<!-- Task Modal -->
<div id="task-modal" class="modal fixed inset-0 flex items-center justify-center z-40 hidden">
    <div class="modal-content p-6 rounded-lg w-full max-w-md mx-4">
        <h3 id="modal-title" class="text-xl font-semibold mb-4 text-cyan-300">Nova Tarefa</h3>
        <form id="task-form">
            <input type="hidden" id="task-id">
            <div class="mb-4">
                <label for="task-title" class="block text-sm font-medium mb-1">Título:</label>
                <input type="text" id="task-title" name="title" class="modal-input w-full p-2 rounded" required maxlength="255">
            </div>
            <div class="mb-4">
                <label for="task-description" class="block text-sm font-medium mb-1">Descrição:</label>
                <textarea id="task-description" name="description" rows="3" class="modal-textarea w-full p-2 rounded" maxlength="1000"></textarea>
            </div>
            <div class="mb-6">
                <label for="task-status" class="block text-sm font-medium mb-1">Status:</label>
                <select id="task-status" name="status" class="modal-select w-full p-2 rounded">
                    <option value="TODO">To Do</option>
                    <option value="DOING">Doing</option>
                    <option value="DONE">Done</option>
                </select>
            </div>
            <div class="flex justify-end gap-3">
                <button type="button" id="modal-cancel" class="modal-close-button text-white font-semibold py-2 px-4 rounded-lg">Cancelar</button>
                <button type="submit" id="modal-save" class="modal-button text-white font-semibold py-2 px-4 rounded-lg">Salvar</button>
                <button type="button" id="modal-delete" class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg hidden">Excluir</button>
            </div>
        </form>
    </div>
</div>

<!-- Board Modal -->
<div id="board-modal" class="modal fixed inset-0 flex items-center justify-center z-40 hidden">
    <div class="modal-content p-6 rounded-lg w-full max-w-sm mx-4">
        <h3 id="board-modal-title" class="text-xl font-semibold mb-4 text-cyan-300">Novo Quadro</h3>
        <form id="board-form">
            <input type="hidden" id="board-id">
            <div class="mb-6">
                <label for="board-name" class="block text-sm font-medium mb-1">Nome:</label>
                <input type="text" id="board-name" name="name" class="modal-input w-full p-2 rounded" required maxlength="100">
                <p id="board-error" class="text-red-400 text-sm mt-1 hidden"></p>
            </div>
            <div class="flex justify-end gap-3">
                <button type="button" id="board-modal-cancel" class="modal-close-button text-white font-semibold py-2 px-4 rounded-lg">Cancelar</button>
                <button type="submit" id="board-modal-save" class="modal-button text-white font-semibold py-2 px-4 rounded-lg">Salvar</button>
            </div>
        </form>
    </div>
</div>

<!-- Alert Modal -->
<div id="alert-modal" class="modal fixed inset-0 flex items-center justify-center z-50 hidden">
    <div class="modal-content p-6 rounded-lg w-full max-w-sm mx-4">
        <h3 id="alert-modal-title" class="text-xl font-semibold mb-4 text-cyan-300">Aviso</h3>
        <p id="alert-modal-message" class="text-gray-300 mb-6">Mensagem.</p>
        <div class="flex justify-end">
            <button id="alert-modal-ok" class="modal-button text-white font-semibold py-2 px-4 rounded-lg">OK</button>
        </div>
    </div>
</div>

<!-- Confirm Modal -->
<div id="confirm-modal" class="modal fixed inset-0 flex items-center justify-center z-50 hidden">
    <div class="modal-content p-6 rounded-lg w-full max-w-sm mx-4">
        <h3 id="confirm-modal-title" class="text-xl font-semibold mb-4 text-red-400">Confirmar</h3>
        <p id="confirm-modal-message" class="text-gray-300 mb-6">Mensagem.</p>
        <div class="flex justify-end gap-3">
            <button id="confirm-modal-cancel" class="modal-close-button text-white font-semibold py-2 px-4 rounded-lg">Cancelar</button>
            <button id="confirm-modal-confirm" class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg">Confirmar</button>
        </div>
    </div>
</div>

