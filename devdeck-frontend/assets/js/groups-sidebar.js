// Sidebar de grupos

function renderGroupsSidebar() {
    const sidebar = document.getElementById('groups-sidebar');
    const sidebarList = document.getElementById('groups-sidebar-list');
    if (!sidebarList) return;

    sidebar.classList.remove('hidden');
    sidebarList.innerHTML = '';

    // Botão Meu Kanban Pessoal
    const personalKanbanBtn = document.createElement('div');
    personalKanbanBtn.className = 'mb-3';
    personalKanbanBtn.innerHTML = `
        <button id="personal-kanban-btn" class="personal-kanban w-full bg-white text-black text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all hover:bg-[#e0e0e0]">
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V3zM4 9a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V9z" />
            </svg>
            Meu Kanban Pessoal
        </button>
    `;
    sidebarList.appendChild(personalKanbanBtn);

    document.getElementById('personal-kanban-btn')?.addEventListener('click', async function() {
        currentGroupId = null;
        document.querySelectorAll('.group-header-item, .personal-kanban').forEach(el => el.classList.remove('active-group', 'active'));
        this.classList.add('active');
        await loadPersonalBoards();
    });

    if (!allGroups || allGroups.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'flex items-center justify-center py-8';
        emptyMessage.innerHTML = `
            <div class="text-center">
                <svg class="w-10 h-10 text-[#2a2a2a] mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p class="text-sm text-[#555555]">Nenhum grupo criado</p>
                <p class="text-xs text-[#444444] mt-1">Clique em "Criar Novo Grupo" para começar!</p>
            </div>
        `;
        sidebarList.appendChild(emptyMessage);
        return;
    }

    allGroups.forEach((group, index) => {
        const groupElement = document.createElement('div');
        groupElement.className = 'mb-2 group-item';
        groupElement.style.animationDelay = `${index * 0.05}s`;
        groupElement.innerHTML = `
            <div class="bg-[#1c1c1c] rounded-xl overflow-hidden border border-[#2a2a2a] hover:border-[#404040] transition-all duration-200">
                <div class="p-3">
                    <div class="flex items-center justify-between cursor-pointer group-header-item" data-group-id="${group.id}">
                        <div class="flex items-center gap-3 flex-grow min-w-0">
                            <div class="w-8 h-8 rounded-lg bg-[#2a2a2a] border border-[#404040] flex items-center justify-center flex-shrink-0">
                                <svg class="w-4 h-4 text-[#888888]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 12a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4zM2 14a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
                                </svg>
                            </div>
                            <div class="flex-grow min-w-0">
                                <h4 class="text-sm font-semibold text-white truncate">${escapeHtml(group.name)}</h4>
                                <p class="text-xs text-[#555555]">Clique para visualizar</p>
                            </div>
                        </div>
                        <button class="group-menu-btn p-1.5 rounded-lg hover:bg-[#2a2a2a] text-[#555555] hover:text-white transition-colors z-10" data-group-id="${group.id}" title="Opções">
                            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Menu inline -->
                <div class="group-menu-inline hidden bg-[#141414] border-t border-[#2a2a2a]" data-group-id="${group.id}">
                    <button class="group-edit-sidebar w-full text-left px-4 py-2.5 text-sm text-[#888888] hover:text-white hover:bg-[#1c1c1c] flex items-center gap-3 transition-colors" data-group-id="${group.id}">
                        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                        </svg>
                        Editar Grupo
                    </button>
                    <button class="group-members-sidebar w-full text-left px-4 py-2.5 text-sm text-[#888888] hover:text-white hover:bg-[#1c1c1c] flex items-center gap-3 transition-colors" data-group-id="${group.id}">
                        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                        </svg>
                        Ver Membros
                    </button>
                    <button class="group-invite-sidebar w-full text-left px-4 py-2.5 text-sm text-[#888888] hover:text-white hover:bg-[#1c1c1c] flex items-center gap-3 transition-colors" data-group-id="${group.id}">
                        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/>
                        </svg>
                        Convidar Membro
                    </button>
                </div>
            </div>
        `;

        const groupHeader = groupElement.querySelector('.group-header-item');
        const menuBtn = groupElement.querySelector('.group-menu-btn');
        const menuInline = groupElement.querySelector('.group-menu-inline');

        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            document.querySelectorAll('.group-menu-inline').forEach(m => { if (m !== menuInline) m.classList.add('hidden'); });
            menuInline.classList.toggle('hidden');
        });

        groupHeader.addEventListener('click', function(e) {
            if (e.target.closest('.group-menu-btn')) return;
            e.stopPropagation();
            document.querySelectorAll('.group-menu-inline').forEach(m => m.classList.add('hidden'));
            document.querySelectorAll('.group-header-item, .personal-kanban').forEach(el => el.classList.remove('active-group', 'active'));
            groupHeader.classList.add('active-group');
            currentGroupId = group.id;
            if (typeof loadGroupBoards === 'function') loadGroupBoards(group.id);
        });

        groupElement.querySelector('.group-edit-sidebar').addEventListener('click', function(e) {
            e.stopPropagation(); menuInline.classList.add('hidden'); openGroupModal(group.id);
        });
        groupElement.querySelector('.group-members-sidebar').addEventListener('click', function(e) {
            e.stopPropagation(); menuInline.classList.add('hidden'); openGroupMembersModal(group.id);
        });
        groupElement.querySelector('.group-invite-sidebar').addEventListener('click', function(e) {
            e.stopPropagation(); menuInline.classList.add('hidden'); openInviteMemberModal(group.id);
        });

        document.addEventListener('click', function(evt) {
            if (!groupElement.contains(evt.target)) menuInline.classList.add('hidden');
        });

        sidebarList.appendChild(groupElement);
    });
}

function loadGroupBoardsInSidebar(groupId, container) {
    const groupBoards = allBoards.filter(b => b.groupId === groupId);

    if (groupBoards.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4 px-3">
                <p class="text-xs text-[#444444]">Nenhum quadro ainda</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    groupBoards.forEach((board, index) => {
        const boardElement = document.createElement('button');
        boardElement.className = 'board-item w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-[#2a2a2a] transition-colors text-[#888888] hover:text-white flex items-center gap-3 border border-transparent hover:border-[#404040]';
        boardElement.style.animationDelay = `${index * 0.05}s`;
        boardElement.innerHTML = `
            <div class="w-6 h-6 rounded bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                <svg class="w-3 h-3 text-[#555555]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
                </svg>
            </div>
            <span class="truncate font-medium">${escapeHtml(board.name)}</span>
        `;

        boardElement.addEventListener('click', function(e) {
            e.stopPropagation();
            document.querySelectorAll('.board-item, .personal-kanban').forEach(el => el.classList.remove('active-board', 'active'));
            boardElement.classList.add('active-board');
            currentGroupId = groupId;
            selectBoard(board.id);
        });

        container.appendChild(boardElement);
    });
}

function setupGroupsSidebar() {
    const createGroupBtn = document.getElementById('create-group-button');
    if (createGroupBtn) createGroupBtn.addEventListener('click', () => openGroupModal());
    loadGroups().then(() => renderGroupsSidebar());
}

function updateGroupsSidebar() { renderGroupsSidebar(); }

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(setupGroupsSidebar, 500));
} else {
    setTimeout(setupGroupsSidebar, 500);
}

window.renderGroupsSidebar = renderGroupsSidebar;
window.setupGroupsSidebar = setupGroupsSidebar;
window.updateGroupsSidebar = updateGroupsSidebar;
window.loadGroupBoardsInSidebar = loadGroupBoardsInSidebar;
