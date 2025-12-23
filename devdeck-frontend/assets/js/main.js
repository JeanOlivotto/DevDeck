// Configurações globais
const TOKEN_KEY = 'devdeck_auth_token';
const USER_EMAIL_KEY = 'devdeck_user_email';
const USER_NAME_KEY = 'devdeck_user_name';

// Funções auxiliares
function getAuthToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function setAuthToken(token) {
    console.log('setAuthToken called with:', token?.substring(0, 20)); // DEBUG
    localStorage.setItem(TOKEN_KEY, token);
    console.log('Token saved to localStorage'); // DEBUG
}

function clearAuthData() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_EMAIL_KEY);
    localStorage.removeItem(USER_NAME_KEY);
}

function setUserData(email, name) {
    console.log('setUserData called:', email, name); // DEBUG
    localStorage.setItem(USER_EMAIL_KEY, email);
    localStorage.setItem(USER_NAME_KEY, name);
    console.log('User data saved'); // DEBUG
}

function getUserData() {
    return {
        email: localStorage.getItem(USER_EMAIL_KEY),
        name: localStorage.getItem(USER_NAME_KEY)
    };
}

// Funções de UI
function showLoading() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.classList.remove('hidden');
    }
}

function hideLoading() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.classList.add('hidden');
    }
}

function showAlert(message, title = 'Aviso') {
    const alertModal = document.getElementById('alert-modal');
    const alertModalTitle = document.getElementById('alert-modal-title');
    const alertModalMessage = document.getElementById('alert-modal-message');
    
    if (alertModal && alertModalTitle && alertModalMessage) {
        alertModalTitle.textContent = title;
        alertModalMessage.textContent = message;
        alertModal.classList.remove('hidden');
    } else {
        alert(title + ': ' + message);
    }
}

function showConfirm(message, title = 'Confirmar Ação') {
    const confirmModal = document.getElementById('confirm-modal');
    const confirmModalTitle = document.getElementById('confirm-modal-title');
    const confirmModalMessage = document.getElementById('confirm-modal-message');
    
    if (confirmModal && confirmModalTitle && confirmModalMessage) {
        confirmModalTitle.textContent = title;
        confirmModalMessage.textContent = message;
        confirmModal.classList.remove('hidden');
        
        return new Promise((resolve) => {
            const confirmBtn = document.getElementById('confirm-modal-confirm');
            const cancelBtn = document.getElementById('confirm-modal-cancel');
            
            const handleConfirm = () => {
                confirmModal.classList.add('hidden');
                confirmBtn.removeEventListener('click', handleConfirm);
                cancelBtn.removeEventListener('click', handleCancel);
                resolve(true);
            };
            
            const handleCancel = () => {
                confirmModal.classList.add('hidden');
                confirmBtn.removeEventListener('click', handleConfirm);
                cancelBtn.removeEventListener('click', handleCancel);
                resolve(false);
            };
            
            confirmBtn.addEventListener('click', handleConfirm);
            cancelBtn.addEventListener('click', handleCancel);
        });
    } else {
        return Promise.resolve(confirm(title + ': ' + message));
    }
}

// Função para fazer requisições à API
async function fetchApi(endpoint, options = {}, requireAuth = true) {
    showLoading();
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (requireAuth) {
        const token = getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });
        
        if (!response.ok) {
            if (response.status === 401 && requireAuth) {
                // Limpar sessão PHP também
                fetch(BASE_PATH + '/api/logout.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'action=logout'
                }).catch(() => {});
                
                clearAuthData();
                window.location.href = BASE_PATH + '/index.php';
                throw new Error('Sessão inválida. Faça login novamente.');
            }
            
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            let msg = 'Erro desconhecido';
            
            if (errorData && typeof errorData === 'object') {
                msg = Array.isArray(errorData.message) 
                    ? errorData.message.join(', ') 
                    : errorData.message || errorData.error || msg;
            } else if (typeof errorData === 'string') {
                msg = errorData;
            }
            
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
        hideLoading();
    }
}

// Exportar para uso global
window.DevDeck = {
    getAuthToken,
    setAuthToken,
    clearAuthData,
    setUserData,
    getUserData,
    showLoading,
    hideLoading,
    showAlert,
    showConfirm,
    fetchApi
};
