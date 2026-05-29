/* KANBAN MODALS */

let boardMembers = [];
let currentModalGroupId = null;
let currentModalTaskId = null;

const MODAL_TABS = ['principal', 'detalhes', 'atribuicao', 'mensagens'];

function resetModalTabs() {
    switchModalTab('principal');
}

function switchModalTab(name) {
    MODAL_TABS.forEach(t => {
        const panel = document.getElementById(`modal-panel-${t}`);
        document.getElementById(`modal-tab-${t}`)?.classList.toggle('modal-inner-tab-active', t === name);
        if (t === name) {
            panel?.classList.remove('hidden');
            if (panel) {
                panel.classList.remove('animate-fade-in-up');
                void panel.offsetWidth;
                panel.classList.add('animate-fade-in-up');
            }
        } else {
            panel?.classList.add('hidden');
        }
    });
    if (name === 'mensagens' && currentModalTaskId) {
        loadComments(currentModalTaskId);
    }
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
    commentsLoaded = false;
    document.getElementById('comments-list').innerHTML = '';
    const commentsBadge = document.getElementById('modal-comments-badge');
    if (commentsBadge) commentsBadge.classList.add('hidden');
    resetModalTabs();

    // Reset subtasks
    document.getElementById('subtasks-list').innerHTML = '';
    document.getElementById('subtask-input-row').classList.add('hidden');

    const userData = DevDeck.getUserData();
    const isDevTeam = userData?.isDevTeam === true || userData?.isDevTeam === 'true' || userData?.isDevTeam === 1;
    const subtasksSection = document.getElementById('subtasks-section');
    if (subtasksSection) subtasksSection.classList.toggle('hidden', !isDevTeam);

    // Aviso de tarefa pessoal: só para novas tarefas em board pessoal
    const personalWarning = document.getElementById('personal-task-warning');
    if (personalWarning) {
        const isNewTask = !task;
        const isPersonalBoard = typeof currentBoardIsGroup !== 'undefined' && !currentBoardIsGroup;
        personalWarning.classList.toggle('hidden', !(isNewTask && isPersonalBoard));
    }

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

        // Aba Mensagens: visível para tickets (têm solicitante) ou qualquer tarefa
        const tabMensagens = document.getElementById('modal-tab-mensagens');
        if (tabMensagens) tabMensagens.classList.remove('hidden');

        // Input de comentário apenas para dev team
        const commentInputArea = document.getElementById('comment-input-area');
        if (commentInputArea) commentInputArea.classList.toggle('hidden', !isDevTeam);

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

        // Esconde aba Mensagens ao criar nova tarefa
        const tabMensagens = document.getElementById('modal-tab-mensagens');
        if (tabMensagens) tabMensagens.classList.add('hidden');
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
    const tab = e.target.closest('#modal-tab-principal, #modal-tab-detalhes, #modal-tab-atribuicao, #modal-tab-mensagens');
    if (!tab) return;
    const name = tab.id.replace('modal-tab-', '');
    switchModalTab(name);
});

// ─── Comentários ──────────────────────────────────────────────────────────────

let commentsLoaded = false;

async function loadComments(taskId) {
    if (commentsLoaded) return;
    commentsLoaded = true;

    const list = document.getElementById('comments-list');
    const empty = document.getElementById('comments-empty');
    const loading = document.getElementById('comments-loading');
    if (!list) return;

    if (loading) loading.classList.remove('hidden');
    list.innerHTML = '';
    if (empty) empty.classList.add('hidden');

    try {
        const comments = await DevDeck.fetchApi(`/tasks/${taskId}/comments`);
        if (loading) loading.classList.add('hidden');

        const badge = document.getElementById('modal-comments-badge');

        if (!comments || comments.length === 0) {
            if (empty) empty.classList.remove('hidden');
            if (badge) badge.classList.add('hidden');
            return;
        }

        if (badge) {
            badge.textContent = comments.length;
            badge.classList.remove('hidden');
        }

        comments.forEach(c => list.appendChild(renderComment(c)));
        list.scrollTop = list.scrollHeight;
    } catch (e) {
        if (loading) loading.classList.add('hidden');
        console.error('Erro ao carregar comentários:', e);
    }
}

function renderComment(c) {
    const div = document.createElement('div');
    div.className = 'p-3 rounded-lg bg-[#1c1c1c] border border-[#2a2a2a]';
    const date = new Date(c.createdAt);
    const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    div.innerHTML = `
        <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs font-semibold text-white">${escapeHtml(c.authorName)}</span>
            <span class="text-[10px] text-[#555555]">${dateStr}</span>
        </div>
        <p class="text-sm text-[#cccccc] leading-relaxed whitespace-pre-wrap">${escapeHtml(c.content)}</p>
    `;
    return div;
}

document.addEventListener('click', async (e) => {
    if (!e.target.closest('#send-comment-btn')) return;

    const btn = document.getElementById('send-comment-btn');
    const textarea = document.getElementById('comment-text');
    const content = textarea?.value.trim();
    if (!content || !currentModalTaskId) return;

    btn.disabled = true;
    btn.querySelector('svg')?.classList.add('hidden');
    btn.childNodes[btn.childNodes.length - 1].textContent = ' Enviando...';

    try {
        const comment = await DevDeck.fetchApi(`/tasks/${currentModalTaskId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content })
        });

        textarea.value = '';
        const list = document.getElementById('comments-list');
        const empty = document.getElementById('comments-empty');
        if (empty) empty.classList.add('hidden');
        if (list) {
            list.appendChild(renderComment(comment));
            list.scrollTop = list.scrollHeight;
        }

        const badge = document.getElementById('modal-comments-badge');
        if (badge) {
            const count = (parseInt(badge.textContent) || 0) + 1;
            badge.textContent = count;
            badge.classList.remove('hidden');
        }

        DevDeck.showAlert('Mensagem enviada! O solicitante foi notificado por email.', 'Enviado');
    } catch (err) {
        DevDeck.showAlert('Erro ao enviar: ' + err.message, 'Erro');
    } finally {
        btn.disabled = false;
        btn.querySelector('svg')?.classList.remove('hidden');
        btn.childNodes[btn.childNodes.length - 1].textContent = ' Enviar';
    }
});

window.openTaskModal = openTaskModal;

