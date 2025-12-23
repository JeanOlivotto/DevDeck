// Variáveis globais do Kanban
let currentBoardId = null;
let allBoards = [];
let draggedTaskElement = null;
let draggedBoardElement = null;
let pusherClient = null;
let pusherChannel = null;
let currentUserSettings = {
    notifyDailySummary: true,
    notifyStaleTasks: true,
    notifyViaWhatsApp: false,
    whatsappNumber: null
};

// Elementos DOM
const boardsContainer = document.getElementById('boards-container');
const kanbanBoardSection = document.getElementById('kanban-board');
const noBoardsMessage = document.getElementById('no-boards-message');
const userMenuButton = document.getElementById('user-menu-button');
const userMenuDropdown = document.getElementById('user-menu-dropdown');
const dropdownArrow = document.getElementById('dropdown-arrow');
const logoutButton = document.getElementById('logout-button');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeKanban();
    setupEventListeners();
});

async function initializeKanban() {
    const userData = DevDeck.getUserData();
    
    if (userData.name) {
        updateUserDisplay(userData);
    }
    
    // Inicializa sempre na visão pessoal para evitar mistura de quadros
    await loadPersonalBoards();
    await loadUserSettings();
    initializePusher();
}

function setupEventListeners() {
    // Menu do usuário
    if (userMenuButton) {
        userMenuButton.addEventListener('click', toggleUserMenu);
    }
    
    // Fechar dropdown ao clicar fora
    document.addEventListener('click', function(e) {
        if (userMenuDropdown && !userMenuDropdown.contains(e.target) && 
            !userMenuButton.contains(e.target)) {
            closeUserMenu();
        }
    });
    
    // Logout
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
    
    // Modais
    setupModalListeners();
    
    // Configurações de usuário
    setupSettingsListeners();
    
    // WhatsApp Meta
    setupWhatsAppMetaListeners();
    
    // Convites de grupos
    setupInvitesListeners();
    loadPendingInvites();
    
    // Modais de grupos
    setupGroupModalListeners();
    loadGroups();
    
    // Botões de adicionar tarefa
    document.querySelectorAll('.add-task-button').forEach(btn => {
        btn.addEventListener('click', function() {
            const status = this.dataset.status;
            openTaskModal(null, status);
        });
    });
}

function toggleUserMenu() {
    if (userMenuDropdown) {
        const isHidden = userMenuDropdown.classList.contains('hidden');
        if (isHidden) {
            userMenuDropdown.classList.remove('hidden');
            userMenuDropdown.classList.add('dropdown-visible');
            if (dropdownArrow) dropdownArrow.classList.add('arrow-rotated');
        } else {
            closeUserMenu();
        }
    }
}

function closeUserMenu() {
    if (userMenuDropdown) {
        userMenuDropdown.classList.add('hidden');
        userMenuDropdown.classList.remove('dropdown-visible');
        if (dropdownArrow) dropdownArrow.classList.remove('arrow-rotated');
    }
}

function updateUserDisplay(userData) {
    const userNameDisplay = document.getElementById('user-name-display');
    const userAvatar = document.getElementById('user-avatar');
    const userDropdownName = document.getElementById('user-dropdown-name');
    const userDropdownEmail = document.getElementById('user-dropdown-email');
    const userGreeting = document.getElementById('user-greeting');
    
    const firstName = userData.name.split(' ')[0];
    const initials = getInitials(userData.name);
    const color = generateAvatarColor(userData.name + userData.email);
    
    if (userNameDisplay) userNameDisplay.textContent = `Olá, ${firstName}`;
    if (userAvatar) {
        userAvatar.textContent = initials;
        userAvatar.style.backgroundColor = color;
    }
    if (userDropdownName) userDropdownName.textContent = userData.name;
    if (userDropdownEmail) userDropdownEmail.textContent = userData.email;
    
    // Saudação baseada no horário
    if (userGreeting) {
        const hour = new Date().getHours();
        let greeting = 'Olá';
        if (hour < 12) greeting = 'Bom dia';
        else if (hour < 18) greeting = 'Boa tarde';
        else greeting = 'Boa noite';
        userGreeting.textContent = `${greeting}, ${firstName}! 👋`;
    }
}

