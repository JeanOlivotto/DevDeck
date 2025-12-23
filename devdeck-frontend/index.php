<?php
require_once __DIR__ . '/config/config.php';

// Redirecionar para dashboard se já estiver logado
if (isLoggedIn()) {
    redirect(url('views/dashboard.php'));
}

$pageTitle = 'DevDeck - Login';
?>
<?php include __DIR__ . '/includes/header.php'; ?>

<?php include __DIR__ . '/components/loading.php'; ?>

<div id="auth-section" class="w-full max-w-md mt-10">
    <div class="flex items-center justify-center mb-6">
        <img src="<?php echo url('img/logo-DevDesck-removebg-preview.png'); ?>" alt="DevDeck Logo" class="w-12 h-12 sm:w-14 sm:h-14 mr-2 filter drop-shadow-[0_0_8px_rgba(162,89,255,0.7)]"/>
        <img src="<?php echo url('img/Nome-DevDesck-removebg-preview.png'); ?>" alt="DevDeck" class="h-10 sm:h-12"/>
    </div>
    <div id="login-view" class="auth-container p-8 rounded-lg">
        <h2 class="text-2xl font-semibold mb-6 text-center text-cyan-300">Login</h2>
        <form id="login-form">
            <div class="mb-4">
                <label for="login-email" class="block text-sm font-medium mb-1">Email:</label>
                <input type="email" id="login-email" class="auth-input w-full p-2 rounded" required>
            </div>
            <div class="mb-6">
                <label for="login-password" class="block text-sm font-medium mb-1">Senha:</label>
                <input type="password" id="login-password" class="auth-input w-full p-2 rounded" required>
            </div>
            <p id="login-error" class="text-red-400 text-sm mb-4 text-center hidden"></p>
            <button type="submit" class="auth-button w-full text-white font-semibold py-2 px-4 rounded-lg">Entrar</button>
        </form>
        <p class="mt-6 text-center text-sm">
            Não tem uma conta? 
            <a href="<?php echo url('views/signup.php'); ?>" class="link-style">Cadastre-se</a>
        </p>
    </div>
</div>

<script src="<?php echo url('assets/js/auth.js'); ?>"></script>

<?php include __DIR__ . '/includes/footer.php'; ?>
