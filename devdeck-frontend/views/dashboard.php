<?php
require_once __DIR__ . '/../config/config.php';

// Redirecionar para login se não estiver autenticado
if (!isLoggedIn()) {
    redirect(url('index.php'));
}

$pageTitle = 'BJGROUP Suporte - Dashboard';
?>
<?php include __DIR__ . '/../includes/header.php'; ?>

<?php include __DIR__ . '/../components/navbar.php'; ?>
<?php include __DIR__ . '/../components/loading.php'; ?>

<main id="app-container" class="container mx-auto max-w-7xl w-full flex gap-6">
    <!-- Sidebar de Grupos -->
    <aside id="groups-sidebar" class="hidden flex-shrink-0 w-64 bg-[#0d0d0d] rounded-2xl overflow-hidden flex flex-col max-h-[calc(100vh-120px)] sticky top-20 border border-[#2a2a2a]">
        <div class="p-4 border-b border-[#2a2a2a]">
            <div class="flex items-center gap-2 mb-3">
                <svg class="w-4 h-4 text-[#888888]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                </svg>
                <h3 class="text-sm font-semibold text-white">Meus Grupos</h3>
            </div>
            <button id="create-group-button" class="w-full bg-[#1c1c1c] border border-[#2a2a2a] hover:border-[#555555] hover:bg-[#222222] text-white text-sm py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all font-medium">
                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                Criar Novo Grupo
            </button>
        </div>

        <div id="groups-sidebar-list" class="flex-grow overflow-y-auto p-3 custom-scrollbar">
            <div class="flex items-center justify-center py-8">
                <p class="text-sm text-[#444444]">Carregando grupos...</p>
            </div>
        </div>
    </aside>

    <div id="main-content" class="flex-grow">
        <div id="boards-container" class="board-selector-container">
            <span class="text-gray-500 italic p-3">Carregando quadros...</span>
        </div>
        
        <div id="no-boards-message" class="text-center py-10 px-6 bg-[#141414] rounded-xl border border-[#2a2a2a] hidden">
            <h3 class="text-xl font-semibold text-white mb-4">Nenhum quadro encontrado!</h3>
            <p class="text-[#888888] mb-6">Parece que você ainda não criou nenhum quadro. Clique em "+ Novo Quadro" para começar.</p>
        </div>
        
        <div id="company-filter-bar" class="hidden"></div>

        <section id="kanban-board" class="grid grid-cols-1 md:grid-cols-3 gap-6 hidden">
            <div class="column bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 flex flex-col" data-status="TODO">
                <h2 class="column-header text-base font-semibold mb-4 text-center tracking-widest uppercase text-[#888888]">A Fazer</h2>
                <div class="tasks flex-grow min-h-[100px] space-y-2" id="todo-tasks"></div>
                <button class="add-task-button text-sm py-2 px-4 rounded-lg mt-4 w-full" data-status="TODO">+ Nova Tarefa</button>
            </div>

            <div class="column bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 flex flex-col" data-status="DOING">
                <h2 class="column-header text-base font-semibold mb-4 text-center tracking-widest uppercase text-[#888888]">Em Andamento</h2>
                <div class="tasks flex-grow min-h-[100px] space-y-2" id="doing-tasks"></div>
                <button class="add-task-button text-sm py-2 px-4 rounded-lg mt-4 w-full" data-status="DOING">+ Nova Tarefa</button>
            </div>

            <div class="column bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 flex flex-col" data-status="DONE">
                <h2 class="column-header text-base font-semibold mb-4 text-center tracking-widest uppercase text-[#888888]">Concluído</h2>
                <div class="tasks flex-grow min-h-[100px] space-y-2" id="done-tasks"></div>
                <button class="add-task-button text-sm py-2 px-4 rounded-lg mt-4 w-full" data-status="DONE">+ Nova Tarefa</button>
            </div>
        </section>
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
<script src="<?php echo url('assets/js/groups-sidebar.js'); ?>"></script>
<script src="<?php echo url('assets/js/groups-navbar.js'); ?>"></script>

<script>
// Inicializar listeners dos modais
document.addEventListener('DOMContentLoaded', () => {
    if (typeof setupBoardModalListeners === 'function') {
        setupBoardModalListeners();
    }
});
</script>

<?php include __DIR__ . '/../includes/footer.php'; ?>
