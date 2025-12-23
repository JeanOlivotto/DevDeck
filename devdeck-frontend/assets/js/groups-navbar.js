// Integração de grupos no navbar dropdown
// Este arquivo gerencia a exibição e manipulação da lista de grupos no dropdown

// Renderizar lista de grupos no dropdown
function renderGroupsListDropdown() {
    const groupsList = document.getElementById('groups-list-dropdown');
    
    if (!groupsList) return;
    
    // Se não há grupos, mostrar mensagem com opção de criar
    if (!allGroups || allGroups.length === 0) {
        groupsList.innerHTML = `
            <div class="p-3 text-center">
                <p class="text-sm text-gray-500 mb-3">Você ainda não tem grupos</p>
                <button id="create-group-from-dropdown" class="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs py-2 px-3 rounded-lg transition-all duration-200">
                    + Criar Novo Grupo
                </button>
            </div>
        `;
        
        // Event listener para criar grupo
        const createBtn = groupsList.querySelector('#create-group-from-dropdown');
        if (createBtn) {
            createBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                openGroupModal();
            });
        }
        return;
    }
    
    groupsList.innerHTML = '';
    
    allGroups.forEach(group => {
        const groupElement = document.createElement('div');
        groupElement.className = 'relative px-2 py-1 group';
        groupElement.innerHTML = `
            <button class="group-item-button w-full text-left text-xs p-2 rounded hover:bg-purple-900/30 transition-colors flex items-center gap-2 justify-between" data-group-id="${group.id}">
                <span class="flex items-center gap-2 flex-grow">
                    <svg class="w-3 h-3 text-gray-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.5 1.5H5.75A2.25 2.25 0 003.5 3.75v12.5A2.25 2.25 0 005.75 18.5h8.5a2.25 2.25 0 002.25-2.25V9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span class="truncate">${escapeHtml(group.name)}</span>
                </span>
                <svg class="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
            </button>
            
            <!-- Menu dropdown do grupo -->
            <div class="absolute left-full top-0 ml-1 bg-[#23284a] rounded-lg shadow-lg border border-gray-700 hidden group-item-menu w-32 z-50">
                <button class="group-edit-btn w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-purple-900/30 flex items-center gap-2 first:rounded-t-lg transition-colors" data-group-id="${group.id}">
                    <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                        <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" />
                    </svg>
                    Editar
                </button>
                <button class="group-members-btn w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-purple-900/30 flex items-center gap-2 transition-colors" data-group-id="${group.id}">
                    <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM9 12a6 6 0 11-12 0 6 6 0 0112 0z" />
                    </svg>
                    Membros
                </button>
                <button class="group-invite-btn w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-purple-900/30 flex items-center gap-2 last:rounded-b-lg transition-colors" data-group-id="${group.id}">
                    <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clip-rule="evenodd" />
                    </svg>
                    Convidar
                </button>
            </div>
        `;
        
        // Event listeners
        const groupButton = groupElement.querySelector('.group-item-button');
        const menu = groupElement.querySelector('.group-item-menu');
        
        // Toggle menu
        groupButton.addEventListener('click', function(e) {
            e.stopPropagation();
            menu.classList.toggle('hidden');
        });
        
        // Editar
        groupElement.querySelector('.group-edit-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            menu.classList.add('hidden');
            openGroupModal(group.id);
        });
        
        // Membros
        groupElement.querySelector('.group-members-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            menu.classList.add('hidden');
            openGroupMembersModal(group.id);
        });
        
        // Convidar
        groupElement.querySelector('.group-invite-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            menu.classList.add('hidden');
            openInviteMemberModal(group.id);
        });
        
        // Fechar menu ao clicar fora
        document.addEventListener('click', function(evt) {
            if (!groupElement.contains(evt.target)) {
                menu.classList.add('hidden');
            }
        });
        
        groupsList.appendChild(groupElement);
    });
}

// Setup de listeners para grupos no navbar
function setupGroupsNavbarListeners() {
    // Botão de criar grupo rápido
    const createGroupQuickButton = document.getElementById('create-group-quick');
    if (createGroupQuickButton) {
        createGroupQuickButton.addEventListener('click', function(e) {
            e.stopPropagation();
            openGroupModal();
        });
    }
    
    // Recarregar e renderizar grupos ao abrir o menu do usuário
    const userMenuButton = document.getElementById('user-menu-button');
    if (userMenuButton) {
        userMenuButton.addEventListener('click', function() {
            // Recarregar grupos quando abrir o dropdown
            loadGroups().then(() => renderGroupsListDropdown());
        });
    }
}

// Inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            renderGroupsListDropdown();
            setupGroupsNavbarListeners();
        }, 500);
    });
} else {
    setTimeout(() => {
        renderGroupsListDropdown();
        setupGroupsNavbarListeners();
    }, 500);
}

// Expor funções globalmente
window.renderGroupsListDropdown = renderGroupsListDropdown;
window.setupGroupsNavbarListeners = setupGroupsNavbarListeners;
