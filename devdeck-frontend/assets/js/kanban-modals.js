/* KANBAN MODALS */

let boardMembers = [];
let currentModalGroupId = null;
let currentModalTaskId = null;

const MODAL_TABS = ['principal', 'detalhes', 'atribuicao'];

function resetModalTabs() {
    switchModalTab('principal');
}

function switchModalTab(name) {
    MODAL_TABS.forEach(t => {
        document.getElementById(`modal-panel-${t}`)?.classList.toggle('hidden', t !== name);
        document.getElementById(`modal-tab-${t}`)?.classList.toggle('modal-inner-tab-active', t === name);
    });
}

function openTaskModal(task = null, status = 'TODO') {
    const modal = document.getElementById('task-modal');
    const form = document.getElementById('task-form');
    const titleEl = document.getElementById('modal-title');
    const deleteBtn = document.getElementById('modal-delete');

    form.reset();
    document.getElementById('task-id').value = '';
    currentModalGroupId = null;
    currentModalTaskId = null;
    resetModalTabs();

    // Reset subtasks
    document.getElementById('subtasks-list').innerHTML = '';
    document.getElementById('subtask-input-row').classList.add('hidden');

    const userData = DevDeck.getUserData();
    const isDevTeam = userData?.isDevTeam === true || userData?.isDevTeam === 'true' || userData?.isDevTeam === 1;
    const subtasksSection = document.getElementById('subtasks-section');
    if (subtasksSection) subtasksSection.classList.toggle('hidden', !isDevTeam);

    const badge = document.getElementById('modal-category-badge');

    if (task) {
        titleEl.textContent = task.isTicket ? 'Ticket' : 'Editar Tarefa';

        if (badge) {
            const cat = task.category || '';
            if (cat) {
                badge.textContent = cat;
                badge.className = 'text-xs font-medium px-2.5 py-1 rounded-full border ' + getCategoryStyle(cat);
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
        document.getElementById('task-id').value = task.id;
        currentModalTaskId = task.id;
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description || '';
        document.getElementById('task-status').value = task.status;

        if (document.getElementById('task-priority'))
            document.getElementById('task-priority').value = task.priority || 'MEDIUM';

        // Prazo — apenas data
        const dueDateEl = document.getElementById('task-duedate');
        if (dueDateEl && task.dueDate) {
            dueDateEl.value = task.dueDate.split('T')[0];
        }

        // Tempo estimado em horas
        const timeEl = document.getElementById('task-time');
        if (timeEl && task.estimatedTime != null) timeEl.value = task.estimatedTime;

        const tagsEl = document.getElementById('task-tags');
        if (tagsEl && task.tags) tagsEl.value = task.tags;

        const validationToggle = document.getElementById('task-requires-validation');
        if (validationToggle) validationToggle.checked = !!task.requiresValidation;

        // Info do ticket
        const ticketSection = document.getElementById('ticket-info-section');
        if (ticketSection) {
            if (task.isTicket) {
                ticketSection.classList.remove('hidden');
                document.getElementById('ticket-requester-name').textContent =
                    task.requesterName || task.requester?.name || '-';
                document.getElementById('ticket-requester-company').textContent =
                    task.requester?.company || '-';
                document.getElementById('ticket-category-display').textContent =
                    task.category || '-';
            } else {
                ticketSection.classList.add('hidden');
            }
        }

        currentModalGroupId = task.board?.groupId || null;

        const assignedSelect = document.getElementById('task-assigned-user');
        if (assignedSelect && task.assignedUserId) {
            assignedSelect.value = task.assignedUserId;
        }

        deleteBtn.classList.remove('hidden');
        deleteBtn.onclick = () => confirmDeleteTask(task.id);

        // Carregar subtasks existentes (só para devs)
        if (isDevTeam && task.subtasks?.length) {
            task.subtasks.forEach(st => renderSubtaskItem(st));
        }
    } else {
        titleEl.textContent = 'Nova Tarefa';
        if (badge) badge.classList.add('hidden');
        document.getElementById('task-status').value = status;
        deleteBtn.classList.add('hidden');

        const validationToggle = document.getElementById('task-requires-validation');
        if (validationToggle) validationToggle.checked = false;

        const ticketSection = document.getElementById('ticket-info-section');
        if (ticketSection) ticketSection.classList.add('hidden');

        const assignedSelect = document.getElementById('task-assigned-user');
        if (assignedSelect) assignedSelect.value = '';
    }

    loadBoardMembersInModal();
    modal.classList.remove('hidden');
}

// ─── Subtasks ────────────────────────────────────────────────────────────────

function renderSubtaskItem(subtask) {
    const list = document.getElementById('subtasks-list');
    const item = document.createElement('div');
    item.className = 'flex items-center gap-2 p-2 bg-[#1c1c1c] rounded border border-[#2a2a2a] group';
    item.dataset.subtaskId = subtask.id || '';
    item.innerHTML = `
        <input type="checkbox" class="subtask-check w-4 h-4 rounded border-[#404040] bg-[#141414] accent-white cursor-pointer flex-shrink-0" ${subtask.completed ? 'checked' : ''}>
        <span class="flex-1 text-sm text-white ${subtask.completed ? 'line-through text-[#555555]' : ''}">${escapeHtml(subtask.title)}</span>
        <button type="button" class="subtask-delete opacity-0 group-hover:opacity-100 text-[#555555] hover:text-red-400 transition-all text-xs px-1">✕</button>
    `;

    const check = item.querySelector('.subtask-check');
    check.addEventListener('change', () => {
        item.querySelector('span').classList.toggle('line-through', check.checked);
        item.querySelector('span').classList.toggle('text-[#555555]', check.checked);
        if (subtask.id && currentModalTaskId) {
            DevDeck.fetchApi(`/tasks/${currentModalTaskId}/subtasks/${subtask.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ completed: check.checked })
            }).catch(console.error);
        }
    });

    item.querySelector('.subtask-delete').addEventListener('click', () => {
        if (subtask.id && currentModalTaskId) {
            DevDeck.fetchApi(`/tasks/${currentModalTaskId}/subtasks/${subtask.id}`, { method: 'DELETE' })
                .catch(console.error);
        }
        item.remove();
    });

    list.appendChild(item);
}

// Event delegation para botões de subtask (sobrevive ao cloneNode do form)
document.addEventListener('click', async (e) => {
    if (e.target.closest('#add-subtask-btn')) {
        document.getElementById('subtask-input-row').classList.remove('hidden');
        document.getElementById('new-subtask-input').focus();
        return;
    }
    if (e.target.closest('#cancel-subtask-btn')) {
        document.getElementById('subtask-input-row').classList.add('hidden');
        document.getElementById('new-subtask-input').value = '';
        return;
    }
    if (e.target.closest('#confirm-subtask-btn')) {
        const input = document.getElementById('new-subtask-input');
        const title = input.value.trim();
        if (!title) return;

        let subtask = { id: null, title, completed: false };

        if (currentModalTaskId) {
            try {
                const saved = await DevDeck.fetchApi(`/tasks/${currentModalTaskId}/subtasks`, {
                    method: 'POST',
                    body: JSON.stringify({ title, completed: false })
                });
                subtask = saved;
            } catch (e) {
                console.error('Erro ao salvar subtask:', e);
            }
        }

        renderSubtaskItem(subtask);
        input.value = '';
        document.getElementById('subtask-input-row').classList.add('hidden');
        return;
    }
});

document.addEventListener('keydown', (e) => {
    if (e.target.id !== 'new-subtask-input') return;
    if (e.key === 'Enter') { e.preventDefault(); document.getElementById('confirm-subtask-btn').click(); }
    if (e.key === 'Escape') document.getElementById('cancel-subtask-btn').click();
});

// ─── Membros do board ─────────────────────────────────────────────────────────

async function loadBoardMembersInModal() {
    const assignedSelect = document.getElementById('task-assigned-user');
    if (!assignedSelect) return;

    try {
        let members = [];

        if (currentModalGroupId) {
            try {
                const membersData = await DevDeck.fetchApi(`/groups/${currentModalGroupId}/members`);
                if (Array.isArray(membersData)) {
                    members = membersData
                        .filter(m => m && m.user)
                        .map(m => ({ id: m.userId, name: m.user.name, email: m.user.email }));
                } else if (membersData?.members) {
                    members = membersData.members
                        .filter(m => m && m.user && m.inviteStatus === 'accepted')
                        .map(m => ({ id: m.userId, name: m.user.name, email: m.user.email }));
                }
            } catch {
                try {
                    const groupData = await DevDeck.fetchApi(`/groups/${currentModalGroupId}`);
                    if (groupData?.members) {
                        members = groupData.members
                            .filter(m => m && m.user && m.inviteStatus === 'accepted')
                            .map(m => ({ id: m.userId, name: m.user.name, email: m.user.email }));
                    }
                } catch (err) {
                    console.error('Erro ao carregar membros do grupo:', err);
                }
            }
        } else {
            const currentUser = DevDeck.getUserData();
            if (currentUser && currentUser.id) {
                members = [{ id: currentUser.id, name: currentUser.name, email: currentUser.email }];
            }
        }

        const currentValue = assignedSelect.value;
        assignedSelect.innerHTML = '<option value="">Ninguém atribuído</option>';
        members.sort((a, b) => a.name.localeCompare(b.name)).forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = `${member.name} (${member.email})`;
            assignedSelect.appendChild(option);
        });

        if (currentValue) assignedSelect.value = currentValue;
        boardMembers = members;

    } catch (error) {
        console.error('Erro ao carregar membros:', error);
        assignedSelect.innerHTML = '<option value="">Ninguém atribuído</option>';
    }
}

// ─── Salvar tarefa ────────────────────────────────────────────────────────────

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
        const assignedUserId = assignedUserIdEl?.value ? parseInt(assignedUserIdEl.value) : null;
        const requiresValidation = document.getElementById('task-requires-validation')?.checked ?? false;

        if (!title) return;

        const boardId = currentBoardId ? parseInt(currentBoardId) : null;
        if (!boardId && !id) {
            alert('Erro: Nenhum quadro disponível. Aguarde o carregamento dos quadros.');
            return;
        }

        const payload = { title, description, status };
        if (!id) payload.boardId = boardId;
        if (assignedUserId) payload.assignedUserId = assignedUserId;
        payload.requiresValidation = requiresValidation;

        const priorityEl = document.getElementById('task-priority');
        if (priorityEl) payload.priority = priorityEl.value;

        const dueDateEl = document.getElementById('task-duedate');
        if (dueDateEl?.value) payload.dueDate = new Date(dueDateEl.value + 'T00:00:00').toISOString();

        const timeEl = document.getElementById('task-time');
        if (timeEl?.value) payload.estimatedTime = parseFloat(timeEl.value);

        const tagsEl = document.getElementById('task-tags');
        if (tagsEl?.value) payload.tags = tagsEl.value.trim();

        try {
            let savedId = id ? parseInt(id) : null;
            if (id) {
                await DevDeck.fetchApi(`/tasks/${id}`, {
                    method: 'PATCH',
                    body: JSON.stringify(payload)
                });
            } else {
                const created = await DevDeck.fetchApi('/tasks', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                savedId = created?.id;
            }

            // Persistir subtasks pendentes (ticket novo, subtasks adicionadas antes de salvar)
            const userData = DevDeck.getUserData();
            const isDevTeam = userData?.isDevTeam === true || userData?.isDevTeam === 'true' || userData?.isDevTeam === 1;
            if (savedId && isDevTeam) {
                const pending = document.querySelectorAll('#subtasks-list [data-subtask-id=""]');
                for (const item of pending) {
                    const t = item.querySelector('span')?.textContent?.trim();
                    const done = item.querySelector('.subtask-check')?.checked ?? false;
                    if (t) {
                        await DevDeck.fetchApi(`/tasks/${savedId}/subtasks`, {
                            method: 'POST',
                            body: JSON.stringify({ title: t, completed: done })
                        }).catch(console.error);
                    }
                }
            }

            document.getElementById('task-modal').classList.add('hidden');

            if (typeof loadPersonalTasks === 'function') {
                loadPersonalTasks();
                if (typeof invalidateHistoryCache === 'function') invalidateHistoryCache();
            } else {
                window.location.reload();
            }

        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro: ' + error.message);
        }
    });
}

// ─── Fechar / Deletar ─────────────────────────────────────────────────────────

function closeTaskModal() {
    document.getElementById('task-modal').classList.add('hidden');
}

document.getElementById('modal-cancel')?.addEventListener('click', closeTaskModal);

document.getElementById('task-modal')?.addEventListener('click', function (e) {
    if (e.target === this || e.target.classList.contains('modal-backdrop')) closeTaskModal();
});

document.getElementById('board-modal')?.addEventListener('click', function (e) {
    if (e.target === this || e.target.classList.contains('modal-backdrop')) {
        this.classList.add('hidden');
    }
});

document.querySelectorAll('.modal-close-button, .modal-cancel-button').forEach(btn => {
    btn.addEventListener('click', e => e.target.closest('.modal').classList.add('hidden'));
});

async function confirmDeleteTask(id) {
    if (confirm('Excluir tarefa?')) {
        await DevDeck.fetchApi(`/tasks/${id}`, { method: 'DELETE' });
        document.getElementById('task-modal').classList.add('hidden');
        if (typeof loadPersonalTasks === 'function') {
            loadPersonalTasks();
            if (typeof invalidateHistoryCache === 'function') invalidateHistoryCache();
        }
    }
}


function escapeHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── Abas internas do modal ───────────────────────────────────────────────────

document.addEventListener('click', (e) => {
    const tab = e.target.closest('#modal-tab-principal, #modal-tab-detalhes, #modal-tab-atribuicao');
    if (!tab) return;
    const name = tab.id.replace('modal-tab-', '');
    switchModalTab(name);
});

window.openTaskModal = openTaskModal;