function getInitials(name) {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function generateAvatarColor(seed) {
    const colors = [
        '#00eaff', '#a259ff', '#ff00ea', '#00ffc3', '#ffc300',
        '#ff006e', '#06ffa5', '#7209b7', '#3a86ff', '#fb5607'
    ];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

async function handleLogout() {
    try {
        // Limpar sessão PHP
        await fetch(BASE_PATH + '/api/logout.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=logout'
        }).catch(e => console.warn('Logout PHP warning:', e));
    } catch (e) {
        console.warn('Erro ao limpar sessão:', e);
    }
    
    // Limpar localStorage e desconectar Pusher
    DevDeck.clearAuthData();
    disconnectPusher();
    
    // Redirecionar para login
    window.location.href = BASE_PATH + '/index.php';
}

// Boards
async function loadBoards() {
    try {
        const boards = await DevDeck.fetchApi('/boards');
        allBoards = boards;
        
        if (boards.length === 0) {
            showNoBoardsMessage();
        } else {
            renderBoardSelectors(boards);
            if (currentBoardId === null || !boards.find(b => b.id === currentBoardId)) {
                currentBoardId = boards[0].id;
            }
            await loadTasks(currentBoardId);
        }
    } catch (error) {
        console.error('Erro ao carregar quadros:', error);
        DevDeck.showAlert('Erro ao carregar quadros', 'Erro');
    }
}

// Carregar apenas quadros pessoais
async function loadPersonalBoards() {
    try {
        const boards = await DevDeck.fetchApi('/boards?groupId=personal');
        allBoards = boards;
        
        if (boards.length === 0) {
            showNoBoardsMessage();
        } else {
            renderBoardSelectors(boards);
            if (currentBoardId === null || !boards.find(b => b.id === currentBoardId)) {
                currentBoardId = boards[0].id;
            }
            await loadTasks(currentBoardId);
        }
    } catch (error) {
        console.error('Erro ao carregar quadros pessoais:', error);
        DevDeck.showAlert('Erro ao carregar quadros pessoais', 'Erro');
    }
}

// Carregar apenas quadros de um grupo específico
async function loadGroupBoards(groupId) {
    try {
        const boards = await DevDeck.fetchApi(`/boards?groupId=${groupId}`);
        allBoards = boards;
        
        if (boards.length === 0) {
            showNoBoardsMessage();
        } else {
            renderBoardSelectors(boards);
            if (currentBoardId === null || !boards.find(b => b.id === currentBoardId)) {
                currentBoardId = boards[0].id;
            }
            await loadTasks(currentBoardId);
        }
    } catch (error) {
        console.error('Erro ao carregar quadros do grupo:', error);
        DevDeck.showAlert('Erro ao carregar quadros do grupo', 'Erro');
    }
}

// Recarregar boards respeitando o contexto atual (pessoal ou grupo)
async function reloadBoardsForCurrentContext() {
    if (currentGroupId) {
        // Se está visualizando um grupo, recarregar apenas quadros daquele grupo
        await loadGroupBoards(currentGroupId);
    } else {
        // Se está visualizando pessoal, recarregar apenas quadros pessoais
        await loadPersonalBoards();
    }
}
function showNoBoardsMessage() {
    if (noBoardsMessage) noBoardsMessage.classList.remove('hidden');
    if (kanbanBoardSection) kanbanBoardSection.classList.add('hidden');
    if (boardsContainer) boardsContainer.innerHTML = '<button id="create-first-board" class="board-button">+ Novo Quadro</button>';
    
    const createBtn = document.getElementById('create-first-board');
    if (createBtn) {
        createBtn.addEventListener('click', () => openBoardModal());
    }
}

function renderBoardSelectors(boards) {
    if (!boardsContainer) return;
    
    boardsContainer.innerHTML = '';
    
    // Adicionar título da seção de quadros
    const boardsTitle = document.createElement('div');
    boardsTitle.className = 'px-3 py-2 text-sm font-semibold text-gray-400';
    boardsTitle.textContent = 'Quadros';
    boardsContainer.appendChild(boardsTitle);
    
    boards.forEach(board => {
        const button = document.createElement('button');
        button.className = 'board-button';
        button.dataset.boardId = board.id;
        
        if (board.id === currentBoardId) {
            button.classList.add('active');
        }
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = board.name;
        button.appendChild(nameSpan);
        
        const iconsDiv = document.createElement('div');
        iconsDiv.className = 'flex items-center gap-2 ml-2';
        iconsDiv.innerHTML = `
            <svg class="board-action-icon rename-icon w-4 h-4"><use xlink:href="#icon-pencil"></use></svg>
            <svg class="board-action-icon delete-icon w-4 h-4"><use xlink:href="#icon-trash"></use></svg>
        `;
        
        button.appendChild(iconsDiv);
        
        button.addEventListener('click', function(e) {
            if (!e.target.closest('.board-action-icon')) {
                selectBoard(board.id);
            }
        });
        
        iconsDiv.querySelector('.rename-icon').addEventListener('click', (e) => {
            e.stopPropagation();
            openBoardModal(board);
        });
        
        iconsDiv.querySelector('.delete-icon').addEventListener('click', (e) => {
            e.stopPropagation();
            handleDeleteBoard(board.id, board.name);
        });
        
        boardsContainer.appendChild(button);
    });
    
    // Botão para criar novo quadro
    const newBoardBtn = document.createElement('button');
    newBoardBtn.className = 'board-button';
    newBoardBtn.textContent = '+ Novo Quadro';
    newBoardBtn.addEventListener('click', () => openBoardModal());
    boardsContainer.appendChild(newBoardBtn);
}

async function selectBoard(boardId) {
    currentBoardId = boardId;
    
    // Atualizar classe active
    document.querySelectorAll('.board-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.boardId == boardId) {
            btn.classList.add('active');
        }
    });
    
    await loadTasks(boardId);
}

