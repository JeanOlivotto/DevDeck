/* BJGROUP Suporte - Portal do Funcionário */

let selectedCategory = null;
let currentStep = 1;
let currentUserData = null;
let portalSelectedFiles = [];

document.addEventListener('DOMContentLoaded', async function () {
    const token = DevDeck.getAuthToken();
    if (!token) {
        window.location.href = BASE_PATH + '/index.php';
        return;
    }

    // Carregar dados do usuário
    try {
        const user = await DevDeck.fetchApi('/user/me');
        if (user) {
            currentUserData = user;
            DevDeck.setUserData(user.email, user.name, user.id);
            const firstName = user.name.split(' ')[0];
            const letter = user.name.charAt(0).toUpperCase();
            document.getElementById('portal-welcome').textContent = `Olá, ${firstName}!`;
            document.getElementById('portal-user-name').textContent =
                user.company ? `${user.name} · ${user.company}` : user.name;
            document.getElementById('portal-user-name').classList.remove('hidden');
            document.getElementById('portal-avatar-letter').textContent = letter;
        }
    } catch (e) {
        console.error('Erro ao carregar usuário:', e);
    }

    // User menu dropdown
    const userDropdown = document.getElementById('portal-user-dropdown');
    document.getElementById('portal-user-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('hidden');
    });
    document.addEventListener('click', () => userDropdown.classList.add('hidden'));

    // Logout
    document.getElementById('portal-logout-btn').addEventListener('click', async () => {
        await fetch(BASE_PATH + '/api/logout.php', { method: 'POST', body: 'action=logout' });
        DevDeck.clearAuthData();
        window.location.href = BASE_PATH + '/index.php';
    });

    // Profile modal
    document.getElementById('portal-profile-btn').addEventListener('click', () => {
        userDropdown.classList.add('hidden');
        openProfileModal();
    });
    document.getElementById('profile-backdrop').addEventListener('click', closeProfileModal);
    document.getElementById('profile-close-btn').addEventListener('click', closeProfileModal);
    document.getElementById('profile-cancel-btn').addEventListener('click', closeProfileModal);
    document.getElementById('profile-save-btn').addEventListener('click', saveProfile);

    // Alert modal
    document.getElementById('portal-alert-ok').addEventListener('click', () => {
        document.getElementById('portal-alert-modal').classList.add('hidden');
    });

    // Ticket detail modal
    document.getElementById('detail-close-btn').addEventListener('click', closeTicketDetail);
    document.getElementById('detail-close-footer').addEventListener('click', closeTicketDetail);
    document.getElementById('detail-backdrop').addEventListener('click', closeTicketDetail);

    // Abrir modal
    document.getElementById('open-ticket-btn').addEventListener('click', () => openTicketModal());

    // Fechar modal
    document.getElementById('modal-close-btn').addEventListener('click', closeTicketModal);
    document.getElementById('modal-backdrop').addEventListener('click', closeTicketModal);

    // Categorias
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedCategory = card.dataset.category;
            const btn = document.getElementById('step-1-next');
            btn.disabled = false;
            btn.style.opacity = '1';
        });
    });

    // Step navigation
    document.getElementById('step-1-next').addEventListener('click', () => goToStep(2));
    document.getElementById('step-2-back').addEventListener('click', () => goToStep(1));
    document.getElementById('step-2-next').addEventListener('click', () => goToStep(3));
    document.getElementById('step-3-back').addEventListener('click', () => goToStep(2));
    document.getElementById('step-3-submit').addEventListener('click', submitTicket);
    document.getElementById('success-close').addEventListener('click', () => {
        closeTicketModal();
        loadMyTickets();
    });
    document.getElementById('success-new').addEventListener('click', () => {
        resetModal();
        goToStep(1);
    });

    // Título - habilitar next quando não vazio
    document.getElementById('ticket-title').addEventListener('input', function () {
        const btn = document.getElementById('step-2-next');
        const hasValue = this.value.trim().length > 0;
        btn.disabled = !hasValue;
        btn.style.opacity = hasValue ? '1' : '0.4';
    });

    // Keyboard: Enter avança etapa
    document.getElementById('ticket-title').addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !document.getElementById('step-2-next').disabled) {
            goToStep(3);
        }
    });

    // Ctrl+V paste de imagem quando o modal de ticket estiver aberto (step 3)
    document.addEventListener('paste', (e) => {
        const modal = document.getElementById('ticket-modal');
        if (modal.classList.contains('hidden')) return;
        if (currentStep !== 3) return;
        const items = Array.from(e.clipboardData?.items || []);
        const imageFiles = items
            .filter(item => item.kind === 'file' && item.type.startsWith('image/'))
            .map(item => {
                const file = item.getAsFile();
                const name = `print-${Date.now()}.${file.type.split('/')[1] || 'png'}`;
                return new File([file], name, { type: file.type });
            });
        if (imageFiles.length === 0) return;
        e.preventDefault();
        portalAddFiles(imageFiles);
        flashDropZone();
    });

    // Carregar tickets
    await loadMyTickets();
});

