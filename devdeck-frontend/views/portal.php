<?php
require_once __DIR__ . '/../config/config.php';

if (!isLoggedIn()) {
    redirect(url('index.php'));
}

// Membros do time dev têm acesso ao dashboard
if (getIsDevTeam()) {
    redirect(url('views/dashboard.php'));
}

$pageTitle = 'BJGROUP Suporte';
?>
<?php include __DIR__ . '/../includes/header.php'; ?>

<?php include __DIR__ . '/../components/loading.php'; ?>

<style>
body { padding: 0 !important; }

    .portal-header {
        background: #0d0d0d;
        border-bottom: 1px solid #2a2a2a;
    }

    .ticket-card {
        background: #141414;
        border: 1px solid #2a2a2a;
        transition: border-color 0.15s, transform 0.1s;
    }

    .ticket-card:hover {
        border-color: #404040;
        transform: translateY(-1px);
    }

    .category-card {
        background: #1c1c1c;
        border: 1px solid #2a2a2a;
        cursor: pointer;
        transition: all 0.15s;
    }

    .category-card:hover {
        border-color: #555555;
        background: #222222;
    }

    .category-card.selected {
        border-color: #ffffff;
        background: #1c1c1c;
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.15);
    }

    .status-badge {
        font-size: 11px;
        font-weight: 600;
        padding: 2px 10px;
        border-radius: 999px;
    }

    .status-TODO    { background: rgba(255,255,255,0.05); color: #888888; }
    .status-DOING   { background: rgba(138, 104, 0, 0.2); color: #c49b00; }
    .status-DONE    { background: rgba(45, 107, 69, 0.2); color: #3da060; }

    .step-indicator {
        width: 28px; height: 28px;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 12px; font-weight: 700;
        transition: all 0.2s;
    }

    .step-active   { background: #ffffff; color: #000000; }
    .step-done     { background: #2a2a2a; color: #888888; }
    .step-inactive { background: #141414; color: #444444; border: 1px solid #2a2a2a; }

    .progress-bar-fill {
        background: #ffffff;
        height: 2px;
        border-radius: 2px;
        transition: width 0.35s ease;
    }

    .portal-input {
        background: #1c1c1c;
        border: 1px solid #2a2a2a;
        color: #ffffff;
        border-radius: 8px;
        padding: 12px 16px;
        width: 100%;
        font-size: 15px;
        outline: none;
        transition: border-color 0.15s;
    }

    .portal-input:focus {
        border-color: #555555;
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.06);
    }

    .btn-primary {
        background: #ffffff;
        color: #000000;
        font-weight: 700;
        border-radius: 10px;
        padding: 12px 28px;
        border: none;
        cursor: pointer;
        transition: background 0.15s, transform 0.1s;
        font-size: 15px;
    }

    .btn-primary:hover  { background: #e0e0e0; }
    .btn-primary:active { transform: scale(0.98); }
    .btn-primary:disabled { opacity: 0.35; cursor: not-allowed; }

    .btn-secondary {
        background: transparent;
        color: #888888;
        font-weight: 500;
        border-radius: 10px;
        padding: 12px 28px;
        border: 1px solid #2a2a2a;
        cursor: pointer;
        transition: all 0.15s;
        font-size: 15px;
    }

    .btn-secondary:hover { color: #ffffff; border-color: #404040; }

    .modal-overlay {
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(4px);
    }

    .company-tag {
        background: rgba(255, 255, 255, 0.08);
        color: #e0e0e0;
        padding: 2px 10px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
    }

    .file-drop-zone {
        border: 1px dashed #2a2a2a;
        border-radius: 8px;
        padding: 16px;
        text-align: center;
        cursor: pointer;
        transition: border-color 0.15s;
    }
    .file-drop-zone:hover { border-color: #555555; }
    .portal-file-item {
        background: #1c1c1c;
        border: 1px solid #2a2a2a;
        border-radius: 6px;
        padding: 6px 12px;
        font-size: 12px;
        color: #888888;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .portal-file-item button {
        background: none; border: none; color: #555555; cursor: pointer; font-size: 14px; line-height: 1;
    }
    .portal-file-item button:hover { color: #ffffff; }
</style>

<!-- Header -->
<div class="portal-header w-full fixed top-0 left-0 z-30 px-4 sm:px-8">
    <div class="max-w-5xl mx-auto flex items-center justify-between h-16">
        <div class="flex items-center gap-3">
            <img src="<?php echo url('img/logo-white.png'); ?>" alt="BJGROUP Suporte" class="h-8" />
        </div>
        <div class="flex items-center gap-3">
            <span id="portal-user-name" class="text-[#888888] text-sm hidden sm:block"></span>
            <div class="relative" id="portal-user-menu">
                <button id="portal-user-btn" class="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-white text-sm font-bold hover:bg-[#404040] transition-colors" title="Meu Perfil">
                    <span id="portal-avatar-letter">U</span>
                </button>
                <div id="portal-user-dropdown" class="hidden absolute right-0 top-full mt-2 w-44 bg-[#141414] rounded-xl border border-[#2a2a2a] shadow-xl z-50 overflow-hidden">
                    <button id="portal-profile-btn" class="w-full text-left px-4 py-3 text-sm text-[#888888] hover:text-white hover:bg-[#1c1c1c] flex items-center gap-2 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        Meu Perfil
                    </button>
                    <div class="h-px bg-[#2a2a2a]"></div>
                    <button id="portal-logout-btn" class="w-full text-left px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/10 flex items-center gap-2 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
                        Sair
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Main Content -->
<div class="w-full max-w-5xl mt-24 px-4 pb-16">

    <!-- Welcome -->
    <div class="mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 id="portal-welcome" class="text-2xl font-bold text-white mb-1">Olá!</h1>
                <p class="text-[#888888] text-sm">Abra um ticket para o time de desenvolvimento tratar.</p>
            </div>
            <button id="open-ticket-btn" class="btn-primary flex items-center gap-2 self-start sm:self-auto">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Abrir Novo Ticket
            </button>
        </div>
    </div>

    <!-- Tickets List -->
    <div class="ticket-card rounded-xl overflow-hidden">
        <div class="px-6 py-4 border-b border-[#2a2a2a] flex items-center justify-between">
            <h2 class="text-white font-semibold">Meus Tickets</h2>
            <span id="tickets-count" class="text-[#444444] text-sm"></span>
        </div>

        <div id="tickets-loading" class="px-6 py-12 text-center text-[#444444] text-sm">
            Carregando seus tickets...
        </div>

        <div id="tickets-empty" class="px-6 py-12 text-center hidden">
            <svg class="w-12 h-12 mx-auto mb-3 text-[#222222]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <p class="text-[#444444] text-sm">Você ainda não abriu nenhum ticket.</p>
            <p class="text-[#333333] text-xs mt-1">Clique em "Abrir Novo Ticket" para começar.</p>
        </div>

        <div id="tickets-table" class="hidden">
            <div class="hidden sm:grid sm:grid-cols-12 px-6 py-3 text-xs font-semibold text-[#444444] uppercase tracking-wider border-b border-[#2a2a2a]/50">
                <div class="col-span-1">#</div>
                <div class="col-span-3">Título</div>
                <div class="col-span-2">Categoria</div>
                <div class="col-span-2">Status</div>
                <div class="col-span-2">Responsável</div>
                <div class="col-span-1">Data</div>
                <div class="col-span-1"></div>
            </div>
            <div id="tickets-list"></div>
        </div>
    </div>
</div>

<!-- Ticket Modal -->
<div id="ticket-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center p-4">
    <div class="modal-overlay absolute inset-0" id="modal-backdrop"></div>
    <div class="relative w-full max-w-lg bg-[#111111] rounded-2xl border border-[#2a2a2a] shadow-2xl overflow-hidden">

        <!-- Progress Bar -->
        <div class="h-0.5 bg-gray-800">
            <div id="modal-progress" class="progress-bar-fill" style="width: 33%"></div>
        </div>

        <!-- Modal Header -->
        <div class="px-6 pt-6 pb-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div id="step-1-ind" class="step-indicator step-active">1</div>
                <div class="w-8 h-px bg-gray-700"></div>
                <div id="step-2-ind" class="step-indicator step-inactive">2</div>
                <div class="w-8 h-px bg-gray-700"></div>
                <div id="step-3-ind" class="step-indicator step-inactive">3</div>
            </div>
            <button id="modal-close-btn" class="text-[#444444] hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>

        <!-- Step 1: Category -->
        <div id="step-1" class="px-6 pb-6">
            <h3 class="text-white font-bold text-xl mb-1">Qual é o tipo do ticket?</h3>
            <p class="text-[#888888] text-sm mb-6">Selecione a categoria que melhor descreve sua solicitação.</p>
            <div class="grid grid-cols-2 gap-3">
                <button class="category-card rounded-xl p-4 text-left" data-category="Bug">
                    <div class="text-2xl mb-2">🐛</div>
                    <div class="text-white font-semibold text-sm">Bug</div>
                    <div class="text-[#444444] text-xs mt-1">Algo não está funcionando</div>
                </button>
                <button class="category-card rounded-xl p-4 text-left" data-category="Nova Funcionalidade">
                    <div class="text-2xl mb-2">✨</div>
                    <div class="text-white font-semibold text-sm">Nova Funcionalidade</div>
                    <div class="text-[#444444] text-xs mt-1">Pedido de melhoria</div>
                </button>
                <button class="category-card rounded-xl p-4 text-left" data-category="Acesso ao Sistema">
                    <div class="text-2xl mb-2">🔑</div>
                    <div class="text-white font-semibold text-sm">Acesso ao Sistema</div>
                    <div class="text-[#444444] text-xs mt-1">Permissões ou logins</div>
                </button>
                <button class="category-card rounded-xl p-4 text-left" data-category="Solicitação Geral">
                    <div class="text-2xl mb-2">📋</div>
                    <div class="text-white font-semibold text-sm">Solicitação Geral</div>
                    <div class="text-[#444444] text-xs mt-1">Outras demandas</div>
                </button>
            </div>
            <div class="mt-6 flex justify-end">
                <button id="step-1-next" class="btn-primary" disabled style="opacity: 0.4">
                    Próximo →
                </button>
            </div>
        </div>

        <!-- Step 2: Title -->
        <div id="step-2" class="px-6 pb-6 hidden">
            <h3 class="text-white font-bold text-xl mb-1">Qual é o título do ticket?</h3>
            <p class="text-[#888888] text-sm mb-6">Em uma frase, descreva o que você precisa.</p>
            <div>
                <input
                    type="text"
                    id="ticket-title"
                    class="portal-input"
                    placeholder="Ex: Não consigo acessar o sistema X"
                    maxlength="255"
                >
                <p class="text-[#333333] text-xs mt-2">Seja específico — isso ajuda o time a entender mais rápido.</p>
            </div>
            <div class="mt-6 flex justify-between">
                <button id="step-2-back" class="btn-secondary">← Voltar</button>
                <button id="step-2-next" class="btn-primary" disabled style="opacity: 0.4">Próximo →</button>
            </div>
        </div>

        <!-- Step 3: Description + Attachments -->
        <div id="step-3" class="px-6 pb-6 hidden">
            <h3 class="text-white font-bold text-xl mb-1">Mais detalhes <span class="text-[#444444] font-normal text-base">(opcional)</span></h3>
            <p class="text-[#888888] text-sm mb-4">Explique o problema e anexe prints ou arquivos, se quiser.</p>
            <div class="space-y-4">
                <textarea
                    id="ticket-description"
                    class="portal-input resize-none"
                    rows="4"
                    placeholder="Descreva o que está acontecendo, passos para reproduzir, qual sistema é afetado..."
                    maxlength="2000"
                ></textarea>
                <div>
                    <p class="text-xs font-semibold text-[#444444] uppercase tracking-wider mb-2">Anexos (máx. 5 arquivos)</p>
                    <div class="file-drop-zone" id="portal-file-drop" onclick="document.getElementById('portal-file-input').click()">
                        <svg class="w-6 h-6 text-[#444444] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                        </svg>
                        <p class="text-xs text-[#555555]">Clique para anexar ou <kbd style="background:#2a2a2a;border:1px solid #404040;border-radius:4px;padding:1px 5px;font-size:11px;font-family:monospace;color:#888;">Ctrl+V</kbd> para colar um print</p>
                    </div>
                    <input type="file" id="portal-file-input" multiple accept="image/*,.pdf" style="display:none;" onchange="portalHandleFiles(this)">
                    <div id="portal-file-list" class="mt-2 flex flex-col gap-1.5"></div>
                </div>
            </div>
            <div class="mt-6 flex justify-between items-center">
                <button id="step-3-back" class="btn-secondary">← Voltar</button>
                <button id="step-3-submit" class="btn-primary flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                    </svg>
                    Enviar Ticket
                </button>
            </div>
        </div>

        <!-- Step 4: Success -->
        <div id="step-success" class="px-6 pb-8 hidden text-center">
            <div class="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4 mt-2">
                <svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
                </svg>
            </div>
            <h3 class="text-white font-bold text-xl mb-2">Ticket enviado!</h3>
            <p class="text-[#888888] text-sm mb-1">Seu ticket foi registrado com sucesso.</p>
            <p class="text-[#444444] text-xs mb-6">Você será notificado por e-mail quando houver atualizações.</p>
            <div class="flex gap-3 justify-center">
                <button id="success-new" class="btn-secondary text-sm px-5 py-2.5">Abrir outro ticket</button>
                <button id="success-close" class="btn-primary text-sm px-5 py-2.5">Ver meus tickets</button>
            </div>
        </div>
    </div>
</div>

<!-- Profile Modal -->
<div id="profile-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center p-4">
    <div class="modal-overlay absolute inset-0" id="profile-backdrop"></div>
    <div class="relative w-full max-w-sm bg-[#111111] rounded-2xl border border-[#2a2a2a] shadow-2xl overflow-hidden">
        <div class="px-6 pt-5 pb-4 flex items-center justify-between border-b border-[#2a2a2a]/60">
            <h3 class="text-white font-bold text-base">Meu Perfil</h3>
            <button id="profile-close-btn" class="text-[#444444] hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
        <div class="px-6 py-5 space-y-4">
            <div class="flex items-center gap-4 pb-4 border-b border-[#2a2a2a]/40">
                <div class="w-14 h-14 rounded-full bg-[#2a2a2a] border border-[#404040] flex items-center justify-center text-white text-xl font-bold flex-shrink-0" id="profile-avatar-big">U</div>
                <div>
                    <div class="text-white font-semibold" id="profile-display-name"></div>
                    <span class="company-tag inline-block mt-1" id="profile-display-company"></span>
                </div>
            </div>
            <div>
                <label class="block text-xs font-semibold text-[#444444] uppercase tracking-wider mb-2">Nome</label>
                <input type="text" id="profile-name-input" class="portal-input" placeholder="Seu nome completo">
            </div>
            <div>
                <label class="block text-xs font-semibold text-[#444444] uppercase tracking-wider mb-2">Email</label>
                <div class="portal-input text-[#444444] select-none" style="cursor:default;opacity:0.65" id="profile-email-display"></div>
            </div>
        </div>
        <div class="px-6 pb-5 flex justify-end gap-3">
            <button id="profile-cancel-btn" class="btn-secondary text-sm px-5 py-2.5">Cancelar</button>
            <button id="profile-save-btn" class="btn-primary text-sm px-5 py-2.5">Salvar</button>
        </div>
    </div>
</div>

<!-- Ticket Detail Modal -->
<div id="ticket-detail-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center p-4">
    <div class="modal-overlay absolute inset-0" id="detail-backdrop"></div>
    <div class="relative w-full max-w-lg bg-[#0f0f0f] rounded-2xl border border-[#2a2a2a] shadow-2xl overflow-hidden">

        <!-- Header -->
        <div class="px-6 pt-6 pb-5 border-b border-[#1e1e1e]">
            <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-3">
                        <span id="detail-category" class="text-[11px] font-semibold text-[#666666] uppercase tracking-widest"></span>
                        <span class="text-[#2a2a2a] select-none">·</span>
                        <span id="detail-status" class="status-badge"></span>
                    </div>
                    <h3 id="detail-title" class="text-white font-bold text-xl leading-tight"></h3>
                </div>
                <button id="detail-close-btn" class="w-8 h-8 flex items-center justify-center rounded-lg text-[#444444] hover:text-white hover:bg-[#1e1e1e] transition-colors flex-shrink-0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        </div>

        <!-- Body -->
        <div class="px-6 py-5 max-h-[65vh] overflow-y-auto space-y-6">

            <!-- Meta grid -->
            <div class="grid grid-cols-2 gap-px bg-[#1e1e1e] rounded-xl overflow-hidden border border-[#1e1e1e]">
                <div class="bg-[#0f0f0f] px-4 py-3">
                    <p class="text-[10px] font-semibold text-[#3a3a3a] uppercase tracking-widest mb-1.5">Ticket</p>
                    <p id="detail-id" class="text-sm font-mono text-[#777777]"></p>
                </div>
                <div class="bg-[#0f0f0f] px-4 py-3">
                    <p class="text-[10px] font-semibold text-[#3a3a3a] uppercase tracking-widest mb-1.5">Aberto em</p>
                    <p id="detail-date" class="text-sm text-[#777777]"></p>
                </div>
                <div class="bg-[#0f0f0f] px-4 py-3 border-t border-[#1e1e1e]">
                    <p class="text-[10px] font-semibold text-[#3a3a3a] uppercase tracking-widest mb-1.5">Responsável</p>
                    <p id="detail-assigned" class="text-sm text-white"></p>
                </div>
                <div class="bg-[#0f0f0f] px-4 py-3 border-t border-[#1e1e1e]">
                    <p class="text-[10px] font-semibold text-[#3a3a3a] uppercase tracking-widest mb-1.5">Prazo</p>
                    <p id="detail-duedate" class="text-sm text-[#777777]"></p>
                </div>
            </div>

            <!-- Descrição -->
            <div id="detail-desc-section">
                <div class="flex items-center gap-3 mb-3">
                    <p class="text-[10px] font-semibold text-[#3a3a3a] uppercase tracking-widest">Descrição</p>
                    <div class="flex-1 h-px bg-[#1e1e1e]"></div>
                </div>
                <p id="detail-description" class="text-sm text-[#aaaaaa] leading-relaxed whitespace-pre-wrap"></p>
            </div>

            <!-- Anexos -->
            <div id="detail-attachments-section" class="hidden">
                <div class="flex items-center gap-3 mb-3">
                    <p class="text-[10px] font-semibold text-[#3a3a3a] uppercase tracking-widest">Anexos</p>
                    <div class="flex-1 h-px bg-[#1e1e1e]"></div>
                </div>
                <div id="detail-attachments-list" class="flex flex-wrap gap-3"></div>
            </div>

        </div>

        <div class="px-6 py-4 border-t border-[#1e1e1e] flex justify-end">
            <button id="detail-close-footer" class="btn-secondary text-sm px-5 py-2.5">Fechar</button>
        </div>
    </div>
</div>

<!-- Minimal Alert Modal -->
<div id="portal-alert-modal" class="fixed inset-0 z-[60] hidden flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
    <div class="relative w-full max-w-xs bg-[#111111] rounded-2xl border border-gray-700 shadow-2xl p-6 text-center">
        <p id="portal-alert-message" class="text-gray-300 text-sm mb-5"></p>
        <button id="portal-alert-ok" class="btn-primary text-sm px-8 py-2.5 w-full">OK</button>
    </div>
</div>

<script src="<?php echo url('assets/js/portal.js'); ?>"></script>

<?php include __DIR__ . '/../includes/footer.php'; ?>
