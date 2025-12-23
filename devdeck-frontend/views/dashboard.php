<?php
require_once __DIR__ . '/../config/config.php';

// Redirecionar para login se não estiver autenticado
if (!isLoggedIn()) {
    redirect('/index.php');
}

$pageTitle = 'DevDeck - Dashboard';
?>
<?php include __DIR__ . '/../includes/header.php'; ?>

<?php include __DIR__ . '/../components/navbar.php'; ?>
<?php include __DIR__ . '/../components/loading.php'; ?>

<main id="app-container" class="container mx-auto max-w-7xl w-full">
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
</main>

<?php include __DIR__ . '/../components/modals.php'; ?>

<script src="<?php echo url('assets/js/kanban.js'); ?>"></script>
<script src="<?php echo url('assets/js/kanban-modals.js'); ?>"></script>
<script src="<?php echo url('assets/js/kanban-settings.js'); ?>"></script>

<?php include __DIR__ . '/../includes/footer.php'; ?>
