/* KANBAN CORE - DEBUG VERSION */

let currentBoardId = null;
let allBoards = [];
let draggedTaskElement = null;
let activeCompanyFilter = 'all';

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Kanban iniciando...');

    try {
        const token = DevDeck.getAuthToken();
        if (!token) {
            window.location.href = BASE_PATH + '/index.php';
            return;
        }
        
        // Carregar Usuário
        const user = await DevDeck.fetchApi('/user/me');
        if (user) {
            DevDeck.setUserData(user.email, user.name, user.id);
            updateUserDisplaySafe(user);
        }

        // Carregar Boards (Blocos)
        await loadPersonalBoards();

        // Carregar Módulos Extras
        if (typeof loadUserSettings === 'function') await loadUserSettings();
        if (typeof setupInvitesListeners === 'function') {
            setupInvitesListeners();
            loadPendingInvites();
        }
        if (typeof setupGroupModalListeners === 'function') setupGroupModalListeners();
        if (typeof loadGroups === 'function') loadGroups();
        
        setupGlobalClicks();

    } catch (error) {
        console.error('ERRO CRÍTICO NO KANBAN:', error);
        alert('Erro ao carregar o quadro: ' + error.message + '\n\nVerifique o console (F12) para mais detalhes.');
    }
});

// --- FUNÇÕES ---

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
    
    // Add Task listener
    document.body.addEventListener('click', function(e) {
        const addBtn = e.target.closest('.add-task-button');
        if (addBtn && typeof openTaskModal === 'function') {
            openTaskModal(null, addBtn.dataset.status);
        }
    });
}

async function loadPersonalBoards() {
    if (typeof currentGroupId !== 'undefined') currentGroupId = null;
    
    const boards = await DevDeck.fetchApi('/boards?groupId=personal');
    allBoards = boards || [];
    renderBoardSelectors(allBoards);
    
    if (allBoards.length > 0) {
        if (!currentBoardId || !allBoards.find(b => b.id == currentBoardId)) {
            selectBoard(allBoards[0].id);
        } else {
            selectBoard(currentBoardId);
        }
    } else {
        showNoBoardsMessage();
    }
}

async function loadGroupBoards(groupId) {
    if (typeof currentGroupId !== 'undefined') currentGroupId = groupId;
    const boards = await DevDeck.fetchApi(`/boards?groupId=${groupId}`);
    allBoards = boards || [];
    renderBoardSelectors(allBoards);
    
    if (allBoards.length > 0) {
        selectBoard(allBoards[0].id);
    } else {
        showNoBoardsMessage();
    }
}

function renderBoardSelectors(boards) {
    const container = document.getElementById('boards-container');
    if (!container) return;
    
    container.innerHTML = '<div class="px-3 py-2 text-sm font-semibold text-gray-400">Quadros</div>';
    
    boards.forEach(board => {
        const btn = document.createElement('button');
        btn.className = 'board-button';
        btn.dataset.boardId = board.id;
        if (board.id == currentBoardId) btn.classList.add('active');
        btn.innerHTML = `<span>${board.name}</span>`;
        btn.onclick = () => selectBoard(board.id);
        
        // Ações (Edit/Delete)
        const actions = document.createElement('div');
        actions.className = 'flex gap-2 ml-2';
        
        // Botão Editar
        const editIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        editIcon.setAttribute('class', 'w-4 h-4 cursor-pointer hover:text-white');
        editIcon.setAttribute('viewBox', '0 0 20 20');
        editIcon.setAttribute('fill', 'currentColor');
        editIcon.innerHTML = '<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>';
        editIcon.onclick = (e) => {
            e.stopPropagation();
            if (typeof openBoardModal === 'function') {
                openBoardModal(board);
            } else {
                console.error('openBoardModal não está definido');
            }
        };
        
        // Botão Deletar
        const deleteIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        deleteIcon.setAttribute('class', 'w-4 h-4 cursor-pointer hover:text-red-400');
        deleteIcon.setAttribute('viewBox', '0 0 20 20');
        deleteIcon.setAttribute('fill', 'currentColor');
        deleteIcon.innerHTML = '<path d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"></path>';
        deleteIcon.onclick = (e) => {
            e.stopPropagation();
            handleDeleteBoard(board.id, board.name);
        };
        
        actions.appendChild(editIcon);
        actions.appendChild(deleteIcon);
        btn.appendChild(actions);
        container.appendChild(btn);
    });
    
    const newBtn = document.createElement('button');
    newBtn.className = 'board-button';
    newBtn.textContent = '+ Novo Quadro';
    newBtn.onclick = () => { if(typeof openBoardModal === 'function') openBoardModal(); };
    container.appendChild(newBtn);
}

async function selectBoard(boardId) {
    currentBoardId = boardId;
    document.querySelectorAll('.board-button').forEach(btn => btn.classList.remove('active'));
    
    // Mostrar kanban board e ocultar mensagem de "sem boards"
    document.getElementById('kanban-board').classList.remove('hidden');
    document.getElementById('no-boards-message').classList.add('hidden');
    
    // Marca ativo visualmente...
    await loadTasks(boardId);
}

