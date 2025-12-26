/* KANBAN CORE - ROBUST VERSION */

// --- 1. CONFIGURAÇÃO IMEDIATA (Executa antes de tudo) ---
// Isso garante que o menu funcione mesmo se o resto do script falhar ou demorar
(function setupSafeMenu() {
    document.body.addEventListener('click', function(e) {
        // Busca o botão de menu (ou qualquer coisa dentro dele)
        const menuBtn = e.target.closest('#user-menu-button');
        
        // Se clicou no botão...
        if (menuBtn) {
            e.preventDefault();  // IMPEDE O RECARREGAMENTO/LOADING
            e.stopPropagation(); // Impede outros conflitos
            
            const dropdown = document.getElementById('user-menu-dropdown');
            const arrow = document.getElementById('dropdown-arrow');
            
            if (dropdown) {
                dropdown.classList.toggle('hidden');
                if (arrow) arrow.classList.toggle('rotate-180');
            }
            return; // Encerra aqui
        }

        // Se clicou fora, fecha o menu
        const dropdown = document.getElementById('user-menu-dropdown');
        if (dropdown && !dropdown.classList.contains('hidden')) {
            // Se o clique não foi dentro do dropdown
            if (!e.target.closest('#user-menu-dropdown')) {
                dropdown.classList.add('hidden');
                const arrow = document.getElementById('dropdown-arrow');
                if (arrow) arrow.classList.remove('rotate-180');
            }
        }
    }, true); // UseCapture para garantir prioridade
})();

// --- 2. VARIÁVEIS GLOBAIS ---
let currentBoardId = null;
// Nota: currentGroupId vem do groups.js (não redeclarar)
let allBoards = [];
let draggedTaskElement = null;
let pusherClient = null;
let pusherChannel = null;

// --- 3. INICIALIZAÇÃO SEGURA ---
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Kanban iniciando...');

    // Garante que o botão não envie formulário
    const btn = document.getElementById('user-menu-button');
    if(btn) btn.type = 'button';

    const token = DevDeck.getAuthToken();
    if (!token) {
        window.location.href = BASE_PATH + '/index.php';
        return;
    }
    
    // Passo A: Carregar Usuário e Interface (Isolado)
    try {
        const user = await DevDeck.fetchApi('/user/me');
        if (user) {
            DevDeck.setUserData(user.email, user.name, user.id);
            updateUserDisplaySafe(user); // Função segura
        }
    } catch (error) {
        console.error('Erro crítico ao carregar usuário:', error);
    }

    // Passo B: Carregar Boards (Isolado)
    try {
        await loadPersonalBoards();
    } catch (error) {
        console.error('Erro ao carregar boards:', error);
    }

    // Passo C: Carregar Módulos Extras (Isolado)
    try {
        if (typeof loadUserSettings === 'function') await loadUserSettings();
        if (typeof setupInvitesListeners === 'function') {
            setupInvitesListeners();
            loadPendingInvites();
        }
        if (typeof setupGroupModalListeners === 'function') setupGroupModalListeners();
        if (typeof loadGroups === 'function') loadGroups();
        if (typeof setupSettingsListeners === 'function') setupSettingsListeners();
        
        initializePusher();
        setupGlobalClicks(); // Outros cliques (Tasks, Logout)
    } catch (error) {
        console.error('Erro em módulos extras:', error);
    }
});

// --- 4. FUNÇÕES DE INTERFACE SEGURAS ---

function updateUserDisplaySafe(userData) {
    try {
        if (!userData || !userData.name) return;

        const userNameDisplay = document.getElementById('user-name-display');
        const userAvatar = document.getElementById('user-avatar');
        const userDropdownName = document.getElementById('user-dropdown-name');
        const userDropdownEmail = document.getElementById('user-dropdown-email');
        const userGreeting = document.getElementById('user-greeting');

        const firstName = userData.name.split(' ')[0];
        const initials = getInitials(userData.name);
        const color = generateAvatarColor(userData.name + (userData.email || ''));
        
        if (userNameDisplay) userNameDisplay.textContent = `Olá, ${firstName}`;
        
        if (userAvatar) {
            userAvatar.innerHTML = initials; // Usar innerHTML é mais seguro que textContent as vezes
            userAvatar.style.backgroundColor = color;
            userAvatar.style.color = '#FFFFFF';
            userAvatar.style.display = 'flex';
            userAvatar.style.alignItems = 'center';
            userAvatar.style.justifyContent = 'center';
        }
        
        if (userDropdownName) userDropdownName.textContent = userData.name;
        if (userDropdownEmail) userDropdownEmail.textContent = userData.email;
        
        if (userGreeting) {
            const hour = new Date().getHours();
            let greeting = 'Olá';
            if (hour < 12) greeting = 'Bom dia';
            else if (hour < 18) greeting = 'Boa tarde';
            else greeting = 'Boa noite';
            userGreeting.textContent = `${greeting}, ${firstName}! 👋`;
        }
    } catch (e) {
        console.error('Erro ao atualizar display:', e);
    }
}

