/* KANBAN MODALS - FIXED */

function openTaskModal(task = null, status = 'TODO') {
    const modal = document.getElementById('task-modal');
    const form = document.getElementById('task-form');
    const titleEl = document.getElementById('modal-title');
    const deleteBtn = document.getElementById('modal-delete');
    
    form.reset();
    document.getElementById('task-id').value = '';
    
    if (task) {
        titleEl.textContent = 'Editar Tarefa';
        document.getElementById('task-id').value = task.id;
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description || '';
        document.getElementById('task-status').value = task.status;
        
        if(document.getElementById('task-priority')) 
            document.getElementById('task-priority').value = task.priority || 'MEDIUM';
        
        deleteBtn.classList.remove('hidden');
        deleteBtn.onclick = () => confirmDeleteTask(task.id);
    } else {
        titleEl.textContent = 'Nova Tarefa';
        document.getElementById('task-status').value = status;
        deleteBtn.classList.add('hidden');
    }
    
    modal.classList.remove('hidden');
}

// Handler de Salvar
const taskForm = document.getElementById('task-form');
if (taskForm) {
    const newTaskForm = taskForm.cloneNode(true);
    taskForm.parentNode.replaceChild(newTaskForm, taskForm);

    newTaskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('task-id').value;
        const title = document.getElementById('task-title').value.trim();
        const description = document.getElementById('task-description').value.trim();
        const status = document.getElementById('task-status').value;
        
        if (!title) return;

        // CORREÇÃO: boardId deve ser inteiro e seguro
        const boardId = currentBoardId ? parseInt(currentBoardId) : null;
        if (!boardId && !id) {
            alert('Erro: Nenhum quadro selecionado.');
            return;
        }

        const payload = {
            title,
            description,
            status,
            boardId: boardId 
        };

        const priorityEl = document.getElementById('task-priority');
        if (priorityEl) payload.priority = priorityEl.value;

        try {
            if (id) {
                await DevDeck.fetchApi(`/tasks/${id}`, {
                    method: 'PATCH',
                    body: JSON.stringify(payload)
                });
            } else {
                await DevDeck.fetchApi('/tasks', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
            }
            
            document.getElementById('task-modal').classList.add('hidden');
            if (typeof loadTasks === 'function') loadTasks(currentBoardId);
            else window.location.reload();
            
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro: ' + error.message);
        }
    });
}

// Fechar modais
document.querySelectorAll('.modal-close-button, .modal-cancel-button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.target.closest('.modal').classList.add('hidden');
    });
});

async function confirmDeleteTask(id) {
    if(confirm('Excluir tarefa?')) {
        await DevDeck.fetchApi(`/tasks/${id}`, { method: 'DELETE' });
        document.getElementById('task-modal').classList.add('hidden');
        if (typeof loadTasks === 'function') loadTasks(currentBoardId);
    }
}

// Tornar global
window.openTaskModal = openTaskModal;