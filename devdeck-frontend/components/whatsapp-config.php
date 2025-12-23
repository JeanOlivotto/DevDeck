<div class="mt-4 p-3 bg-[#1e223b] rounded-lg border border-gray-700">
    <div class="flex items-center justify-between mb-2">
        <h5 class="text-sm font-semibold text-cyan-400">🔑 Configurar Meta API</h5>
        <button id="whatsapp-meta-tutorial-btn" class="text-xs text-purple-400 hover:text-purple-300 underline">📖 Tutorial</button>
    </div>
    
    <!-- Status e Contador -->
    <div id="whatsapp-meta-status" class="mb-3 p-2 bg-[#23284a] rounded text-xs">
        <div class="flex items-center justify-between mb-1">
            <span class="text-gray-400">Status:</span>
            <span id="whatsapp-meta-status-text" class="text-gray-300">Não configurado</span>
        </div>
        <div class="flex items-center justify-between">
            <span class="text-gray-400">Mensagens este mês:</span>
            <span id="whatsapp-meta-counter" class="text-cyan-400 font-semibold">0/950</span>
        </div>
        <!-- Barra de progresso -->
        <div class="mt-2 w-full bg-gray-700 rounded-full h-1.5">
            <div id="whatsapp-meta-progress-bar" class="bg-cyan-400 h-1.5 rounded-full" style="width: 0%"></div>
        </div>
    </div>

    <!-- Formulário de credenciais -->
    <div id="whatsapp-meta-form" class="space-y-2">
        <div>
            <label class="block text-xs text-gray-400 mb-1">Phone Number ID:</label>
            <input type="text" id="whatsapp-phone-number-id" placeholder="109876543210" class="modal-input w-full p-2 rounded text-xs">
        </div>
        <div>
            <label class="block text-xs text-gray-400 mb-1">Access Token:</label>
            <input type="password" id="whatsapp-access-token" placeholder="EAA..." class="modal-input w-full p-2 rounded text-xs">
        </div>
        <div class="flex gap-2">
            <button id="whatsapp-meta-save-btn" class="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 px-3 rounded-lg">💾 Salvar</button>
            <button id="whatsapp-meta-remove-btn" class="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 px-3 rounded-lg hidden">🗑️ Remover</button>
        </div>
    </div>

    <!-- Botão de teste -->
    <button id="whatsapp-meta-test-btn" class="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3 rounded-lg hidden">📱 Enviar Teste</button>
</div>
