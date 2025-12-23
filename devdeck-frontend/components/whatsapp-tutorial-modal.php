<div id="whatsapp-tutorial-modal" class="modal fixed inset-0 flex items-center justify-center z-50 hidden">
    <div class="modal-content p-6 rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h3 class="text-2xl font-semibold mb-4 text-cyan-300">📖 Tutorial: WhatsApp Meta Business API</h3>
        
        <div class="space-y-4 text-sm">
            <!-- Passo 1 -->
            <div class="p-4 bg-[#1e223b] rounded-lg border-l-4 border-cyan-400">
                <h4 class="font-semibold text-cyan-400 mb-2">1️⃣ Criar conta Meta for Developers</h4>
                <ol class="list-decimal list-inside space-y-1 text-gray-300">
                    <li>Acesse: <a href="https://developers.facebook.com" target="_blank" class="text-cyan-400 hover:underline">developers.facebook.com</a></li>
                    <li>Faça login com sua conta Facebook/Instagram</li>
                    <li>Clique em "Meus Apps" > "Criar App"</li>
                    <li>Escolha tipo: <span class="text-purple-400 font-semibold">"Business"</span></li>
                    <li>Nome do App: <span class="text-gray-400 italic">DevDeck WhatsApp</span></li>
                </ol>
            </div>

            <!-- Passo 2 -->
            <div class="p-4 bg-[#1e223b] rounded-lg border-l-4 border-green-400">
                <h4 class="font-semibold text-green-400 mb-2">2️⃣ Adicionar produto WhatsApp</h4>
                <ol class="list-decimal list-inside space-y-1 text-gray-300">
                    <li>No painel do app, encontre <span class="font-semibold">"WhatsApp"</span></li>
                    <li>Clique em <span class="text-green-400">"Configurar"</span></li>
                    <li>Selecione ou crie uma conta Business</li>
                    <li>Aceite os termos</li>
                </ol>
            </div>

            <!-- Passo 3 -->
            <div class="p-4 bg-[#1e223b] rounded-lg border-l-4 border-purple-400">
                <h4 class="font-semibold text-purple-400 mb-2">3️⃣ Obter credenciais</h4>
                <p class="text-gray-300 mb-2">Na página do WhatsApp > "API Setup":</p>
                <div class="space-y-2">
                    <div class="p-2 bg-[#23284a] rounded">
                        <p class="text-xs text-gray-400 mb-1"><strong class="text-cyan-400">Phone Number ID:</strong></p>
                        <p class="text-xs text-gray-300">Copie o número que aparece em "From"</p>
                        <p class="text-xs text-gray-500 italic">Exemplo: 109876543210</p>
                    </div>
                    <div class="p-2 bg-[#23284a] rounded">
                        <p class="text-xs text-gray-400 mb-1"><strong class="text-purple-400">Access Token:</strong></p>
                        <p class="text-xs text-gray-300">Clique em "Generate Token" ou use o temporário</p>
                        <p class="text-xs text-yellow-400">⚠️ Para permanente: Configurações > Básico > Gerar Token</p>
                    </div>
                </div>
            </div>

            <!-- Passo 4 -->
            <div class="p-4 bg-[#1e223b] rounded-lg border-l-4 border-blue-400">
                <h4 class="font-semibold text-blue-400 mb-2">4️⃣ Registrar número de teste</h4>
                <ol class="list-decimal list-inside space-y-1 text-gray-300">
                    <li>No painel WhatsApp > "API Setup"</li>
                    <li>Role até "To" (destinatário)</li>
                    <li>Clique em "Manage phone number list"</li>
                    <li>Adicione seu número: <span class="text-gray-400">+5519999998888</span></li>
                    <li>Você receberá um código via WhatsApp</li>
                    <li>Cole o código para verificar ✅</li>
                </ol>
            </div>

            <!-- Informações importantes -->
            <div class="p-4 bg-gradient-to-r from-cyan-900/30 to-purple-900/30 rounded-lg border border-cyan-500/30">
                <h4 class="font-semibold text-cyan-300 mb-2">💡 Informações Importantes</h4>
                <ul class="space-y-1 text-xs text-gray-300">
                    <li>✅ <strong>1000 conversas/mês GRÁTIS</strong> para sempre</li>
                    <li>✅ Limite do app: <strong>950 mensagens/mês</strong> (margem de segurança)</li>
                    <li>✅ Reset automático: <strong>todo dia 1º</strong> do mês</li>
                    <li>✅ Funciona na Vercel: <strong>API REST</strong>, sem WebSocket</li>
                    <li>⚠️ Para produção (qualquer número): fazer <strong>verificação de negócio</strong></li>
                    <li>📱 Números de teste: <strong>máximo 5 gratuitos</strong></li>
                </ul>
            </div>

            <!-- Links úteis -->
            <div class="p-3 bg-[#1e223b] rounded-lg">
                <h4 class="font-semibold text-gray-400 mb-2 text-xs">🔗 Links Úteis</h4>
                <div class="space-y-1 text-xs">
                    <a href="https://developers.facebook.com" target="_blank" class="block text-cyan-400 hover:underline">• Meta for Developers</a>
                    <a href="https://developers.facebook.com/docs/whatsapp/cloud-api" target="_blank" class="block text-cyan-400 hover:underline">• Documentação WhatsApp Cloud API</a>
                    <a href="https://business.facebook.com" target="_blank" class="block text-cyan-400 hover:underline">• Meta Business Manager</a>
                </div>
            </div>
        </div>
        
        <div class="flex justify-end mt-6">
            <button id="whatsapp-tutorial-close" class="modal-button text-white font-semibold py-2 px-6 rounded-lg">Entendi! 🚀</button>
        </div>
    </div>
</div>
