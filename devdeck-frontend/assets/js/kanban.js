/* KANBAN CORE - DEBUG VERSION */

let currentBoardId = null;
let allBoards = [];
let draggedTaskElement = null;

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
        if (board.id == currentBoardId) btn.classList.add('active');
        btn.innerHTML = `<span>${board.name}</span>`;
        btn.onclick = () => selectBoard(board.id);
        
        // Ações (Edit/Delete)
        const actions = document.createElement('div');
        actions.className = 'flex gap-2 ml-2';
        actions.innerHTML = `
            <svg class="w-4 h-4 cursor-pointer hover:text-cyan-400" onclick="event.stopPropagation(); openBoardModal({id: ${board.id}, name: '${board.name}'})"><path fill="currentColor" d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path></svg>
            <svg class="w-4 h-4 cursor-pointer hover:text-red-400" onclick="event.stopPropagation(); handleDeleteBoard(${board.id}, '${board.name}')"><path fill="currentColor" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"></path></svg>
        `;
        btn.appendChild(actions);
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
    // Marca ativo visualmente...
    await loadTasks(boardId);
}

async function loadTasks(boardId) {
    const tasks = await DevDeck.fetchApi(`/tasks?boardId=${boardId}`);
    document.querySelectorAll('.tasks').forEach(c => c.innerHTML = '');
    
    tasks.forEach(task => {
        const el = createTaskElement(task);
        const col = document.getElementById(task.status.toLowerCase() + '-tasks');
        if (col) col.appendChild(el);
    });
    
    setupDragAndDrop();
}

function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = `task-card bg-[#1a1f3a] p-3 rounded-lg shadow mb-2 cursor-pointer border-l-4 hover:border-cyan-500/50 ${getPriorityColor(task.priority)}`;
    div.dataset.taskId = task.id;
    div.draggable = true;
    div.innerHTML = `<h4 class="text-sm font-medium text-gray-200">${task.title}</h4>`;
    
    if (task.tags) {
        div.innerHTML = `<div class="flex flex-wrap gap-1 mb-1">${task.tags.split(',').map(t => `<span class="text-[10px] px-1 bg-blue-900/50 rounded">${t}</span>`).join('')}</div>` + div.innerHTML;
    }
    
    div.onclick = () => { if(typeof openTaskModal === 'function') openTaskModal(task); };
    div.ondragstart = function() { draggedTaskElement = this; this.style.opacity = '0.5'; };
    div.ondragend = function() { this.style.opacity = '1'; draggedTaskElement = null; };
    return div;
}

function getPriorityColor(p) {
    if (p === 'URGENT') return 'border-red-500';
    if (p === 'HIGH') return 'border-orange-500';
    if (p === 'LOW') return 'border-green-500';
    return 'border-gray-500'; // Medium
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