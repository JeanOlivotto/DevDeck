// Funções de Drag and Drop
function setupDragAndDrop() {
    const taskCards = document.querySelectorAll('.task-card');
    const columns = document.querySelectorAll('.tasks');
    
    taskCards.forEach(card => {
        card.addEventListener('dragstart', handleTaskDragStart);
        card.addEventListener('dragend', handleTaskDragEnd);
    });
    
    columns.forEach(column => {
        column.addEventListener('dragover', handleTaskDragOver);
        column.addEventListener('drop', handleTaskDrop);
        column.addEventListener('dragleave', handleTaskDragLeave);
    });
}

function handleTaskDragStart(e) {
    draggedTaskElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleTaskDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.tasks').forEach(col => {
        col.classList.remove('drag-over');
    });
}

function handleTaskDragOver(e) {
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    this.classList.add('drag-over');
    return false;
}

function handleTaskDragLeave(e) {
    this.classList.remove('drag-over');
}

async function handleTaskDrop(e) {
    if (e.stopPropagation) e.stopPropagation();
    e.preventDefault();
    
    this.classList.remove('drag-over');
    
    if (draggedTaskElement) {
        const taskId = parseInt(draggedTaskElement.dataset.taskId);
        const newStatus = this.closest('.column').dataset.status;
        
        try {
            await DevDeck.fetchApi(`/tasks/${taskId}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus })
            });
            
            this.appendChild(draggedTaskElement);
            draggedTaskElement = null;
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            DevDeck.showAlert('Erro ao atualizar tarefa', 'Erro');
        }
    }
    
    return false;
}

// Modais de Tarefas
function openTaskModal(task = null, defaultStatus = 'TODO') {
    const taskModal = document.getElementById('task-modal');
    const modalTitle = document.getElementById('modal-title');
    const taskIdInput = document.getElementById('task-id');
    const taskTitleInput = document.getElementById('task-title');
    const taskDescriptionInput = document.getElementById('task-description');
    const taskStatusSelect = document.getElementById('task-status');
    const modalDeleteButton = document.getElementById('modal-delete');
    
    if (task) {
        modalTitle.textContent = 'Editar Tarefa';
        taskIdInput.value = task.id;
        taskTitleInput.value = task.title;
        taskDescriptionInput.value = task.description || '';
        taskStatusSelect.value = task.status;
        modalDeleteButton.classList.remove('hidden');
    } else {
        modalTitle.textContent = 'Nova Tarefa';
        taskIdInput.value = '';
        taskTitleInput.value = '';
        taskDescriptionInput.value = '';
        taskStatusSelect.value = defaultStatus;
        modalDeleteButton.classList.add('hidden');
    }
    
    taskModal.classList.remove('hidden');
    taskTitleInput.focus();
}

function closeTaskModal() {
    const taskModal = document.getElementById('task-modal');
    taskModal.classList.add('hidden');
}

function setupModalListeners() {
    const taskForm = document.getElementById('task-form');
    const taskModal = document.getElementById('task-modal');
    const modalCancelButton = document.getElementById('modal-cancel');
    const modalDeleteButton = document.getElementById('modal-delete');
    const boardForm = document.getElementById('board-form');
    const boardModalCancelButton = document.getElementById('board-modal-cancel');
    const alertModalOk = document.getElementById('alert-modal-ok');
    const confirmModalCancel = document.getElementById('confirm-modal-cancel');
    const infoModalClose = document.getElementById('info-modal-close');
    
    // Task form
    if (taskForm) {
        taskForm.addEventListener('submit', handleTaskSubmit);
    }
    
    if (modalCancelButton) {
        modalCancelButton.addEventListener('click', closeTaskModal);
    }
    
    if (modalDeleteButton) {
        modalDeleteButton.addEventListener('click', handleDeleteTask);
    }
    
    // Board form
    if (boardForm) {
        boardForm.addEventListener('submit', handleBoardSubmit);
    }
    
    if (boardModalCancelButton) {
        boardModalCancelButton.addEventListener('click', closeBoardModal);
    }
    
    // Alert modal
    if (alertModalOk) {
        alertModalOk.addEventListener('click', () => {
            document.getElementById('alert-modal').classList.add('hidden');
        });
    }
    
    // Confirm modal
    if (confirmModalCancel) {
        confirmModalCancel.addEventListener('click', () => {
            document.getElementById('confirm-modal').classList.add('hidden');
        });
    }
    
    // Info modal
    if (infoModalClose) {
        infoModalClose.addEventListener('click', () => {
            document.getElementById('info-modal').classList.add('hidden');
        });
    }
    
    // Fechar modal ao clicar fora
    if (taskModal) {
        taskModal.addEventListener('click', function(e) {
            if (e.target === taskModal) {
                closeTaskModal();
            }
        });
    }
}

async function handleTaskSubmit(e) {
    e.preventDefault();
    
    const taskId = document.getElementById('task-id').value;
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const status = document.getElementById('task-status').value;
    
    try {
        if (taskId) {
            // Atualizar tarefa existente
            await DevDeck.fetchApi(`/tasks/${taskId}`, {
                method: 'PATCH',
                body: JSON.stringify({ title, description, status, boardId: currentBoardId })
            });
        } else {
            // Criar nova tarefa
            await DevDeck.fetchApi('/tasks', {
                method: 'POST',
                body: JSON.stringify({ title, description, status, boardId: currentBoardId })
            });
        }
        
        closeTaskModal();
        await loadTasks(currentBoardId);
    } catch (error) {
        console.error('Erro ao salvar tarefa:', error);
        DevDeck.showAlert(error.message, 'Erro');
    }
}

async function handleDeleteTask() {
    const taskId = document.getElementById('task-id').value;
    const taskTitle = document.getElementById('task-title').value;
    
    const confirmed = await DevDeck.showConfirm(
        `Tem certeza que deseja excluir a tarefa "${taskTitle}"?`,
        'Confirmar Exclusão'
    );
    
    if (!confirmed) return;
    
    try {
        await DevDeck.fetchApi(`/tasks/${taskId}`, {
            method: 'DELETE'
        });
        
        closeTaskModal();
        await loadTasks(currentBoardId);
    } catch (error) {
        console.error('Erro ao excluir tarefa:', error);
        DevDeck.showAlert(error.message, 'Erro');
    }
}

// Modais de Board
function openBoardModal(board = null) {
    const boardModal = document.getElementById('board-modal');
    const boardModalTitle = document.getElementById('board-modal-title');
    const boardIdInput = document.getElementById('board-id');
    const boardNameInput = document.getElementById('board-name');
    
    if (board) {
        boardModalTitle.textContent = 'Renomear Quadro';
        boardIdInput.value = board.id;
        boardNameInput.value = board.name;
    } else {
        boardModalTitle.textContent = 'Novo Quadro';
        boardIdInput.value = '';
        boardNameInput.value = '';
    }
    
    boardModal.classList.remove('hidden');
    boardNameInput.focus();
}

function closeBoardModal() {
    const boardModal = document.getElementById('board-modal');
    const boardError = document.getElementById('board-error');
    boardModal.classList.add('hidden');
    if (boardError) boardError.classList.add('hidden');
}

async function handleBoardSubmit(e) {
    e.preventDefault();
    
    const boardId = document.getElementById('board-id').value;
    const name = document.getElementById('board-name').value;
    
    try {
        if (boardId) {
            // Atualizar board existente
            await DevDeck.fetchApi(`/boards/${boardId}`, {
                method: 'PATCH',
                body: JSON.stringify({ name })
            });
        } else {
            // Criar novo board
            const newBoard = await DevDeck.fetchApi('/boards', {
                method: 'POST',
                body: JSON.stringify({ name })
            });
            currentBoardId = newBoard.id;
        }
        
        closeBoardModal();
        await loadBoards();
    } catch (error) {
        console.error('Erro ao salvar quadro:', error);
        const boardError = document.getElementById('board-error');
        if (boardError) {
            boardError.textContent = error.message;
            boardError.classList.remove('hidden');
        }
    }
}

async function handleDeleteBoard(boardId, boardName) {
    const confirmed = await DevDeck.showConfirm(
        `Tem certeza que deseja excluir o quadro "${boardName}"? Todas as tarefas serão perdidas!`,
        'Confirmar Exclusão'
    );
    
    if (!confirmed) return;
    
    try {
        await DevDeck.fetchApi(`/boards/${boardId}`, {
            method: 'DELETE'
        });
        
        if (currentBoardId === boardId) {
            currentBoardId = null;
        }
        
        await loadBoards();
    } catch (error) {
        console.error('Erro ao excluir quadro:', error);
        DevDeck.showAlert(error.message, 'Erro');
    }
}
