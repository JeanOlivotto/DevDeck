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
        
        <div id="user-menu-dropdown" class="user-menu-dropdown-class absolute right-0 mt-2 w-72 bg-[#23284a] rounded-lg shadow-2xl border border-gray-700 z-50 hidden max-h-[80vh] overflow-y-auto">
            <div class="p-4 border-b border-gray-700 sticky top-0 bg-[#23284a]">
                <div class="flex items-center justify-between">
                    <div class="flex-grow">
                        <p class="font-semibold text-white" id="user-dropdown-name"><?php echo htmlspecialchars(getUserName() ?? 'Nome Completo'); ?></p>
                        <p class="text-sm text-gray-400" id="user-dropdown-email"><?php echo htmlspecialchars(getUserEmail() ?? 'email@exemplo.com'); ?></p>
                    </div>
                    <div id="invites-badge" class="hidden bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">0</div>
                </div>
            </div>
            
            <!-- Seção de Convites Pendentes -->
            <div id="invites-section" class="border-b border-gray-700">
                <div class="p-3 bg-gray-800/50">
                    <div class="flex items-center justify-between">
                        <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M15 8a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path fill-rule="evenodd" d="M12.316 1.872a1 1 0 01.582.756l1.537 9.694a1 1 0 01-.966 1.166H5.531a1 1 0 01-.966-1.166l1.537-9.694a1 1 0 01.582-.756A6.974 6.974 0 0110 0c1.995 0 3.888.422 5.316 1.172zM5 14a2 2 0 00-2 2v2h14v-2a2 2 0 00-2-2H5z" clip-rule="evenodd"></path>
                            </svg>
                            Convites Pendentes
                        </h4>
                        <button id="refresh-invites-button" class="text-cyan-400 hover:text-cyan-300 transition-colors" title="Atualizar">
                            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 1119.414 4.414c-.474.565-1.21.667-1.784.198-.573-.469-.67-1.208-.196-1.781A5.002 5.002 0 005.064 5H7a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm0 12a1 1 0 01.967-.252l2.121 1.061a1 1 0 10.896-1.789l-2.121-1.061A1 1 0 014 14z" clip-rule="evenodd"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div id="pending-invites-container" class="max-h-48 overflow-y-auto">
                    <p class="text-sm text-gray-500 p-3">Carregando...</p>
                </div>
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
            
            <!-- Seção de Grupos -->
            <div class="p-4 border-b border-gray-700">
                <div class="flex items-center justify-between mb-3">
                    <h4 class="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                        </svg>
                        Meus Grupos
                    </h4>
                </div>
                <div id="groups-list-dropdown" class="max-h-48 overflow-y-auto space-y-1">
                    <p class="text-xs text-gray-500 p-2">Carregando grupos...</p>
                </div>
            </div>
            
            <div class="p-2">
                <button id="logout-button" class="w-full text-center p-2 rounded hover:bg-red-700/50 text-red-400 transition-colors">Sair</button>
            </div>
        </div>
    </div>
</header>
<?php endif; ?>
