// Gerenciamento de modais de grupos
let groupModalState = {
    isEditing: false,
    currentGroupId: null,
    selectedGroupBoardId: null
};

// Abrir modal de criar/editar grupo
function openGroupModal(groupId = null) {
    const modal = document.getElementById('group-modal');
    const title = document.getElementById('group-modal-title');
    const form = document.getElementById('group-form');
    const nameInput = document.getElementById('group-name');
    const descriptionInput = document.getElementById('group-description');
    const deleteBtn = document.getElementById('group-modal-delete');
    
    if (!modal || !form) return;
    
    groupModalState.isEditing = !!groupId;
    groupModalState.currentGroupId = groupId;
    
    // Limpar form
    form.reset();
    
    if (groupId) {
        // Modo edição
        title.textContent = 'Editar Grupo';
        const group = allGroups.find(g => g.id === groupId);
        
        if (group) {
            nameInput.value = group.name || '';
            descriptionInput.value = group.description || '';
            deleteBtn.classList.remove('hidden');
        }
    } else {
        // Modo criação
        title.textContent = 'Novo Grupo';
        deleteBtn.classList.add('hidden');
    }
    
    modal.classList.remove('hidden');
}

// Fechar modal de grupo
function closeGroupModal() {
    const modal = document.getElementById('group-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    groupModalState = { isEditing: false, currentGroupId: null, selectedGroupBoardId: null };
}

// Abrir modal de convite de membro
function openInviteMemberModal(groupId) {
    const modal = document.getElementById('invite-member-modal');
    const groupIdInput = document.getElementById('invite-group-id');
    const form = document.getElementById('invite-member-form');
    
    if (!modal) return;
    
    groupIdInput.value = groupId;
    form.reset();
    modal.classList.remove('hidden');
}

// Fechar modal de convite
function closeInviteMemberModal() {
    const modal = document.getElementById('invite-member-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Abrir modal de membros do grupo
function openGroupMembersModal(groupId) {
    const modal = document.getElementById('group-members-modal');
    const title = document.getElementById('group-members-modal-title');
    const container = document.getElementById('group-members-container');
    
    if (!modal || !container) return;
    
    const group = allGroups.find(g => g.id === groupId);
    if (group) {
        title.textContent = `Membros - ${group.name}`;
        loadAndRenderGroupMembers(groupId, container);
    }
    
    modal.classList.remove('hidden');
}

// Carregar e renderizar membros do grupo
async function loadAndRenderGroupMembers(groupId, container) {
    try {
        const members = await getGroupMembers(groupId);
        
        if (!members || members.length === 0) {
            container.innerHTML = '<p class="text-gray-400 text-sm p-4">Nenhum membro no grupo</p>';
            return;
        }
        
        container.innerHTML = '';
        members.forEach(member => {
            const memberElement = document.createElement('div');
            memberElement.className = 'p-3 border-b border-gray-700 flex items-center justify-between';
            memberElement.innerHTML = `
                <div>
                    <p class="font-medium text-white text-sm">${escapeHtml(member.user.name)}</p>
                    <p class="text-xs text-gray-400">${escapeHtml(member.user.email)}</p>
                    <span class="text-xs font-semibold text-cyan-400 capitalize">${escapeHtml(member.role)}</span>
                </div>
                <button class="remove-member-btn bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs" data-group-id="${groupId}" data-member-id="${member.userId}">
                    Remover
                </button>
            `;
            
            const removeBtn = memberElement.querySelector('.remove-member-btn');
            removeBtn.addEventListener('click', async function() {
                const confirmed = await DevDeck.showConfirm(
                    `Tem certeza que deseja remover ${escapeHtml(member.user.name)} do grupo?`,
                    'Confirmar Remoção'
                );
                
                if (confirmed) {
                    try {
                        await removeGroupMember(groupId, member.userId);
                        loadAndRenderGroupMembers(groupId, container);
                        DevDeck.showAlert('Membro removido com sucesso!', 'Sucesso');
                    } catch (error) {
                        console.error('Erro ao remover membro:', error);
                        DevDeck.showAlert('Erro ao remover membro', 'Erro');
                    }
                }
            });
            
            container.appendChild(memberElement);
        });
    } catch (error) {
        console.error('Erro ao carregar membros:', error);
        container.innerHTML = '<p class="text-red-400 text-sm p-4">Erro ao carregar membros</p>';
    }
}

// Fechar modal de membros
function closeGroupMembersModal() {
    const modal = document.getElementById('group-members-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Setup de listeners para modais de grupos
function setupGroupModalListeners() {
    // Modal de grupo
    const groupForm = document.getElementById('group-form');
    if (groupForm) {
        groupForm.addEventListener('submit', handleGroupFormSubmit);
    }
    
    const groupModalCancel = document.getElementById('group-modal-cancel');
    if (groupModalCancel) {
        groupModalCancel.addEventListener('click', closeGroupModal);
    }
    
    const groupModalDelete = document.getElementById('group-modal-delete');
    if (groupModalDelete) {
        groupModalDelete.addEventListener('click', handleGroupDelete);
    }
    
    // Modal de convite
    const inviteForm = document.getElementById('invite-member-form');
    if (inviteForm) {
        inviteForm.addEventListener('submit', handleInviteFormSubmit);
    }
    
    const inviteModalCancel = document.getElementById('invite-member-modal-cancel');
    if (inviteModalCancel) {
        inviteModalCancel.addEventListener('click', closeInviteMemberModal);
    }
    
    // Modal de membros
    const membersModalClose = document.getElementById('group-members-modal-close');
    if (membersModalClose) {
        membersModalClose.addEventListener('click', closeGroupMembersModal);
    }
    
    // Fechar modais ao clicar fora
    document.addEventListener('click', function(e) {
        const groupModal = document.getElementById('group-modal');
        const inviteModal = document.getElementById('invite-member-modal');
        const membersModal = document.getElementById('group-members-modal');
        
        if (groupModal && e.target === groupModal) {
            closeGroupModal();
        }
        if (inviteModal && e.target === inviteModal) {
            closeInviteMemberModal();
        }
        if (membersModal && e.target === membersModal) {
            closeGroupMembersModal();
        }
    });
}

// Lidar com submissão do form de grupo
async function handleGroupFormSubmit(e) {
    e.preventDefault();
    
    const nameInput = document.getElementById('group-name');
    const descriptionInput = document.getElementById('group-description');
    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();
    
    if (!name) {
        DevDeck.showAlert('O nome do grupo é obrigatório', 'Erro');
        return;
    }
    
    try {
        DevDeck.showLoading();
        
        if (groupModalState.isEditing && groupModalState.currentGroupId) {
            // Editar grupo
            await updateGroup(groupModalState.currentGroupId, name, description);
            DevDeck.showAlert('Grupo atualizado com sucesso!', 'Sucesso');
        } else {
            // Criar novo grupo
            await createGroup(name, description);
            DevDeck.showAlert('Grupo criado com sucesso!', 'Sucesso');
        }
        
        // Recarregar grupos
        await loadGroups();
        closeGroupModal();
        
        // Se tem uma função para renderizar grupos, chamar
        if (typeof renderGroupsList === 'function') {
            renderGroupsList();
        }
    } catch (error) {
        console.error('Erro ao salvar grupo:', error);
        DevDeck.showAlert(error.message || 'Erro ao salvar grupo', 'Erro');
    } finally {
        DevDeck.hideLoading();
    }
}

// Lidar com exclusão de grupo
async function handleGroupDelete(e) {
    e.preventDefault();
    
    if (!groupModalState.currentGroupId) return;
    
    const group = allGroups.find(g => g.id === groupModalState.currentGroupId);
    if (!group) return;
    
    const confirmed = await DevDeck.showConfirm(
        `Tem certeza que deseja deletar o grupo "${group.name}"? Esta ação não pode ser desfeita.`,
        'Confirmar Exclusão'
    );
    
    if (!confirmed) return;
    
    try {
        DevDeck.showLoading();
        
        await deleteGroup(groupModalState.currentGroupId);
        DevDeck.showAlert('Grupo deletado com sucesso!', 'Sucesso');
        
        // Recarregar grupos
        await loadGroups();
        closeGroupModal();
        
        // Se tem uma função para renderizar grupos, chamar
        if (typeof renderGroupsList === 'function') {
            renderGroupsList();
        }
    } catch (error) {
        console.error('Erro ao deletar grupo:', error);
        DevDeck.showAlert(error.message || 'Erro ao deletar grupo', 'Erro');
    } finally {
        DevDeck.hideLoading();
    }
}

// Lidar com submissão do form de convite
async function handleInviteFormSubmit(e) {
    e.preventDefault();
    
    const groupIdInput = document.getElementById('invite-group-id');
    const emailInput = document.getElementById('invite-email');
    const roleSelect = document.getElementById('invite-role');
    
    const groupId = parseInt(groupIdInput.value);
    const email = emailInput.value.trim();
    const role = roleSelect.value;
    
    if (!email) {
        DevDeck.showAlert('O email é obrigatório', 'Erro');
        return;
    }
    
    try {
        DevDeck.showLoading();
        
        await inviteGroupMember(groupId, email, role);
        DevDeck.showAlert('Convite enviado com sucesso!', 'Sucesso');
        
        closeInviteMemberModal();
    } catch (error) {
        console.error('Erro ao enviar convite:', error);
        DevDeck.showAlert(error.message || 'Erro ao enviar convite', 'Erro');
    } finally {
        DevDeck.hideLoading();
    }
}

// Expor funções globalmente
window.openGroupModal = openGroupModal;
window.closeGroupModal = closeGroupModal;
window.openInviteMemberModal = openInviteMemberModal;
window.closeInviteMemberModal = closeInviteMemberModal;
window.openGroupMembersModal = openGroupMembersModal;
window.closeGroupMembersModal = closeGroupMembersModal;
window.setupGroupModalListeners = setupGroupModalListeners;
