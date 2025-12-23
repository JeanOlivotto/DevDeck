// Configurações do usuário
async function loadUserSettings() {
    try {
        const user = await DevDeck.fetchApi('/user/me');
        
        if (user) {
            currentUserSettings = {
                notifyDailySummary: user.notifyDailySummary,
                notifyStaleTasks: user.notifyStaleTasks,
                notifyViaWhatsApp: user.notifyViaWhatsApp,
                whatsappNumber: user.whatsappNumber
            };
            
            updateToggleUI();
        }
    } catch (error) {
        console.error('Erro ao carregar configurações:', error);
    }
}

function setupSettingsListeners() {
    const toggleDailySummary = document.getElementById('toggle-daily-summary');
    const toggleStaleTasks = document.getElementById('toggle-stale-tasks');
    const toggleWhatsApp = document.getElementById('toggle-whatsapp');
    const whatsappNumberInput = document.getElementById('whatsapp-number-confirm');
    
    if (toggleDailySummary) {
        toggleDailySummary.addEventListener('change', function() {
            updateUserSettings({ notifyDailySummary: this.checked });
        });
    }
    
    if (toggleStaleTasks) {
        toggleStaleTasks.addEventListener('change', function() {
            updateUserSettings({ notifyStaleTasks: this.checked });
        });
    }
    
    if (toggleWhatsApp) {
        toggleWhatsApp.addEventListener('change', function() {
            updateUserSettings({ notifyViaWhatsApp: this.checked });
        });
    }
    
    if (whatsappNumberInput) {
        whatsappNumberInput.addEventListener('blur', function() {
            const number = this.value.trim();
            if (number && number !== currentUserSettings.whatsappNumber) {
                updateUserSettings({ whatsappNumber: number });
            }
        });
    }
    
    // Info icons
    document.querySelectorAll('.info-icon').forEach(icon => {
        icon.addEventListener('click', function() {
            const settingKey = this.dataset.settingKey;
            showSettingInfo(settingKey);
        });
    });
}

function updateToggleUI() {
    const toggleDailySummary = document.getElementById('toggle-daily-summary');
    const toggleStaleTasks = document.getElementById('toggle-stale-tasks');
    const toggleWhatsApp = document.getElementById('toggle-whatsapp');
    const whatsappNumberInput = document.getElementById('whatsapp-number-confirm');
    
    if (toggleDailySummary) {
        toggleDailySummary.checked = currentUserSettings.notifyDailySummary;
        updateToggleStyle(toggleDailySummary);
    }
    
    if (toggleStaleTasks) {
        toggleStaleTasks.checked = currentUserSettings.notifyStaleTasks;
        updateToggleStyle(toggleStaleTasks);
    }
    
    if (toggleWhatsApp) {
        toggleWhatsApp.checked = currentUserSettings.notifyViaWhatsApp;
        updateToggleStyle(toggleWhatsApp);
    }
    
    if (whatsappNumberInput) {
        whatsappNumberInput.value = currentUserSettings.whatsappNumber || '';
    }
}

function updateToggleStyle(toggleElement) {
    const toggleBg = toggleElement.parentElement.querySelector('.toggle-bg');
    const toggleDot = toggleElement.parentElement.querySelector('.toggle-dot');
    
    if (toggleElement.checked) {
        toggleBg.classList.remove('bg-gray-600');
        toggleBg.classList.add('bg-green-500');
        toggleDot.style.transform = 'translateX(20px)';
    } else {
        toggleBg.classList.remove('bg-green-500');
        toggleBg.classList.add('bg-gray-600');
        toggleDot.style.transform = 'translateX(0)';
    }
}

async function updateUserSettings(settingsData) {
    try {
        const payload = { ...currentUserSettings, ...settingsData };
        
        // Validar número WhatsApp
        if (payload.whatsappNumber) {
            const whatsappRegex = /^\+?\d{10,15}$/;
            if (!whatsappRegex.test(payload.whatsappNumber)) {
                DevDeck.showAlert('Formato WhatsApp inválido. Use: +DDI DDD NÚMERO (Ex: +5519999998888)');
                updateToggleUI();
                return;
            }
        }
        
        // Verificar se WhatsApp está ativado sem número
        if (payload.notifyViaWhatsApp && !payload.whatsappNumber) {
            DevDeck.showAlert('É necessário confirmar seu número de WhatsApp para ativar as notificações.');
            payload.notifyViaWhatsApp = false;
            currentUserSettings.notifyViaWhatsApp = false;
            updateToggleUI();
            return;
        }
        
        const updatedUser = await DevDeck.fetchApi('/user/settings', {
            method: 'PATCH',
            body: JSON.stringify(payload)
        });
        
        currentUserSettings.notifyDailySummary = updatedUser.notifyDailySummary;
        currentUserSettings.notifyStaleTasks = updatedUser.notifyStaleTasks;
        currentUserSettings.notifyViaWhatsApp = updatedUser.notifyViaWhatsApp;
        currentUserSettings.whatsappNumber = updatedUser.whatsappNumber;
        
        updateToggleUI();
    } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        DevDeck.showAlert(`Erro ao salvar configurações: ${error.message}`);
        updateToggleUI();
    }
}

