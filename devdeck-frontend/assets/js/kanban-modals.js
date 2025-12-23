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
            // Apenas enviar o novo status
            // O backend fará auto-atribuição baseado no usuário logado
            const payload = { status: newStatus };
            
            await DevDeck.fetchApi(`/tasks/${taskId}`, {
                method: 'PATCH',
                body: JSON.stringify(payload)
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
    const assignedUserDisplay = document.getElementById('assigned-user-display') || createAssignedUserDisplay();
    const subtaskUI = ensureSubtasksSection();
    
    if (task) {
        modalTitle.textContent = 'Editar Tarefa';
        taskIdInput.value = task.id;
        taskTitleInput.value = task.title;
        taskDescriptionInput.value = task.description || '';
        taskStatusSelect.value = task.status;
        modalDeleteButton.classList.remove('hidden');
        
        // Mostrar quem está fazendo a tarefa
        if (task.assignedUser) {
            assignedUserDisplay.innerHTML = `
                <strong>👤 Atribuída a:</strong> ${task.assignedUser.name}
                <small style="color: #a0aec0;">(${task.assignedUser.email})</small>
            `;
            assignedUserDisplay.classList.remove('hidden');
        } else {
            assignedUserDisplay.innerHTML = `
                <strong>👤 Atribuída a:</strong> <em style="color: #64748b;">Ninguém está fazendo esta tarefa</em>
            `;
            assignedUserDisplay.classList.remove('hidden');
        }

        // Renderizar subtarefas
        renderModalSubtasks(task, subtaskUI);
    } else {
        modalTitle.textContent = 'Nova Tarefa';
        taskIdInput.value = '';
        taskTitleInput.value = '';
        taskDescriptionInput.value = '';
        taskStatusSelect.value = defaultStatus;
        modalDeleteButton.classList.add('hidden');
        assignedUserDisplay.classList.add('hidden');

        // Limpar subtarefas e bloquear adição até salvar
        renderModalSubtasks(null, subtaskUI);
    }
    
    taskModal.classList.remove('hidden');
    taskTitleInput.focus();
}

function ensureSubtasksSection() {
    let section = document.getElementById('subtasks-section');
    if (section) {
        return {
            section,
            list: section.querySelector('#subtasks-list'),
            empty: section.querySelector('#subtasks-empty'),
            input: section.querySelector('#new-subtask-title'),
            addButton: section.querySelector('#add-subtask-btn'),
        };
    }

    section = document.createElement('div');
    section.id = 'subtasks-section';
    section.className = 'subtasks-section';

    const heading = document.createElement('div');
    heading.className = 'subtasks-heading';
    heading.textContent = 'Subtarefas (opcionais)';
    section.appendChild(heading);

    const list = document.createElement('div');
    list.id = 'subtasks-list';
    list.className = 'subtasks-list';
    section.appendChild(list);

    const empty = document.createElement('div');
    empty.id = 'subtasks-empty';
    empty.className = 'task-subtasks-empty';
    empty.textContent = 'Nenhuma subtarefa ainda.';
    section.appendChild(empty);

    const addRow = document.createElement('div');
    addRow.className = 'task-subtasks-add';
    
    const input = document.createElement('input');
    input.id = 'new-subtask-title';
    input.type = 'text';
    input.placeholder = 'Adicionar subtarefa';
    addRow.appendChild(input);

    const addButton = document.createElement('button');
    addButton.id = 'add-subtask-btn';
    addButton.type = 'button';
    addButton.textContent = 'Adicionar';
    addButton.addEventListener('click', handleAddSubtaskFromModal);
    addRow.appendChild(addButton);

    section.appendChild(addRow);

    const taskModal = document.getElementById('task-modal');
    const modalContent = taskModal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.appendChild(section);
    }

    return { section, list, empty, input, addButton };
}

function renderModalSubtasks(task, subtaskUI) {
    const { list, empty, input, addButton } = subtaskUI;

    list.innerHTML = '';

    if (!task || !task.id) {
        empty.textContent = 'Salve a tarefa para adicionar subtarefas.';
        empty.classList.remove('hidden');
        input.value = '';
        input.disabled = true;
        addButton.disabled = true;
        return;
    }

    input.disabled = false;
    addButton.disabled = false;

    if (!task.subtasks || task.subtasks.length === 0) {
        empty.textContent = 'Nenhuma subtarefa ainda.';
        empty.classList.remove('hidden');
    } else {
        empty.classList.add('hidden');
        task.subtasks.forEach((subtask) => {
            const item = document.createElement('label');
            item.className = 'task-subtask-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'task-subtask-checkbox';
            checkbox.checked = !!subtask.completed;
            checkbox.addEventListener('change', async (e) => {
                e.stopPropagation();
                try {
                    await toggleSubtaskCompletion(task.id, subtask.id, e.target.checked);
                    await refreshModalSubtasks(task.id);
                } catch (err) {
                    console.error('Erro ao atualizar subtarefa:', err);
                    DevDeck.showAlert('Erro ao atualizar subtarefa', 'Erro');
                }
            });

            const text = document.createElement('span');
            text.className = 'task-subtask-text' + (subtask.completed ? ' completed' : '');
            text.textContent = subtask.title;

            item.appendChild(checkbox);
            item.appendChild(text);
            list.appendChild(item);
        });
    }
}

async function handleAddSubtaskFromModal() {
    const taskId = document.getElementById('task-id').value;
    const input = document.getElementById('new-subtask-title');
    const title = (input.value || '').trim();

    if (!taskId) {
        DevDeck.showAlert('Salve a tarefa antes de adicionar subtarefas.', 'Aviso');
        return;
    }

    if (!title) return;

    try {
        await DevDeck.fetchApi(`/tasks/${taskId}/subtasks`, {
            method: 'POST',
            body: JSON.stringify({ title })
        });
        input.value = '';
        await loadTasks(currentBoardId);
        await refreshModalSubtasks(taskId);
    } catch (err) {
        console.error('Erro ao adicionar subtarefa:', err);
        DevDeck.showAlert('Erro ao adicionar subtarefa', 'Erro');
    }
}

async function refreshModalSubtasks(taskId) {
    try {
        const task = await DevDeck.fetchApi(`/tasks/${taskId}`);
        const subtaskUI = ensureSubtasksSection();
        renderModalSubtasks(task, subtaskUI);
    } catch (err) {
        console.error('Erro ao recarregar subtarefas:', err);
    }
}

function createAssignedUserDisplay() {
    const display = document.createElement('div');
    display.id = 'assigned-user-display';
    display.style.marginTop = '0.75rem';
    display.style.paddingTop = '0.75rem';
    display.style.borderTop = '1px solid rgba(162, 89, 255, 0.2)';
    display.style.fontSize = '0.875rem';
    display.style.color = '#a0aec0';
    display.classList.add('hidden');
    
    const taskModal = document.getElementById('task-modal');
    const modalContent = taskModal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.appendChild(display);
    }
    
    return display;
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
            const payload = { name };
            // Respeitar o contexto atual: grupo ou pessoal
            if (typeof currentGroupId === 'number' && currentGroupId) {
                payload.type = 'group';
                payload.groupId = currentGroupId;
            } else {
                payload.type = 'personal';
            }
            const newBoard = await DevDeck.fetchApi('/boards', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            currentBoardId = newBoard.id;
        }
        
        closeBoardModal();
        await reloadBoardsForCurrentContext();
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
        
        await reloadBoardsForCurrentContext();
    } catch (error) {
        console.error('Erro ao excluir quadro:', error);
        DevDeck.showAlert(error.message, 'Erro');
    }
}
