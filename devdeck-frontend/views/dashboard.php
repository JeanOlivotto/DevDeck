<?php
require_once __DIR__ . '/../config/config.php';

// Redirecionar para login se não estiver autenticado
if (!isLoggedIn()) {
    redirect(url('index.php'));
}

$pageTitle = 'DevDeck - Dashboard';
?>
<?php include __DIR__ . '/../includes/header.php'; ?>

<?php include __DIR__ . '/../components/navbar.php'; ?>
<?php include __DIR__ . '/../components/loading.php'; ?>

<main id="app-container" class="container mx-auto max-w-7xl w-full flex gap-6">
    <!-- Sidebar de Grupos -->
    <aside id="groups-sidebar" class="hidden flex-shrink-0 w-72 bg-gradient-to-b from-[#1e2344] to-[#1a1f3a] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-120px)] sticky top-20 border border-purple-900/20">
        <div class="p-5 border-b border-purple-900/30 bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur-sm">
            <div class="flex items-center gap-2 mb-4">
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                    </svg>
                </div>
                <h3 class="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Meus Grupos</h3>
            </div>
            <button id="create-group-button" class="group w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-purple-500/50 hover:scale-105 font-semibold">
                <svg class="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                Criar Novo Grupo
            </button>
        </div>
        
        <div id="groups-sidebar-list" class="flex-grow overflow-y-auto p-4 custom-scrollbar">
            <div class="flex items-center justify-center py-8">
                <div class="text-center">
                    <svg class="w-12 h-12 text-gray-600 mx-auto mb-3 animate-pulse" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p class="text-sm text-gray-500">Carregando grupos...</p>
                </div>
            </div>
        </div>
    </aside>

    <div id="main-content" class="flex-grow">
        <div id="boards-container" class="board-selector-container">
            <span class="text-gray-500 italic p-3">Carregando quadros...</span>
        </div>
        
        <div id="no-boards-message" class="text-center py-10 px-6 bg-[#23284a] rounded-lg shadow-lg hidden">
            <h3 class="text-xl font-semibold text-cyan-300 mb-4">Nenhum quadro encontrado!</h3>
            <p class="text-gray-400 mb-6">Parece que você ainda não criou nenhum quadro. Clique em "+ Novo Quadro" para começar.</p>
        </div>
        
        <section id="kanban-board" class="grid grid-cols-1 md:grid-cols-3 gap-6 hidden">
            <div class="column bg-[#23284a] rounded-xl shadow-lg p-4 flex flex-col" data-status="TODO">
                <h2 class="column-header text-xl font-semibold mb-4 text-center">To Do</h2>
                <div class="tasks flex-grow min-h-[100px] space-y-3" id="todo-tasks"></div>
                <button class="add-task-button text-white font-semibold py-2 px-4 rounded-lg mt-4 w-full" data-status="TODO">+ Nova Tarefa</button>
            </div>
            
            <div class="column bg-[#23284a] rounded-xl shadow-lg p-4 flex flex-col" data-status="DOING">
                <h2 class="column-header text-xl font-semibold mb-4 text-center">Doing</h2>
                <div class="tasks flex-grow min-h-[100px] space-y-3" id="doing-tasks"></div>
                <button class="add-task-button text-white font-semibold py-2 px-4 rounded-lg mt-4 w-full" data-status="DOING">+ Nova Tarefa</button>
            </div>
            
            <div class="column bg-[#23284a] rounded-xl shadow-lg p-4 flex flex-col" data-status="DONE">
                <h2 class="column-header text-xl font-semibold mb-4 text-center">Done</h2>
                <div class="tasks flex-grow min-h-[100px] space-y-3" id="done-tasks"></div>
                <button class="add-task-button text-white font-semibold py-2 px-4 rounded-lg mt-4 w-full" data-status="DONE">+ Nova Tarefa</button>
            </div>
        </section>
    </div>
</main>

<?php include __DIR__ . '/../components/modals.php'; ?>

<script src="<?php echo url('assets/js/component-updates.js'); ?>"></script>
<script src="<?php echo url('assets/js/kanban.js'); ?>"></script>
<script src="<?php echo url('assets/js/kanban-modals.js'); ?>"></script>
<script src="<?php echo url('assets/js/kanban-settings.js'); ?>"></script>
<script src="<?php echo url('assets/js/invites.js'); ?>"></script>
<script src="<?php echo url('assets/js/groups.js'); ?>"></script>
<script src="<?php echo url('assets/js/group-modals.js'); ?>"></script>
<script src="<?php echo url('assets/js/groups-sidebar.js'); ?>"></script>
<script src="<?php echo url('assets/js/groups-navbar.js'); ?>"></script>

<?php include __DIR__ . '/../includes/footer.php'; ?>
