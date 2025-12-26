<div id="task-modal" class="modal fixed inset-0 flex items-center justify-center z-40 hidden">
    <div class="modal-content p-6 rounded-lg w-full max-w-lg mx-4 bg-[#1a1f3a] border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 id="modal-title" class="text-xl font-semibold mb-4 text-cyan-300">Nova Tarefa</h3>
        <form id="task-form">
            <input type="hidden" id="task-id">

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div class="md:col-span-2">
                    <label for="task-title" class="block text-xs font-medium text-gray-400 mb-1">Título</label>
                    <input type="text" id="task-title" name="title" class="w-full bg-[#0f111a] border border-gray-600 rounded p-2 text-white focus:border-cyan-400 focus:outline-none" required maxlength="255">
                </div>
                <div>
                    <label for="task-status" class="block text-xs font-medium text-gray-400 mb-1">Status</label>
                    <select id="task-status" name="status" class="w-full bg-[#0f111a] border border-gray-600 rounded p-2 text-white focus:border-cyan-400 focus:outline-none">
                        <option value="TODO">A Fazer</option>
                        <option value="DOING">Em Progresso</option>
                        <option value="DONE">Concluído</option>
                    </select>
                </div>
            </div>

            <div class="mb-4">
                <label for="task-description" class="block text-xs font-medium text-gray-400 mb-1">Descrição</label>
                <textarea id="task-description" name="description" rows="3" class="w-full bg-[#0f111a] border border-gray-600 rounded p-2 text-white focus:border-cyan-400 focus:outline-none resize-none" maxlength="1000"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label for="task-priority" class="block text-xs font-medium text-gray-400 mb-1">Prioridade</label>
                    <select id="task-priority" name="priority" class="w-full bg-[#0f111a] border border-gray-600 rounded p-2 text-white focus:border-cyan-400 focus:outline-none">
                        <option value="LOW">🟢 Baixa</option>
                        <option value="MEDIUM" selected>🟡 Média</option>
                        <option value="HIGH">🟠 Alta</option>
                        <option value="URGENT">🔴 Urgente</option>
                    </select>
                </div>
                <div>
                    <label for="task-duedate" class="block text-xs font-medium text-gray-400 mb-1">Prazo de Entrega</label>
                    <input type="datetime-local" id="task-duedate" name="dueDate" class="w-full bg-[#0f111a] border border-gray-600 rounded p-2 text-white focus:border-cyan-400 focus:outline-none [color-scheme:dark]">
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label for="task-time" class="block text-xs font-medium text-gray-400 mb-1">Tempo Estimado (min)</label>
                    <input type="number" id="task-time" name="estimatedTime" placeholder="Ex: 60" class="w-full bg-[#0f111a] border border-gray-600 rounded p-2 text-white focus:border-cyan-400 focus:outline-none">
                </div>
                <div>
                    <label for="task-tags" class="block text-xs font-medium text-gray-400 mb-1">Tags (separadas por vírgula)</label>
                    <input type="text" id="task-tags" name="tags" placeholder="bug, front, urgente" class="w-full bg-[#0f111a] border border-gray-600 rounded p-2 text-white focus:border-cyan-400 focus:outline-none">
                </div>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button type="button" id="modal-cancel" class="px-4 py-2 text-gray-300 hover:text-white transition-colors">Cancelar</button>
                <button type="button" id="modal-delete" class="bg-red-900/50 hover:bg-red-700 text-red-200 py-2 px-4 rounded border border-red-800 hidden transition-colors">Excluir</button>
                <button type="submit" id="modal-save" class="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 px-6 rounded shadow-lg shadow-cyan-500/20 transition-colors">Salvar Tarefa</button>
            </div>
        </form>
    </div>
</div>

<div id="board-modal" class="modal fixed inset-0 flex items-center justify-center z-40 hidden">
    <div class="modal-content p-6 rounded-lg w-full max-w-md mx-4 bg-[#1a1f3a] border border-gray-700 shadow-2xl">
        <h3 id="board-modal-title" class="text-xl font-semibold mb-4 text-cyan-300">Editar Quadro</h3>
        <form id="board-form">
            <input type="hidden" id="board-id">
            <div class="mb-6">
                <label for="board-name" class="block text-sm font-medium text-gray-400 mb-1">Nome do Quadro:</label>
                <input type="text" id="board-name" name="name" class="w-full bg-[#0f111a] border border-gray-600 rounded p-2 text-white focus:border-cyan-400 focus:outline-none" required maxlength="100">
                <p id="board-error" class="text-red-400 text-sm mt-1 hidden"></p>
            </div>

            <div id="board-public-section" class="mb-6 p-4 bg-[#0f111a] rounded border border-gray-700 hidden">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-sm font-medium text-white flex items-center gap-2">
                        <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                        </svg>
                        Receber Tickets Públicos
                    </span>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="board-is-public" class="sr-only peer">
                        <div class="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                    </label>
                </div>

                <div id="public-link-container" class="hidden">
                    <label class="block text-xs text-gray-500 mb-1">Link para clientes:</label>
                    <div class="flex gap-2">
                        <input type="text" id="board-public-link" readonly class="w-full bg-[#1a1f3a] text-gray-300 text-xs border border-gray-600 rounded p-2 focus:outline-none select-all">
                        <button type="button" id="copy-link-btn" class="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded border border-gray-600" title="Copiar Link">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                            </svg>
                        </button>
                    </div>
                    <p class="text-[10px] text-gray-500 mt-1">Envie este link para quem precisa abrir chamados neste quadro.</p>
                </div>
            </div>

            <div class="flex justify-end gap-3">
                <button type="button" id="board-modal-cancel" class="px-4 py-2 text-gray-300 hover:text-white transition-colors">Cancelar</button>
                <button type="submit" id="board-modal-save" class="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 px-6 rounded transition-colors shadow-lg shadow-cyan-500/20">Salvar</button>
            </div>
        </form>
    </div>
</div>