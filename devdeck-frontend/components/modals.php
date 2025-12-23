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