async function loadTasks(boardId) {
    activeCompanyFilter = 'all';
    const tasks = await DevDeck.fetchApi(`/tasks?boardId=${boardId}`);
    document.querySelectorAll('.tasks').forEach(c => c.innerHTML = '');

    tasks.forEach(task => {
        const el = createTaskElement(task);
        const col = document.getElementById(task.status.toLowerCase() + '-tasks');
        if (col) col.appendChild(el);
    });

    renderCompanyFilter(tasks);
    setupDragAndDrop();
}

function renderCompanyFilter(tasks) {
    const bar = document.getElementById('company-filter-bar');
    if (!bar) return;

    const ticketTasks = tasks.filter(t => t.isTicket);
    if (ticketTasks.length === 0) {
        bar.innerHTML = '';
        bar.classList.add('hidden');
        return;
    }

    const companies = {};
    ticketTasks.forEach(t => {
        const c = t.requester?.company || 'Sem empresa';
        companies[c] = (companies[c] || 0) + 1;
    });

    bar.classList.remove('hidden');
    bar.innerHTML = '';

    const allTab = document.createElement('button');
    allTab.className = 'company-filter-tab active';
    allTab.textContent = `Todos (${ticketTasks.length})`;
    allTab.onclick = () => setCompanyFilter('all', bar);
    bar.appendChild(allTab);

    Object.entries(companies).sort().forEach(([company, count]) => {
        const tab = document.createElement('button');
        tab.className = 'company-filter-tab';
        tab.textContent = `${company} (${count})`;
        tab.dataset.company = company;
        tab.onclick = () => setCompanyFilter(company, bar);
        bar.appendChild(tab);
    });
}

function setCompanyFilter(company, bar) {
    activeCompanyFilter = company;
    bar.querySelectorAll('.company-filter-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.company === company || (company === 'all' && !t.dataset.company));
    });
    document.querySelectorAll('[data-company]').forEach(el => {
        if (company === 'all') {
            el.style.display = '';
        } else {
            el.style.display = (el.dataset.company === company) ? '' : 'none';
        }
    });
}

function createTaskElement(task) {
    const div = document.createElement('div');
    div.dataset.taskId = task.id;
    div.dataset.priority = task.priority || 'MEDIUM';
    if (task.isTicket) div.dataset.company = task.requester?.company || '';
    div.draggable = true;

    let innerHTML = '';

    if (task.isTicket) {
        // Left border color based on assignment state
        const borderColor = task.assignedUserId ? '#3a3a3a' : '#5c4200';
        div.className = 'task-card p-3 rounded-lg mb-2 cursor-pointer border-l-2';
        div.style.borderLeftColor = borderColor;

        const badges = [];
        if (task.requester?.company) {
            badges.push(`<span class="text-[10px] px-2 py-0.5 bg-white/10 text-[#e0e0e0] rounded-full font-medium">${escapeHtml(task.requester.company)}</span>`);
        }
        if (task.category) {
            badges.push(`<span class="text-[10px] px-2 py-0.5 bg-white/5 text-[#888888] rounded-full">${escapeHtml(task.category)}</span>`);
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

        // Footer: solicitante | responsável
        const requesterName = task.requesterName || task.requester?.name || '—';
        let assigneeBadge;
        if (task.assignedUser) {
            const initials = task.assignedUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            assigneeBadge = `<div class="flex items-center gap-1.5 flex-shrink-0">
                <div class="w-5 h-5 rounded-full bg-white flex items-center justify-center text-black text-[9px] font-bold leading-none">${initials}</div>
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
                <svg class="w-3 h-3 flex-shrink-0" style="color:#444444" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <span class="text-xs truncate" style="color:#555555">${escapeHtml(requesterName)}</span>
            </div>
            ${assigneeBadge}
        </div>`;

    } else {
        // Card de tarefa normal
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

    div.innerHTML = innerHTML;
    div.onclick = () => { if(typeof openTaskModal === 'function') openTaskModal(task); };
    div.ondragstart = function() { draggedTaskElement = this; this.style.opacity = '0.5'; };
    div.ondragend = function() { this.style.opacity = '1'; draggedTaskElement = null; };
    return div;
}

async function handleDeleteBoard(id, name) {
    if(confirm(`Excluir "${name}"?`)) {
        await DevDeck.fetchApi(`/boards/${id}`, { method: 'DELETE' });
        if (typeof currentGroupId !== 'undefined' && currentGroupId) await loadGroupBoards(currentGroupId);
        else await loadPersonalBoards();
    }
}

function setupDragAndDrop() {
    document.querySelectorAll('.tasks').forEach(col => {
        col.ondragover = e => e.preventDefault();
        col.ondrop = async e => {
            e.preventDefault();
            if(!draggedTaskElement) return;
            col.appendChild(draggedTaskElement);
            const status = col.id.replace('-tasks', '').toUpperCase();
            await DevDeck.fetchApi(`/tasks/${draggedTaskElement.dataset.taskId}`, {
                method: 'PATCH',
                body: JSON.stringify({ status })
            });
        };
    });
}

function showNoBoardsMessage() {
    document.getElementById('kanban-board').classList.add('hidden');
    document.getElementById('no-boards-message').classList.remove('hidden');
}

// Exports
window.loadPersonalBoards = loadPersonalBoards;
window.loadGroupBoards = loadGroupBoards;
window.loadTasks = loadTasks;
window.handleDeleteBoard = handleDeleteBoard;