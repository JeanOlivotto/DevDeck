// Sidebar de grupos - Exibe quadros de grupo
// Este arquivo gerencia a sidebar esquerda com lista de grupos e seus quadros

// Renderizar grupos na sidebar
function renderGroupsSidebar() {
    const sidebar = document.getElementById('groups-sidebar');
    const sidebarList = document.getElementById('groups-sidebar-list');
    
    if (!sidebarList) return;
    
    // Sempre mostrar a sidebar (para que o usuário possa criar o primeiro grupo)
    sidebar.classList.remove('hidden');
    
    // Limpar sidebar
    sidebarList.innerHTML = '';
    
    // Adicionar botão "Meu Kanban Pessoal" no topo
    const personalKanbanBtn = document.createElement('div');
    personalKanbanBtn.className = 'mb-4';
    personalKanbanBtn.innerHTML = `
        <button id="personal-kanban-btn" class="personal-kanban w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 font-semibold active">
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V3zM4 9a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V9z" />
            </svg>
            Meu Kanban Pessoal
        </button>
    `;
    sidebarList.appendChild(personalKanbanBtn);
    
    // Adicionar listener ao botão pessoal
    document.getElementById('personal-kanban-btn')?.addEventListener('click', async function() {
        // Limpar filtros
        currentGroupId = null;
        
        // Remover active de todos os grupos e botão pessoal
        document.querySelectorAll('.group-header-item, .personal-kanban').forEach(el => {
            el.classList.remove('active-group', 'active');
        });
        this.classList.add('active');
        
        // Recarregar apenas quadros pessoais
        await loadPersonalBoards();
    });
    
    // Se não há grupos, mostrar mensagem vazia
    if (!allGroups || allGroups.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'flex items-center justify-center py-8 h-full';
        emptyMessage.innerHTML = `
            <div class="text-center">
                <svg class="w-12 h-12 text-gray-600 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p class="text-sm text-gray-500">Nenhum grupo criado</p>
                <p class="text-xs text-gray-600 mt-2">Clique em "Criar Novo Grupo" para começar!</p>
            </div>
        `;
        sidebarList.appendChild(emptyMessage);
        return;
    }
    
    allGroups.forEach((group, index) => {
        const groupElement = document.createElement('div');
        groupElement.className = 'mb-3 group-item';
        groupElement.style.animationDelay = `${index * 0.05}s`;
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
                
                <!-- Menu inline -->
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
        
        // Event listeners
        const groupHeader = groupElement.querySelector('.group-header-item');
        const menuBtn = groupElement.querySelector('.group-menu-btn');
        const menuInline = groupElement.querySelector('.group-menu-inline');
        
        // Toggle menu inline
        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Fechar outros menus
            document.querySelectorAll('.group-menu-inline').forEach(m => {
                if (m !== menuInline) m.classList.add('hidden');
            });
            
            menuInline.classList.toggle('hidden');
        });
        
        // Click no grupo - Carregar quadros do grupo no top selector
        groupHeader.addEventListener('click', function(e) {
            if (e.target.closest('.group-menu-btn')) return;
            e.stopPropagation();
            
            // Fechar menus
            document.querySelectorAll('.group-menu-inline').forEach(m => {
                m.classList.add('hidden');
            });
            
            // Remover active de outros grupos e botão pessoal
            document.querySelectorAll('.group-header-item, .personal-kanban').forEach(el => {
                el.classList.remove('active-group', 'active');
            });
            
            // Marcar este grupo como ativo
            groupHeader.classList.add('active-group');
            currentGroupId = group.id;
            
            // Atualizar o seletor de quadros no topo para mostrar apenas quadros deste grupo
            if (typeof loadGroupBoards === 'function') {
                loadGroupBoards(group.id);
            }
        });
        
        // Editar grupo
        groupElement.querySelector('.group-edit-sidebar').addEventListener('click', function(e) {
            e.stopPropagation();
            menuInline.classList.add('hidden');
            openGroupModal(group.id);
        });
        
        // Ver membros
        groupElement.querySelector('.group-members-sidebar').addEventListener('click', function(e) {
            e.stopPropagation();
            menuInline.classList.add('hidden');
            openGroupMembersModal(group.id);
        });
        
        // Convidar membro
        groupElement.querySelector('.group-invite-sidebar').addEventListener('click', function(e) {
            e.stopPropagation();
            menuInline.classList.add('hidden');
            openInviteMemberModal(group.id);
        });
        
        // Fechar menu ao clicar fora
        document.addEventListener('click', function(evt) {
            if (!groupElement.contains(evt.target)) {
                menuInline.classList.add('hidden');
            }
        });
        
        sidebarList.appendChild(groupElement);
    });
}

// Carregar quadros de um grupo na sidebar
function loadGroupBoardsInSidebar(groupId, container) {
    // Filtrar quadros do grupo
    const groupBoards = allBoards.filter(b => b.groupId === groupId);
    
    if (groupBoards.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4 px-3">
                <svg class="w-10 h-10 text-gray-600 mx-auto mb-2 opacity-50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p class="text-xs text-gray-500">Nenhum quadro ainda</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    groupBoards.forEach((board, index) => {
        const boardElement = document.createElement('button');
        boardElement.className = 'board-item w-full text-left px-3 py-2.5 text-xs rounded-lg hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-blue-600/20 transition-all duration-200 text-gray-300 flex items-center gap-3 border border-transparent hover:border-purple-500/30 group';
        boardElement.style.animationDelay = `${index * 0.05}s`;
        boardElement.innerHTML = `
            <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                <svg class="w-3.5 h-3.5 text-purple-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
                </svg>
            </div>
            <div class="flex-grow min-w-0">
                <span class="truncate block font-medium">${escapeHtml(board.name)}</span>
            </div>
            <svg class="w-4 h-4 text-gray-600 group-hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-all duration-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
        `;
        
        boardElement.addEventListener('click', function(e) {
            e.stopPropagation();
            // Remover active de outros
            document.querySelectorAll('.board-item, .personal-kanban').forEach(el => {
                el.classList.remove('active-board', 'active');
            });
            boardElement.classList.add('active-board');
            
            // Set current group context
            currentGroupId = groupId;
            
            // Selecionar o quadro
            selectBoard(board.id);
        });
        
        container.appendChild(boardElement);
    });
}

// Setup da sidebar
function setupGroupsSidebar() {
    const createGroupBtn = document.getElementById('create-group-button');
    
    // Configurar listener do botão "Criar Novo Grupo"
    if (createGroupBtn) {
        createGroupBtn.addEventListener('click', function() {
            openGroupModal();
        });
    }
    
    // Carregar grupos inicialmente
    loadGroups().then(() => {
        renderGroupsSidebar();
    });
}

// Atualizar sidebar quando grupos mudarem
function updateGroupsSidebar() {
    renderGroupsSidebar();
}

// Inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            setupGroupsSidebar();
        }, 500);
    });
} else {
    setTimeout(() => {
        setupGroupsSidebar();
    }, 500);
}

// Expor globalmente
window.renderGroupsSidebar = renderGroupsSidebar;
window.setupGroupsSidebar = setupGroupsSidebar;
window.updateGroupsSidebar = updateGroupsSidebar;
window.loadGroupBoardsInSidebar = loadGroupBoardsInSidebar;
