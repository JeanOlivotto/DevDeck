<?php
require_once __DIR__ . '/../config/config.php';

// Redirecionar para login se não estiver autenticado
if (!isLoggedIn()) {
    redirect('/index.php');
}

$pageTitle = 'DevDeck - Cadastro';
?>
<?php include __DIR__ . '/../includes/header.php'; ?>

<?php include __DIR__ . '/../components/loading.php'; ?>

<div id="auth-section" class="w-full max-w-md mt-10">
    <div id="signup-view" class="auth-container p-8 rounded-lg">
        <h2 class="text-2xl font-semibold mb-6 text-center text-cyan-300">Cadastro</h2>
        <form id="signup-form">
            <div class="mb-4">
                <label for="signup-name" class="block text-sm font-medium mb-1">Nome:</label>
                <input type="text" id="signup-name" class="auth-input w-full p-2 rounded" required>
            </div>
            <div class="mb-4">
                <label for="signup-email" class="block text-sm font-medium mb-1">Email:</label>
                <input type="email" id="signup-email" class="auth-input w-full p-2 rounded" required>
            </div>
            <div class="mb-4">
                <label for="signup-password" class="block text-sm font-medium mb-1">Senha:</label>
                <input type="password" id="signup-password" class="auth-input w-full p-2 rounded" required minlength="6">
                <small class="text-gray-400">Mínimo 6 caracteres.</small>
            </div>
            <div class="mb-6">
                <label for="signup-confirm-password" class="block text-sm font-medium mb-1">Confirmar Senha:</label>
                <input type="password" id="signup-confirm-password" class="auth-input w-full p-2 rounded" required minlength="6">
            </div>
            <p id="signup-error" class="text-red-400 text-sm mb-4 text-center hidden"></p>
            <button type="submit" class="auth-button w-full text-white font-semibold py-2 px-4 rounded-lg">Cadastrar</button>
        </form>
        <p class="mt-6 text-center text-sm">
            Já tem uma conta? 
            <a href="<?php echo url('index.php'); ?>" class="link-style">Faça login</a>
        </p>
    </div>
</div>

<script src="<?php echo url('assets/js/auth.js'); ?>"></script>

<?php include __DIR__ . '/../includes/footer.php'; ?>
