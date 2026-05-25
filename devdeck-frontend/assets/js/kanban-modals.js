/* KANBAN MODALS - FIXED */

let boardMembers = []; // Cache de membros da board

function openTaskModal(task = null, status = 'TODO') {
    const modal = document.getElementById('task-modal');
    const form = document.getElementById('task-form');
    const titleEl = document.getElementById('modal-title');
    const deleteBtn = document.getElementById('modal-delete');
    
    form.reset();
    document.getElementById('task-id').value = '';
    
    if (task) {
        titleEl.textContent = task.isTicket ? 'Ticket' : 'Editar Tarefa';
        document.getElementById('task-id').value = task.id;
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description || '';
        document.getElementById('task-status').value = task.status;

        if(document.getElementById('task-priority'))
            document.getElementById('task-priority').value = task.priority || 'MEDIUM';

        // Mostrar info de ticket se aplicável
        const ticketSection = document.getElementById('ticket-info-section');
        if (ticketSection) {
            if (task.isTicket) {
                ticketSection.classList.remove('hidden');
                document.getElementById('ticket-requester-name').textContent =
                    task.requesterName || (task.requester?.name) || '-';
                document.getElementById('ticket-requester-company').textContent =
                    task.requester?.company || '-';
                document.getElementById('ticket-category-display').textContent =
                    task.category || '-';
            } else {
                ticketSection.classList.add('hidden');
            }
        }

        // Carregar usuário atribuído
        const assignedSelect = document.getElementById('task-assigned-user');
        if (assignedSelect && task.assignedUserId) {
            assignedSelect.value = task.assignedUserId;
        }

        deleteBtn.classList.remove('hidden');
        deleteBtn.onclick = () => confirmDeleteTask(task.id);
    } else {
        titleEl.textContent = 'Nova Tarefa';
        document.getElementById('task-status').value = status;
        deleteBtn.classList.add('hidden');

        const ticketSection = document.getElementById('ticket-info-section');
        if (ticketSection) ticketSection.classList.add('hidden');

        const assignedSelect = document.getElementById('task-assigned-user');
        if (assignedSelect) {
            assignedSelect.value = '';
        }
    }
    
    // Carregar membros da board/grupo
    loadBoardMembersInModal();
    
    modal.classList.remove('hidden');
}

// Função para carregar membros disponíveis
async function loadBoardMembersInModal() {
    const assignedSelect = document.getElementById('task-assigned-user');
    if (!assignedSelect) return;
    
    try {
        let members = [];
        
        // Se for grupo, buscar TODOS os membros aceitos do grupo
        if (typeof currentGroupId !== 'undefined' && currentGroupId) {
            try {
                // Tentar primeiro o endpoint específico de membros
                const membersData = await DevDeck.fetchApi(`/groups/${currentGroupId}/members`);
                if (Array.isArray(membersData)) {
                    // Novo endpoint retorna array direto
                    members = membersData
                        .filter(m => m && m.user) // Filtrar membros válidos
                        .map(m => ({ 
                            id: m.userId, 
                            name: m.user.name, 
                            email: m.user.email,
                            status: m.inviteStatus 
                        }));
                    
                    console.log(`Carregados ${members.length} membros aceitos do grupo ${currentGroupId}`);
                } else if (membersData && membersData.members) {
                    // Fallback para endpoint antigo que retorna grupo completo
                    members = membersData.members
                        .filter(m => m && m.user) // Filtrar membros válidos
                        .map(m => ({ 
                            id: m.userId, 
                            name: m.user.name, 
                            email: m.user.email,
                            status: m.inviteStatus 
                        }));
                    
                    console.log(`Carregados ${members.length} membros do grupo ${currentGroupId} (fallback)`);
                }
            } catch (groupError) {
                // Se falhar, tentar endpoint alternativo GET /api/groups/:id
                try {
                    console.warn('Endpoint /members falhou, tentando /groups/:id');
                    const groupData = await DevDeck.fetchApi(`/groups/${currentGroupId}`);
                    if (groupData && groupData.members && Array.isArray(groupData.members)) {
                        members = groupData.members
                            .filter(m => m && m.user && m.inviteStatus === 'accepted')
                            .map(m => ({ 
                                id: m.userId, 
                                name: m.user.name, 
                                email: m.user.email,
                                status: m.inviteStatus 
                            }));
                        
                        console.log(`Carregados ${members.length} membros aceitos do grupo ${currentGroupId}`);
                    }
                } catch (error) {
                    console.error('Erro em todos os endpoints de grupo:', error);
                }
            }
        } else {
            // Se for pessoal, buscar o próprio usuário
            const currentUser = DevDeck.getUserData();
            if (currentUser && currentUser.id) {
                members = [{ 
                    id: currentUser.id, 
                    name: currentUser.name, 
                    email: currentUser.email,
                    status: 'accepted'
                }];
            }
        }
        
        // Atualizar select com os membros
        const currentValue = assignedSelect.value;
        assignedSelect.innerHTML = '<option value="">Ninguém atribuído</option>';
        
        // Ordenar membros por nome
        members.sort((a, b) => a.name.localeCompare(b.name));
        
        members.forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = `${member.name} (${member.email})`;
            assignedSelect.appendChild(option);
        });
        
        console.log(`Select populado com ${assignedSelect.options.length - 1} membros`);
        
        // Restaurar valor anterior se existir
        if (currentValue) {
            assignedSelect.value = currentValue;
        }
        
        boardMembers = members;
    } catch (error) {
        console.error('Erro ao carregar membros:', error);
        // Ao menos mostrar opção "Ninguém atribuído"
        const assignedSelect = document.getElementById('task-assigned-user');
        if (assignedSelect) {
            assignedSelect.innerHTML = '<option value="">Ninguém atribuído (Erro ao carregar membros)</option>';
        }
    }
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
        const assignedUserIdEl = document.getElementById('task-assigned-user');
        const assignedUserId = assignedUserIdEl && assignedUserIdEl.value ? parseInt(assignedUserIdEl.value) : null;
        
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

        // Adicionar assignedUserId se definido
        if (assignedUserId) {
            payload.assignedUserId = assignedUserId;
        }

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

// Fechar task modal via Cancelar ou backdrop
function closeTaskModal() {
    document.getElementById('task-modal').classList.add('hidden');
}

document.getElementById('modal-cancel')?.addEventListener('click', closeTaskModal);

document.getElementById('task-modal')?.addEventListener('click', function(e) {
    if (e.target === this || e.target.classList.contains('modal-backdrop')) closeTaskModal();
});

// Fechar board modal via backdrop
document.getElementById('board-modal')?.addEventListener('click', function(e) {
    if (e.target === this || e.target.classList.contains('modal-backdrop')) {
        this.classList.add('hidden');
    }
});

// Fechar modais genéricos
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