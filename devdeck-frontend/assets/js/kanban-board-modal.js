/* BOARD MODAL - Gerenciamento de criação/edição de boards */

let boardModalState = {
    isEditing: false,
    currentBoardId: null,
    currentBoard: null
};

// Abrir modal de criar/editar board
function openBoardModal(board = null) {
    const modal = document.getElementById('board-modal');
    const title = document.getElementById('board-modal-title');
    const form = document.getElementById('board-form');
    const nameInput = document.getElementById('board-name');
    const boardIdInput = document.getElementById('board-id');
    
    // Elementos do Discord
    const discordEnabledInput = document.getElementById('board-discord-enabled');
    const discordWebhookInput = document.getElementById('board-discord-webhook');
    const discordContainer = document.getElementById('board-discord-container');
    
    // Elementos de ticket público
    const publicSection = document.getElementById('board-public-section');
    const isPublicInput = document.getElementById('board-is-public');
    const publicLinkContainer = document.getElementById('public-link-container');
    const publicLinkInput = document.getElementById('board-public-link');
    
    if (!modal || !form) return;
    
    boardModalState.isEditing = !!board;
    boardModalState.currentBoardId = board ? board.id : null;
    boardModalState.currentBoard = board;
    
    // Limpar form
    form.reset();
    if (boardIdInput) boardIdInput.value = '';
    if (discordWebhookInput) discordWebhookInput.value = '';
    if (discordEnabledInput) discordEnabledInput.checked = false;
    if (discordContainer) discordContainer.classList.add('hidden');
    if (publicSection) publicSection.classList.add('hidden');
    
    if (board && board.id) {
        // Modo edição
        title.textContent = 'Editar Quadro';
        nameInput.value = board.name || '';
        if (boardIdInput) boardIdInput.value = board.id;
        
        // Configurar Discord
        if (board.discordWebhook && discordWebhookInput && discordEnabledInput) {
            discordWebhookInput.value = board.discordWebhook;
            discordEnabledInput.checked = true;
            if (discordContainer) discordContainer.classList.remove('hidden');
        }
        
        // Mostrar seção de tickets públicos para boards pessoais
        if (board.type === 'personal' && publicSection) {
            publicSection.classList.remove('hidden');
            
            if (isPublicInput) {
                isPublicInput.checked = !!board.isPublicTicketBoard;
            }
            
            if (board.isPublicTicketBoard && board.publicToken) {
                const baseUrl = window.location.origin;
                const publicUrl = `${baseUrl}/ticket.php?token=${board.publicToken}`;
                if (publicLinkInput) publicLinkInput.value = publicUrl;
                if (publicLinkContainer) publicLinkContainer.classList.remove('hidden');
            } else {
                if (publicLinkContainer) publicLinkContainer.classList.add('hidden');
            }
        }
    } else {
        // Modo criação
        title.textContent = 'Novo Quadro';
    }
    
    modal.classList.remove('hidden');
}

