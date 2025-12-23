// Funções para atualização isolada de componentes (sem recarregar tudo)
// Este arquivo contém helpers para atualizar apenas o componente necessário

// ========== UTILITY FUNCTIONS ==========

// Escapar HTML para evitar XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

// ========== INVITES UPDATES ==========

// Remover um convite da lista sem recarregar
function removeInviteFromUI(groupId) {
    const inviteElement = document.querySelector(`.invite-item[data-group-id="${groupId}"]`);
    if (inviteElement) {
        inviteElement.style.opacity = '0';
        inviteElement.style.transform = 'translateX(20px)';
        setTimeout(() => inviteElement.remove(), 300);
    }
}

// Esconder a seção de convites se não houver mais
function hideInvitesIfEmpty() {
    const invitesContainer = document.getElementById('invites-container');
    if (!invitesContainer) return;
    
    if (invitesContainer.children.length === 0 || 
        invitesContainer.textContent.includes('Nenhum convite')) {
        const invitesSection = document.querySelector('[data-section="invites"]');
        if (invitesSection) {
            invitesSection.style.display = 'none';
        }
    }
}

// ========== SIDEBAR GROUPS UPDATES ==========

// Remover um grupo da sidebar sem recarregar tudo
function removeGroupFromSidebar(groupId) {
    const groupElement = document.querySelector(`.group-item [data-group-id="${groupId}"]`)?.closest('.group-item');
    if (groupElement) {
        groupElement.style.opacity = '0';
        groupElement.style.transform = 'scale(0.95)';
        setTimeout(() => {
            groupElement.remove();
            // Se não há mais grupos, esconder sidebar
            const groupsList = document.getElementById('groups-sidebar-list');
            if (groupsList && groupsList.children.length === 0) {
                document.getElementById('groups-sidebar').classList.add('hidden');
            }
        }, 300);
    }
}

// Adicionar um novo grupo na sidebar com animação
function addGroupToSidebar(group) {
    const sidebarList = document.getElementById('groups-sidebar-list');
    const sidebar = document.getElementById('groups-sidebar');
    
    if (!sidebarList) return;
    
    sidebar.classList.remove('hidden');
    
    const groupElement = document.createElement('div');
    groupElement.className = 'mb-3 group-item';
    groupElement.innerHTML = `
        <div class="bg-gradient-to-br from-[#23284a] to-[#1e2344] rounded-xl overflow-hidden border border-purple-900/20 hover:border-purple-500/40 transition-all duration-300 shadow-md hover:shadow-purple-500/20">
            <div class="p-3.5">
                <div class="flex items-center justify-between cursor-pointer group-header-item" data-group-id="${group.id}">
                    <div class="flex items-center gap-3 flex-grow min-w-0">
                        <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                            <svg class="w-4 h-4 text-purple-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 12a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4zM2 14a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
                            </svg>
                        </div>
                        <div class="flex-grow min-w-0">
                            <h4 class="text-sm font-bold text-gray-100 truncate">${escapeHtml(group.name)}</h4>
                            <p class="text-xs text-gray-500">Clique para visualizar</p>
                        </div>
                    </div>
                    <button class="group-menu-btn p-2 rounded-lg hover:bg-purple-900/30 text-gray-400 hover:text-purple-300 transition-all duration-200 z-10" data-group-id="${group.id}" title="Opções">
                        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                    </button>
                </div>
            </div>
            <div class="group-menu-inline hidden bg-[#1a1f3a] border-t border-b border-purple-900/30" data-group-id="${group.id}">
                <button class="group-edit-sidebar w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-blue-600/20 flex items-center gap-3 transition-all duration-200" data-group-id="${group.id}">
                    <svg class="w-4 h-4 text-purple-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                    </svg>
                    <span>Editar Grupo</span>
                </button>
                <button class="group-members-sidebar w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-blue-600/20 flex items-center gap-3 transition-all duration-200" data-group-id="${group.id}">
                    <svg class="w-4 h-4 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                    </svg>
                    <span>Ver Membros</span>
                </button>
                <button class="group-invite-sidebar w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-blue-600/20 flex items-center gap-3 transition-all duration-200" data-group-id="${group.id}">
                    <svg class="w-4 h-4 text-cyan-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/>
                    </svg>
                    <span>Convidar Membro</span>
                </button>
            </div>
        </div>
    `;
    
    sidebarList.appendChild(groupElement);
    
    // Animação de entrada
    groupElement.style.opacity = '0';
    groupElement.style.transform = 'translateY(-10px)';
    groupElement.style.transition = 'all 0.3s ease';
    setTimeout(() => {
        groupElement.style.opacity = '1';
        groupElement.style.transform = 'translateY(0)';
    }, 10);
}

