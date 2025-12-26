<?php
require_once __DIR__ . '/config/config.php';
$token = $_GET['token'] ?? '';
?>
<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Abrir Chamado - DevDeck</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #0f111a;
            color: #e2e8f0;
        }
    </style>
</head>

<body class="flex items-center justify-center min-h-screen p-4">

    <?php if (!$token): ?>
        <div class="text-center">
            <h1 class="text-2xl font-bold text-red-500">Link Inválido</h1>
            <p class="text-gray-400">O link que você acessou está incompleto.</p>
        </div>
    <?php else: ?>

        <div class="w-full max-w-md bg-[#1a1f3a] rounded-xl shadow-2xl border border-gray-700 p-8">
            <div class="text-center mb-8">
                <div class="w-16 h-16 bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
                    <span class="text-3xl">🎫</span>
                </div>
                <h1 class="text-2xl font-bold text-white mb-2">Abrir Chamado</h1>
                <p class="text-sm text-gray-400" id="board-info">Carregando informações...</p>
            </div>

            <form id="ticket-form" class="space-y-4 hidden">
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">Seu Nome</label>
                    <input type="text" name="requesterName" required class="w-full bg-[#0f111a] border border-gray-600 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none transition-colors">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">Seu Email</label>
                    <input type="email" name="requesterEmail" required class="w-full bg-[#0f111a] border border-gray-600 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none transition-colors">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">Prioridade</label>
                    <select name="priority" class="w-full bg-[#0f111a] border border-gray-600 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none">
                        <option value="LOW">Normal</option>
                        <option value="MEDIUM" selected>Média</option>
                        <option value="HIGH">Alta</option>
                        <option value="URGENT">Urgente</option>
                    </select>
                </div>

                <div class="pt-2">
                    <label class="block text-sm font-medium text-gray-300 mb-1">Assunto</label>
                    <input type="text" name="title" required class="w-full bg-[#0f111a] border border-gray-600 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">Descrição do Problema</label>
                    <textarea name="description" rows="4" required class="w-full bg-[#0f111a] border border-gray-600 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none resize-none"></textarea>
                </div>

                <button type="submit" class="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg shadow-cyan-500/20 mt-4">
                    Enviar Solicitação
                </button>
            </form>

            <div id="success-message" class="hidden text-center py-8">
                <div class="text-green-400 text-5xl mb-4">✓</div>
                <h3 class="text-xl font-bold text-white mb-2">Solicitação Enviada!</h3>
                <p class="text-gray-400">Recebemos seu ticket. Entraremos em contato em breve.</p>
                <button onclick="window.location.reload()" class="mt-6 text-cyan-400 hover:text-cyan-300 text-sm font-medium">Enviar outro</button>
            </div>

            <div id="error-message" class="hidden text-center py-8">
                <div class="text-red-400 text-5xl mb-4">✕</div>
                <h3 class="text-xl font-bold text-white mb-2">Erro</h3>
                <p class="text-gray-400" id="error-text">Link inválido ou expirado.</p>
            </div>
        </div>

        <script>
            const API_URL = '<?php echo API_BASE_URL; ?>';
            const TOKEN = '<?php echo $token; ?>';

            // 1. Carregar Info do Board
            fetch(`${API_URL}/boards/public/${TOKEN}`)
                .then(res => {
                    if (!res.ok) throw new Error('Board não encontrado');
                    return res.json();
                })
                .then(data => {
                    document.getElementById('board-info').textContent = `Enviando para: ${data.name} (${data.ownerName || 'DevDeck'})`;
                    document.getElementById('ticket-form').classList.remove('hidden');
                })
                .catch(err => {
                    document.getElementById('board-info').classList.add('hidden');
                    document.getElementById('error-message').classList.remove('hidden');
                });

            // 2. Enviar Formulário
            document.getElementById('ticket-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = e.target.querySelector('button');
                const originalText = btn.textContent;
                btn.disabled = true;
                btn.textContent = 'Enviando...';

                const formData = new FormData(e.target);
                const payload = Object.fromEntries(formData.entries());

                try {
                    const res = await fetch(`${API_URL}/tasks/ticket/${TOKEN}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });

                    if (!res.ok) throw new Error('Falha ao enviar');

                    document.getElementById('ticket-form').classList.add('hidden');
                    document.getElementById('success-message').classList.remove('hidden');
                } catch (error) {
                    alert('Erro ao enviar ticket. Tente novamente.');
                    btn.disabled = false;
                    btn.textContent = originalText;
                }
            });
        </script>
    <?php endif; ?>
</body>

</html>