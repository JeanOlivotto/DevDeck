/* KANBAN — Dashboard com Abas */

function getCategoryStyle(cat) {
    const lower = (cat || '').toLowerCase();
    if (lower.includes('bug'))           return 'bg-red-900/30 border border-red-800/50 text-red-300';
    if (lower.includes('funcionalidade') || lower.includes('feature'))
                                         return 'bg-blue-900/30 border border-blue-800/50 text-blue-300';
    if (lower.includes('melhoria'))      return 'bg-purple-900/30 border border-purple-800/50 text-purple-300';
    if (lower.includes('suporte') || lower.includes('dúvida') || lower.includes('duvida'))
                                         return 'bg-amber-900/30 border border-amber-800/50 text-amber-300';
    return 'bg-[#2a2a2a] border border-[#404040] text-[#cccccc]';
}
window.getCategoryStyle = getCategoryStyle;

let currentBoardId = null;
let allBoards = [];
let draggedTaskElement = null;
let historyData = null; // cache do histórico, null = não carregado

document.addEventListener('DOMContentLoaded', async function () {
    try {
        const token = DevDeck.getAuthToken();
        if (!token) {
            window.location.href = BASE_PATH + '/index.php';
            return;
        }

        const user = await DevDeck.fetchApi('/user/me');
        if (user) {
            DevDeck.setUserData(user.email, user.name, user.id, user.isDevTeam || false);
            updateUserDisplaySafe(user);
        }

        // Carregar boards pessoais em background (para criação de tasks)
        loadPersonalBoards();

        // Módulos extras
        if (typeof loadUserSettings === 'function') await loadUserSettings();
        if (typeof setupInvitesListeners === 'function') {
            setupInvitesListeners();
            loadPendingInvites();
        }
        if (typeof setupGroupModalListeners === 'function') setupGroupModalListeners();
        if (typeof loadGroups === 'function') loadGroups();

        setupGlobalClicks();
        initTabs();

    } catch (error) {
        console.error('ERRO CRÍTICO NO KANBAN:', error);
        alert('Erro ao carregar o quadro: ' + error.message);
    }
});

// ─── Exibição do usuário ───────────────────────────────────────────────────

function updateUserDisplaySafe(userData) {
    const elName = document.getElementById('user-name-display');
    const elDropName = document.getElementById('user-dropdown-name');
    const elDropEmail = document.getElementById('user-dropdown-email');

    if (elName && userData.name) elName.textContent = `Olá, ${userData.name.split(' ')[0]}`;
    if (elDropName) elDropName.textContent = userData.name;
    if (elDropEmail) elDropEmail.textContent = userData.email;
}

function setupGlobalClicks() {
    const logoutBtn = document.getElementById('logout-button');
    if (logoutBtn) {
        logoutBtn.onclick = async () => {
            await fetch(BASE_PATH + '/api/logout.php', { method: 'POST', body: 'action=logout' });
            DevDeck.clearAuthData();
            window.location.href = BASE_PATH + '/index.php';
        };
    }

    document.body.addEventListener('click', function (e) {
        const addBtn = e.target.closest('.add-task-button');
        if (addBtn && typeof openTaskModal === 'function') {
            openTaskModal(null, addBtn.dataset.status || 'TODO');
        }
    });

    const manageBoardsBtn = document.getElementById('manage-boards-btn');
    if (manageBoardsBtn) {
        manageBoardsBtn.onclick = () => {
            if (typeof openBoardModal === 'function') openBoardModal();
        };
    }
}

// ─── Boards pessoais (background, para criação de tasks) ─────────────────

async function loadPersonalBoards() {
    if (typeof currentGroupId !== 'undefined') currentGroupId = null;

    const boards = await DevDeck.fetchApi('/boards?groupId=personal');
    allBoards = boards || [];

    if (allBoards.length > 0) {
        currentBoardId = allBoards[0].id;
    }
}

async function loadGroupBoards(groupId) {
    if (typeof currentGroupId !== 'undefined') currentGroupId = groupId;
    const boards = await DevDeck.fetchApi(`/boards?groupId=${groupId}`);
    allBoards = boards || [];
    if (allBoards.length > 0) currentBoardId = allBoards[0].id;
}

async function handleDeleteBoard(id, name) {
    if (confirm(`Excluir "${name}"?`)) {
        await DevDeck.fetchApi(`/boards/${id}`, { method: 'DELETE' });
        await loadPersonalBoards();
    }
}