// ========== BOARD UPDATES ==========

// Adicionar um novo board ao seletor sem recarregar tudo
function addBoardToSelector(board) {
    const boardsContainer = document.getElementById('boards-container');
    if (!boardsContainer) return;
    
    const button = document.createElement('button');
    button.className = 'board-button';
    button.dataset.boardId = board.id;
    
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
    
    // Inserir antes do botão "+ Novo Quadro"
    const newBoardBtn = boardsContainer.querySelector('button:last-child');
    if (newBoardBtn && newBoardBtn.textContent.includes('+ Novo Quadro')) {
        boardsContainer.insertBefore(button, newBoardBtn);
    } else {
        boardsContainer.appendChild(button);
    }
    
    // Animação de entrada
    button.style.opacity = '0';
    button.style.transform = 'translateY(-10px)';
    button.style.transition = 'all 0.3s ease';
    setTimeout(() => {
        button.style.opacity = '1';
        button.style.transform = 'translateY(0)';
    }, 10);
}

// Remover um board do seletor sem recarregar tudo
function removeBoardFromSelector(boardId) {
    const button = document.querySelector(`button.board-button[data-board-id="${boardId}"]`);
    if (button) {
        button.style.opacity = '0';
        button.style.transform = 'translateX(20px)';
        setTimeout(() => button.remove(), 300);
    }
}

// Atualizar nome de um board no seletor sem recarregar
function updateBoardInSelector(boardId, newName) {
    const button = document.querySelector(`button.board-button[data-board-id="${boardId}"]`);
    if (button) {
        const nameSpan = button.querySelector('span');
        if (nameSpan) {
            nameSpan.textContent = newName;
        }
    }
}

// ========== TASKS UPDATES ==========

// Adicionar uma tarefa ao kanban sem recarregar
function addTaskToKanban(task) {
    const columnId = `${task.status.toLowerCase()}-tasks`;
    const column = document.getElementById(columnId);
    
    if (column) {
        const taskElement = createTaskElement(task);
        column.appendChild(taskElement);
        
        // Animação de entrada
        taskElement.style.opacity = '0';
        taskElement.style.transform = 'scale(0.95)';
        taskElement.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            taskElement.style.opacity = '1';
            taskElement.style.transform = 'scale(1)';
        }, 10);
    }
}

// Remover uma tarefa do kanban sem recarregar
function removeTaskFromKanban(taskId) {
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
        taskElement.style.opacity = '0';
        taskElement.style.transform = 'scale(0.95)';
        setTimeout(() => taskElement.remove(), 300);
    }
}

// Atualizar status de uma tarefa (mover entre colunas)
function updateTaskInKanban(taskId, newStatus) {
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
        const oldColumn = taskElement.parentElement;
        const newColumnId = `${newStatus.toLowerCase()}-tasks`;
        const newColumn = document.getElementById(newColumnId);
        
        if (newColumn && oldColumn !== newColumn) {
            taskElement.style.opacity = '0';
            setTimeout(() => {
                newColumn.appendChild(taskElement);
                taskElement.style.opacity = '1';
                taskElement.style.transition = 'opacity 0.3s ease';
            }, 150);
        }
    }
}

// Expor globalmente
window.removeInviteFromUI = removeInviteFromUI;
window.hideInvitesIfEmpty = hideInvitesIfEmpty;
window.removeGroupFromSidebar = removeGroupFromSidebar;
window.addGroupToSidebar = addGroupToSidebar;
window.addBoardToSelector = addBoardToSelector;
window.removeBoardFromSelector = removeBoardFromSelector;
window.updateBoardInSelector = updateBoardInSelector;
window.addTaskToKanban = addTaskToKanban;
window.removeTaskFromKanban = removeTaskFromKanban;
window.updateTaskInKanban = updateTaskInKanban;