function setupGlobalClicks() {
    // Logout
    const logoutBtn = document.getElementById('logout-button');
    if (logoutBtn) {
        logoutBtn.onclick = handleLogout;
    }

    // Add Task (Delegação)
    document.body.addEventListener('click', function(e) {
        const addBtn = e.target.closest('.add-task-button');
        if (addBtn) {
            if (typeof openTaskModal === 'function') {
                openTaskModal(null, addBtn.dataset.status);
            } else {
                console.error('openTaskModal não carregada');
            }
        }
    });
}

// --- 5. LÓGICA CORE (BOARDS E TASKS) ---

async function loadPersonalBoards() {
    if (typeof currentGroupId !== 'undefined') currentGroupId = null;
    const boards = await DevDeck.fetchApi('/boards?groupId=personal');
    allBoards = boards || []; // Garante array
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
    try {
        const boards = await DevDeck.fetchApi(`/boards?groupId=${groupId}`);
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
    } catch (error) {
        console.error(error);
        DevDeck.showAlert('Erro ao acessar grupo', 'Erro');
    }
}

function renderBoardSelectors(boards) {
    const container = document.getElementById('boards-container');
    if (!container) return;
    
    container.innerHTML = '<div class="px-3 py-2 text-sm font-semibold text-gray-400">Quadros</div>';
    
    boards.forEach(board => {
        const btn = document.createElement('button');
        btn.className = 'board-button';
        if (board.id == currentBoardId) btn.classList.add('active');
        
        btn.innerHTML = `<span>${board.name}</span>`;
        
        const actions = document.createElement('div');
        actions.className = 'flex items-center gap-2 ml-2';
        actions.innerHTML = `
            <svg class="board-action-icon rename w-4 h-4 cursor-pointer"><use xlink:href="#icon-pencil"></use></svg>
            <svg class="board-action-icon delete w-4 h-4 cursor-pointer"><use xlink:href="#icon-trash"></use></svg>
        `;
        btn.appendChild(actions);
        
        btn.onclick = (e) => {
            if (!e.target.closest('.board-action-icon')) selectBoard(board.id);
        };
        
        actions.querySelector('.rename').onclick = (e) => {
            e.stopPropagation();
            if(typeof openBoardModal === 'function') openBoardModal(board);
        };
        actions.querySelector('.delete').onclick = (e) => {
            e.stopPropagation();
            handleDeleteBoard(board.id, board.name);
        };
        
        container.appendChild(btn);
    });
    
    const newBtn = document.createElement('button');
    newBtn.className = 'board-button';
    newBtn.textContent = '+ Novo Quadro';
    newBtn.onclick = () => { if(typeof openBoardModal === 'function') openBoardModal(); };
    container.appendChild(newBtn);
    
    document.getElementById('kanban-board').classList.remove('hidden');
    document.getElementById('no-boards-message').classList.add('hidden');
}

async function selectBoard(boardId) {
    currentBoardId = boardId;
    document.querySelectorAll('.board-button').forEach(btn => btn.classList.remove('active'));
    
    // Busca botão visualmente
    const buttons = document.querySelectorAll('.board-button');
    for (let btn of buttons) {
        // Verifica se é o botão do board atual (pelo nome ou ordem)
        if (btn.textContent.includes(allBoards.find(b => b.id == boardId)?.name)) {
            btn.classList.add('active');
            break;
        }
    }

    await loadTasks(boardId);
}

