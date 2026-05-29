<div id="task-modal" class="modal fixed inset-0 flex items-center justify-center z-40 hidden">
    <div class="modal-backdrop absolute inset-0 bg-black/60"></div>
    <div class="modal-content relative p-6 rounded-xl w-full max-w-lg mx-4 bg-[#141414] border border-[#2a2a2a] shadow-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
            <h3 id="modal-title" class="text-xl font-semibold text-white">Nova Tarefa</h3>
            <span id="modal-category-badge" class="hidden text-xs font-medium px-2.5 py-1 rounded-full bg-[#2a2a2a] border border-[#404040] text-[#cccccc]"></span>
        </div>

        <!-- Abas internas do modal -->
        <div class="flex gap-0 mb-5 border-b border-[#2a2a2a]">
            <button type="button" id="modal-tab-principal" class="modal-inner-tab modal-inner-tab-active px-4 py-2 text-sm font-medium">Principal</button>
            <button type="button" id="modal-tab-detalhes" class="modal-inner-tab px-4 py-2 text-sm font-medium">Detalhes</button>
            <button type="button" id="modal-tab-atribuicao" class="modal-inner-tab px-4 py-2 text-sm font-medium">Atribuição</button>
            <button type="button" id="modal-tab-mensagens" class="modal-inner-tab px-4 py-2 text-sm font-medium hidden">
                Mensagens
                <span id="modal-comments-badge" class="ml-1.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-[#2a2a2a] text-[10px] text-[#888888] hidden"></span>
            </button>
        </div>

        <form id="task-form">
            <input type="hidden" id="task-id">

            <!-- ── ABA PRINCIPAL ── -->
            <div id="modal-panel-principal">

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div class="md:col-span-2">
                        <label for="task-title" class="block text-xs font-medium text-[#888888] mb-1">Título</label>
                        <input type="text" id="task-title" name="title" class="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded p-2 text-white focus:border-white focus:outline-none" required maxlength="255">
                    </div>
                    <div>
                        <label for="task-status" class="block text-xs font-medium text-[#888888] mb-1">Status</label>
                        <select id="task-status" name="status" class="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded p-2 text-white focus:border-white focus:outline-none">
                            <option value="TODO">A Fazer</option>
                            <option value="DOING">Em Progresso</option>
                            <option value="DONE">Concluído</option>
                        </select>
                    </div>
                </div>

                <!-- Aviso: tarefa pessoal só visível para o criador -->
                <div id="personal-task-warning" class="hidden mb-4 flex items-start gap-2.5 bg-amber-950/40 border border-amber-800/40 rounded-lg px-3.5 py-3">
                    <svg class="w-4 h-4 text-amber-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    </svg>
                    <p class="text-xs text-amber-300 leading-relaxed">
                        Esta tarefa ficará visível <strong>somente para você</strong> no seu Kanban pessoal. Tickets enviados pelo portal de suporte vão automaticamente para o Kanban Coletivo.
                    </p>
                </div>

                <div class="mb-4">
                    <label for="task-description" class="block text-xs font-medium text-[#888888] mb-1">Descrição</label>
                    <textarea id="task-description" name="description" rows="5" class="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded p-2 text-white focus:border-white focus:outline-none resize-none" maxlength="2000"></textarea>
                </div>

                <!-- Subtasks — apenas para DEV -->
                <div id="subtasks-section" class="mb-4 hidden">
                    <div class="flex items-center justify-between mb-2">
                        <label class="text-xs font-medium text-[#888888] uppercase tracking-wider">Subtasks</label>
                        <button type="button" id="add-subtask-btn" class="text-xs text-[#888888] hover:text-white flex items-center gap-1 transition-colors">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                            Adicionar
                        </button>
                    </div>
                    <div id="subtasks-list" class="space-y-1.5"></div>
                    <div id="subtask-input-row" class="hidden mt-2 flex gap-2">
                        <input type="text" id="new-subtask-input" placeholder="Descrição da subtask..." maxlength="200"
                            class="flex-1 bg-[#1c1c1c] border border-[#2a2a2a] rounded p-2 text-sm text-white placeholder-[#555] focus:border-white focus:outline-none">
                        <button type="button" id="confirm-subtask-btn" class="px-3 py-1.5 bg-white text-black text-xs font-semibold rounded hover:bg-[#e0e0e0] transition-colors">OK</button>
                        <button type="button" id="cancel-subtask-btn" class="px-3 py-1.5 text-[#888] hover:text-white text-xs transition-colors">✕</button>
                    </div>
                </div>

            </div><!-- /modal-panel-principal -->

            <!-- ── ABA DETALHES ── -->
            <div id="modal-panel-detalhes" class="hidden">

                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label for="task-priority" class="block text-xs font-medium text-[#888888] mb-1">Prioridade</label>
                        <select id="task-priority" name="priority" class="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded p-2 text-white focus:border-white focus:outline-none">
                            <option value="LOW">🟢 Baixa</option>
                            <option value="MEDIUM" selected>🟡 Média</option>
                            <option value="HIGH">🟠 Alta</option>
                            <option value="URGENT">🔴 Urgente</option>
                        </select>
                    </div>
                    <div>
                        <label for="task-duedate" class="block text-xs font-medium text-[#888888] mb-1">Prazo de Entrega</label>
                        <input type="date" id="task-duedate" name="dueDate" class="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded p-2 text-white focus:border-white focus:outline-none [color-scheme:dark]">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label for="task-time" class="block text-xs font-medium text-[#888888] mb-1">Tempo Estimado (h)</label>
                        <input type="number" id="task-time" name="estimatedTime" placeholder="Ex: 4" min="0" step="0.5" class="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded p-2 text-white focus:border-white focus:outline-none">
                    </div>
                    <div>
                        <label for="task-tags" class="block text-xs font-medium text-[#888888] mb-1">Tags (separadas por vírgula)</label>
                        <input type="text" id="task-tags" name="tags" placeholder="bug, front, urgente" class="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded p-2 text-white focus:border-white focus:outline-none">
                    </div>
                </div>

                <!-- Requer Validação -->
                <div class="flex items-center justify-between p-3 bg-[#1c1c1c] rounded-lg border border-[#2a2a2a]">
                    <div>
                        <span class="text-sm font-medium text-white">Requer Validação</span>
                        <p class="text-xs text-[#555555] mt-0.5">Impede concluir sem validação de outro membro</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input type="checkbox" id="task-requires-validation" class="sr-only peer">
                        <div class="w-9 h-5 bg-[#2a2a2a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#404040] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                </div>

            </div><!-- /modal-panel-detalhes -->

            <!-- ── ABA ATRIBUIÇÃO ── -->
            <div id="modal-panel-atribuicao" class="hidden">

                <!-- Info do solicitante (apenas para tickets) -->
                <div id="ticket-info-section" class="mb-4 p-3 bg-[#1c1c1c] rounded-lg border border-[#2a2a2a] hidden">
                    <p class="text-xs font-semibold text-[#888888] mb-2 uppercase tracking-wider">Informações do Ticket</p>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <p class="text-xs text-[#555555]">Solicitante</p>
                            <p id="ticket-requester-name" class="text-sm text-white font-medium"></p>
                        </div>
                        <div>
                            <p class="text-xs text-[#555555]">Empresa</p>
                            <p id="ticket-requester-company" class="text-sm text-white font-medium"></p>
                        </div>
                        <div class="col-span-2">
                            <p class="text-xs text-[#555555]">Categoria</p>
                            <p id="ticket-category-display" class="text-sm text-white"></p>
                        </div>
                    </div>
                </div>

                <div>
                    <label for="task-assigned-user" class="block text-xs font-medium text-[#888888] mb-1">Responsável</label>
                    <select id="task-assigned-user" name="assignedUserId" class="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded p-2 text-white focus:border-white focus:outline-none">
                        <option value="">Ninguém atribuído</option>
                    </select>
                </div>

            </div><!-- /modal-panel-atribuicao -->

            <!-- ── ABA MENSAGENS ── -->
            <div id="modal-panel-mensagens" class="hidden">

                <div id="comments-loading" class="flex items-center justify-center py-8 text-[#555555] text-sm hidden">
                    Carregando mensagens...
                </div>

                <div id="comments-list" class="space-y-3 max-h-56 overflow-y-auto mb-4 pr-1 scroll-smooth"></div>

                <div id="comments-empty" class="text-center py-6 text-[#444444] text-sm hidden">
                    Nenhuma mensagem ainda.
                </div>

                <!-- Input apenas para dev team -->
                <div id="comment-input-area" class="hidden mt-3 pt-3 border-t border-[#2a2a2a]">
                    <label class="block text-xs font-medium text-[#888888] mb-1.5">Nova mensagem para o solicitante</label>
                    <textarea id="comment-text" rows="3" maxlength="2000"
                        placeholder="Escreva uma atualização, dúvida ou confirmação de conclusão..."
                        class="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg p-3 text-white placeholder-[#444444] text-sm focus:border-white focus:outline-none resize-none"></textarea>
                    <div class="flex justify-end mt-2">
                        <button type="button" id="send-comment-btn"
                            class="bg-white hover:bg-[#e0e0e0] text-black text-sm font-semibold py-2 px-5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                            </svg>
                            Enviar
                        </button>
                    </div>
                </div>

            </div><!-- /modal-panel-mensagens -->

            <div class="flex justify-end gap-3 pt-4 mt-4 border-t border-[#2a2a2a]">
                <button type="button" id="modal-cancel" class="px-4 py-2 text-[#888888] hover:text-white transition-colors">Cancelar</button>
                <button type="button" id="modal-delete" class="bg-red-900/40 hover:bg-red-800/60 text-red-300 py-2 px-4 rounded border border-red-900/50 hidden transition-colors">Excluir</button>
                <button type="submit" id="modal-save" class="bg-white hover:bg-[#e0e0e0] text-black font-semibold py-2 px-6 rounded transition-colors">Salvar Tarefa</button>
            </div>
        </form>
    </div>
