<?php if (isLoggedIn()): ?>
    <header class="w-full max-w-7xl flex items-center justify-between mb-6 sm:mb-10 px-4 relative z-30">
        <div class="flex items-center flex-shrink-0">
            <img src="<?php echo url('img/logo-DevDesck-removebg-preview.png'); ?>" alt="DevDeck Logo" class="w-12 h-12 sm:w-14 sm:h-14 mr-2 filter drop-shadow-[0_0_8px_rgba(162,89,255,0.7)]" />
            <img src="<?php echo url('img/Nome-DevDesck-removebg-preview.png'); ?>" alt="DevDeck" class="h-10 sm:h-12" />
        </div>

        <div id="greeting-container" class="flex-grow text-center hidden sm:block">
            <span id="user-greeting" class="text-lg text-gray-300"></span>
        </div>

        <div id="user-menu" class="relative z-50">
            <button id="user-menu-button" class="flex items-center gap-3 bg-[#23284a] p-2 rounded-lg border border-transparent hover:border-purple-500 transition-all focus:outline-none">
                <span id="user-name-display" class="font-semibold text-white hidden sm:block">Olá, <?php echo htmlspecialchars(getUserName() ?? '...'); ?></span>
                <div id="user-avatar" class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm bg-purple-600">
                    <?php echo strtoupper(substr(getUserName() ?? 'U', 0, 2)); ?>
                </div>
                <svg id="dropdown-arrow" class="w-5 h-5 text-gray-400 transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>

            <div id="user-menu-dropdown-v2" class="absolute right-0 mt-2 w-72 bg-[#23284a] rounded-lg shadow-2xl border border-gray-700 hidden" style="display: none;">
                <div class="p-4 border-b border-gray-700 bg-[#23284a] rounded-t-lg">
                    <div class="flex items-center justify-between">
                        <div class="flex-grow overflow-hidden">
                            <p class="font-semibold text-white truncate" id="user-dropdown-name"><?php echo htmlspecialchars(getUserName() ?? 'Nome'); ?></p>
                            <p class="text-sm text-gray-400 truncate" id="user-dropdown-email"><?php echo htmlspecialchars(getUserEmail() ?? 'email@exemplo.com'); ?></p>
                        </div>
                    </div>
                </div>

                <div id="invites-section" class="border-b border-gray-700">
                    <div class="p-3 bg-gray-800/50 flex justify-between items-center">
                        <h4 class="text-xs font-semibold text-gray-400 uppercase">Convites Pendentes</h4>
                        <button id="refresh-invites-button" class="text-cyan-400 hover:text-cyan-300 text-xs">Atualizar</button>
                    </div>
                    <div id="pending-invites-container" class="max-h-32 overflow-y-auto"></div>
                </div>

                <div class="p-4 border-b border-gray-700">
                    <h4 class="text-xs font-semibold text-gray-400 uppercase mb-2">Meus Grupos</h4>
                    <div id="groups-list-dropdown" class="max-h-32 overflow-y-auto space-y-1">
                        <p class="text-xs text-gray-500">Carregando...</p>
                    </div>
                </div>

                <button onclick="window.openSettingsModal()" class="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-[#2b304b] hover:text-white flex items-center gap-2">
                    <span>⚙️</span> Configurações
                </button>
                <div class="border-t border-gray-700"></div>
                <button id="logout-button" class="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 flex items-center gap-2 rounded-b-lg">
                    <span>🚪</span> Sair
                </button>
            </div>
        </div>
    </header>
<?php endif; ?>