function openTicketModal() {
    resetModal();
    goToStep(1);
    document.getElementById('ticket-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeTicketModal() {
    document.getElementById('ticket-modal').classList.add('hidden');
    document.body.style.overflow = '';
}

function resetModal() {
    selectedCategory = null;
    portalSelectedFiles = [];
    document.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('ticket-title').value = '';
    document.getElementById('ticket-description').value = '';
    document.getElementById('portal-file-list').innerHTML = '';
    document.getElementById('portal-file-drop').style.display = '';
    const btn1 = document.getElementById('step-1-next');
    btn1.disabled = true; btn1.style.opacity = '0.4';
    const btn2 = document.getElementById('step-2-next');
    btn2.disabled = true; btn2.style.opacity = '0.4';
}

function portalAddFiles(files) {
    files.forEach(f => {
        if (portalSelectedFiles.length < 5) portalSelectedFiles.push(f);
    });
    renderPortalFileList();
}

function portalHandleFiles(input) {
    portalAddFiles(Array.from(input.files));
    input.value = '';
}

function portalRemoveFile(idx) {
    portalSelectedFiles.splice(idx, 1);
    renderPortalFileList();
}

function renderPortalFileList() {
    const list = document.getElementById('portal-file-list');
    const drop = document.getElementById('portal-file-drop');
    list.innerHTML = portalSelectedFiles.map((f, i) => `
        <div class="portal-file-item">
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:280px;">${escapeHtml(f.name)}</span>
            <button onclick="portalRemoveFile(${i})" title="Remover">×</button>
        </div>`).join('');
    drop.style.display = portalSelectedFiles.length >= 5 ? 'none' : '';
}

function flashDropZone() {
    const drop = document.getElementById('portal-file-drop');
    if (!drop) return;
    drop.style.borderColor = '#ffffff';
    drop.style.background = 'rgba(255,255,255,0.04)';
    setTimeout(() => {
        drop.style.borderColor = '';
        drop.style.background = '';
    }, 600);
}

function goToStep(step) {
    currentStep = step;

    // Update step indicators
    [1, 2, 3].forEach(s => {
        const ind = document.getElementById(`step-${s}-ind`);
        if (s < step) {
            ind.className = 'step-indicator step-done';
            ind.textContent = '✓';
        } else if (s === step) {
            ind.className = 'step-indicator step-active';
            ind.textContent = s;
        } else {
            ind.className = 'step-indicator step-inactive';
            ind.textContent = s;
        }
    });

    // Progress bar
    const progress = step === 1 ? 33 : step === 2 ? 66 : 100;
    document.getElementById('modal-progress').style.width = progress + '%';

    // Show/hide panels
    document.getElementById('step-1').classList.toggle('hidden', step !== 1);
    document.getElementById('step-2').classList.toggle('hidden', step !== 2);
    document.getElementById('step-3').classList.toggle('hidden', step !== 3);
    document.getElementById('step-success').classList.add('hidden');

    if (step === 2) {
        setTimeout(() => document.getElementById('ticket-title').focus(), 100);
    }
    if (step === 3) {
        setTimeout(() => document.getElementById('ticket-description').focus(), 100);
    }
}

async function submitTicket() {
    const title = document.getElementById('ticket-title').value.trim();
    const description = document.getElementById('ticket-description').value.trim();

    if (!title || !selectedCategory) return;

    const submitBtn = document.getElementById('step-3-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    try {
        const fd = new FormData();
        fd.append('title', title);
        fd.append('category', selectedCategory);
        if (description) fd.append('description', description);
        portalSelectedFiles.forEach(f => fd.append('attachments', f));

        const token = DevDeck.getAuthToken();
        const res = await fetch(API_BASE_URL + '/tasks/employee-submit', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token },
            body: fd
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Erro ao enviar');
        }
        await res.json();

        // Sucesso
        document.getElementById('step-3').classList.add('hidden');
        document.getElementById('step-success').classList.remove('hidden');
        document.getElementById('modal-progress').style.width = '100%';
        [1, 2, 3].forEach(s => {
            const ind = document.getElementById(`step-${s}-ind`);
            ind.className = 'step-indicator step-done';
            ind.textContent = '✓';
        });

    } catch (err) {
        console.error('Erro ao enviar ticket:', err);
        alert('Erro ao enviar o ticket: ' + (err.message || 'Tente novamente.'));
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg> Enviar Ticket`;
    }
}

async function loadMyTickets() {
    const loading = document.getElementById('tickets-loading');
    const empty = document.getElementById('tickets-empty');
    const table = document.getElementById('tickets-table');
    const list = document.getElementById('tickets-list');
    const count = document.getElementById('tickets-count');

    loading.classList.remove('hidden');
    empty.classList.add('hidden');
    table.classList.add('hidden');

    try {
        const tickets = await DevDeck.fetchApi('/tasks/my-tickets');

        loading.classList.add('hidden');

        if (!tickets || tickets.length === 0) {
            empty.classList.remove('hidden');
            count.textContent = '';
            return;
        }

        count.textContent = `${tickets.length} ticket${tickets.length !== 1 ? 's' : ''}`;
        list.innerHTML = '';

        tickets.forEach(ticket => {
            const row = document.createElement('div');
            row.className = 'grid grid-cols-12 px-6 py-4 border-b border-[#2a2a2a]/40 hover:bg-white/[0.02] transition-colors items-center';

            const date = new Date(ticket.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit', month: '2-digit', year: '2-digit'
            });

            const statusLabel = { TODO: 'Na Fila', DOING: 'Em Andamento', DONE: 'Concluído' }[ticket.status] || ticket.status;
            const assignedName = ticket.assignedUser?.name
                ? escapeHtml(ticket.assignedUser.name)
                : '<span class="text-[#444444] italic">Aguardando</span>';

            row.innerHTML = `
                <div class="col-span-1 text-[#555555] text-xs font-mono">#${ticket.id}</div>
                <div class="col-span-3 text-[#e0e0e0] text-sm font-medium truncate pr-2">${escapeHtml(ticket.title)}</div>
                <div class="col-span-2 text-[#888888] text-xs truncate">${escapeHtml(ticket.category || '-')}</div>
                <div class="col-span-2">
                    <span class="status-badge status-${ticket.status}">${statusLabel}</span>
                </div>
                <div class="col-span-2 text-[#888888] text-xs truncate">${assignedName}</div>
                <div class="col-span-1 text-[#555555] text-xs">${date}</div>
                <div class="col-span-1 flex justify-end">
                    <button class="ticket-view-btn w-7 h-7 flex items-center justify-center rounded-lg text-[#555555] hover:text-white hover:bg-[#2a2a2a] transition-colors" title="Ver detalhes">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                    </button>
                </div>
            `;

            row.querySelector('.ticket-view-btn').addEventListener('click', () => openTicketDetail(ticket));
            list.appendChild(row);
        });

        table.classList.remove('hidden');

    } catch (err) {
        loading.classList.add('hidden');
        empty.classList.remove('hidden');
        console.error('Erro ao carregar tickets:', err);
    }
}

function openProfileModal() {
    if (!currentUserData) return;
    const letter = currentUserData.name.charAt(0).toUpperCase();
    document.getElementById('profile-avatar-big').textContent = letter;
    document.getElementById('profile-display-name').textContent = currentUserData.name;
    document.getElementById('profile-display-company').textContent = currentUserData.company || '';
    document.getElementById('profile-name-input').value = currentUserData.name;
    document.getElementById('profile-email-display').textContent = currentUserData.email;
    document.getElementById('profile-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('profile-name-input').focus(), 100);
}

function closeProfileModal() {
    document.getElementById('profile-modal').classList.add('hidden');
    document.body.style.overflow = '';
}

async function saveProfile() {
    const name = document.getElementById('profile-name-input').value.trim();
    if (!name) {
        showPortalAlert('O nome não pode estar vazio.');
        return;
    }

    const saveBtn = document.getElementById('profile-save-btn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Salvando...';

    try {
        const updated = await DevDeck.fetchApi('/user/settings', {
            method: 'PATCH',
            body: JSON.stringify({ name })
        });

        currentUserData = { ...currentUserData, name: updated?.name || name };
        const firstName = currentUserData.name.split(' ')[0];
        const letter = currentUserData.name.charAt(0).toUpperCase();
        document.getElementById('portal-welcome').textContent = `Olá, ${firstName}!`;
        document.getElementById('portal-user-name').textContent =
            currentUserData.company
                ? `${currentUserData.name} · ${currentUserData.company}`
                : currentUserData.name;
        document.getElementById('portal-avatar-letter').textContent = letter;
        DevDeck.setUserData(currentUserData.email, currentUserData.name, currentUserData.id);
        closeProfileModal();
    } catch (err) {
        showPortalAlert('Erro ao salvar: ' + (err.message || 'Tente novamente.'));
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Salvar';
    }
}

function showPortalAlert(msg) {
    document.getElementById('portal-alert-message').textContent = msg;
    document.getElementById('portal-alert-modal').classList.remove('hidden');
}

function openTicketDetail(ticket) {
    const statusLabels = { TODO: 'Na Fila', DOING: 'Em Andamento', DONE: 'Concluído' };

    document.getElementById('detail-id').textContent = '#' + ticket.id;
    document.getElementById('detail-title').textContent = ticket.title;
    document.getElementById('detail-category').textContent = ticket.category || '';
    document.getElementById('detail-date').textContent = new Date(ticket.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const assignedEl = document.getElementById('detail-assigned');
    if (ticket.assignedUser?.name) {
        assignedEl.textContent = ticket.assignedUser.name;
        assignedEl.style.color = '';
    } else {
        assignedEl.innerHTML = '<span style="color:#555555;font-style:italic">Aguardando atendimento</span>';
    }

    const dueDateEl = document.getElementById('detail-duedate');
    if (ticket.dueDate) {
        dueDateEl.textContent = new Date(ticket.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } else {
        dueDateEl.innerHTML = '<span style="color:#444444">—</span>';
    }

    const statusEl = document.getElementById('detail-status');
    statusEl.textContent = statusLabels[ticket.status] || ticket.status;
    statusEl.className = `status-badge status-${ticket.status}`;

    // Descrição
    const descSection = document.getElementById('detail-desc-section');
    const descEl = document.getElementById('detail-description');
    if (ticket.description) {
        descEl.textContent = ticket.description;
        descSection.classList.remove('hidden');
    } else {
        descSection.classList.add('hidden');
    }

    // Anexos
    const attachSection = document.getElementById('detail-attachments-section');
    const attachList = document.getElementById('detail-attachments-list');
    attachList.innerHTML = '';

    let attachments = [];
    try { attachments = ticket.attachments ? JSON.parse(ticket.attachments) : []; } catch {}

    if (attachments.length > 0) {
        attachments.forEach(path => {
            const isImage = /\.(png|jpe?g|gif|webp|bmp)$/i.test(path);
            const url = API_BASE_URL.replace('/api', '') + path;
            if (isImage) {
                const a = document.createElement('a');
                a.href = url;
                a.target = '_blank';
                a.innerHTML = `<img src="${url}" alt="anexo" style="width:120px;height:90px;object-fit:cover;border-radius:8px;border:1px solid #2a2a2a;cursor:pointer;transition:border-color .15s;" onmouseover="this.style.borderColor='#555'" onmouseout="this.style.borderColor='#2a2a2a'">`;
                attachList.appendChild(a);
            } else {
                const a = document.createElement('a');
                a.href = url;
                a.target = '_blank';
                a.style.cssText = 'display:flex;align-items:center;gap:8px;background:#1c1c1c;border:1px solid #2a2a2a;border-radius:8px;padding:8px 12px;text-decoration:none;color:#e0e0e0;font-size:13px;transition:border-color .15s;';
                a.onmouseover = () => a.style.borderColor = '#555';
                a.onmouseout = () => a.style.borderColor = '#2a2a2a';
                a.innerHTML = `<svg style="width:16px;height:16px;flex-shrink:0;color:#888" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg><span style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${path.split('/').pop()}</span>`;
                attachList.appendChild(a);
            }
        });
        attachSection.classList.remove('hidden');
    } else {
        attachSection.classList.add('hidden');
    }

    document.getElementById('ticket-detail-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeTicketDetail() {
    document.getElementById('ticket-detail-modal').classList.add('hidden');
    document.body.style.overflow = '';
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
