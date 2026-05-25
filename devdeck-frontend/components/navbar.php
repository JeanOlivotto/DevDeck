<?php if (isLoggedIn()): ?>
    <header class="w-full max-w-7xl flex items-center justify-between mb-6 sm:mb-10 px-4 relative z-30">
        <div class="flex items-center flex-shrink-0">
            <img src="<?php echo url('img/logo-white.png'); ?>" alt="BJGROUP Suporte" class="h-9 sm:h-10" />
        </div>

        <div id="greeting-container" class="flex-grow text-center hidden sm:block">
            <span id="user-greeting" class="text-sm text-[#888888]"></span>
        </div>

        <div id="user-menu" class="relative z-50">
            <button id="user-menu-button" class="flex items-center gap-3 bg-[#141414] p-2 rounded-lg border border-[#2a2a2a] hover:border-[#404040] transition-all focus:outline-none">
                <span id="user-name-display" class="font-medium text-white hidden sm:block text-sm">Olá, <?php echo htmlspecialchars(getUserName() ?? '...'); ?></span>
                <div id="user-avatar" class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm bg-[#2a2a2a]">
                    <?php echo strtoupper(substr(getUserName() ?? 'U', 0, 2)); ?>
                </div>
                <svg id="dropdown-arrow" class="w-4 h-4 text-[#888888] transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>

            <div id="user-menu-dropdown-v2" class="absolute right-0 mt-2 w-72 bg-[#141414] rounded-xl shadow-2xl border border-[#2a2a2a] hidden" style="display: none;">
                <div class="p-4 border-b border-[#2a2a2a] rounded-t-xl">
                    <div class="flex items-center justify-between">
                        <div class="flex-grow overflow-hidden">
                            <p class="font-semibold text-white truncate" id="user-dropdown-name"><?php echo htmlspecialchars(getUserName() ?? 'Nome'); ?></p>
                            <p class="text-sm text-[#888888] truncate" id="user-dropdown-email"><?php echo htmlspecialchars(getUserEmail() ?? 'email@exemplo.com'); ?></p>
                        </div>
                    </div>
                </div>

                <div id="invites-section" class="border-b border-[#2a2a2a]">
                    <div class="p-3 bg-[#1c1c1c] flex justify-between items-center">
                        <h4 class="text-xs font-semibold text-[#888888] uppercase tracking-wider">Convites Pendentes</h4>
                        <button id="refresh-invites-button" class="text-white hover:text-[#e0e0e0] text-xs">Atualizar</button>
                    </div>
                    <div id="pending-invites-container" class="max-h-32 overflow-y-auto"></div>
                </div>

                <div class="p-4 border-b border-[#2a2a2a]">
                    <h4 class="text-xs font-semibold text-[#888888] uppercase tracking-wider mb-2">Meus Grupos</h4>
                    <div id="groups-list-dropdown" class="max-h-32 overflow-y-auto space-y-1">
                        <p class="text-xs text-[#444444]">Carregando...</p>
                    </div>
                </div>

                <button onclick="window.openSettingsModal()" class="w-full text-left px-4 py-3 text-sm text-[#888888] hover:bg-[#1c1c1c] hover:text-white flex items-center gap-2 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    Configurações
                </button>
                <div class="border-t border-[#2a2a2a]"></div>
                <button id="logout-button" class="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-900/10 hover:text-red-300 flex items-center gap-2 rounded-b-xl transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    Sair
                </button>
            </div>
        </div>
    </header>
<?php endif; ?>