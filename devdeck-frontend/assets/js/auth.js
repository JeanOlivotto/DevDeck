// Funções de autenticação
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginError = document.getElementById('login-error');
    const signupError = document.getElementById('signup-error');
    
    // Login
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            if (loginError) loginError.classList.add('hidden');
            
            try {
                const data = await DevDeck.fetchApi('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password })
                }, false);
                
                console.log('Login response:', data); // DEBUG
                
                if (data?.access_token) {
                    console.log('Token received, calling setAuthToken'); // DEBUG
                    DevDeck.setAuthToken(data.access_token);
                    console.log('Token set, localStorage:', localStorage.getItem('devdeck_auth_token')?.substring(0, 20)); // DEBUG
                    
                    if (data.user) {
                        console.log('Setting user data:', data.user.email); // DEBUG
                        DevDeck.setUserData(data.user.email, data.user.name);
                    }
                    
                    // Sincronizar session PHP com o token JWT
                    console.log('Syncing PHP session...'); // DEBUG
                    await fetch(BASE_PATH + '/api/set-session.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            token: data.access_token,
                            email: data.user?.email,
                            name: data.user?.name
                        })
                    }).catch(e => console.warn('Session sync warning:', e)); // DEBUG
                    
                    console.log('BASE_PATH value:', BASE_PATH); // DEBUG
                    console.log('Redirect URL:', BASE_PATH + '/views/dashboard.php'); // DEBUG
                    // Redirecionar para dashboard
                    window.location.href = BASE_PATH + '/views/dashboard.php';
                    console.log('Redirect triggered'); // DEBUG
                } else {
                    throw new Error('Token de autenticação não recebido');
                }
            } catch (error) {
                console.error('Erro no login:', error);
                if (loginError) {
                    loginError.textContent = error.message || 'Erro ao fazer login';
                    loginError.classList.remove('hidden');
                }
            }
        });
    }
    
    // Signup
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-confirm-password').value;
            
            if (signupError) signupError.classList.add('hidden');
            
            // Validar senhas
            if (password !== confirmPassword) {
                if (signupError) {
                    signupError.textContent = 'As senhas não coincidem';
                    signupError.classList.remove('hidden');
                }
                return;
            }
            
            if (password.length < 6) {
                if (signupError) {
                    signupError.textContent = 'A senha deve ter no mínimo 6 caracteres';
                    signupError.classList.remove('hidden');
                }
                return;
            }
            
            try {
                const data = await DevDeck.fetchApi('/auth/signup', {
                    method: 'POST',
                    body: JSON.stringify({ name, email, password })
                }, false);
                
                if (data?.access_token) {
                    DevDeck.setAuthToken(data.access_token);
                    
                    if (data.user) {
                        DevDeck.setUserData(data.user.email, data.user.name);
                    }
                    
                    // Sincronizar session PHP com o token JWT
                    await fetch(BASE_PATH + '/api/set-session.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            token: data.access_token,
                            email: data.user?.email,
                            name: data.user?.name
                        })
                    }).catch(e => console.warn('Session sync warning:', e));
                    
                    // Redirecionar para dashboard
                    window.location.href = BASE_PATH + '/views/dashboard.php';
                } else if (data?.message) {
                    // Sucesso, mas precisa fazer login
                    DevDeck.showAlert('Cadastro realizado com sucesso! Faça login para continuar.', 'Sucesso');
                    setTimeout(() => {
                        window.location.href = BASE_PATH + '/index.php';
                    }, 2000);
                }
            } catch (error) {
                console.error('Erro no cadastro:', error);
                if (signupError) {
                    signupError.textContent = error.message || 'Erro ao fazer cadastro';
                    signupError.classList.remove('hidden');
                }
            }
        });
    }
});
