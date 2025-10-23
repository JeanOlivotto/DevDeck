// --- Constantes ---
const API_BASE_URL = 'http://localhost:3000/api';
const TOKEN_KEY = 'devdeck_auth_token';
const USER_EMAIL_KEY = 'devdeck_user_email';
const USER_NAME_KEY = 'devdeck_user_name';

// --- Seletores DOM (Auth) ---
const loadingIndicator = document.getElementById('loading-indicator');
const appContainer = document.getElementById('app-container');
const authSection = document.getElementById('auth-section');
const loginView = document.getElementById('login-view');
const signupView = document.getElementById('signup-view');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const signupNameInput = document.getElementById('signup-name');
const signupEmailInput = document.getElementById('signup-email');
const signupPasswordInput = document.getElementById('signup-password');
const signupConfirmPasswordInput = document.getElementById('signup-confirm-password');
const loginError = document.getElementById('login-error');
const signupError = document.getElementById('signup-error');
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');

// --- Seletores DOM (Header / User Menu) ---
const userMenu = document.getElementById('user-menu');
const userMenuButton = document.getElementById('user-menu-button');
const userNameDisplay = document.getElementById('user-name-display');
const userAvatar = document.getElementById('user-avatar');
const userMenuDropdown = document.getElementById('user-menu-dropdown');
const userDropdownName = document.getElementById('user-dropdown-name');
const userDropdownEmail = document.getElementById('user-dropdown-email');
const logoutButton = document.getElementById('logout-button');
const dropdownArrow = document.getElementById('dropdown-arrow');

// --- Seletores DOM (Kanban) ---
const boardsContainer = document.getElementById('boards-container');
const kanbanBoardSection = document.getElementById('kanban-board');
const noBoardsMessage = document.getElementById('no-boards-message');

// --- Seletores DOM (Modais) ---
const taskModal = document.getElementById('task-modal');
const taskForm = document.getElementById('task-form');
const modalTitle = document.getElementById('modal-title');
const taskIdInput = document.getElementById('task-id');
const taskTitleInput = document.getElementById('task-title');
const taskDescriptionInput = document.getElementById('task-description');
const taskStatusSelect = document.getElementById('task-status');
const modalCancelButton = document.getElementById('modal-cancel');
const modalSaveButton = document.getElementById('modal-save');
const modalDeleteButton = document.getElementById('modal-delete');
const boardModal = document.getElementById('board-modal');
const boardModalTitle = document.getElementById('board-modal-title');
const boardForm = document.getElementById('board-form');
const boardIdInput = document.getElementById('board-id');
const boardNameInput = document.getElementById('board-name');
const boardError = document.getElementById('board-error');
const boardModalCancelButton = document.getElementById('board-modal-cancel');
const boardModalSaveButton = document.getElementById('board-modal-save');
const alertModal = document.getElementById('alert-modal');
const alertModalTitle = document.getElementById('alert-modal-title');
const alertModalMessage = document.getElementById('alert-modal-message');
const alertModalOk = document.getElementById('alert-modal-ok');
const confirmModal = document.getElementById('confirm-modal');
const confirmModalTitle = document.getElementById('confirm-modal-title');
const confirmModalMessage = document.getElementById('confirm-modal-message');
const confirmModalCancel = document.getElementById('confirm-modal-cancel');
const confirmModalConfirm = document.getElementById('confirm-modal-confirm');
const toggleDailySummary = document.getElementById('toggle-daily-summary');
const toggleStaleTasks = document.getElementById('toggle-stale-tasks');
const allToggles = document.querySelectorAll('.toggle-checkbox');
// Info Modal
const infoModal = document.getElementById('info-modal');
const infoModalTitle = document.getElementById('info-modal-title');
const infoModalDescription = document.getElementById('info-modal-description');
const infoModalEmail = document.getElementById('info-modal-email');
const infoModalClose = document.getElementById('info-modal-close');
const infoIcons = document.querySelectorAll('.info-icon');

// --- Variáveis de Estado ---
let currentBoardId = null;
let allBoards = [];
let draggedTaskElement = null;
let authToken = localStorage.getItem(TOKEN_KEY);
let currentUserEmail = localStorage.getItem(USER_EMAIL_KEY);
let currentUserName = localStorage.getItem(USER_NAME_KEY);
let confirmResolve = null;
let currentUserSettings = {
    notifyDailySummary: true, // Default values
    notifyStaleTasks: true
};

// --- Funções de Alerta / Confirmação / Info Modais ---
function showAlert(message, title = 'Aviso') {
    alertModalTitle.textContent = title;
    alertModalMessage.textContent = message;
    alertModal.classList.remove('hidden');
    alertModalOk.focus();
}
function showConfirm(message, title = 'Confirmar Ação') {
    confirmModalTitle.textContent = title;
    confirmModalMessage.textContent = message;
    confirmModal.classList.remove('hidden');
    confirmModalConfirm.focus();
    return new Promise((resolve) => {
        confirmResolve = resolve;
    });
}
function closeAlertModal() {
    alertModal.classList.add('hidden');
}
function closeConfirmModal(result) {
    confirmModal.classList.add('hidden');
    if (confirmResolve) {
        confirmResolve(result);
        confirmResolve = null;
    }
}
function openInfoModal(title, description, email) {
    infoModalTitle.textContent = title;
    infoModalDescription.textContent = description;
    infoModalEmail.textContent = email || 'Nenhum e-mail cadastrado';
    infoModal.classList.remove('hidden');
    infoModalClose.focus();
}
function closeInfoModal() {
    infoModal.classList.add('hidden');
}