// ─── Navegação por Abas ───────────────────────────────────────────────────

function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '') || 'kanban';
        switchTab(hash, false);
    });

    const initial = window.location.hash.replace('#', '') || 'kanban';
    switchTab(initial, false);
}

function switchTab(tab, updateHash = true) {
    const validTabs = ['kanban', 'coletivo', 'historico'];
    if (!validTabs.includes(tab)) tab = 'kanban';

    if (updateHash) window.location.hash = tab;

    validTabs.forEach(t => {
        document.getElementById(`panel-${t}`)?.classList.add('hidden');
        document.getElementById(`tab-${t}`)?.classList.remove('tab-active');
    });

    document.getElementById(`panel-${tab}`)?.classList.remove('hidden');
    document.getElementById(`tab-${tab}`)?.classList.add('tab-active');

    if (tab === 'kanban') loadPersonalTasks();
    else if (tab === 'coletivo') loadCollectiveTasks();
    else if (tab === 'historico') loadHistory();
}

// ─── Meu Kanban ──────────────────────────────────────────────────────────

async function loadPersonalTasks() {
    const todoCol = document.getElementById('personal-todo-tasks');
    const doingCol = document.getElementById('personal-doing-tasks');
    const validatingCol = document.getElementById('personal-validating-tasks');
    if (!todoCol) return;

    const loading = '<p class="text-xs text-[#444444] text-center py-4">Carregando...</p>';
    todoCol.innerHTML = loading;
    doingCol.innerHTML = loading;
    validatingCol.innerHTML = loading;

    const tasks = await DevDeck.fetchApi('/tasks/my-tasks');
    todoCol.innerHTML = '';
    doingCol.innerHTML = '';
    validatingCol.innerHTML = '';

    const hasValidating = (tasks || []).some(t => t.requiresValidation && t.status === 'DOING');

    if (!hasValidating) {
        validatingCol.innerHTML = '<p class="text-xs text-[#444444] text-center py-6">Tasks que requerem<br>validação antes de concluir</p>';
    }

    (tasks || []).forEach(task => {
        const el = createPersonalTaskCard(task);
        if (task.requiresValidation && task.status === 'DOING') {
            validatingCol.appendChild(el);
        } else if (task.status === 'TODO') {
            todoCol.appendChild(el);
        } else if (task.status === 'DOING') {
            doingCol.appendChild(el);
        }
    });

    setupPersonalDragAndDrop();
}

