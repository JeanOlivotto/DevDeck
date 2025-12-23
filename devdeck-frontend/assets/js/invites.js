// Gerenciamento de convites de grupos
let pendingInvites = [];
let invitesRefreshInterval = null;

// Carregar convites pendentes
async function loadPendingInvites(silent = false) {
    try {
        // Usar fetchApiSilent se disponível (para requisições em background)
        // Fallback para fetchApi se fetchApiSilent não existir
        const fetchFunction = (silent && typeof DevDeck.fetchApiSilent === 'function')
            ? DevDeck.fetchApiSilent
            : DevDeck.fetchApi;
        
        const invites = await fetchFunction('/groups/invites/pending');
        pendingInvites = invites || [];
        updateInvitesDisplay();
        return invites;
    } catch (error) {
        console.error('Erro ao carregar convites pendentes:', error);
        return [];
    }
}

// Atualizar a exibição de convites no dropdown
function updateInvitesDisplay() {
    const invitesContainer = document.getElementById('pending-invites-container');
    const invitesBadge = document.getElementById('invites-badge');
    
    if (!invitesContainer) return;
    
    // Atualizar badge de número de convites
    if (invitesBadge && pendingInvites.length > 0) {
        invitesBadge.textContent = pendingInvites.length;
        invitesBadge.classList.remove('hidden');
    } else if (invitesBadge) {
        invitesBadge.classList.add('hidden');
    }
    
    // Limpar container
    invitesContainer.innerHTML = '';
    
    if (pendingInvites.length === 0) {
        invitesContainer.innerHTML = '<p class="text-sm text-gray-500 p-3">Nenhum convite pendente</p>';
        return;
    }
    
    // Renderizar cada convite
    pendingInvites.forEach(invite => {
        const inviteElement = createInviteElement(invite);
        invitesContainer.appendChild(inviteElement);
    });
}

// Criar elemento HTML para um convite
function createInviteElement(invite) {
    const div = document.createElement('div');
    div.className = 'p-3 border-b border-gray-700 last:border-b-0 hover:bg-gray-800/50 transition-colors';
    div.innerHTML = `
        <div class="flex items-start justify-between gap-2">
            <div class="flex-grow">
                <p class="font-medium text-white text-sm">${escapeHtml(invite.group.name)}</p>
                <p class="text-xs text-gray-400">Criado por: ${escapeHtml(invite.group.owner.name)}</p>
            </div>
            <div class="flex gap-2">
                <button class="accept-invite-btn bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs transition-colors" data-invite-id="${invite.id}" data-group-id="${invite.groupId}">
                    Aceitar
                </button>
                <button class="reject-invite-btn bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-colors" data-invite-id="${invite.id}" data-group-id="${invite.groupId}">
                    Rejeitar
                </button>
            </div>
        </div>
    `;
    
    // Adicionar event listeners
    div.querySelector('.accept-invite-btn').addEventListener('click', async function() {
        await handleAcceptInvite(invite.groupId, this);
    });
    
    div.querySelector('.reject-invite-btn').addEventListener('click', async function() {
        await handleRejectInvite(invite.groupId, this);
    });
    
    return div;
}

// Aceitar convite
async function handleAcceptInvite(groupId, buttonElement) {
    try {
        buttonElement.disabled = true;
        buttonElement.textContent = 'Processando...';
        
        const response = await DevDeck.fetchApi(`/groups/${groupId}/accept-invite`, {
            method: 'POST'
        });
        
        // Remover convite da lista e recarregar grupos
        removeInviteFromUI(groupId);
        hideInvitesIfEmpty();
        
        // Recarregar grupos e re-renderizar TUDO (sidebar, navbar)
        await loadGroups();
        
        // Garantir que as funções existem antes de chamar
        if (typeof renderGroupsSidebar === 'function') {
            renderGroupsSidebar();
        }
        if (typeof renderGroupsListDropdown === 'function') {
            renderGroupsListDropdown();
        }
        
        DevDeck.showAlert('Convite aceito com sucesso!', 'Sucesso');
    } catch (error) {
        console.error('Erro ao aceitar convite:', error);
        DevDeck.showAlert('Erro ao aceitar convite', 'Erro');
        buttonElement.disabled = false;
        buttonElement.textContent = 'Aceitar';
    }
}

// Rejeitar convite
async function handleRejectInvite(groupId, buttonElement) {
    try {
        buttonElement.disabled = true;
        buttonElement.textContent = 'Processando...';
        
        await DevDeck.fetchApi(`/groups/${groupId}/reject-invite`, {
            method: 'POST'
        });
        
        // Remover convite da lista SEM RECARREGAR TUDO
        removeInviteFromUI(groupId);
        hideInvitesIfEmpty();
        
        DevDeck.showAlert('Convite rejeitado', 'Sucesso');
    } catch (error) {
        console.error('Erro ao rejeitar convite:', error);
        DevDeck.showAlert('Erro ao rejeitar convite', 'Erro');
        buttonElement.disabled = false;
        buttonElement.textContent = 'Rejeitar';
    }
}

// Função auxiliar para escapar HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Inicializar listeners de convites
function setupInvitesListeners() {
    // Recarregar convites periodicamente (a cada 30 segundos) SEM mostrar loading
    // Usa silent=true se fetchApiSilent existir, senão usa fetchApi normal
    setInterval(() => {
        const useSilent = typeof DevDeck.fetchApiSilent === 'function';
        loadPendingInvites(useSilent);
    }, 30000);
    
    // Recarregar ao abrir o menu do usuário (COM loading, pois é ação do usuário)
    const userMenuButton = document.getElementById('user-menu-button');
    if (userMenuButton) {
        userMenuButton.addEventListener('click', () => loadPendingInvites(false));
    }
    
    // Botão de refresh de convites (COM loading, pois é ação do usuário)
    const refreshButton = document.getElementById('refresh-invites-button');
    if (refreshButton) {
        refreshButton.addEventListener('click', function(e) {
            e.stopPropagation();
            const svg = refreshButton.querySelector('svg');
            svg.style.animation = 'spin 1s linear infinite';
            
            loadPendingInvites(false).finally(() => {
                svg.style.animation = '';
            });
        });
    }
}

// Expor funções globalmente
window.loadPendingInvites = loadPendingInvites;
window.updateInvitesDisplay = updateInvitesDisplay;