<!-- Info Modal -->
<div id="info-modal" class="modal fixed inset-0 flex items-center justify-center z-50 hidden">
    <div class="modal-content p-6 rounded-lg w-full max-w-md mx-4">
        <h3 id="info-modal-title" class="text-xl font-semibold mb-4 text-cyan-300">Informação</h3>
        <p id="info-modal-description" class="text-gray-300 mb-4">Descrição.</p>
        <p class="text-sm text-gray-400 mb-6">Enviado para: <span id="info-modal-email" class="font-medium text-gray-300"></span></p>
        <div class="flex justify-end">
            <button id="info-modal-close" class="modal-close-button text-white font-semibold py-2 px-4 rounded-lg">Fechar</button>
        </div>
    </div>
</div>

<!-- WhatsApp Tutorial Modal -->
<?php include __DIR__ . '/whatsapp-tutorial-modal.php'; ?>

<!-- Group Modal -->
<div id="group-modal" class="modal fixed inset-0 flex items-center justify-center z-40 hidden">
    <div class="modal-content p-6 rounded-lg w-full max-w-md mx-4">
        <h3 id="group-modal-title" class="text-xl font-semibold mb-4 text-cyan-300">Novo Grupo</h3>
        <form id="group-form">
            <div class="mb-4">
                <label for="group-name" class="block text-sm font-medium mb-1">Nome:</label>
                <input type="text" id="group-name" name="name" class="modal-input w-full p-2 rounded" required maxlength="100">
            </div>
            <div class="mb-6">
                <label for="group-description" class="block text-sm font-medium mb-1">Descrição:</label>
                <textarea id="group-description" name="description" rows="3" class="modal-textarea w-full p-2 rounded" maxlength="500"></textarea>
            </div>
            <div class="flex justify-end gap-3">
                <button type="button" id="group-modal-cancel" class="modal-close-button text-white font-semibold py-2 px-4 rounded-lg">Cancelar</button>
                <button type="submit" class="modal-button text-white font-semibold py-2 px-4 rounded-lg">Salvar</button>
                <button type="button" id="group-modal-delete" class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg hidden">Deletar</button>
            </div>
        </form>
    </div>
</div>

<!-- Invite Member Modal -->
<div id="invite-member-modal" class="modal fixed inset-0 flex items-center justify-center z-40 hidden">
    <div class="modal-content p-6 rounded-lg w-full max-w-md mx-4">
        <h3 class="text-xl font-semibold mb-4 text-cyan-300">Convidar Membro</h3>
        <form id="invite-member-form">
            <input type="hidden" id="invite-group-id">
            <div class="mb-4">
                <label for="invite-email" class="block text-sm font-medium mb-1">Email:</label>
                <input type="email" id="invite-email" name="email" class="modal-input w-full p-2 rounded" required>
            </div>
            <div class="mb-6">
                <label for="invite-role" class="block text-sm font-medium mb-1">Função:</label>
                <select id="invite-role" name="role" class="modal-select w-full p-2 rounded">
                    <option value="member">Membro</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
            <div class="flex justify-end gap-3">
                <button type="button" id="invite-member-modal-cancel" class="modal-close-button text-white font-semibold py-2 px-4 rounded-lg">Cancelar</button>
                <button type="submit" class="modal-button text-white font-semibold py-2 px-4 rounded-lg">Convidar</button>
            </div>
        </form>
    </div>
</div>

<!-- Group Members Modal -->
<div id="group-members-modal" class="modal fixed inset-0 flex items-center justify-center z-40 hidden">
    <div class="modal-content p-6 rounded-lg w-full max-w-md mx-4 max-h-[80vh] overflow-auto">
        <h3 id="group-members-modal-title" class="text-xl font-semibold mb-4 text-cyan-300">Membros do Grupo</h3>
        <div id="group-members-container" class="space-y-2 mb-6">
            <p class="text-gray-400 text-sm">Carregando membros...</p>
        </div>
        <div class="flex justify-end gap-3">
            <button type="button" id="group-members-modal-close" class="modal-close-button text-white font-semibold py-2 px-4 rounded-lg">Fechar</button>
        </div>
    </div>
</div>

