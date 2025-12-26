
// --- 1. CARREGAMENTO DE DADOS ---

async function loadUserSettings() {
    try {
        const user = await DevDeck.fetchApi('/user/me');
        
        if (user) {
            // Atualiza a variável global (definida no kanban.js)
            if (typeof currentUserSettings !== 'undefined') {
                currentUserSettings = {
                    notifyDailySummary: user.notifyDailySummary,
                    notifyStaleTasks: user.notifyStaleTasks,
                    discordWebhook: user.discordWebhook,
                    notificationDays: user.notificationDays // Novo campo
                };
            }

            // 1. Toggles de Notificação (Suporta IDs novos e antigos)
            setInputValue('settings-notify-daily', user.notifyDailySummary, true);
            setInputValue('toggle-daily-summary', user.notifyDailySummary, true);
            
            setInputValue('settings-notify-stale', user.notifyStaleTasks, true);
            setInputValue('toggle-stale-tasks', user.notifyStaleTasks, true);

            // 2. Campo do Discord
            setInputValue('settings-discord-webhook', user.discordWebhook || '');
            
            // 3. Dias da Semana (NOVO)
            // Se não tiver nada salvo, assume padrão "1,2,3,4,5" (Seg-Sex)
            const savedDays = (user.notificationDays || "1,2,3,4,5").split(',');
            
            document.querySelectorAll('.day-checkbox').forEach(chk => {
                // Marca o checkbox se o valor dele estiver na lista salva
                chk.checked = savedDays.includes(chk.value);
            });

            // Compatibilidade com funções legadas (se existirem)
            if (typeof updateToggleUI === 'function') updateToggleUI();
        }
    } catch (error) {
        console.error('Erro ao carregar configurações:', error);
    }
}

// Helper para setar valor sem erro se o elemento não existir
function setInputValue(id, value, isCheckbox = false) {
    const el = document.getElementById(id);
    if (el) {
        if (isCheckbox) el.checked = value;
        else el.value = value;
    }
}

// --- 2. LISTENERS E SALVAMENTO ---

function setupSettingsListeners() {
    const saveBtn = document.getElementById('save-settings-btn');
    
    // Lógica do Modal Novo (Botão Salvar Geral)
    if (saveBtn) {
        // Clone para remover listeners antigos e evitar duplicidade
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

        newSaveBtn.addEventListener('click', async () => {
            const daily = getInputValue('settings-notify-daily', true);
            const stale = getInputValue('settings-notify-stale', true);
            const discord = getInputValue('settings-discord-webhook', false);

            await saveAllSettings({
                notifyDailySummary: daily,
                notifyStaleTasks: stale,
                discordWebhook: discord
            });
            
            // Fechar modal
            const modal = document.getElementById('settings-modal');
            if (modal) modal.classList.add('hidden');
        });
    }

    // Lógica Legada (Listeners individuais dos toggles antigos - Mantido por segurança)
    const toggleDaily = document.getElementById('toggle-daily-summary');
    if (toggleDaily) {
        toggleDaily.addEventListener('change', function() {
            saveAllSettings({ notifyDailySummary: this.checked });
        });
    }
    const toggleStale = document.getElementById('toggle-stale-tasks');
    if (toggleStale) {
        toggleStale.addEventListener('change', function() {
            saveAllSettings({ notifyStaleTasks: this.checked });
        });
    }
    
    // Info icons (se ainda existirem no HTML)
    document.querySelectorAll('.info-icon').forEach(icon => {
        icon.addEventListener('click', function() {
            if (typeof showSettingInfo === 'function') showSettingInfo(this.dataset.settingKey);
        });
    });
}

// Helper para pegar valor
function getInputValue(id, isCheckbox = false) {
    const el = document.getElementById(id);
    if (!el) return isCheckbox ? false : null;
    
    if (isCheckbox) {
        return el.checked;
    } else {
        // CORREÇÃO: Se estiver vazio, retorna null para não dar erro de URL inválida
        const val = el.value.trim();
        return val === '' ? null : val;
    }
}