async function loadTasks(boardId) {
    try {
        const tasks = await DevDeck.fetchApi(`/tasks?boardId=${boardId}`);
        renderTasks(tasks);
        
        if (noBoardsMessage) noBoardsMessage.classList.add('hidden');
        if (kanbanBoardSection) kanbanBoardSection.classList.remove('hidden');
    } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
        DevDeck.showAlert('Erro ao carregar tarefas', 'Erro');
    }
}

function renderTasks(tasks) {
    // Limpar todas as colunas
    document.querySelectorAll('.tasks').forEach(column => {
        column.innerHTML = '';
    });
    
    // Renderizar tarefas nas colunas apropriadas
    tasks.forEach(task => {
        const taskElement = createTaskElement(task);
        const columnId = `${task.status.toLowerCase()}-tasks`;
        const column = document.getElementById(columnId);
        if (column) {
            column.appendChild(taskElement);
        }
    });
    
    setupDragAndDrop();
}

function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = 'task-card';
    div.dataset.taskId = task.id;
    div.draggable = true;
    
    const title = document.createElement('h3');
    title.className = 'task-title';
    title.textContent = task.title;
    
    // Header: título + avatar ao lado
    const headerRow = document.createElement('div');
    headerRow.className = 'task-header-row';
    
    const headerLeft = document.createElement('div');
    headerLeft.className = 'task-header-left';
    headerLeft.appendChild(title);
    headerRow.appendChild(headerLeft);
    
    if (task.assignedUser) {
        const initials = task.assignedUser.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
        
        const avatar = document.createElement('div');
        avatar.className = 'task-assigned-avatar';
        avatar.textContent = initials;
        avatar.title = `Atribuído a: ${task.assignedUser.name} (${task.assignedUser.email})`;
        headerRow.appendChild(avatar);
    }
    
    div.appendChild(headerRow);
    
    const description = document.createElement('p');
    description.className = 'task-description';
    description.textContent = task.description || 'Sem descrição';
    div.appendChild(description);

    
    div.addEventListener('click', () => {
        openTaskModal(task);
    });
    
    return div;
}

async function toggleSubtaskCompletion(taskId, subtaskId, completed) {
    await DevDeck.fetchApi(`/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ completed })
    });
    await loadTasks(currentBoardId);
}

// Inicialização ao carregar DOM
document.addEventListener('DOMContentLoaded', async function() {
    const token = DevDeck.getAuthToken();
    
    if (!token) {
        console.warn('Sem token de autenticação');
        return;
    }
    
    try {
        // Verificar se o token é válido
        const user = await DevDeck.fetchApi('/user/me');
        DevDeck.setUserData(user.email, user.name, user.id);
        
        currentUserSettings = {
            notifyDailySummary: user.notifyDailySummary,
            notifyStaleTasks: user.notifyStaleTasks,
            notifyViaWhatsApp: user.notifyViaWhatsApp,
            whatsappNumber: user.whatsappNumber
        };
        
        await initializeKanban();
    } catch (error) {
        console.error('Erro ao inicializar:', error);
        DevDeck.clearAuthData();
        window.location.href = BASE_PATH + '/index.php';
    }
});