function showSettingInfo(settingKey) {
    const infoModal = document.getElementById('info-modal');
    const infoModalTitle = document.getElementById('info-modal-title');
    const infoModalDescription = document.getElementById('info-modal-description');
    const infoModalEmail = document.getElementById('info-modal-email');
    
    const userData = DevDeck.getUserData();
    
    const infoData = {
        dailySummary: {
            title: 'Resumo Diário',
            description: 'Receba um e-mail diário com um resumo de todas as suas tarefas pendentes e em andamento.'
        },
        staleTasks: {
            title: 'Aviso de Tarefa Parada',
            description: 'Receba alertas quando uma tarefa estiver parada há muito tempo em uma mesma coluna.'
        }
    };
    
    const info = infoData[settingKey];
    
    if (info && infoModal) {
        infoModalTitle.textContent = info.title;
        infoModalDescription.textContent = info.description;
        infoModalEmail.textContent = userData.email || 'Nenhum e-mail cadastrado';
        infoModal.classList.remove('hidden');
    }
}

// WhatsApp Meta API
function setupWhatsAppMetaListeners() {
    const whatsappMetaTutorialBtn = document.getElementById('whatsapp-meta-tutorial-btn');
    const whatsappMetaTutorialClose = document.getElementById('whatsapp-tutorial-close');
    const whatsappMetaSaveBtn = document.getElementById('whatsapp-meta-save-btn');
    const whatsappMetaRemoveBtn = document.getElementById('whatsapp-meta-remove-btn');
    const whatsappMetaTestBtn = document.getElementById('whatsapp-meta-test-btn');
    
    if (whatsappMetaTutorialBtn) {
        whatsappMetaTutorialBtn.addEventListener('click', openWhatsAppTutorial);
    }
    
    if (whatsappMetaTutorialClose) {
        whatsappMetaTutorialClose.addEventListener('click', closeWhatsAppTutorial);
    }
    
    if (whatsappMetaSaveBtn) {
        whatsappMetaSaveBtn.addEventListener('click', saveWhatsAppMetaCredentials);
    }
    
    if (whatsappMetaRemoveBtn) {
        whatsappMetaRemoveBtn.addEventListener('click', removeWhatsAppMetaCredentials);
    }
    
    if (whatsappMetaTestBtn) {
        whatsappMetaTestBtn.addEventListener('click', sendWhatsAppMetaTest);
    }
}

function openWhatsAppTutorial() {
    const modal = document.getElementById('whatsapp-tutorial-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeWhatsAppTutorial() {
    const modal = document.getElementById('whatsapp-tutorial-modal');
    if (modal) modal.classList.add('hidden');
}

async function loadWhatsAppMetaStatus() {
    try {
        const status = await DevDeck.fetchApi('/whatsapp-meta/status');
        
        const statusText = document.getElementById('whatsapp-meta-status-text');
        const counter = document.getElementById('whatsapp-meta-counter');
        const progressBar = document.getElementById('whatsapp-meta-progress-bar');
        const saveBtn = document.getElementById('whatsapp-meta-save-btn');
        const removeBtn = document.getElementById('whatsapp-meta-remove-btn');
        const testBtn = document.getElementById('whatsapp-meta-test-btn');
        
        // Atualizar status
        if (status.configured) {
            if (statusText) {
                statusText.textContent = '✅ Configurado';
                statusText.className = 'text-green-400 font-semibold';
            }
            if (saveBtn) saveBtn.textContent = '💾 Atualizar';
            if (removeBtn) removeBtn.classList.remove('hidden');
            if (testBtn) testBtn.classList.remove('hidden');
        } else {
            if (statusText) {
                statusText.textContent = '⚠️ Não configurado';
                statusText.className = 'text-yellow-400 font-semibold';
            }
            if (saveBtn) saveBtn.textContent = '💾 Salvar';
            if (removeBtn) removeBtn.classList.add('hidden');
            if (testBtn) testBtn.classList.add('hidden');
        }
        
        // Atualizar contador
        const messagesUsed = status.messagesUsed || 0;
        const messagesLimit = 950;
        
        if (counter) {
            counter.textContent = `${messagesUsed}/${messagesLimit}`;
        }
        
        // Atualizar barra de progresso
        const percentage = (messagesUsed / messagesLimit) * 100;
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
            
            if (percentage >= 90) {
                progressBar.className = 'bg-red-500 h-1.5 rounded-full';
            } else if (percentage >= 70) {
                progressBar.className = 'bg-yellow-500 h-1.5 rounded-full';
            } else {
                progressBar.className = 'bg-cyan-400 h-1.5 rounded-full';
            }
        }
        
        // Alerta se limite atingido
        if (status.limitReached) {
            DevDeck.showAlert('⚠️ Limite mensal de mensagens WhatsApp atingido (950/950). Reset no dia 1º do próximo mês.');
        }
    } catch (error) {
        console.error('Erro ao carregar status WhatsApp Meta:', error);
    }
}

