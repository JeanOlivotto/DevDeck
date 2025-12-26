/* KANBAN SETTINGS & NAVBAR FIX - FINAL v3 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Menu de Usuário (Dropdown) - Lógica de Força Bruta
    const userMenuBtn = document.getElementById('user-menu-button');
    const userDropdown = document.getElementById('user-menu-dropdown-v2'); // Usa o ID V2
    const arrow = document.getElementById('dropdown-arrow');

    if (userMenuBtn && userDropdown) {
        const newBtn = userMenuBtn.cloneNode(true);
        userMenuBtn.parentNode.replaceChild(newBtn, userMenuBtn);

        newBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = userDropdown.style.display === 'none' || userDropdown.classList.contains('hidden');
            
            if (isHidden) {
                userDropdown.classList.remove('hidden');
                userDropdown.style.display = 'block';
                if (arrow) arrow.classList.add('rotate-180');
            } else {
                userDropdown.classList.add('hidden');
                userDropdown.style.display = 'none';
                if (arrow) arrow.classList.remove('rotate-180');
            }
        });

        document.addEventListener('click', (e) => {
            if (!userDropdown.contains(e.target) && !newBtn.contains(e.target)) {
                userDropdown.classList.add('hidden');
                userDropdown.style.display = 'none';
                if (arrow) arrow.classList.remove('rotate-180');
            }
        });
    }

    // Inicializar listeners do Modal
    setupSettingsListeners();
});

// 2. Configurações Globais
let currentUserSettings = { notifyDailySummary: true, notifyStaleTasks: true, discordWebhook: '', notificationDays: '' };

window.openSettingsModal = async function() {
    // Fecha o menu se estiver aberto
    const dropdown = document.getElementById('user-menu-dropdown-v2');
    if(dropdown) {
        dropdown.classList.add('hidden');
        dropdown.style.display = 'none';
    }

    const modal = document.getElementById('settings-modal');
    if (!modal) {
        alert('ERRO: Modal não encontrado. Verifique se copiou o HTML para modals.php');
        return;
    }
    
    modal.classList.remove('hidden');
    try { await loadUserSettings(); } catch (e) { console.error(e); }
};

async function loadUserSettings() {
    try {
        const user = await DevDeck.fetchApi('/user/me');
        if (user) {
            setInputValue('settings-notify-daily', user.notifyDailySummary, true);
            setInputValue('settings-notify-stale', user.notifyStaleTasks, true);
            setInputValue('settings-discord-webhook', user.discordWebhook || '');
            
            // Lógica do Toggle do Discord
            const hasDiscord = !!(user.discordWebhook && user.discordWebhook.trim() !== '');
            setInputValue('settings-enable-discord', hasDiscord, true);
            toggleDiscordContainer(hasDiscord);

            // Dias
            const savedDays = (user.notificationDays || "1,2,3,4,5").split(',');
            document.querySelectorAll('.day-checkbox').forEach(chk => chk.checked = savedDays.includes(chk.value));
        }
    } catch (e) { console.error(e); }
}

function setupSettingsListeners() {
    // Listener do Botão Salvar
    const saveBtn = document.getElementById('save-settings-btn');
    if (saveBtn) {
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

        newSaveBtn.addEventListener('click', async () => {
            // Verifica se o toggle do Discord está ativo
            const enableDiscord = getInputValue('settings-enable-discord', true);
            
            const payload = {
                notifyDailySummary: getInputValue('settings-notify-daily', true),
                notifyStaleTasks: getInputValue('settings-notify-stale', true),
                // Se toggle desligado, envia string vazia para limpar no backend
                discordWebhook: enableDiscord ? getInputValue('settings-discord-webhook', false) : '',
                notificationDays: Array.from(document.querySelectorAll('.day-checkbox:checked')).map(c => c.value).join(',')
            };

            try {
                await DevDeck.fetchApi('/user/settings', { method: 'PATCH', body: JSON.stringify(payload) });
                DevDeck.showAlert('Configurações salvas com sucesso!', 'Sucesso');
                document.getElementById('settings-modal').classList.add('hidden');
            } catch (e) { 
                DevDeck.showAlert('Erro ao salvar: ' + e.message, 'Erro'); 
            }
        });
    }

    // Listener do Toggle do Discord (Show/Hide dinâmico)
    const discordToggle = document.getElementById('settings-enable-discord');
    if(discordToggle) {
        // Remove listener antigo clonando
        const newToggle = discordToggle.cloneNode(true);
        discordToggle.parentNode.replaceChild(newToggle, discordToggle);
        
        newToggle.addEventListener('change', (e) => {
            toggleDiscordContainer(e.target.checked);
        });
    }
}

function toggleDiscordContainer(show) {
    const container = document.getElementById('discord-input-container');
    if(container) {
        if(show) {
            container.classList.remove('hidden');
        } else {
            container.classList.add('hidden');
        }
    }
}

// Helpers
function setInputValue(id, val, chk=false) { 
    const el = document.getElementById(id); 
    if(el) { chk ? el.checked = val : el.value = val; } 
}
function getInputValue(id, chk=false) { 
    const el = document.getElementById(id); 
    if(!el) return null; 
    return chk ? el.checked : el.value; 
}