function createPersonalTaskCard(task) {
    const div = document.createElement('div');
    div.dataset.taskId = task.id;
    div.dataset.priority = task.priority || 'MEDIUM';
    div.dataset.requiresValidation = task.requiresValidation ? 'true' : 'false';
    div.draggable = true;

    let innerHTML = '';

    if (task.isTicket) {
        const borderColor = task.assignedUserId ? '#3a3a3a' : '#5c4200';
        div.className = 'task-card p-3 rounded-lg mb-2 cursor-pointer border-l-2';
        div.style.borderLeftColor = borderColor;

        const badges = [];
        if (task.requester?.company) {
            badges.push(`<span class="text-[10px] px-2 py-0.5 bg-white/10 text-[#e0e0e0] rounded-full font-medium">${escapeHtml(task.requester.company)}</span>`);
        }
        if (task.category) {
            badges.push(`<span class="text-[10px] px-2 py-0.5 rounded-full ${getCategoryStyle(task.category)}">${escapeHtml(task.category)}</span>`);
        }
        if (badges.length > 0) {
            innerHTML += `<div class="flex flex-wrap gap-1 mb-2">${badges.join('')}</div>`;
        }

        innerHTML += `<h4 class="text-sm font-medium text-white mb-2">${escapeHtml(task.title)}</h4>`;

        if (task.tags) {
            const filteredTags = task.tags.split(',').map(t => t.trim()).filter(t => t && t !== 'ticket');
            if (filteredTags.length > 0) {
                innerHTML += `<div class="flex flex-wrap gap-1 mb-2">${filteredTags.map(t => `<span class="text-[10px] px-1.5 py-0.5 bg-white/5 text-[#888888] rounded">${escapeHtml(t)}</span>`).join('')}</div>`;
            }
        }

        const requesterName = task.requesterName || task.requester?.name || '—';
        let assigneeBadge;
        if (task.assignedUser) {
            const initials = task.assignedUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            assigneeBadge = `<div class="flex items-center gap-1.5 flex-shrink-0">
                <div class="w-5 h-5 rounded-full bg-white flex items-center justify-center text-black text-[9px] font-bold">${initials}</div>
                <span class="text-xs text-white font-medium truncate max-w-[90px]">${escapeHtml(task.assignedUser.name)}</span>
            </div>`;
        } else {
            assigneeBadge = `<span class="flex items-center gap-1 text-[10px] font-semibold flex-shrink-0" style="color:#b07800">
                <span style="width:6px;height:6px;border-radius:50%;background:#b07800;display:inline-block;flex-shrink:0"></span>
                Aguardando
            </span>`;
        }

        innerHTML += `<div class="flex items-center justify-between gap-2 pt-2 border-t border-[#2a2a2a]">
            <div class="flex items-center gap-1.5 min-w-0">
                <svg class="w-3 h-3 flex-shrink-0 text-[#444444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <span class="text-xs truncate text-[#555555]">${escapeHtml(requesterName)}</span>
            </div>
            ${assigneeBadge}
        </div>`;

    } else {
        div.className = 'task-card p-3 rounded-lg mb-2 cursor-pointer';
        innerHTML += `<h4 class="text-sm font-medium text-white">${escapeHtml(task.title)}</h4>`;

        if (task.tags) {
            const filteredTags = task.tags.split(',').map(t => t.trim()).filter(t => t);
            if (filteredTags.length > 0) {
                innerHTML += `<div class="flex flex-wrap gap-1 mt-1">${filteredTags.map(t => `<span class="text-[10px] px-1.5 py-0.5 bg-white/5 text-[#888888] rounded">${escapeHtml(t)}</span>`).join('')}</div>`;
            }
        }

        if (task.assignedUser) {
            const initials = task.assignedUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            innerHTML += `<div class="flex items-center gap-2 mt-2 pt-2 border-t border-[#2a2a2a]">
                <div class="w-6 h-6 rounded-full bg-[#2a2a2a] flex items-center justify-center text-white text-xs font-bold">${initials}</div>
                <span class="text-xs text-[#888888] truncate">${escapeHtml(task.assignedUser.name)}</span>
            </div>`;
        }
    }

    if (task.requiresValidation) {
        innerHTML += `<div class="mt-2">
            <span class="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border" style="background:rgba(176,120,0,0.1);color:#b07800;border-color:rgba(176,120,0,0.3)">
                ⚠ Requer Validação
            </span>
        </div>`;
    }

    div.innerHTML = innerHTML;
    div.onclick = () => { if (typeof openTaskModal === 'function') openTaskModal(task); };
    div.ondragstart = function () { draggedTaskElement = this; this.style.opacity = '0.5'; };
    div.ondragend = function () { this.style.opacity = '1'; draggedTaskElement = null; };

    return div;
}