async function saveWhatsAppMetaCredentials() {
    const phoneNumberId = document.getElementById('whatsapp-phone-number-id').value.trim();
    const accessToken = document.getElementById('whatsapp-access-token').value.trim();
    
    if (!phoneNumberId || !accessToken) {
        DevDeck.showAlert('⚠️ Preencha Phone Number ID e Access Token');
        return;
    }
    
    try {
        await DevDeck.fetchApi('/whatsapp-meta/credentials', {
            method: 'POST',
            body: JSON.stringify({ phoneNumberId, accessToken })
        });
        
        DevDeck.showAlert('✅ Credenciais WhatsApp Meta salvas com sucesso!');
        await loadWhatsAppMetaStatus();
        
        // Limpar campos
        document.getElementById('whatsapp-phone-number-id').value = '';
        document.getElementById('whatsapp-access-token').value = '';
    } catch (error) {
        console.error('Erro ao salvar credenciais:', error);
        DevDeck.showAlert(`❌ Erro ao salvar credenciais: ${error.message}`);
    }
}

async function removeWhatsAppMetaCredentials() {
    const confirmed = await DevDeck.showConfirm(
        'Tem certeza que deseja remover as credenciais do WhatsApp Meta? Você não receberá mais notificações via WhatsApp.',
        'Remover Configuração'
    );
    
    if (!confirmed) return;
    
    try {
        await DevDeck.fetchApi('/whatsapp-meta/credentials', {
            method: 'DELETE'
        });
        
        DevDeck.showAlert('✅ Credenciais WhatsApp Meta removidas com sucesso!');
        await loadWhatsAppMetaStatus();
        
        document.getElementById('whatsapp-phone-number-id').value = '';
        document.getElementById('whatsapp-access-token').value = '';
    } catch (error) {
        console.error('Erro ao remover credenciais:', error);
        DevDeck.showAlert(`❌ Erro ao remover credenciais: ${error.message}`);
    }
}

async function sendWhatsAppMetaTest() {
    const testNumber = prompt('Digite o número de WhatsApp para teste (formato: +5519999998888):');
    
    if (!testNumber) return;
    
    const whatsappRegex = /^\+?\d{10,15}$/;
    if (!whatsappRegex.test(testNumber)) {
        DevDeck.showAlert('❌ Formato inválido. Use: +DDI DDD NÚMERO (Ex: +5519999998888)');
        return;
    }
    
    try {
        await DevDeck.fetchApi('/whatsapp-meta/test', {
            method: 'POST',
            body: JSON.stringify({ to: testNumber })
        });
        
        DevDeck.showAlert('✅ Mensagem de teste enviada com sucesso!');
        await loadWhatsAppMetaStatus();
    } catch (error) {
        console.error('Erro ao enviar teste:', error);
        DevDeck.showAlert(`❌ Erro ao enviar teste: ${error.message}`);
    }
}

// Pusher (WebSocket) para atualizações em tempo real
function initializePusher() {
    try {
        const token = DevDeck.getAuthToken();
        if (!token) return;
        
        // Decodificar token para pegar userId
        const decoded = jwt_decode(token);
        const userId = decoded.sub || decoded.userId || decoded.id;
        
        if (!userId) {
            console.error('Não foi possível obter userId do token');
            return;
        }
        
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
        
        pusherChannel.bind('task_created', async () => {
            await loadTasks(currentBoardId);
        });
        
        pusherChannel.bind('task_updated', async () => {
            await loadTasks(currentBoardId);
        });
        
        pusherChannel.bind('task_deleted', async () => {
            await loadTasks(currentBoardId);
        });
        
        pusherChannel.bind('board_created', async () => {
            await loadBoards();
        });
        
        pusherChannel.bind('board_updated', async () => {
            await loadBoards();
        });
        
        pusherChannel.bind('board_deleted', async () => {
            await loadBoards();
        });
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