<div id="settings-modal" class="modal fixed inset-0 flex items-center justify-center z-50 hidden">
    <div class="modal-content p-6 rounded-lg w-full max-w-md mx-4 bg-[#1a1f3a] border border-purple-900/50 shadow-2xl">
        <h3 class="text-xl font-semibold mb-6 text-cyan-300 border-b border-gray-700 pb-2">Configurações</h3>

        <div class="space-y-6">
            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <div>
                        <span class="text-white font-medium">Resumo Diário (Email)</span>
                        <p class="text-gray-500 text-xs">Resumo das tarefas pendentes toda manhã.</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="settings-notify-daily" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                    </label>
                </div>

                <div class="flex items-center justify-between">
                    <div>
                        <span class="text-white font-medium">Alertas de Estagnação (Email)</span>
                        <p class="text-gray-500 text-xs">Aviso de tarefas paradas há muito tempo.</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="settings-notify-stale" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                    </label>
                </div>
            </div>

            <div class="mt-4 mb-4">
                <span class="text-white font-medium block mb-2">Dias de Notificação</span>
                <div class="flex justify-between gap-1" id="settings-days-container">
                    <label class="cursor-pointer">
                        <input type="checkbox" value="0" class="peer sr-only day-checkbox">
                        <div class="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 text-xs peer-checked:bg-cyan-600 peer-checked:text-white peer-checked:border-cyan-500 transition-all hover:border-cyan-400">
                            D
                        </div>
                    </label>
                    <label class="cursor-pointer">
                        <input type="checkbox" value="1" class="peer sr-only day-checkbox">
                        <div class="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 text-xs peer-checked:bg-cyan-600 peer-checked:text-white peer-checked:border-cyan-500 transition-all hover:border-cyan-400">
                            S
                        </div>
                    </label>
                    <label class="cursor-pointer">
                        <input type="checkbox" value="2" class="peer sr-only day-checkbox">
                        <div class="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 text-xs peer-checked:bg-cyan-600 peer-checked:text-white peer-checked:border-cyan-500 transition-all hover:border-cyan-400">
                            T
                        </div>
                    </label>
                    <label class="cursor-pointer">
                        <input type="checkbox" value="3" class="peer sr-only day-checkbox">
                        <div class="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 text-xs peer-checked:bg-cyan-600 peer-checked:text-white peer-checked:border-cyan-500 transition-all hover:border-cyan-400">
                            Q
                        </div>
                    </label>
                    <label class="cursor-pointer">
                        <input type="checkbox" value="4" class="peer sr-only day-checkbox">
                        <div class="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 text-xs peer-checked:bg-cyan-600 peer-checked:text-white peer-checked:border-cyan-500 transition-all hover:border-cyan-400">
                            Q
                        </div>
                    </label>
                    <label class="cursor-pointer">
                        <input type="checkbox" value="5" class="peer sr-only day-checkbox">
                        <div class="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 text-xs peer-checked:bg-cyan-600 peer-checked:text-white peer-checked:border-cyan-500 transition-all hover:border-cyan-400">
                            S
                        </div>
                    </label>
                    <label class="cursor-pointer">
                        <input type="checkbox" value="6" class="peer sr-only day-checkbox">
                        <div class="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 text-xs peer-checked:bg-cyan-600 peer-checked:text-white peer-checked:border-cyan-500 transition-all hover:border-cyan-400">
                            S
                        </div>
                    </label>
                </div>
                <p class="text-gray-500 text-xs mt-2">Escolha em quais dias receber alertas (Email e Discord).</p>
            </div>

            <div class="border-t border-gray-700 pt-4">
                <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.086 2.176 2.419 0 1.334-.956 2.419-2.176 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.176 2.419 0 1.334-.946 2.419-2.176 2.419z" />
                    </svg>
                    Integração Discord
                </h3>

                <div class="mb-4">
                    <label for="settings-discord-webhook" class="block text-sm font-medium text-gray-300 mb-1 flex justify-between">
                        Webhook URL
                        <a href="https://support.discord.com/hc/pt-br/articles/228383668-Usando-Webhooks" target="_blank" class="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1 cursor-pointer" title="Como criar um Webhook?">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Ajuda
                        </a>
                    </label>
                    <input type="url" id="settings-discord-webhook" placeholder="https://discord.com/api/webhooks/..."
                        class="w-full bg-[#23284a] text-white border border-gray-600 rounded p-2 focus:border-cyan-400 focus:outline-none text-sm placeholder-gray-500">
                    <p class="text-gray-500 text-xs mt-1">Cole a URL do Webhook do canal onde deseja receber alertas.</p>
                </div>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button type="button" onclick="document.getElementById('settings-modal').classList.add('hidden')" class="px-4 py-2 text-gray-300 hover:text-white transition-colors">Cancelar</button>
                <button type="button" id="save-settings-btn" class="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-lg shadow-cyan-500/20">Salvar Alterações</button>
            </div>
        </div>
    </div>
</div>

<!-- SVG Icons -->
<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
    <symbol id="icon-pencil" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" />
    </symbol>
    <symbol id="icon-trash" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
    </symbol>
</svg>