// Fechar modal de board
function closeBoardModal() {
    const modal = document.getElementById('board-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    boardModalState = { isEditing: false, currentBoardId: null, currentBoard: null };
}

// Toggle do container de Discord
function toggleBoardDiscordContainer(show) {
    const container = document.getElementById('board-discord-container');
    if (container) {
        if (show) {
            container.classList.remove('hidden');
        } else {
            container.classList.add('hidden');
            // Limpar webhook ao desativar
            const webhookInput = document.getElementById('board-discord-webhook');
            if (webhookInput) webhookInput.value = '';
        }
    }
}

// Setup de listeners para board modal
function setupBoardModalListeners() {
    // Listener do form de board
    const boardForm = document.getElementById('board-form');
    if (boardForm) {
        const newBoardForm = boardForm.cloneNode(true);
        boardForm.parentNode.replaceChild(newBoardForm, boardForm);
        
        newBoardForm.addEventListener('submit', async (e) => {
            await handleBoardFormSubmit(e);
        });
    }
    
    // Listener do botão cancelar
    const cancelBtn = document.getElementById('board-modal-cancel');
    if (cancelBtn) {
        const newCancelBtn = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        newCancelBtn.addEventListener('click', closeBoardModal);
    }
    
    // Listener do toggle Discord
    const discordToggle = document.getElementById('board-discord-enabled');
    if (discordToggle) {
        const newToggle = discordToggle.cloneNode(true);
        discordToggle.parentNode.replaceChild(newToggle, discordToggle);
        newToggle.addEventListener('change', (e) => {
            toggleBoardDiscordContainer(e.target.checked);
        });
    }
    
    // Listener do toggle público
    const publicToggle = document.getElementById('board-is-public');
    if (publicToggle) {
        const newPublicToggle = publicToggle.cloneNode(true);
        publicToggle.parentNode.replaceChild(newPublicToggle, publicToggle);
        newPublicToggle.addEventListener('change', async (e) => {
            if (boardModalState.currentBoardId) {
                await toggleBoardPublic(boardModalState.currentBoardId, e.target.checked);
            }
        });
    }
    
    // Listener do botão copiar link
    const copyLinkBtn = document.getElementById('copy-link-btn');
    if (copyLinkBtn) {
        const newCopyBtn = copyLinkBtn.cloneNode(true);
        copyLinkBtn.parentNode.replaceChild(newCopyBtn, copyLinkBtn);
        newCopyBtn.addEventListener('click', async () => {
            const linkInput = document.getElementById('board-public-link');
            if (linkInput) {
                linkInput.select();
                await navigator.clipboard.writeText(linkInput.value);
                DevDeck.showAlert('Link copiado!', 'Sucesso');
            }
        });
    }
}

// Lidar com submissão do form de board
async function handleBoardFormSubmit(e) {
    e.preventDefault();
    
    const nameInput = document.getElementById('board-name');
    const name = nameInput.value.trim();
    
    if (!name) {
        DevDeck.showAlert('O nome do board é obrigatório', 'Erro');
        return;
    }
    
    // Pegar webhook do Discord
    const discordEnabledInput = document.getElementById('board-discord-enabled');
    const discordWebhookInput = document.getElementById('board-discord-webhook');
    const discordEnabled = discordEnabledInput ? discordEnabledInput.checked : false;
    const rawWebhook = discordWebhookInput ? discordWebhookInput.value.trim() : '';
    
    // Se ativado e tem webhook, envia; senão envia null
    let finalWebhook = null;
    if (discordEnabled && rawWebhook !== '') {
        finalWebhook = rawWebhook;
    }
    
    try {
        DevDeck.showLoading();
        
        if (boardModalState.isEditing && boardModalState.currentBoardId) {
            // Editar board existente
            const payload = { 
                name,
                discordWebhook: finalWebhook
            };
            
            await DevDeck.fetchApi(`/boards/${boardModalState.currentBoardId}`, {
                method: 'PATCH',
                body: JSON.stringify(payload)
            });
            
            DevDeck.showAlert('Board atualizado com sucesso!', 'Sucesso');
            
            // Atualizar nome no seletor
            if (typeof updateBoardInSelector === 'function') {
                updateBoardInSelector(boardModalState.currentBoardId, name);
            }
        } else {
            // Criar novo board
            const payload = { 
                name,
                discordWebhook: finalWebhook
            };
            
            // Se estiver em contexto de grupo
            if (typeof currentGroupId !== 'undefined' && currentGroupId) {
                payload.groupId = currentGroupId;
                payload.type = 'group';
            }
            
            const newBoard = await DevDeck.fetchApi('/boards', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            
            DevDeck.showAlert('Board criado com sucesso!', 'Sucesso');
            
            // Adicionar ao seletor
            if (typeof addBoardToSelector === 'function') {
                addBoardToSelector(newBoard);
            }
            
            // Selecionar o novo board
            if (typeof selectBoard === 'function') {
                selectBoard(newBoard.id);
            }
        }
        
        closeBoardModal();
        
        // Recarregar boards
        if (typeof currentGroupId !== 'undefined' && currentGroupId) {
            if (typeof loadGroupBoards === 'function') await loadGroupBoards(currentGroupId);
        } else {
            if (typeof loadPersonalBoards === 'function') await loadPersonalBoards();
        }
        
    } catch (error) {
        console.error('Erro ao salvar board:', error);
        DevDeck.showAlert(error.message || 'Erro ao salvar board', 'Erro');
    } finally {
        DevDeck.hideLoading();
    }
}

// Toggle board público
async function toggleBoardPublic(boardId, isPublic) {
    try {
        DevDeck.showLoading();
        
        const response = await DevDeck.fetchApi(`/boards/${boardId}/public-toggle`, {
            method: 'PATCH',
            body: JSON.stringify({ isPublic })
        });
        
        const publicLinkContainer = document.getElementById('public-link-container');
        const publicLinkInput = document.getElementById('board-public-link');
        
        if (isPublic && response.publicToken) {
            const baseUrl = window.location.origin;
            const publicUrl = `${baseUrl}/ticket.php?token=${response.publicToken}`;
            if (publicLinkInput) publicLinkInput.value = publicUrl;
            if (publicLinkContainer) publicLinkContainer.classList.remove('hidden');
            DevDeck.showAlert('Board público ativado!', 'Sucesso');
        } else {
            if (publicLinkContainer) publicLinkContainer.classList.add('hidden');
            DevDeck.showAlert('Board público desativado', 'Sucesso');
        }
        
    } catch (error) {
        console.error('Erro ao toggle público:', error);
        DevDeck.showAlert(error.message || 'Erro ao alterar visibilidade', 'Erro');
    } finally {
        DevDeck.hideLoading();
    }
}

// Expor funções globalmente
window.openBoardModal = openBoardModal;
window.closeBoardModal = closeBoardModal;
window.toggleBoardDiscordContainer = toggleBoardDiscordContainer;
window.setupBoardModalListeners = setupBoardModalListeners;
window.toggleBoardPublic = toggleBoardPublic;