async function loadTasks(boardId) {
    try {
        const tasks = await DevDeck.fetchApi(`/tasks?boardId=${boardId}`);
        document.querySelectorAll('.tasks').forEach(c => c.innerHTML = '');
        
        tasks.forEach(task => {
            const el = createTaskElement(task);
            const col = document.getElementById(task.status.toLowerCase() + '-tasks');
            if (col) col.appendChild(el);
        });
        
        setupDragAndDrop();
        
        if (document.getElementById('kanban-board').classList.contains('hidden')) {
            document.getElementById('kanban-board').classList.remove('hidden');
            document.getElementById('no-boards-message').classList.add('hidden');
        }
    } catch (error) {
        console.error('Erro tasks:', error);
    }
}

function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = 'task-card bg-[#1a1f3a] p-3 rounded-lg shadow mb-2 cursor-pointer border-l-4 border-transparent hover:border-cyan-500/50';
    div.dataset.taskId = task.id;
    div.draggable = true;
    
    if (task.priority === 'HIGH') div.classList.add('border-l-orange-500');
    else if (task.priority === 'URGENT') div.classList.add('border-l-red-500');
    else if (task.priority === 'LOW') div.classList.add('border-l-green-500');
    else div.classList.add('border-l-gray-500');

    const icon = task.isTicket ? '🎫 ' : '';
    
    let tagsHtml = '';
    if (task.tags) {
        tagsHtml = '<div class="flex flex-wrap gap-1 mb-2">';
        task.tags.split(',').forEach(tag => {
            tagsHtml += `<span class="text-[10px] px-1.5 py-0.5 rounded border bg-blue-900/30 text-blue-300 border-blue-800">${tag.trim()}</span>`;
        });
        tagsHtml += '</div>';
    }

    // Avatar seguro
    let avatarHtml = '';
    if (task.assignedUser) {
        avatarHtml = `<div class="text-xs text-cyan-400 mt-2 flex items-center gap-1">
            <div class="w-4 h-4 rounded-full bg-cyan-900 flex items-center justify-center text-[10px]">
                ${getInitials(task.assignedUser.name)}
            </div> 
            ${task.assignedUser.name.split(' ')[0]}
        </div>`;
    }

    div.innerHTML = `
        ${tagsHtml}
        <h4 class="text-sm font-medium text-gray-200">${icon}${task.title}</h4>
        ${avatarHtml}
    `;
    
    div.onclick = () => { if(typeof openTaskModal === 'function') openTaskModal(task); };
    div.ondragstart = handleDragStart;
    div.ondragend = handleDragEnd;
    
    return div;
}

// --- 6. UTILITÁRIOS ---

function getInitials(name) {
    if (!name) return 'DD';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function generateAvatarColor(seed) {
    const colors = ['#00eaff', '#a259ff', '#ff00ea', '#00ffc3', '#ffc300', '#ff006e', '#3a86ff'];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

async function handleDeleteBoard(id, name) {
    if(confirm(`Excluir "${name}"?`)) {
        await DevDeck.fetchApi(`/boards/${id}`, { method: 'DELETE' });
        reloadBoardsForCurrentContext();
    }
}

async function reloadBoardsForCurrentContext() {
    if (typeof currentGroupId !== 'undefined' && currentGroupId) await loadGroupBoards(currentGroupId);
    else await loadPersonalBoards();
}

function handleDragStart(e) { draggedTaskElement = this; this.style.opacity = '0.5'; }
function handleDragEnd(e) { this.style.opacity = '1'; draggedTaskElement = null; }
function setupDragAndDrop() {
    document.querySelectorAll('.tasks').forEach(col => {
        col.ondragover = e => { e.preventDefault(); };
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

async function handleLogout() {
    await fetch(BASE_PATH + '/api/logout.php', { method: 'POST', body: 'action=logout' });
    DevDeck.clearAuthData();
    window.location.href = BASE_PATH + '/index.php';
}

function initializePusher() { /* Pusher placeholder */ }
function showNoBoardsMessage() {
    document.getElementById('kanban-board').classList.add('hidden');
    document.getElementById('no-boards-message').classList.remove('hidden');
}

// --- 7. EXPORTS ---
window.loadPersonalBoards = loadPersonalBoards;
window.loadGroupBoards = loadGroupBoards;
window.loadTasks = loadTasks;
window.selectBoard = selectBoard;
window.reloadBoardsForCurrentContext = reloadBoardsForCurrentContext;
window.handleDeleteBoard = handleDeleteBoard;