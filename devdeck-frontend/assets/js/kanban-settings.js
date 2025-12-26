/* KANBAN SETTINGS - FIXED */

// Variável Global
let currentUserSettings = {
    notifyDailySummary: true,
    notifyStaleTasks: true,
    discordWebhook: null,
    notificationDays: null
};

// 1. Carregar Configurações
async function loadUserSettings() {
    try {
        const user = await DevDeck.fetchApi('/user/me');
        
        if (user) {
            currentUserSettings = {
                notifyDailySummary: user.notifyDailySummary,
                notifyStaleTasks: user.notifyStaleTasks,
                discordWebhook: user.discordWebhook,
                notificationDays: user.notificationDays
            };
            
            // Preencher Toggles
            setInputValue('settings-notify-daily', user.notifyDailySummary, true);
            setInputValue('settings-notify-stale', user.notifyStaleTasks, true);
            setInputValue('settings-discord-webhook', user.discordWebhook || '');
            
            // Dias da Semana
            const savedDays = (user.notificationDays || "1,2,3,4,5").split(',');
            document.querySelectorAll('.day-checkbox').forEach(chk => {
                chk.checked = savedDays.includes(chk.value);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar settings:', error);
    }
}

// 2. Configurar Botão Salvar
function setupSettingsListeners() {
    const saveBtn = document.getElementById('save-settings-btn');
    if (saveBtn) {
        const newBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newBtn, saveBtn);

        newBtn.addEventListener('click', async () => {
            const daily = getInputValue('settings-notify-daily', true);
            const stale = getInputValue('settings-notify-stale', true);
            const discord = getInputValue('settings-discord-webhook', false);
            
            const selectedDays = Array.from(document.querySelectorAll('.day-checkbox:checked'))
                .map(cb => cb.value).join(',');

            const payload = {
                notifyDailySummary: daily,
                notifyStaleTasks: stale,
                discordWebhook: discord,
                notificationDays: selectedDays
            };

            try {
                await DevDeck.fetchApi('/user/settings', {
                    method: 'PATCH',
                    body: JSON.stringify(payload)
                });
                
                currentUserSettings = payload;
                DevDeck.showAlert('Configurações salvas!', 'Sucesso');
                document.getElementById('settings-modal').classList.add('hidden');
            } catch (error) {
                console.error(error);
                DevDeck.showAlert('Erro ao salvar: ' + error.message, 'Erro');
            }
        });
    }
}

// 3. Função Global para Abrir Modal (CRÍTICO)
window.openSettingsModal = async function() {
    await loadUserSettings();
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.remove('hidden');
    } else {
        console.error('Modal #settings-modal não encontrado.');
    }
};

// Helpers
function setInputValue(id, value, isCheckbox = false) {
    const el = document.getElementById(id);
    if (el) {
        if (isCheckbox) el.checked = value;
        else el.value = value;
    }
}

function getInputValue(id, isCheckbox = false) {
    const el = document.getElementById(id);
    if (!el) return isCheckbox ? false : null;
    if (isCheckbox) return el.checked;
    const val = el.value.trim();
    return val === '' ? null : val;
}