// --- Funções da API ---
async function fetchApi(endpoint, options = {}, isAuth = false) {
    loadingIndicator.classList.remove('hidden');
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (!isAuth && authToken) { headers['Authorization'] = `Bearer ${authToken}`; }
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
        if (!response.ok) {
            if (response.status === 401 && !isAuth) { console.warn('Token inválido/expirado. Logout.'); logout(); throw new Error('Sessão inválida. Faça login.'); }
            const errorData = await response.json(); console.error('API Error:', response.status, errorData);
            let msg = 'Erro desconhecido';
            if (errorData && typeof errorData === 'object') { msg = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message || errorData.error || msg; }
            else if (typeof errorData === 'string') { msg = errorData; }
            throw new Error(msg || `Erro na API: ${response.statusText}`);
        }
        return response.status === 204 ? null : await response.json();
    } catch (error) {
        console.error('Erro API:', error);
        if (!error.message.includes('Sessão inválida')) {
            showAlert(error.message, 'Erro de Rede');
        }
        throw error;
    } finally {
        loadingIndicator.classList.add('hidden');
    }
}
async function signup(email, password, name) { return await fetchApi('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, name }) }, true); }
async function login(email, password) {
    loginError.classList.add('hidden');
    try {
        const data = await fetchApi('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }, true);
        if (data?.access_token) {
            authToken = data.access_token; localStorage.setItem(TOKEN_KEY, authToken);
            if (data.user) {
                currentUserEmail = data.user.email;
                currentUserName = data.user.name;
                currentUserSettings = {
                    notifyDailySummary: data.user.notifyDailySummary,
                    notifyStaleTasks: data.user.notifyStaleTasks
                };
                localStorage.setItem(USER_EMAIL_KEY, currentUserEmail);
                localStorage.setItem(USER_NAME_KEY, currentUserName);
            } else { currentUserEmail = null; currentUserName = null; localStorage.removeItem(USER_EMAIL_KEY); localStorage.removeItem(USER_NAME_KEY); currentUserSettings = { notifyDailySummary: true, notifyStaleTasks: true };}
        } else { currentUserEmail = null; currentUserName = null; localStorage.removeItem(USER_EMAIL_KEY); localStorage.removeItem(USER_NAME_KEY); currentUserSettings = { notifyDailySummary: true, notifyStaleTasks: true };}
        return data;
    } catch (error) { currentUserEmail = null; currentUserName = null; localStorage.removeItem(USER_EMAIL_KEY); localStorage.removeItem(USER_NAME_KEY); currentUserSettings = { notifyDailySummary: true, notifyStaleTasks: true }; throw error; }
}
function logout() {
    authToken = null; currentUserEmail = null; currentUserName = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_EMAIL_KEY);
    localStorage.removeItem(USER_NAME_KEY);
    showLoginView();
    currentBoardId = null; allBoards = []; boardsContainer.innerHTML = '';
    document.querySelectorAll('.tasks').forEach(c => c.innerHTML = '');
    userMenu.classList.add('hidden');
    userMenuDropdown.classList.remove('dropdown-visible');
    dropdownArrow.classList.remove('arrow-rotated');
    currentUserSettings = { notifyDailySummary: true, notifyStaleTasks: true };
}
async function updateUserSettings(settingsData) {
    try {
        // Inclui SEMPRE os campos relacionados ao WhatsApp se eles existem no DTO
        const payload = {
            notifyDailySummary: currentUserSettings.notifyDailySummary,
            notifyStaleTasks: currentUserSettings.notifyStaleTasks,
            notifyViaWhatsApp: currentUserSettings.notifyViaWhatsApp,
            whatsappNumber: currentUserSettings.whatsappNumber,
            ...settingsData // Sobrescreve com os dados que realmente mudaram
        };

        // Validação simples do número antes de enviar (melhorar com regex se necessário)
        if (payload.whatsappNumber && !payload.whatsappNumber.startsWith('+')) {
            showAlert('Número do WhatsApp deve iniciar com + e código do país (Ex: +5519...).');
            updateToggleUI(); // Reverte UI
            return;
        }
         if (payload.notifyViaWhatsApp && !payload.whatsappNumber) {
              showAlert('É necessário confirmar seu número de WhatsApp para ativar as notificações.');
              payload.notifyViaWhatsApp = false; // Desativa se não houver número
              currentUserSettings.notifyViaWhatsApp = false; // Atualiza estado local
              updateToggleUI(); // Reverte UI do toggle
              // Não envia a atualização ainda, espera o número
              return;
         }


        const updatedUser = await fetchApi('/user/settings', {
             method: 'PATCH',
             body: JSON.stringify(payload)
        });

        // Atualiza estado local com a resposta do servidor
        currentUserSettings.notifyDailySummary = updatedUser.notifyDailySummary;
        currentUserSettings.notifyStaleTasks = updatedUser.notifyStaleTasks;
        currentUserSettings.notifyViaWhatsApp = updatedUser.notifyViaWhatsApp;
        currentUserSettings.whatsappNumber = updatedUser.whatsappNumber;

        console.log('Configurações atualizadas:', updatedUser);
        updateToggleUI(); // Garante que a UI reflita o estado salvo

    } catch (error) {
        console.error('Falha ao salvar configurações:', error);
        showAlert(`Erro ao salvar configurações: ${error.message}`);
        // Recarrega as configurações do backend para garantir consistência?
        // Ou apenas reverte a UI para o estado anterior? Por ora, reverte a UI.
        // É preciso buscar as configurações novamente para ter certeza.
        // Vamos apenas reverter a UI por enquanto.
        updateToggleUI();
    }
}
async function getBoards() { return await fetchApi('/boards'); }
async function createBoard(name) { boardError.classList.add('hidden'); try { return await fetchApi('/boards', { method: 'POST', body: JSON.stringify({ name }) }); } catch (error) { if (error.message?.includes('já existe')) { boardError.textContent = `Quadro "${name}" já existe.`; boardError.classList.remove('hidden'); } else { showAlert(error.message, 'Erro ao Criar Quadro'); } throw error; } }
async function getTasks(boardId) { if (!boardId) return []; return await fetchApi(`/tasks?boardId=${boardId}`); }
async function createTask(taskData) { return await fetchApi('/tasks', { method: 'POST', body: JSON.stringify(taskData) }); }
async function updateTask(taskId, taskData) { return await fetchApi(`/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(taskData) }); }
async function deleteTask(taskId) { return await fetchApi(`/tasks/${taskId}`, { method: 'DELETE' }); }
async function updateBoard(boardId, boardData) { boardError.classList.add('hidden'); try { return await fetchApi(`/boards/${boardId}`, { method: 'PATCH', body: JSON.stringify(boardData) }); } catch(error) { if (error.message?.includes('já existe')) { boardError.textContent = `Nome "${boardData.name}" já existe.`; boardError.classList.remove('hidden'); } else { showAlert(error.message, 'Erro ao Renomear'); } throw error; } }
async function deleteBoard(boardId) { return await fetchApi(`/boards/${boardId}`, { method: 'DELETE' }); }

// --- Funções Auxiliares ---
function getInitials(name) { if (!name) return '?'; const parts = name.trim().split(' '); if (parts.length > 1 && parts[parts.length - 1]) { return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase(); } return name.substring(0, 2).toUpperCase(); }
function generateAvatarColor(seed) { let hash = 0; if (!seed || seed.length === 0) return '#4a517e'; for (let i = 0; i < seed.length; i++) { hash = seed.charCodeAt(i) + ((hash << 5) - hash); } const colors = ['#f56565', '#ed8936', '#ecc94b', '#48bb78', '#38b2ac', '#4299e1', '#667eea', '#9f7aea', '#ed64a6']; return colors[Math.abs(hash) % colors.length]; }
function updateToggleUI() { toggleDailySummary.checked = !!currentUserSettings.notifyDailySummary; toggleStaleTasks.checked = !!currentUserSettings.notifyStaleTasks; toggleWhatsApp.checked = !!currentUserSettings.notifyViaWhatsApp;
    whatsappNumberInput.value = currentUserSettings.whatsappNumber || '';}

function connectWebSocket() {
    if (socket && socket.connected) {
        console.log('WebSocket já conectado.');
        return;
    }

    console.log('Tentando conectar WebSocket...');
    // Inclui o token JWT para autenticação no backend gateway
    socket = io(WS_URL, {
        auth: {
            token: authToken
        },
        reconnectionAttempts: 5, // Tenta reconectar algumas vezes
        transports: ['websocket'] // Força WebSocket
    });

    socket.on('connect', () => {
        console.log('WebSocket Conectado:', socket.id);
        // Solicita o status atual do WhatsApp ao conectar
         socket.emit('request_whatsapp_status'); // Precisa implementar este handler no backend se quiser status imediato
    });

    socket.on('disconnect', (reason) => {
        console.warn('WebSocket Desconectado:', reason);
        // Poderia tentar reconectar manualmente ou notificar o usuário
        updateWhatsappUI('Desconectado (Socket)'); // Atualiza UI localmente
    });

    socket.on('connect_error', (err) => {
        console.error('Erro de conexão WebSocket:', err.message);
        updateWhatsappUI('Erro de Conexão');
    });

    // Eventos específicos do WhatsApp vindos do Gateway
    socket.on('whatsapp_qr_code', (qrDataUrl) => {
        console.log('QR Code recebido');
        whatsappQrCodeImg.src = qrDataUrl;
        whatsappQrContainer.classList.remove('hidden');
        whatsappStatusText.textContent = 'Status: Escaneie o QR Code';
        whatsappConnectBtn.classList.add('hidden');
        whatsappDisconnectBtn.classList.remove('hidden'); // Permite cancelar
    });

    socket.on('whatsapp_status_update', (payload) => {
        const status = payload.status;
        console.log('Status WhatsApp recebido:', status);
        updateWhatsappUI(status);
    });
}

function disconnectWebSocket() {
    if (socket) {
        console.log('Desconectando WebSocket...');
        socket.disconnect();
        socket = null;
    }
}

// Atualiza a UI da seção WhatsApp
function updateWhatsappUI(status) {
    whatsappQrContainer.classList.add('hidden'); // Esconde QR por padrão
    whatsappQrCodeImg.src = '';

    switch (status) {
        case 'connecting':
            whatsappStatusText.textContent = 'Status: Conectando...';
            whatsappConnectBtn.classList.add('hidden');
            whatsappDisconnectBtn.classList.remove('hidden');
            whatsappDisconnectBtn.disabled = true; // Desabilita enquanto conecta
            break;
        case 'open':
            whatsappStatusText.textContent = 'Status: Conectado';
            whatsappConnectBtn.classList.add('hidden');
            whatsappDisconnectBtn.classList.remove('hidden');
             whatsappDisconnectBtn.disabled = false;
            break;
        case 'request_qr':
             // O QR será exibido pelo handler 'whatsapp_qr_code'
             whatsappStatusText.textContent = 'Status: Escaneie o QR Code';
            whatsappConnectBtn.classList.add('hidden');
            whatsappDisconnectBtn.classList.remove('hidden');
             whatsappDisconnectBtn.disabled = false;
            break;
        case 'close':
            whatsappStatusText.textContent = 'Status: Desconectado';
            whatsappConnectBtn.classList.remove('hidden');
            whatsappDisconnectBtn.classList.add('hidden');
             whatsappDisconnectBtn.disabled = false;
            break;
         case 'logged_out':
             whatsappStatusText.textContent = 'Status: Deslogado';
             whatsappConnectBtn.classList.remove('hidden');
             whatsappDisconnectBtn.classList.add('hidden');
             whatsappDisconnectBtn.disabled = false;
             break;
         case 'error':
            whatsappStatusText.textContent = 'Status: Erro';
            whatsappConnectBtn.classList.remove('hidden');
            whatsappDisconnectBtn.classList.add('hidden');
            whatsappDisconnectBtn.disabled = false;
             break;
         default:
             whatsappStatusText.textContent = `Status: ${status}`; // Status desconhecido ou customizado
             whatsappConnectBtn.classList.remove('hidden'); // Mostra conectar por segurança
             whatsappDisconnectBtn.classList.add('hidden');
             whatsappDisconnectBtn.disabled = false;
    }
}

// --- Controle de Views ---
function showLoginView() { appContainer.classList.add('hidden'); authSection.classList.remove('hidden'); loginView.classList.remove('hidden'); signupView.classList.add('hidden'); userMenu.classList.add('hidden'); loginError.classList.add('hidden'); signupError.classList.add('hidden'); disconnectWebSocket();}
function showSignupView() { appContainer.classList.add('hidden'); authSection.classList.remove('hidden'); loginView.classList.add('hidden'); signupView.classList.remove('hidden'); userMenu.classList.add('hidden'); loginError.classList.add('hidden'); signupError.classList.add('hidden'); }
function showKanbanView() {
    authSection.classList.add('hidden');
    appContainer.classList.remove('hidden');
    userMenu.classList.remove('hidden');
    const name = currentUserName || "Usuário";
    const email = currentUserEmail || "sem-email";
    const initials = getInitials(name);
    const color = generateAvatarColor(name);
    userNameDisplay.textContent = `Olá, ${name.split(' ')[0]}`;
    userAvatar.textContent = initials;
    userAvatar.style.backgroundColor = color;
    userDropdownName.textContent = name;
    userDropdownEmail.textContent = email;
    updateToggleUI();
    loadInitialData();
    connectWebSocket();
}

// --- Renderização Kanban ---
function renderBoardSelectors(boards) {
    boardsContainer.innerHTML = '';
    boards.forEach(board => {
        const button = document.createElement('button'); button.className = 'board-button'; button.dataset.boardId = board.id;
        const nameSpan = document.createElement('span'); nameSpan.textContent = board.name; button.appendChild(nameSpan);
        const iconsDiv = document.createElement('div'); iconsDiv.className = 'flex items-center gap-2 ml-2';
        const renameSVG = `<svg class="board-action-icon rename-icon w-4 h-4"><use xlink:href="#icon-pencil"></use></svg>`;
        const deleteSVG = `<svg class="board-action-icon delete-icon w-4 h-4"><use xlink:href="#icon-trash"></use></svg>`;
        iconsDiv.innerHTML = renameSVG + deleteSVG;
        iconsDiv.querySelector('.rename-icon').addEventListener('click', (e) => { e.stopPropagation(); openBoardModal(board); });
        iconsDiv.querySelector('.delete-icon').addEventListener('click', (e) => { e.stopPropagation(); handleDeleteBoard(board.id, board.name); });
        button.appendChild(iconsDiv);
        button.addEventListener('click', () => handleBoardSelection(board.id)); boardsContainer.appendChild(button);
    });
    const newBtn = document.createElement('button'); newBtn.id = 'add-board-button'; newBtn.className = 'modal-button text-white font-semibold py-2 px-4 rounded-lg text-base whitespace-nowrap ml-auto flex-shrink-0'; newBtn.textContent = '+ Novo Quadro';
    newBtn.addEventListener('click', () => openBoardModal()); boardsContainer.appendChild(newBtn);
}
function setActiveBoardUI(id) { document.querySelectorAll('.board-button').forEach(b => b.classList.toggle('active-board', parseInt(b.dataset.boardId, 10) === id)); }
function renderTasks(tasks) {
    document.querySelectorAll('.tasks').forEach(c => c.innerHTML = '');
    if (!tasks || !tasks.length) {
        setupDragAndDrop(); // Chamar mesmo se vazio
        return;
    }
    tasks.forEach(t => { const colId = `${t.status.toLowerCase()}-tasks`; const colEl = document.getElementById(colId); if (colEl) colEl.appendChild(createTaskElement(t)); else console.warn(`Coluna ${colId} não encontrada.`); });
    setupDragAndDrop(); // Chamar após renderizar
}
function createTaskElement(task) { const d=document.createElement('div'); d.className='task-card bg-[#2e335a] rounded-lg shadow-md p-3 mb-3 cursor-grab text-white'; d.draggable=true; d.dataset.taskId=task.id; d.dataset.status=task.status; const t=document.createElement('strong'); t.className='block font-semibold mb-1 truncate'; t.textContent=task.title; d.appendChild(t); if(task.description){const s=document.createElement('small'); s.className='block text-gray-400 text-sm break-words'; s.textContent=task.description; d.appendChild(s);} d.addEventListener('click', (e)=>{if(draggedTaskElement) return; openTaskModal(task)}); return d; }

// --- Modais Tarefa ---
function openTaskModal(t = null) { taskForm.reset(); taskIdInput.value=''; modalDeleteButton.classList.add('hidden'); if (t){ modalTitle.textContent='Editar Tarefa'; taskIdInput.value=t.id; taskTitleInput.value=t.title; taskDescriptionInput.value=t.description||''; taskStatusSelect.value=t.status; modalSaveButton.textContent='Salvar Alterações'; modalDeleteButton.classList.remove('hidden'); } else { modalTitle.textContent='Nova Tarefa'; modalSaveButton.textContent='Criar Tarefa'; const btn=event?.target; taskStatusSelect.value=(btn?.dataset.status)||'TODO'; } taskModal.classList.remove('hidden'); taskTitleInput.focus(); }
function closeTaskModal() { taskModal.classList.add('hidden'); }
async function handleTaskFormSubmit(e) { e.preventDefault(); const id=taskIdInput.value; const d={title: taskTitleInput.value.trim(), description:taskDescriptionInput.value.trim()||null, status:taskStatusSelect.value, boardId:currentBoardId};
    if(!d.boardId){ showAlert('Quadro não selecionado.'); return; }
    if(!d.title){ showAlert('O título da tarefa é obrigatório.'); return; }
    try { if(id) await updateTask(id,d); else await createTask(d); closeTaskModal(); loadTasksForBoard(currentBoardId); }
    catch(err){ console.error('Falha salvar tarefa:', err); }
}
async function handleDeleteTask() {
    const id=taskIdInput.value; if(!id)return;
    const confirmed = await showConfirm(`Excluir tarefa "${taskTitleInput.value}"?`, 'Confirmar Exclusão');
    if(confirmed){try{await deleteTask(id); closeTaskModal(); loadTasksForBoard(currentBoardId);}catch(err){console.error('Falha excluir tarefa:', err);}}
}

// --- Modais Quadro ---
function openBoardModal(b = null) { boardForm.reset(); boardIdInput.value=''; boardError.classList.add('hidden'); if(b){ boardModalTitle.textContent='Renomear Quadro'; boardIdInput.value=b.id; boardNameInput.value=b.name; boardModalSaveButton.textContent='Salvar Alterações'; } else { boardModalTitle.textContent='Novo Quadro'; boardModalSaveButton.textContent='Criar Quadro'; } boardModal.classList.remove('hidden'); boardNameInput.focus(); boardNameInput.select(); }
function closeBoardModal() { boardModal.classList.add('hidden'); }
async function handleBoardFormSubmit(e) { e.preventDefault(); const n=boardNameInput.value.trim(); const id=boardIdInput.value; if(!n) return; try{ let board; if(id) board=await updateBoard(id,{name:n}); else board=await createBoard(n); closeBoardModal(); await loadInitialData(board.id); } catch(err){} }
async function handleDeleteBoard(id, name) {
    const confirmed = await showConfirm(`Excluir quadro "${name}"?\n\nATENÇÃO: Todas as tarefas serão excluídas!`, 'Confirmar Exclusão');
    if(confirmed){ try{ await deleteBoard(id); console.log(`Quadro ${id} excluído.`); const wasCurrent=currentBoardId===id; await loadInitialData(wasCurrent?null:currentBoardId); } catch(err){ console.error(`Falha excluir quadro ${id}:`, err); } }
}

// --- Drag and Drop (CORRIGIDO) ---
function handleDragStart(e){
    const t=e.target.closest('.task-card'); 
    if(!t){e.preventDefault(); return;} 
    draggedTaskElement=t; 
    e.dataTransfer.setData('text/plain', t.dataset.taskId); 
    e.dataTransfer.effectAllowed='move'; 
    setTimeout(()=>t.classList.add('dragging'),0);
}
function handleDragEnd(e){
    if(draggedTaskElement)draggedTaskElement.classList.remove('dragging'); 
    draggedTaskElement=null; 
    document.querySelectorAll('.task-placeholder').forEach(p=>p.remove());
}
function handleDragOver(e){
    e.preventDefault(); 
    e.dataTransfer.dropEffect='move'; 
    const tc=e.target.closest('.tasks'); 
    if(!tc||!draggedTaskElement)return; 
    const p=tc.querySelector('.task-placeholder'); 
    if(!p){
        document.querySelectorAll('.task-placeholder').forEach(p=>p.remove()); 
        const nP=document.createElement('div'); 
        nP.className='task-placeholder'; 
        const aE=getDragAfterElement(tc,e.clientY); 
        if(aE==null)tc.appendChild(nP); 
        else tc.insertBefore(nP,aE);
    }else{
        const aE=getDragAfterElement(tc,e.clientY); 
        if(aE!==p.nextSibling){
            if(aE==null)tc.appendChild(p); 
            else tc.insertBefore(p,aE);
        }
    }
}
function getDragAfterElement(c,y){
    const dE=[...c.querySelectorAll('.task-card:not(.dragging)')]; 
    return dE.reduce((cl,ch)=>{
        const b=ch.getBoundingClientRect(); 
        const o=y-b.top-b.height/2; 
        if(o<0&&o>cl.offset)return{offset:o,element:ch}; 
        else return cl;
    },{offset:Number.NEGATIVE_INFINITY}).element;
}
function handleDragEnter(e){
    e.preventDefault();
}
function handleDragLeave(e){
    const t=e.target.closest('.tasks'); 
    if(t&&!t.contains(e.relatedTarget)){
        const p=t.querySelector('.task-placeholder'); 
        if(p)p.remove();
    }
}
async function handleDrop(e) {
    e.preventDefault();
    const tasksContainer = e.target.closest('.tasks');
    const column = tasksContainer?.closest('.column');
    
    // 1. Encontra o placeholder na coluna atual
    const placeholder = tasksContainer?.querySelector('.task-placeholder');

    // 2. Remove o estilo de arrastar
    if (draggedTaskElement) draggedTaskElement.classList.remove('dragging');

    // 3. Verifica se o drop é válido
    if (!column || !tasksContainer || !draggedTaskElement) {
        draggedTaskElement = null;
        document.querySelectorAll('.task-placeholder').forEach(p => p.remove()); // Limpa todos os placeholders
        return;
    }

    const taskId = draggedTaskElement.dataset.taskId;
    const newStatus = column.dataset.status;
    const oldStatus = draggedTaskElement.dataset.status;

    // 4. Insere o elemento arrastado
    if (placeholder) {
        // Substitui o placeholder pelo elemento arrastado
        placeholder.replaceWith(draggedTaskElement);
    } else {
        // Fallback: se não houver placeholder, tenta adicionar no final ou na posição do cursor
        const afterElement = getDragAfterElement(tasksContainer, e.clientY);
        if (afterElement == null) {
            tasksContainer.appendChild(draggedTaskElement);
        } else {
            tasksContainer.insertBefore(draggedTaskElement, afterElement);
        }
    }
    
    // 5. Limpa qualquer outro placeholder (de outras colunas)
    document.querySelectorAll('.task-placeholder').forEach(p => p.remove());

    // 6. Atualiza estado e API
    draggedTaskElement.dataset.status = newStatus;
    const locallyDraggedElement = draggedTaskElement;
    draggedTaskElement = null;

    if (newStatus !== oldStatus) {
        try {
            await updateTask(taskId, { status: newStatus });
            console.log(`Tarefa ${taskId} movida para ${newStatus}`);
        }
        catch (err) {
            console.error('Falha D&D:', err);
            // Reverte a mudança visual
            const originalColumnTasks = document.querySelector(`.column[data-status="${oldStatus}"] .tasks`);
            if (originalColumnTasks) {
                originalColumnTasks.appendChild(locallyDraggedElement); // Adiciona de volta
                locallyDraggedElement.dataset.status = oldStatus;
            }
            showAlert('Erro ao mover tarefa.', 'Erro de Arraste');
        }
    }
}
function setupDragAndDrop(){
    document.querySelectorAll('.task-card').forEach(t=>{t.removeEventListener('dragstart',handleDragStart); t.removeEventListener('dragend',handleDragEnd);}); 
    document.querySelectorAll('.column .tasks').forEach(c=>{c.removeEventListener('dragover',handleDragOver); c.removeEventListener('dragenter',handleDragEnter); c.removeEventListener('dragleave',handleDragLeave); c.removeEventListener('drop',handleDrop);}); 
    const ts=document.querySelectorAll('.task-card'); 
    const cs=document.querySelectorAll('.column .tasks'); 
    ts.forEach(t=>{t.addEventListener('dragstart',handleDragStart); t.addEventListener('dragend',handleDragEnd);}); 
    cs.forEach(c=>{c.addEventListener('dragover',handleDragOver); c.addEventListener('dragenter',handleDragEnter); c.addEventListener('dragleave',handleDragLeave); c.addEventListener('drop',handleDrop);});
}
// --- FIM DO DRAG AND DROP ---

// --- Inicialização Kanban e Seleção ---
async function loadTasksForBoard(id) { if(!id){renderTasks([]); return;} try{const ts=await getTasks(id); renderTasks(ts);}catch(err){console.error(`Erro carregar tasks ${id}:`, err); renderTasks([]);}}
function handleBoardSelection(id) { const i=parseInt(id,10); if(isNaN(i)||i<=0){currentBoardId=null; setActiveBoardUI(null); renderTasks([]); kanbanBoardSection.classList.add('hidden'); noBoardsMessage.classList.remove('hidden');} else if(i!==currentBoardId){currentBoardId=i; setActiveBoardUI(i); loadTasksForBoard(i); kanbanBoardSection.classList.remove('hidden'); noBoardsMessage.classList.add('hidden');} }
async function loadInitialData(selectId=null) {
    if(!authToken){console.warn("Sem auth token."); logout(); return;}
    try {
        allBoards = await getBoards();
        renderBoardSelectors(allBoards);
        if(allBoards.length === 0){
            kanbanBoardSection.classList.add('hidden');
            noBoardsMessage.classList.remove('hidden');
            currentBoardId = null;
            setActiveBoardUI(null);
            renderTasks([]);
        } else {
            kanbanBoardSection.classList.remove('hidden');
            noBoardsMessage.classList.add('hidden');
            let initId = selectId;
            if (!initId) {
                const defaults = ["Tasks Pendentes", "Novas Ideias", "Alinhamento com Cliente"];
                let found = false;
                for (const n of defaults) { const b = allBoards.find(b => b.name === n); if (b) { initId = b.id; found = true; break; } }
                if (!found) initId = allBoards[0].id;
            }
            handleBoardSelection(initId);
        }
    } catch(err) {
        console.error('Erro loadInitialData:', err);
        loadingIndicator.classList.add('hidden');
        if(authToken){ boardsContainer.innerHTML='<span class="text-red-500 p-3">Erro ao carregar</span>'; kanbanBoardSection.classList.add('hidden'); noBoardsMessage.classList.add('hidden'); renderTasks([]);}
    }
}

// --- Event Listeners ---
showSignupLink.addEventListener('click', showSignupView);
showLoginLink.addEventListener('click', showLoginView);
logoutButton.addEventListener('click', logout);
whatsappConnectBtn.addEventListener('click', () => {
    if (socket && socket.connected) {
        whatsappStatusText.textContent = 'Status: Solicitando conexão...';
        socket.emit('request_whatsapp_connect');
    } else {
        showAlert('Conexão WebSocket não estabelecida. Tentando reconectar...');
        connectWebSocket(); // Tenta reconectar o socket principal primeiro
    }
});

whatsappDisconnectBtn.addEventListener('click', () => {
    if (socket && socket.connected) {
        whatsappStatusText.textContent = 'Status: Desconectando...';
        socket.emit('disconnect_whatsapp');
    } else {
        // Se o socket não está conectado, apenas atualiza a UI e talvez limpe localmente
         updateWhatsappUI('logged_out'); // Ou 'close' se preferir
         // Considerar limpar o número salvo localmente também?
         // currentUserSettings.whatsappNumber = null;
         // updateUserSettings({ whatsappNumber: null, notifyViaWhatsApp: false }); // Ou apenas local
         console.warn("Socket não conectado, desconexão não enviada ao backend.");
    }
});

// Listener para salvar o número confirmado e a preferência de notificação
whatsappNumberInput.addEventListener('change', (e) => {
    const newNumber = e.target.value.trim();
    if (currentUserSettings.whatsappNumber !== newNumber) {
        currentUserSettings.whatsappNumber = newNumber || null; // Salva null se vazio
        updateUserSettings({ whatsappNumber: currentUserSettings.whatsappNumber });
    }
});

toggleWhatsApp.addEventListener('change', (e) => {
    const wantsWhatsApp = e.target.checked;
    currentUserSettings.notifyViaWhatsApp = wantsWhatsApp;
    updateUserSettings({ notifyViaWhatsApp: wantsWhatsApp }); // Salva a preferência
});
// Toggle do Menu de Usuário
userMenuButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = userMenuDropdown.classList.toggle('dropdown-visible');
    dropdownArrow.classList.toggle('arrow-rotated', isVisible);
});
// Fechar dropdown ao clicar fora
document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target) && userMenuDropdown.classList.contains('dropdown-visible')) {
        userMenuDropdown.classList.remove('dropdown-visible');
        dropdownArrow.classList.remove('arrow-rotated');
    }
});

// Forms
loginForm.addEventListener('submit', async (e) => { e.preventDefault(); loginError.classList.add('hidden'); const em=loginEmailInput.value; const pw=loginPasswordInput.value; try { await login(em,pw); showKanbanView(); } catch (err) { loginError.textContent=err.message||'Erro login.'; loginError.classList.remove('hidden'); } });
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault(); signupError.classList.add('hidden');
    const name = signupNameInput.value.trim(); const email = signupEmailInput.value; const pw = signupPasswordInput.value; const cpw = signupConfirmPasswordInput.value;
    if (!name) { signupError.textContent = 'O nome é obrigatório.'; signupError.classList.remove('hidden'); return; }
    if (pw !== cpw) { signupError.textContent = 'As senhas não coincidem.'; signupError.classList.remove('hidden'); return; }
    if (pw.length < 6) { signupError.textContent = 'A senha deve ter pelo menos 6 caracteres.'; signupError.classList.remove('hidden'); return; }
    try {
        await signup(email, pw, name);
        showAlert('Cadastro realizado com sucesso! Faça o login.', 'Sucesso');
        showLoginView();
    } catch (err) { signupError.textContent = err.message || 'Erro cadastro.'; signupError.classList.remove('hidden'); }
});

// Modais
alertModalOk.addEventListener('click', closeAlertModal);
confirmModalCancel.addEventListener('click', () => closeConfirmModal(false));
confirmModalConfirm.addEventListener('click', () => closeConfirmModal(true));
infoModalClose.addEventListener('click', closeInfoModal);
infoIcons.forEach(icon => {
    icon.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault(); // Impede que o label ative o checkbox
        const settingKey = e.target.closest('.info-icon').dataset.settingKey;
        let title = 'Informação da Notificação';
        let description = 'Detalhes não encontrados.';
        if (settingKey === 'dailySummary') {
            title = 'Resumo Diário';
            description = 'Envia um e-mail todas as manhãs com um resumo de todas as suas tarefas que não estão marcadas como "Done".';
        } else if (settingKey === 'staleTasks') {
            title = 'Aviso de Tarefa Parada';
            description = 'Envia um e-mail quando uma tarefa permanece na coluna "Doing" por mais de 2 dias sem ser atualizada ou movida.';
        }
        openInfoModal(title, description, currentUserEmail);
    });
});

// Toggles de Configuração
allToggles.forEach(toggle => {
    toggle.addEventListener('change', (e) => {
        const settingKey = e.target.dataset.setting;
        const value = e.target.checked;
        currentUserSettings[settingKey] = value;
        updateUserSettings({ [settingKey]: value });
    });
});

// Kanban
document.body.addEventListener('click', function(event) {
    if (event.target.matches('.add-task-button')) {
        if (!currentBoardId) { showAlert("Por favor, selecione ou crie um quadro primeiro."); return; }
        openTaskModal(); const s = event.target.dataset.status || 'TODO'; taskStatusSelect.value = s;
    }
});
taskForm.addEventListener('submit', handleTaskFormSubmit);
modalCancelButton.addEventListener('click', closeTaskModal);
modalDeleteButton.addEventListener('click', handleDeleteTask);
boardForm.addEventListener('submit', handleBoardFormSubmit);
boardModalCancelButton.addEventListener('click', closeBoardModal);

// --- Inicialização Geral ---
document.addEventListener('DOMContentLoaded', async () => { // Tornar async
    authToken = localStorage.getItem(TOKEN_KEY);
    currentUserEmail = localStorage.getItem(USER_EMAIL_KEY);
    currentUserName = localStorage.getItem(USER_NAME_KEY);

    if (authToken) {
        try {
            const user = await fetchApi('/user/me'); // Espera a resposta
            currentUserEmail = user.email;
            currentUserName = user.name;
            currentUserSettings = { // Carrega TODAS as configurações
                notifyDailySummary: user.notifyDailySummary,
                notifyStaleTasks: user.notifyStaleTasks,
                notifyViaWhatsApp: user.notifyViaWhatsApp, // Carrega do backend
                whatsappNumber: user.whatsappNumber,     // Carrega do backend
            };
            localStorage.setItem(USER_EMAIL_KEY, currentUserEmail);
            localStorage.setItem(USER_NAME_KEY, currentUserName);
            // NÃO salvar whatsappNumber ou notifyViaWhatsApp no localStorage
            showKanbanView();
        } catch (err) {
            console.error("Erro ao buscar /user/me ou token inválido:", err);
            logout(); // Faz logout se o token for inválido
        }
    } else {
        showLoginView();
    }
});