function setupPersonalDragAndDrop() {
    ['personal-todo-tasks', 'personal-doing-tasks', 'personal-validating-tasks'].forEach(colId => {
        const col = document.getElementById(colId);
        if (!col) return;
        col.ondragover = e => e.preventDefault();
        col.ondrop = async e => {
            e.preventDefault();
            if (!draggedTaskElement) return;
            const status = colId === 'personal-todo-tasks' ? 'TODO' : 'DOING';
            col.appendChild(draggedTaskElement);
            draggedTaskElement.dataset.requiresValidation = 'false'; // mover de volta desbloqueia
            await DevDeck.fetchApi(`/tasks/${draggedTaskElement.dataset.taskId}`, {
                method: 'PATCH',
                body: JSON.stringify({ status })
            });
        };
    });

    const zone = document.getElementById('completion-zone');
    if (!zone) return;

    zone.ondragover = e => {
        e.preventDefault();
        if (draggedTaskElement?.dataset.requiresValidation === 'true') {
            zone.classList.add('completion-zone-blocked');
        } else {
            zone.classList.add('completion-zone-hover');
        }
    };

    zone.ondragleave = () => {
        zone.classList.remove('completion-zone-hover', 'completion-zone-blocked');
    };

    zone.ondrop = async e => {
        e.preventDefault();
        zone.classList.remove('completion-zone-hover', 'completion-zone-blocked');
        if (!draggedTaskElement) return;

        if (draggedTaskElement.dataset.requiresValidation === 'true') {
            alert('Este ticket requer validação antes de ser concluído.\nAbra o ticket e desmarque "Requer Validação" para poder concluir.');
            return;
        }

        const taskId = draggedTaskElement.dataset.taskId;
        draggedTaskElement.remove();
        historyData = null; // limpar cache do histórico

        await DevDeck.fetchApi(`/tasks/${taskId}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'DONE' })
        });
    };
}

// ─── Kanban Coletivo ─────────────────────────────────────────────────────

async function loadCollectiveTasks() {
    const col = document.getElementById('collective-available-tasks');
    if (!col) return;

    col.innerHTML = '<p class="text-sm text-[#444444] text-center py-8 col-span-full">Carregando...</p>';

    const tasks = await DevDeck.fetchApi('/tasks/unassigned');

    if (!tasks || tasks.length === 0) {
        col.innerHTML = '<p class="text-sm text-[#444444] text-center py-8 col-span-full">Nenhuma tarefa disponível no momento.</p>';
        return;
    }

    col.innerHTML = '';
    tasks.forEach(task => col.appendChild(createCollectiveTaskCard(task)));
}

function createCollectiveTaskCard(task) {
    const div = document.createElement('div');
    div.dataset.taskId = task.id;
    div.dataset.priority = task.priority || 'MEDIUM';
    div.className = 'task-card p-4 rounded-xl cursor-default';

    let html = '';

    if (task.board?.group?.name) {
        html += `<div class="mb-2">
            <span class="text-[10px] px-2 py-0.5 bg-white/5 text-[#888888] rounded-full border border-[#2a2a2a]">${escapeHtml(task.board.group.name)}</span>
        </div>`;
    }

    if (task.isTicket) {
        const badges = [];
        if (task.requester?.company) badges.push(`<span class="text-[10px] px-2 py-0.5 bg-white/10 text-[#e0e0e0] rounded-full">${escapeHtml(task.requester.company)}</span>`);
        if (task.category) badges.push(`<span class="text-[10px] px-2 py-0.5 rounded-full ${getCategoryStyle(task.category)}">${escapeHtml(task.category)}</span>`);
        if (badges.length) html += `<div class="flex flex-wrap gap-1 mb-2">${badges.join('')}</div>`;
    }

    html += `<h4 class="text-sm font-medium text-white mb-1">${escapeHtml(task.title)}</h4>`;

    if (task.description) {
        html += `<p class="text-xs text-[#888888] mb-3 line-clamp-2">${escapeHtml(task.description)}</p>`;
    }

    const priorityColors = { URGENT: '#7a1e1e', HIGH: '#5a3a00', MEDIUM: '#2a2a2a', LOW: '#1e3a2a' };
    const priorityLabels = { URGENT: 'Urgente', HIGH: 'Alta', MEDIUM: 'Média', LOW: 'Baixa' };
    const pColor = priorityColors[task.priority] || priorityColors.MEDIUM;
    const pLabel = priorityLabels[task.priority] || 'Média';

    html += `<div class="flex items-center justify-between mt-3 pt-3 border-t border-[#2a2a2a] gap-2">
        <span class="text-[10px] px-2 py-0.5 rounded text-[#888888] border border-[#2a2a2a]">${pLabel}</span>
        <button class="pickup-btn" onclick="pickupTask(${task.id}, this)">Pegar Tarefa</button>
    </div>`;

    div.innerHTML = html;
    div.addEventListener('click', e => {
        if (!e.target.closest('.pickup-btn') && typeof openTaskModal === 'function') openTaskModal(task);
    });

    return div;
}

async function pickupTask(taskId, btn) {
    const userData = DevDeck.getUserData();
    if (!userData || !userData.id) { alert('Usuário não identificado.'); return; }

    btn.disabled = true;
    btn.textContent = 'Pegando...';

    try {
        await DevDeck.fetchApi(`/tasks/${taskId}`, {
            method: 'PATCH',
            body: JSON.stringify({ assignedUserId: userData.id })
        });

        const card = btn.closest('[data-task-id]');
        if (card) {
            card.style.transition = 'opacity 0.3s';
            card.style.opacity = '0';
            setTimeout(() => card.remove(), 300);
        }
    } catch (error) {
        alert('Erro ao pegar tarefa: ' + error.message);
        btn.disabled = false;
        btn.textContent = 'Pegar Tarefa';
    }
}

// ─── Histórico ───────────────────────────────────────────────────────────

async function loadHistory(query = '') {
    const container = document.getElementById('history-cards');
    if (!container) return;

    if (!historyData) {
        container.innerHTML = '<p class="text-sm text-[#444444] text-center py-8 col-span-full">Carregando...</p>';
        const data = await DevDeck.fetchApi('/tasks/history');
        historyData = data || [];
        setupHistorySearch();
    }

    const q = query.toLowerCase();
    const filtered = q
        ? historyData.filter(t =>
            t.title.toLowerCase().includes(q) ||
            (t.assignedUser?.name || '').toLowerCase().includes(q) ||
            (t.category || '').toLowerCase().includes(q) ||
            (t.requester?.company || '').toLowerCase().includes(q)
        )
        : historyData;

    container.innerHTML = '';

    if (filtered.length === 0) {
        container.innerHTML = '<p class="text-sm text-[#444444] text-center py-8 col-span-full">Nenhum ticket encontrado no histórico.</p>';
        return;
    }

    filtered.forEach(task => container.appendChild(createHistoryCard(task)));
}

function createHistoryCard(task) {
    const div = document.createElement('div');
    div.className = 'history-card';

    const completedAt = task.updatedAt ? new Date(task.updatedAt) : null;
    const timeAgo = completedAt ? formatTimeAgo(completedAt) : '';
    const assigneeName = task.assignedUser?.name || 'Sem responsável';
    const initials = task.assignedUser
        ? task.assignedUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    const badges = [];
    if (task.requester?.company) badges.push(`<span class="text-[10px] px-2 py-0.5 bg-white/10 text-[#e0e0e0] rounded-full">${escapeHtml(task.requester.company)}</span>`);
    if (task.category) badges.push(`<span class="text-[10px] px-2 py-0.5 bg-white/5 text-[#888888] rounded-full">${escapeHtml(task.category)}</span>`);

    div.innerHTML = `
        ${badges.length ? `<div class="flex flex-wrap gap-1 mb-2">${badges.join('')}</div>` : ''}
        <h4 class="text-sm font-medium text-white mb-1 leading-snug">${escapeHtml(task.title)}</h4>
        ${task.description ? `<p class="text-xs text-[#888888] mb-3 line-clamp-2">${escapeHtml(task.description)}</p>` : ''}
        <div class="flex items-center justify-between pt-2 border-t border-[#2a2a2a] mt-auto gap-2">
            <div class="flex items-center gap-1.5 min-w-0">
                <div class="w-5 h-5 rounded-full bg-[#2a2a2a] flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">${initials}</div>
                <span class="text-xs text-[#888888] truncate">${escapeHtml(assigneeName)}</span>
            </div>
            <span class="text-[10px] text-[#555555] flex-shrink-0">${timeAgo}</span>
        </div>
    `;

    div.onclick = () => { if (typeof openTaskModal === 'function') openTaskModal(task); };
    return div;
}

function setupHistorySearch() {
    const input = document.getElementById('history-search');
    if (!input || input._historyBound) return;
    input._historyBound = true;
    let debounce;
    input.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => loadHistory(input.value), 250);
    });
}

function formatTimeAgo(date) {
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d atrás`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

// ─── Compatibilidade / Exports ─────────────────────────────────────────

// loadTasks ainda usado por kanban-modals.js após salvar
async function loadTasks() {
    await loadPersonalTasks();
    historyData = null;
}

// renderBoardSelectors: não mais usada mas mantida para evitar erro em kanban-board-modal
function renderBoardSelectors(boards) { /* no-op */ }

// Compatibilidade com component-updates.js (addTaskToKanban usa createTaskElement)
window.createTaskElement = createPersonalTaskCard;

window.loadPersonalBoards = loadPersonalBoards;
window.loadGroupBoards = loadGroupBoards;
window.loadTasks = loadTasks;
window.loadPersonalTasks = loadPersonalTasks;
window.loadCollectiveTasks = loadCollectiveTasks;
window.loadHistory = loadHistory;
window.handleDeleteBoard = handleDeleteBoard;
window.pickupTask = pickupTask;
window.invalidateHistoryCache = () => { historyData = null; };
