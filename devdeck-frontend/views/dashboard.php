<?php
require_once __DIR__ . '/../config/config.php';

if (!isLoggedIn()) {
    redirect(url('index.php'));
}

$pageTitle = 'BJGROUP Suporte - Dashboard';
?>
<?php include __DIR__ . '/../includes/header.php'; ?>
<?php include __DIR__ . '/../components/navbar.php'; ?>
<?php include __DIR__ . '/../components/loading.php'; ?>

<main id="app-container" class="container mx-auto max-w-7xl w-full px-4">

    <!-- Barra de Abas -->
    <div id="tab-bar" class="flex items-center border-b border-[#2a2a2a] mb-6">
        <button id="tab-kanban" class="tab-btn tab-active" data-tab="kanban">Meu Kanban</button>
        <button id="tab-coletivo" class="tab-btn" data-tab="coletivo">Kanban Coletivo</button>
        <button id="tab-historico" class="tab-btn" data-tab="historico">Histórico</button>
        <div class="ml-auto pb-1">
            <button id="manage-boards-btn" class="text-xs text-[#555555] hover:text-white border border-[#2a2a2a] hover:border-[#555555] px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path>
                </svg>
                Quadros
            </button>
        </div>
    </div>

    <!-- Painel: Meu Kanban -->
    <div id="panel-kanban" class="panel">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-lg font-semibold text-white">Meu Kanban</h2>
                <p class="text-sm text-[#555555]">Tarefas atribuídas a você</p>
            </div>
            <button class="add-task-button text-sm py-2 px-4 rounded-lg" data-status="TODO">+ Nova Tarefa</button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- A Fazer -->
            <div class="column bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 flex flex-col" data-status="TODO">
                <h3 class="column-header text-sm font-semibold mb-4 text-center tracking-widest uppercase text-[#888888]">A Fazer</h3>
                <div class="tasks flex-grow min-h-[120px] space-y-2" id="personal-todo-tasks"></div>
                <button class="add-task-button text-sm py-2 px-4 rounded-lg mt-4 w-full" data-status="TODO">+ Nova Tarefa</button>
            </div>

            <!-- Em Andamento -->
            <div class="column bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 flex flex-col" data-status="DOING">
                <h3 class="column-header text-sm font-semibold mb-4 text-center tracking-widest uppercase text-[#888888]">Em Andamento</h3>
                <div class="tasks flex-grow min-h-[120px] space-y-2" id="personal-doing-tasks"></div>
                <button class="add-task-button text-sm py-2 px-4 rounded-lg mt-4 w-full" data-status="DOING">+ Nova Tarefa</button>
            </div>

            <!-- Aguardando Validação -->
            <div class="column bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 flex flex-col" data-status="VALIDATING">
                <h3 class="text-sm font-semibold mb-4 text-center tracking-widest uppercase" style="color:#b07800">Aguardando Validação</h3>
                <div class="tasks flex-grow min-h-[120px] space-y-2" id="personal-validating-tasks">
                    <p class="text-xs text-[#444444] text-center py-6">Tasks que requerem<br>validação antes de concluir</p>
                </div>
            </div>

            <!-- Zona de Conclusão -->
            <div id="completion-zone" class="completion-zone flex flex-col items-center justify-center gap-2 rounded-xl min-h-[200px]">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-sm font-semibold">Concluir</span>
                <span class="text-xs text-center px-2">Arraste um ticket aqui para finalizar</span>
            </div>
        </div>
    </div>

    <!-- Painel: Kanban Coletivo -->
    <div id="panel-coletivo" class="panel hidden">
        <div class="mb-6">
            <h2 class="text-lg font-semibold text-white">Kanban Coletivo</h2>
            <p class="text-sm text-[#555555]">Tarefas disponíveis dos seus grupos — clique em "Pegar Tarefa" para assumir</p>
        </div>

        <div class="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
            <h3 class="column-header text-sm font-semibold mb-4 tracking-widest uppercase text-[#888888]">Disponíveis</h3>
            <div id="collective-available-tasks" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 min-h-[200px]">
                <p class="text-sm text-[#444444] text-center py-8 col-span-full">Carregando...</p>
            </div>
        </div>
    </div>

    <!-- Painel: Histórico -->
    <div id="panel-historico" class="panel hidden">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-lg font-semibold text-white">Histórico de Tickets</h2>
                <p class="text-sm text-[#555555]">Tickets concluídos de todos os quadros</p>
            </div>
            <input type="text" id="history-search" placeholder="Buscar por título, responsável, categoria..." class="w-72 bg-[#1c1c1c] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555555] focus:border-[#555555] focus:outline-none">
        </div>

        <div id="history-cards" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-h-[200px]">
            <p class="text-sm text-[#444444] text-center py-8 col-span-full">Carregando...</p>
        </div>
    </div>

</main>

<?php include __DIR__ . '/../components/modals.php'; ?>

<script src="<?php echo url('assets/js/component-updates.js'); ?>"></script>
<script src="<?php echo url('assets/js/kanban.js'); ?>"></script>
<script src="<?php echo url('assets/js/kanban-modals.js'); ?>"></script>
<script src="<?php echo url('assets/js/kanban-board-modal.js'); ?>"></script>
<script src="<?php echo url('assets/js/kanban-settings.js'); ?>"></script>
<script src="<?php echo url('assets/js/invites.js'); ?>"></script>
<script src="<?php echo url('assets/js/groups.js'); ?>"></script>
<script src="<?php echo url('assets/js/group-modals.js'); ?>"></script>
<script src="<?php echo url('assets/js/groups-navbar.js'); ?>"></script>

<script>
document.addEventListener('DOMContentLoaded', () => {
    if (typeof setupBoardModalListeners === 'function') {
        setupBoardModalListeners();
    }
});
</script>

<?php include __DIR__ . '/../includes/footer.php'; ?>