</div>

<div id="board-modal" class="modal fixed inset-0 flex items-center justify-center z-40 hidden">
    <div class="modal-backdrop absolute inset-0 bg-black/60"></div>
    <div class="modal-content relative p-6 rounded-xl w-full max-w-md mx-4 bg-[#141414] border border-[#2a2a2a] shadow-2xl">
        <h3 id="board-modal-title" class="text-xl font-semibold mb-4 text-white">Editar Quadro</h3>
        <form id="board-form">
            <input type="hidden" id="board-id">
            <div class="mb-6">
                <label for="board-name" class="block text-sm font-medium text-[#888888] mb-1">Nome do Quadro:</label>
                <input type="text" id="board-name" name="name" class="w-full bg-[#1c1c1c] border border-[#2a2a2a] rounded p-2 text-white focus:border-white focus:outline-none" required maxlength="100">
                <p id="board-error" class="text-red-400 text-sm mt-1 hidden"></p>
            </div>

            <div id="board-public-section" class="mb-6 p-4 bg-[#1c1c1c] rounded border border-[#2a2a2a] hidden">
                <!-- Board Principal de Tickets -->
                <div class="flex items-center justify-between mb-4 pb-4 border-b border-[#2a2a2a]">
                    <div>
                        <span class="text-sm font-medium text-white flex items-center gap-2">
                            <svg class="w-4 h-4 text-[#888888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                            </svg>
                            Board Principal de Tickets
                        </span>
                        <p class="text-[10px] text-[#555555] mt-1 ml-6">Tickets dos funcionários virão para cá.</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="board-is-main" class="sr-only peer">
                        <div class="w-9 h-5 bg-[#2a2a2a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#404040] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white peer-checked:after:bg-[#141414]"></div>
                    </label>
                </div>

                <div class="flex items-center justify-between mb-3">
                    <span class="text-sm font-medium text-white flex items-center gap-2">
                        <svg class="w-4 h-4 text-[#888888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                        </svg>
                        Receber Tickets Públicos
                    </span>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="board-is-public" class="sr-only peer">
                        <div class="w-9 h-5 bg-[#2a2a2a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#404040] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white peer-checked:after:bg-[#141414]"></div>
                    </label>
                </div>

                <div id="public-link-container" class="hidden">
                    <label class="block text-xs text-[#555555] mb-1">Link para clientes:</label>
                    <div class="flex gap-2">
                        <input type="text" id="board-public-link" readonly class="w-full bg-[#1c1c1c] text-[#888888] text-xs border border-[#2a2a2a] rounded p-2 focus:outline-none select-all">
                        <button type="button" id="copy-link-btn" class="bg-[#2a2a2a] hover:bg-[#404040] text-white p-2 rounded border border-[#404040]" title="Copiar Link">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                            </svg>
                        </button>
                    </div>
                    <p class="text-[10px] text-[#555555] mt-1">Envie este link para quem precisa abrir chamados neste quadro.</p>
                </div>
            </div>

            <div class="mb-6 p-4 bg-[#1c1c1c] rounded border border-[#2a2a2a]">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-sm font-medium text-white flex items-center gap-2">
                        <svg class="w-4 h-4 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                        </svg>
                        Notificações Discord
                    </span>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="board-discord-enabled" class="sr-only peer">
                        <div class="w-9 h-5 bg-[#2a2a2a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#404040] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#5865F2]"></div>
                    </label>
                </div>

                <div id="board-discord-container" class="hidden transition-all duration-300">
                    <label for="board-discord-webhook" class="block text-xs font-medium text-[#888888] mb-2 flex justify-between">
                        <span>Webhook URL</span>
                        <a href="https://support.discord.com/hc/pt-br/articles/228383668-Usando-Webhooks" target="_blank" class="text-[#888888] hover:text-white hover:underline flex items-center gap-1 text-[10px]">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Como obter?
                        </a>
                    </label>
                    <input type="url" id="board-discord-webhook" placeholder="https://discord.com/api/webhooks/..." class="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg p-3 text-white placeholder-[#444444] focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] focus:outline-none text-sm">
                    <p class="text-[10px] text-[#555555] mt-2">As notificações deste board serão enviadas para este canal do Discord.</p>
                </div>
            </div>

            <div class="flex justify-end gap-3">
                <button type="button" id="board-modal-cancel" class="px-4 py-2 text-[#888888] hover:text-white transition-colors">Cancelar</button>
                <button type="submit" id="board-modal-save" class="bg-white hover:bg-[#e0e0e0] text-black font-semibold py-2 px-6 rounded transition-colors">Salvar</button>
            </div>
        </form>
    </div>
