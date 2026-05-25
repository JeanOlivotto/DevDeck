// Integração de grupos no navbar dropdown

function renderGroupsListDropdown() {
    const groupsList = document.getElementById('groups-list-dropdown');
    if (!groupsList) return;

    if (!allGroups || allGroups.length === 0) {
        groupsList.innerHTML = `
            <div class="p-3 text-center">
                <p class="text-sm text-[#555555] mb-3">Você ainda não tem grupos</p>
                <button id="create-group-from-dropdown" class="w-full bg-white text-black text-xs font-semibold py-2 px-3 rounded-lg transition-colors hover:bg-[#e0e0e0]">
                    + Criar Novo Grupo
                </button>
            </div>
        `;
        groupsList.querySelector('#create-group-from-dropdown')?.addEventListener('click', function(e) {
            e.stopPropagation(); openGroupModal();
        });
        return;
    }

    groupsList.innerHTML = '';

    allGroups.forEach(group => {
        const groupElement = document.createElement('div');
        groupElement.className = 'relative px-2 py-1';
        groupElement.innerHTML = `
            <button class="group-item-button w-full text-left text-xs p-2 rounded hover:bg-[#2a2a2a] transition-colors flex items-center gap-2 justify-between text-[#888888] hover:text-white" data-group-id="${group.id}">
                <span class="flex items-center gap-2 flex-grow truncate">
                    <svg class="w-3 h-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                    </svg>
                    <span class="truncate">${escapeHtml(group.name)}</span>
                </span>
            </button>

            <div class="absolute left-0 top-full mt-1 bg-[#141414] rounded-lg shadow-lg border border-[#2a2a2a] hidden group-item-menu w-36 z-50">
                <button class="group-edit-btn w-full text-left px-3 py-2 text-xs text-[#888888] hover:text-white hover:bg-[#1c1c1c] flex items-center gap-2 rounded-t-lg transition-colors" data-group-id="${group.id}">
                    <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                    </svg>
                    Editar
                </button>
                <button class="group-members-btn w-full text-left px-3 py-2 text-xs text-[#888888] hover:text-white hover:bg-[#1c1c1c] flex items-center gap-2 transition-colors" data-group-id="${group.id}">
                    <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM9 12a6 6 0 11-12 0 6 6 0 0112 0z" />
                    </svg>
                    Membros
                </button>
                <button class="group-invite-btn w-full text-left px-3 py-2 text-xs text-[#888888] hover:text-white hover:bg-[#1c1c1c] flex items-center gap-2 rounded-b-lg transition-colors" data-group-id="${group.id}">
                    <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clip-rule="evenodd" />
                    </svg>
                    Convidar
                </button>
            </div>
        `;

        const groupButton = groupElement.querySelector('.group-item-button');
        const menu = groupElement.querySelector('.group-item-menu');

        groupButton.addEventListener('click', function(e) {
            e.stopPropagation();
            document.querySelectorAll('.group-item-menu').forEach(m => { if (m !== menu) m.classList.add('hidden'); });
            menu.classList.toggle('hidden');
        });

        groupElement.querySelector('.group-edit-btn').addEventListener('click', function(e) {
            e.stopPropagation(); menu.classList.add('hidden'); openGroupModal(group.id);
        });
        groupElement.querySelector('.group-members-btn').addEventListener('click', function(e) {
            e.stopPropagation(); menu.classList.add('hidden'); openGroupMembersModal(group.id);
        });
        groupElement.querySelector('.group-invite-btn').addEventListener('click', function(e) {
            e.stopPropagation(); menu.classList.add('hidden'); openInviteMemberModal(group.id);
        });

        document.addEventListener('click', function(evt) {
            if (!groupElement.contains(evt.target)) menu.classList.add('hidden');
        });

        groupsList.appendChild(groupElement);
    });
}

function setupGroupsNavbarListeners() {
    document.getElementById('create-group-quick')?.addEventListener('click', function(e) {
        e.stopPropagation(); openGroupModal();
    });
    document.getElementById('user-menu-button')?.addEventListener('click', function() {
        loadGroups().then(() => renderGroupsListDropdown());
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(() => { renderGroupsListDropdown(); setupGroupsNavbarListeners(); }, 500));
} else {
    setTimeout(() => { renderGroupsListDropdown(); setupGroupsNavbarListeners(); }, 500);
}

window.renderGroupsListDropdown = renderGroupsListDropdown;
window.setupGroupsNavbarListeners = setupGroupsNavbarListeners;
