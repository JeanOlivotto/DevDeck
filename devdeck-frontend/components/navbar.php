<?php if (isLoggedIn()): ?>
<header class="w-full max-w-7xl flex items-center justify-between mb-6 sm:mb-10 px-4">
    <div class="flex items-center flex-shrink-0">
        <img src="<?php echo url('img/logo-DevDesck-removebg-preview.png'); ?>" alt="DevDeck Logo" class="w-12 h-12 sm:w-14 sm:h-14 mr-2 filter drop-shadow-[0_0_8px_rgba(162,89,255,0.7)]"/>
        <img src="<?php echo url('img/Nome-DevDesck-removebg-preview.png'); ?>" alt="DevDeck" class="h-10 sm:h-12"/>
    </div>
    
    <div id="greeting-container" class="flex-grow text-center">
        <span id="user-greeting" class="text-lg text-gray-300"></span>
    </div>
    
    <div id="user-menu" class="relative">
        <button id="user-menu-button" class="user-menu-button-class flex items-center gap-3 bg-[#23284a] p-2 rounded-lg border border-transparent hover:border-purple-500 transition-all">
            <span id="user-name-display" class="font-semibold text-white">Olá, <?php echo htmlspecialchars(getUserName() ?? '...'); ?></span>
            <div id="user-avatar" class="user-avatar-class w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"></div>
            <svg id="dropdown-arrow" class="w-5 h-5 text-gray-400 transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
        </button>
        
        <div id="user-menu-dropdown" class="user-menu-dropdown-class absolute right-0 mt-2 w-72 bg-[#23284a] rounded-lg shadow-2xl border border-gray-700 z-50 hidden">
            <div class="p-4 border-b border-gray-700">
                <p class="font-semibold text-white" id="user-dropdown-name"><?php echo htmlspecialchars(getUserName() ?? 'Nome Completo'); ?></p>
                <p class="text-sm text-gray-400" id="user-dropdown-email"><?php echo htmlspecialchars(getUserEmail() ?? 'email@exemplo.com'); ?></p>
            </div>
            
            <div class="p-4 border-b border-gray-700 space-y-3">
                <h4 class="text-sm font-semibold text-gray-400 mb-2">Notificações Email</h4>
                <label for="toggle-daily-summary" class="flex items-center justify-between cursor-pointer">
                    <span class="flex items-center text-gray-300">
                        Resumo Diário
                        <svg class="info-icon w-4 h-4 ml-2 text-gray-500 hover:text-cyan-400 cursor-help" data-setting-key="dailySummary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                        </svg>
                    </span>
                    <div class="relative">
                        <input type="checkbox" id="toggle-daily-summary" class="sr-only toggle-checkbox" data-setting="notifyDailySummary">
                        <div class="toggle-bg bg-gray-600 border-2 border-gray-600 h-6 w-11 rounded-full"></div>
                        <div class="toggle-dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform"></div>
                    </div>
                </label>
                
                <label for="toggle-stale-tasks" class="flex items-center justify-between cursor-pointer">
                    <span class="flex items-center text-gray-300">
                        Aviso de Tarefa Parada
                        <svg class="info-icon w-4 h-4 ml-2 text-gray-500 hover:text-cyan-400 cursor-help" data-setting-key="staleTasks" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                        </svg>
                    </span>
                    <div class="relative">
                        <input type="checkbox" id="toggle-stale-tasks" class="sr-only toggle-checkbox" data-setting="notifyStaleTasks">
                        <div class="toggle-bg bg-gray-600 border-2 border-gray-600 h-6 w-11 rounded-full"></div>
                        <div class="toggle-dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform"></div>
                    </div>
                </label>
            </div>
            
            <div class="p-4 border-b border-gray-700 space-y-3">
                <h4 class="text-sm font-semibold text-gray-400 mb-2">Notificações WhatsApp (Meta API)</h4>
                <label for="toggle-whatsapp" class="flex items-center justify-between cursor-pointer">
                    <span class="text-gray-300">Receber via WhatsApp</span>
                    <div class="relative">
                        <input type="checkbox" id="toggle-whatsapp" class="sr-only toggle-checkbox" data-setting="notifyViaWhatsApp">
                        <div class="toggle-bg bg-gray-600 border-2 border-gray-600 h-6 w-11 rounded-full"></div>
                        <div class="toggle-dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform"></div>
                    </div>
                </label>
                
                <div class="mt-2">
                    <label for="whatsapp-number-confirm" class="block text-sm font-medium mb-1 text-gray-400">Seu Nº WhatsApp (com + DDI):</label>
                    <input type="tel" id="whatsapp-number-confirm" placeholder="+5519999998888" class="modal-input w-full p-2 rounded text-sm" data-setting="whatsappNumber">
                    <small class="text-xs text-gray-500 mt-1 block">Confirme seu número após configurar.</small>
                </div>
                
                <!-- Meta WhatsApp API Configuration -->
                <?php include __DIR__ . '/whatsapp-config.php'; ?>
            </div>
            
            <div class="p-2">
                <button id="logout-button" class="w-full text-center p-2 rounded hover:bg-red-700/50 text-red-400 transition-colors">Sair</button>
            </div>
        </div>
    </div>
</header>
<?php endif; ?>