</div>

<div id="settings-modal" class="modal fixed inset-0 flex items-center justify-center z-50 hidden">
    <div class="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity" onclick="document.getElementById('settings-modal').classList.add('hidden')"></div>

    <div class="modal-content relative p-8 rounded-2xl w-full max-w-xl mx-4 bg-[#141414] border border-[#2a2a2a] shadow-2xl">

        <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-4">
                <div class="p-3 bg-[#1c1c1c] rounded-xl border border-[#2a2a2a]">
                    <svg class="w-6 h-6 text-[#888888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                </div>
                <div>
                    <h3 class="text-2xl font-bold text-white tracking-tight">Preferências</h3>
                    <p class="text-sm text-[#888888]">Personalize suas notificações e alertas.</p>
                </div>
            </div>
            <button onclick="document.getElementById('settings-modal').classList.add('hidden')" class="text-[#555555] hover:text-white transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>

        <div class="space-y-6">
            <div class="grid gap-4">
                <div class="flex items-center justify-between p-4 bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] hover:border-[#404040] transition-colors group">
                    <div class="flex flex-col">
                        <span class="text-white font-medium">Resumo Diário</span>
                        <span class="text-xs text-[#555555]">Receba um email com suas tarefas do dia.</span>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="settings-notify-daily" class="sr-only peer">
                        <div class="w-11 h-6 bg-[#2a2a2a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#404040] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white peer-checked:after:bg-[#141414] shadow-inner"></div>
                    </label>
                </div>

                <div class="flex items-center justify-between p-4 bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] hover:border-[#404040] transition-colors group">
                    <div class="flex flex-col">
                        <span class="text-white font-medium">Alertas de Estagnação</span>
                        <span class="text-xs text-[#555555]">Avise quando tarefas ficarem paradas.</span>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="settings-notify-stale" class="sr-only peer">
                        <div class="w-11 h-6 bg-[#2a2a2a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#404040] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white peer-checked:after:bg-[#141414] shadow-inner"></div>
                    </label>
                </div>
            </div>

            <div class="h-px bg-[#2a2a2a] my-2"></div>

            <div class="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] p-4">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2">
                        <svg class="w-5 h-5 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z" />
                        </svg>
                        <span class="text-white font-medium">Notificações via Discord</span>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="settings-enable-discord" class="sr-only peer">
                        <div class="w-11 h-6 bg-[#2a2a2a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#404040] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5865F2] shadow-inner"></div>
                    </label>
                </div>

                <div id="discord-input-container" class="hidden transition-all duration-300 ease-in-out pl-2 border-l-2 border-[#5865F2]/30">
                    <label for="settings-discord-webhook" class="block text-xs font-medium text-[#888888] mb-2 flex justify-between">
                        WEBHOOK URL (Opcional)
                        <a href="https://support.discord.com/hc/pt-br/articles/228383668-Usando-Webhooks" target="_blank" class="text-[#888888] hover:text-white hover:underline flex items-center gap-1">
                            Como pegar? <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                            </svg>
                        </a>
                    </label>
                    <input type="text" id="settings-discord-webhook" placeholder="https://discord.com/api/webhooks/..." class="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg p-3 text-white placeholder-[#444444] focus:border-[#5865F2] focus:ring-1 focus:ring-[#5865F2] focus:outline-none text-sm">
                </div>
            </div>

            <div>
                <label class="block text-sm font-semibold text-white mb-4">Dias de Notificação</label>
                <div class="flex flex-wrap gap-3 justify-between">
                    <?php
                    $days = [0 => 'Dom', 1 => 'Seg', 2 => 'Ter', 3 => 'Qua', 4 => 'Qui', 5 => 'Sex', 6 => 'Sáb'];
                    foreach ($days as $val => $label): ?>
                        <label class="cursor-pointer group relative">
                            <input type="checkbox" value="<?php echo $val; ?>" class="day-checkbox sr-only peer">
                            <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1c1c1c] border-2 border-[#2a2a2a] flex items-center justify-center text-[#555555] group-hover:border-white group-hover:text-white peer-checked:bg-white peer-checked:text-black peer-checked:border-white transition-all font-bold text-xs sm:text-sm transform active:scale-95 select-none">
                                <?php echo $label; ?>
                            </div>
                        </label>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>

        <div class="flex justify-end gap-3 mt-10 pt-6 border-t border-[#2a2a2a]">
            <button type="button" onclick="document.getElementById('settings-modal').classList.add('hidden')" class="px-5 py-2.5 text-[#888888] hover:text-white transition-colors text-sm font-medium rounded-lg hover:bg-white/5">Cancelar</button>
            <button type="button" id="save-settings-btn" class="bg-white hover:bg-[#e0e0e0] text-black font-bold py-2.5 px-6 rounded-lg transition-colors text-sm flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Salvar Alterações
            </button>
        </div>
    </div>
</div>
