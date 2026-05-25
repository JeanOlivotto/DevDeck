<?php
require_once __DIR__ . '/../config/config.php';

// Redirecionar conforme tipo de usuário se já estiver logado
if (isLoggedIn()) {
    if (getIsDevTeam()) {
        redirect(url('views/dashboard.php'));
    } else {
        redirect(url('views/portal.php'));
    }
}

$pageTitle = 'BJGROUP Suporte - Cadastro';
?>
<?php include __DIR__ . '/../includes/header.php'; ?>

<?php include __DIR__ . '/../components/loading.php'; ?>

<div id="auth-section" class="w-full max-w-md mt-10">
    <div class="flex items-center justify-center mb-6">
        <img src="<?php echo url('img/logo-white.png'); ?>" alt="BJGROUP Suporte" class="h-14 sm:h-16"/>
    </div>
    <div id="signup-view" class="auth-container p-8 rounded-lg">
        <h2 class="text-2xl font-semibold mb-6 text-center text-white">Cadastro</h2>
        <form id="signup-form">
            <div class="mb-4">
                <label for="signup-company" class="block text-sm font-medium mb-1">Empresa <span class="text-white">*</span></label>
                <select id="signup-company" class="auth-input w-full p-2 rounded" required>
                    <option value="">Selecione sua empresa...</option>
                    <option value="Aplicari">Aplicari</option>
                    <option value="Previnity">Previnity</option>
                    <option value="TaxResearch">TaxResearch</option>
                </select>
            </div>
            <div class="mb-4">
                <label for="signup-name" class="block text-sm font-medium mb-1">Nome completo:</label>
                <input type="text" id="signup-name" class="auth-input w-full p-2 rounded" required>
            </div>
            <div class="mb-4">
                <label for="signup-email" class="block text-sm font-medium mb-1">Email corporativo:</label>
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
            <button type="submit" class="auth-button w-full py-2 px-4 rounded-lg">Cadastrar</button>
        </form>
        <p class="mt-6 text-center text-sm">
            Já tem uma conta? 
            <a href="<?php echo url('index.php'); ?>" class="link-style">Faça login</a>
        </p>
    </div>
</div>

<?php include __DIR__ . '/../components/modals.php'; ?>

<script src="<?php echo url('assets/js/auth.js'); ?>"></script>

<?php include __DIR__ . '/../includes/footer.php'; ?>