// Função unificada de salvamento
async function saveAllSettings(payload) {
    try {
        // Mescla com as configurações atuais para não perder dados
        const finalPayload = { ...currentUserSettings, ...payload };
        
        // Remove campos de WhatsApp do payload para não dar erro no backend
        delete finalPayload.whatsappNumber;
        delete finalPayload.notifyViaWhatsApp;

        await DevDeck.fetchApi('/user/settings', {
            method: 'PATCH',
            body: JSON.stringify(finalPayload)
        });
        
        // Atualiza localmente
        currentUserSettings = finalPayload;
        DevDeck.showAlert('Configurações salvas!', 'Sucesso');
        
    } catch (error) {
        console.error('Erro ao salvar:', error);
        DevDeck.showAlert('Erro ao salvar: ' + error.message, 'Erro');
    }
}

// --- 3. STUBS DE COMPATIBILIDADE (O PULO DO GATO) ---
// Essas funções não fazem nada, mas existem para o kanban.js não dar erro "undefined is not a function"

function setupWhatsAppMetaListeners() { /* Removido: Stub para não quebrar */ }
function loadWhatsAppMetaStatus() { /* Removido */ }
function updateToggleUI() { /* Removido */ }
function showSettingInfo() { /* Removido */ }


// --- 4. PUSHER (ESSENCIAL - RESTAURADO DO ARQUIVO ANTIGO) ---

function initializePusher() {
    try {
        const token = DevDeck.getAuthToken();
        if (!token) return;
        
        // Decodificar token para pegar userId
        // Nota: jwt_decode precisa estar carregado na página
        if (typeof jwt_decode === 'undefined') return;

        const decoded = jwt_decode(token);
        const userId = decoded.sub || decoded.userId || decoded.id;
        
        if (!userId || typeof Pusher === 'undefined') return;
        
        // Verifica se as constantes existem (definidas no config.php -> header -> script)
        if (typeof PUSHER_KEY === 'undefined' || typeof PUSHER_CLUSTER === 'undefined') return;

        pusherClient = new Pusher(PUSHER_KEY, {
            cluster: PUSHER_CLUSTER,
            encrypted: true,
            authEndpoint: `${API_BASE_URL}/pusher/auth`,
            auth: {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        });
        
        pusherChannel = pusherClient.subscribe(`private-user-${userId}`);
        
        pusherChannel.bind('pusher:subscription_succeeded', () => {
            console.log('Conectado ao Pusher com sucesso!');
        });
        
        const refreshTasks = async () => { if (typeof loadTasks === 'function') await loadTasks(currentBoardId); };
        const refreshBoards = async () => { if (typeof reloadBoardsForCurrentContext === 'function') await reloadBoardsForCurrentContext(); };

        pusherChannel.bind('task_created', refreshTasks);
        pusherChannel.bind('task_updated', refreshTasks);
        pusherChannel.bind('task_deleted', refreshTasks);
        
        pusherChannel.bind('board_created', refreshBoards);
        pusherChannel.bind('board_updated', refreshBoards);
        pusherChannel.bind('board_deleted', refreshBoards);

    } catch (error) {
        console.error('Erro ao inicializar Pusher:', error);
    }
}

function disconnectPusher() {
    if (pusherClient) {
        if (pusherChannel) {
            pusherChannel.unbind_all();
            pusherClient.unsubscribe(pusherChannel.name);
        }
        pusherClient.disconnect();
        pusherClient = null;
        pusherChannel = null;
    }
}

// Função para abrir o modal manualmente (chamada pelo botão da navbar)
function openSettingsModal() {
    loadUserSettings().then(() => {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.classList.remove('hidden');
        } else {
            console.warn('Modal settings-modal não encontrado. Verifique se modals.php foi atualizado.');
        }
    });
}