<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevDeck - Teste de Sistema</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white p-8">
    <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold mb-8 text-cyan-400">🔧 DevDeck - Teste de Sistema</h1>
        
        <div class="space-y-4">
            <!-- PHP Version -->
            <div class="bg-gray-800 p-4 rounded-lg">
                <h2 class="text-xl font-semibold mb-2">PHP Version</h2>
                <p class="text-green-400 font-mono"><?php echo phpversion(); ?></p>
            </div>
            
            <!-- Session Test -->
            <div class="bg-gray-800 p-4 rounded-lg">
                <h2 class="text-xl font-semibold mb-2">Sessão PHP</h2>
                <?php
                session_start();
                $_SESSION['test'] = 'Sessão funcionando!';
                echo '<p class="text-green-400">✅ ' . $_SESSION['test'] . '</p>';
                ?>
            </div>
            
            <!-- File Structure -->
            <div class="bg-gray-800 p-4 rounded-lg">
                <h2 class="text-xl font-semibold mb-2">Estrutura de Arquivos</h2>
                <?php
                $requiredFiles = [
                    'config/config.php',
                    'includes/header.php',
                    'includes/footer.php',
                    'views/dashboard.php',
                    'views/signup.php',
                    'components/navbar.php',
                    'components/modals.php',
                    'assets/css/style.css',
                    'assets/js/main.js',
                    'assets/js/auth.js',
                    'assets/js/kanban.js',
                    'index.php'
                ];
                
                $allGood = true;
                foreach ($requiredFiles as $file) {
                    $exists = file_exists(__DIR__ . '/' . $file);
                    $color = $exists ? 'text-green-400' : 'text-red-400';
                    $icon = $exists ? '✅' : '❌';
                    echo "<p class='$color'>$icon $file</p>";
                    if (!$exists) $allGood = false;
                }
                ?>
            </div>
            
            <!-- Configuration -->
            <div class="bg-gray-800 p-4 rounded-lg">
                <h2 class="text-xl font-semibold mb-2">Configurações</h2>
                <?php
                require_once __DIR__ . '/config/config.php';
                echo '<p class="text-gray-300">APP_NAME: <span class="text-cyan-400">' . APP_NAME . '</span></p>';
                echo '<p class="text-gray-300">API_BASE_URL: <span class="text-cyan-400">' . API_BASE_URL . '</span></p>';
                echo '<p class="text-gray-300">Environment: <span class="text-cyan-400">' . (IS_LOCAL ? 'LOCAL' : 'PRODUCTION') . '</span></p>';
                ?>
            </div>
            
            <!-- Extensions -->
            <div class="bg-gray-800 p-4 rounded-lg">
                <h2 class="text-xl font-semibold mb-2">Extensões PHP</h2>
                <?php
                $requiredExtensions = ['session', 'json', 'curl', 'openssl'];
                foreach ($requiredExtensions as $ext) {
                    $loaded = extension_loaded($ext);
                    $color = $loaded ? 'text-green-400' : 'text-red-400';
                    $icon = $loaded ? '✅' : '❌';
                    echo "<p class='$color'>$icon $ext</p>";
                }
                ?>
            </div>
            
            <!-- API Connection Test -->
            <div class="bg-gray-800 p-4 rounded-lg">
                <h2 class="text-xl font-semibold mb-2">Teste de Conexão com API</h2>
                <button onclick="testApiConnection()" class="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded">
                    Testar Conexão
                </button>
                <p id="api-result" class="mt-2"></p>
            </div>
            
            <!-- Summary -->
            <div class="bg-gray-800 p-4 rounded-lg border-2 <?php echo $allGood ? 'border-green-500' : 'border-red-500'; ?>">
                <h2 class="text-xl font-semibold mb-2">Resumo</h2>
                <?php if ($allGood): ?>
                    <p class="text-green-400 text-lg">✅ Todos os arquivos estão presentes!</p>
                    <p class="text-gray-300 mt-2">Sistema pronto para uso. Acesse <a href="index.php" class="text-cyan-400 underline">index.php</a> para começar.</p>
                <?php else: ?>
                    <p class="text-red-400 text-lg">❌ Alguns arquivos estão faltando!</p>
                    <p class="text-gray-300 mt-2">Verifique a estrutura de arquivos acima.</p>
                <?php endif; ?>
            </div>
        </div>
        
        <div class="mt-8 text-center">
            <a href="index.php" class="inline-block bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-6 rounded-lg">
                Ir para Login
            </a>
        </div>
    </div>
    
    <script>
        const API_BASE_URL = '<?php echo API_BASE_URL; ?>';
        
        async function testApiConnection() {
            const resultEl = document.getElementById('api-result');
            resultEl.textContent = 'Testando...';
            resultEl.className = 'mt-2 text-yellow-400';
            
            try {
                const response = await fetch(API_BASE_URL + '/health', {
                    method: 'GET'
                });
                
                if (response.ok) {
                    resultEl.textContent = '✅ API está respondendo!';
                    resultEl.className = 'mt-2 text-green-400';
                } else {
                    resultEl.textContent = '⚠️ API respondeu com status: ' + response.status;
                    resultEl.className = 'mt-2 text-yellow-400';
                }
            } catch (error) {
                resultEl.textContent = '❌ Erro ao conectar: ' + error.message;
                resultEl.className = 'mt-2 text-red-400';
            }
        }
    </script>
</body>
</html>
