<?php
require_once __DIR__ . '/config/config.php';
$token = $_GET['token'] ?? '';
$embedded = isset($_GET['embedded']) && $_GET['embedded'] == '1';
$prefillName = trim($_GET['name'] ?? '');
$prefillEmail = trim($_GET['email'] ?? '');
?>
<?php if (!$embedded): ?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Abrir Chamado - BJGROUP</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="font-family:'Inter',sans-serif;background:#0d0d0d;color:#fff;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:16px;">
<?php endif; ?>

<style>
.ticket-wrap { width: 100%; max-width: 480px; background: #141414; border: 1px solid #2a2a2a; border-radius: 16px; padding: 32px; }
.step { display: none; }
.step.active { display: block; }
.cat-card { background: #1c1c1c; border: 1px solid #2a2a2a; border-radius: 12px; padding: 16px; cursor: pointer; transition: all .15s; text-align: center; }
.cat-card:hover { border-color: #555; background: #222; }
.cat-card.selected { border-color: #fff; background: #1c1c1c; }
.cat-card.selected .cat-icon { color: #fff; }
.cat-icon { font-size: 28px; margin-bottom: 8px; color: #888; }
.cat-label { font-size: 13px; font-weight: 600; color: #fff; }
.cat-desc { font-size: 11px; color: #888; margin-top: 4px; }
.t-input { width: 100%; background: #1c1c1c; border: 1px solid #2a2a2a; border-radius: 8px; padding: 10px 12px; color: #fff; font-size: 14px; outline: none; transition: border-color .15s; box-sizing: border-box; }
.t-input:focus { border-color: #555; }
.t-input::placeholder { color: #444; }
.t-label { display: block; font-size: 13px; font-weight: 500; color: #888; margin-bottom: 6px; }
.btn-primary { width: 100%; background: #fff; color: #000; font-weight: 700; font-size: 14px; padding: 11px; border-radius: 8px; border: none; cursor: pointer; transition: background .15s; }
.btn-primary:hover { background: #e0e0e0; }
.btn-primary:disabled { background: #333; color: #666; cursor: not-allowed; }
.btn-back { background: transparent; border: 1px solid #2a2a2a; color: #888; font-size: 13px; padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: all .15s; }
.btn-back:hover { border-color: #555; color: #fff; }
.step-dots { display: flex; gap: 6px; justify-content: center; margin-bottom: 24px; }
.dot { width: 6px; height: 6px; border-radius: 50%; background: #2a2a2a; transition: background .2s; }
.dot.active { background: #fff; }
.file-drop { border: 1px dashed #2a2a2a; border-radius: 8px; padding: 20px; text-align: center; cursor: pointer; transition: border-color .15s; }
.file-drop:hover { border-color: #555; }
.file-list { margin-top: 8px; display: flex; flex-direction: column; gap: 4px; }
.file-item { background: #1c1c1c; border: 1px solid #2a2a2a; border-radius: 6px; padding: 6px 10px; font-size: 12px; color: #888; display: flex; align-items: center; justify-content: space-between; }
.file-item button { background: none; border: none; color: #555; cursor: pointer; font-size: 14px; padding: 0; line-height: 1; }
.file-item button:hover { color: #fff; }
</style>

<?php if (!$token): ?>
<div class="ticket-wrap" style="text-align:center;padding:48px 32px;">
    <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
    <h2 style="color:#fff;font-size:18px;margin:0 0 8px;">Link inválido</h2>
    <p style="color:#888;font-size:14px;margin:0;">O link está incompleto ou incorreto.</p>
</div>
<?php else: ?>

<div class="ticket-wrap" id="ticket-wrap">
    <div style="text-align:center;margin-bottom:24px;">
        <img src="<?php echo url('img/logo-white.png'); ?>" alt="BJGROUP" style="height:36px;margin:0 auto 12px;display:block;" onerror="this.style.display='none'">
        <p style="font-size:13px;color:#888;margin:0;" id="board-name">Carregando...</p>
    </div>

    <div class="step-dots" id="step-dots">
        <div class="dot active" data-step="1"></div>
        <div class="dot" data-step="2"></div>
        <div class="dot" data-step="3"></div>
    </div>

    <!-- Passo 1: Categoria -->
    <div class="step active" id="step-1">
        <h3 style="font-size:16px;font-weight:600;color:#fff;margin:0 0 6px;">Qual é o assunto?</h3>
        <p style="font-size:13px;color:#888;margin:0 0 20px;">Escolha a categoria do seu chamado.</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;">
            <div class="cat-card" data-cat="Bug" onclick="selectCategory(this)">
                <div class="cat-icon">🐛</div>
                <div class="cat-label">Bug / Erro</div>
                <div class="cat-desc">Algo não está funcionando</div>
            </div>
            <div class="cat-card" data-cat="Nova Funcionalidade" onclick="selectCategory(this)">
                <div class="cat-icon">✨</div>
                <div class="cat-label">Nova Funcionalidade</div>
                <div class="cat-desc">Sugestão ou melhoria</div>
            </div>
            <div class="cat-card" data-cat="Acesso" onclick="selectCategory(this)">
                <div class="cat-icon">🔑</div>
                <div class="cat-label">Acesso</div>
                <div class="cat-desc">Problema de login ou permissão</div>
            </div>
            <div class="cat-card" data-cat="Solicitação Geral" onclick="selectCategory(this)">
                <div class="cat-icon">📋</div>
                <div class="cat-label">Solicitação Geral</div>
                <div class="cat-desc">Outros assuntos</div>
            </div>
        </div>
        <button class="btn-primary" id="btn-step1" disabled onclick="goToStep(2)">Continuar →</button>
    </div>

    <!-- Passo 2: Identificação -->
    <div class="step" id="step-2">
        <h3 style="font-size:16px;font-weight:600;color:#fff;margin:0 0 6px;">Quem está abrindo?</h3>
        <p style="font-size:13px;color:#888;margin:0 0 20px;">Informe seus dados para contato.</p>
        <div style="display:flex;flex-direction:column;gap:14px;margin-bottom:20px;">
            <div>
                <label class="t-label">Seu nome completo</label>
                <input type="text" id="inp-name" class="t-input" placeholder="João Silva" required>
            </div>
            <div>
                <label class="t-label">Seu e-mail</label>
                <input type="email" id="inp-email" class="t-input" placeholder="joao@empresa.com.br" required>
            </div>
        </div>
        <div style="display:flex;gap:8px;">
            <button class="btn-back" onclick="goToStep(1)">← Voltar</button>
            <button class="btn-primary" onclick="validateStep2()">Continuar →</button>
        </div>
    </div>

    <!-- Passo 3: Detalhes + Arquivos -->
    <div class="step" id="step-3">
        <h3 style="font-size:16px;font-weight:600;color:#fff;margin:0 0 6px;">Detalhes do chamado</h3>
        <p style="font-size:13px;color:#888;margin:0 0 20px;">Descreva o problema com o máximo de detalhes.</p>
        <div style="display:flex;flex-direction:column;gap:14px;margin-bottom:20px;">
            <div>
                <label class="t-label">Assunto (resumo em uma linha)</label>
                <input type="text" id="inp-title" class="t-input" placeholder="Ex: Botão de salvar não responde" required>
            </div>
            <div>
                <label class="t-label">Descrição detalhada</label>
                <textarea id="inp-desc" class="t-input" rows="4" placeholder="Descreva o que aconteceu, quando ocorre e como reproduzir..." required style="resize:vertical;"></textarea>
            </div>
            <div>
                <label class="t-label">Anexos (opcional — máx. 5 arquivos)</label>
                <div class="file-drop" id="file-drop" onclick="document.getElementById('inp-files').click()">
                    <svg style="width:24px;height:24px;color:#444;margin:0 auto 6px;display:block;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                    </svg>
                    <p style="font-size:12px;color:#555;margin:0;">Clique para anexar ou <kbd style="background:#2a2a2a;border:1px solid #404040;border-radius:4px;padding:1px 5px;font-size:11px;font-family:monospace;color:#888888;">Ctrl+V</kbd> para colar um print</p>
                </div>
                <input type="file" id="inp-files" multiple accept="image/*,.pdf" style="display:none;" onchange="handleFileSelect(this)">
                <div class="file-list" id="file-list"></div>
            </div>
        </div>
        <div style="display:flex;gap:8px;">
            <button class="btn-back" onclick="goToStep(2)">← Voltar</button>
            <button class="btn-primary" id="btn-submit" onclick="submitTicket()">Enviar Chamado</button>
        </div>
    </div>

    <!-- Passo 4: Sucesso -->
    <div class="step" id="step-success" style="text-align:center;padding:16px 0;">
        <div style="width:56px;height:56px;background:#1c1c1c;border:1px solid #2a2a2a;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
            <svg style="width:28px;height:28px;color:#fff;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
        </div>
        <h3 style="font-size:18px;font-weight:700;color:#fff;margin:0 0 8px;">Chamado enviado!</h3>
        <p style="font-size:14px;color:#888;margin:0 0 24px;">Nossa equipe recebeu sua solicitação e entrará em contato em breve.</p>
        <button class="btn-primary" style="max-width:200px;margin:0 auto;display:block;" onclick="resetForm()">Abrir outro chamado</button>
    </div>

    <!-- Erro de carregamento -->
    <div class="step" id="step-error" style="text-align:center;padding:16px 0;">
        <div style="font-size:40px;margin-bottom:12px;">⚠️</div>
        <h3 style="font-size:16px;font-weight:600;color:#fff;margin:0 0 8px;">Link inválido</h3>
        <p style="font-size:13px;color:#888;margin:0;" id="error-text">Este link de chamado não é válido ou expirou.</p>
    </div>
</div>

<script>
const API_URL = '<?php echo API_BASE_URL; ?>';
const TOKEN = '<?php echo htmlspecialchars($token, ENT_QUOTES); ?>';
const EMBEDDED = <?php echo $embedded ? 'true' : 'false'; ?>;
const PREFILL_NAME = '<?php echo htmlspecialchars($prefillName, ENT_QUOTES); ?>';
const PREFILL_EMAIL = '<?php echo htmlspecialchars($prefillEmail, ENT_QUOTES); ?>';
let selectedCategory = null;
let selectedFiles = [];

// Pre-fill identity fields if passed via URL
if (PREFILL_NAME) {
    document.getElementById('inp-name').value = PREFILL_NAME;
    document.getElementById('inp-name').readOnly = true;
    document.getElementById('inp-name').style.opacity = '0.6';
    document.getElementById('inp-name').style.cursor = 'default';
}
if (PREFILL_EMAIL) {
    document.getElementById('inp-email').value = PREFILL_EMAIL;
    document.getElementById('inp-email').readOnly = true;
    document.getElementById('inp-email').style.opacity = '0.6';
    document.getElementById('inp-email').style.cursor = 'default';
}

// Validate token on load
fetch(`${API_URL}/boards/public/${TOKEN}`)
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(data => {
        document.getElementById('board-name').textContent = data.name || 'BJGROUP Suporte';
    })
    .catch(() => {
        showStep('step-error');
        document.getElementById('step-dots').style.display = 'none';
    });

function selectCategory(el) {
    document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedCategory = el.dataset.cat;
    document.getElementById('btn-step1').disabled = false;
}

function goToStep(n) {
    // Skip step 2 if name and email are pre-filled
    if (n === 2 && PREFILL_NAME && PREFILL_EMAIL) { n = 3; }
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById('step-' + n).classList.add('active');
    document.querySelectorAll('.dot').forEach((d, i) => {
        d.classList.toggle('active', i < n);
    });
}

function showStep(id) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function validateStep2() {
    const name = document.getElementById('inp-name').value.trim();
    const email = document.getElementById('inp-email').value.trim();
    if (!name) { document.getElementById('inp-name').focus(); return; }
    if (!email || !email.includes('@')) { document.getElementById('inp-email').focus(); return; }
    goToStep(3);
}

function addFiles(files) {
    files.forEach(f => {
        if (selectedFiles.length < 5) selectedFiles.push(f);
    });
    renderFileList();
}

function handleFileSelect(input) {
    addFiles(Array.from(input.files));
    input.value = '';
}

function flashTicketDrop() {
    const drop = document.getElementById('file-drop');
    if (!drop) return;
    drop.style.borderColor = '#ffffff';
    drop.style.background = 'rgba(255,255,255,0.04)';
    setTimeout(() => { drop.style.borderColor = ''; drop.style.background = ''; }, 600);
}

document.addEventListener('paste', (e) => {
    const step3 = document.getElementById('step-3');
    if (!step3 || !step3.classList.contains('active')) return;
    const items = Array.from(e.clipboardData?.items || []);
    const imageFiles = items
        .filter(item => item.kind === 'file' && item.type.startsWith('image/'))
        .map(item => {
            const file = item.getAsFile();
            const name = `print-${Date.now()}.${file.type.split('/')[1] || 'png'}`;
            return new File([file], name, { type: file.type });
        });
    if (imageFiles.length === 0) return;
    e.preventDefault();
    addFiles(imageFiles);
    flashTicketDrop();
});

function removeFile(idx) {
    selectedFiles.splice(idx, 1);
    renderFileList();
}

function renderFileList() {
    const list = document.getElementById('file-list');
    list.innerHTML = selectedFiles.map((f, i) => `
        <div class="file-item">
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${f.name}</span>
            <button onclick="removeFile(${i})" title="Remover">×</button>
        </div>`).join('');
    document.getElementById('file-drop').style.display = selectedFiles.length >= 5 ? 'none' : '';
}

async function submitTicket() {
    const title = document.getElementById('inp-title').value.trim();
    const desc = document.getElementById('inp-desc').value.trim();
    const name = document.getElementById('inp-name').value.trim();
    const email = document.getElementById('inp-email').value.trim();

    if (!title || !desc) { return; }

    const btn = document.getElementById('btn-submit');
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    const fd = new FormData();
    fd.append('requesterName', name);
    fd.append('requesterEmail', email);
    fd.append('category', selectedCategory);
    fd.append('title', title);
    fd.append('description', desc);
    selectedFiles.forEach(f => fd.append('attachments', f));

    try {
        const res = await fetch(`${API_URL}/tasks/ticket/${TOKEN}`, { method: 'POST', body: fd });
        if (!res.ok) throw new Error();
        document.getElementById('step-dots').style.display = 'none';
        showStep('step-success');
        if (EMBEDDED) {
            setTimeout(() => window.parent.postMessage('ticket-submitted', '*'), 500);
        }
    } catch {
        alert('Erro ao enviar. Tente novamente.');
        btn.disabled = false;
        btn.textContent = 'Enviar Chamado';
    }
}

function resetForm() {
    selectedCategory = null;
    selectedFiles = [];
    document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('btn-step1').disabled = true;
    document.getElementById('inp-name').value = '';
    document.getElementById('inp-email').value = '';
    document.getElementById('inp-title').value = '';
    document.getElementById('inp-desc').value = '';
    document.getElementById('file-list').innerHTML = '';
    document.getElementById('file-drop').style.display = '';
    document.getElementById('step-dots').style.display = 'flex';
    goToStep(1);
}
</script>
<?php endif; ?>

<?php if (!$embedded): ?>
</body>
</html>
<?php endif; ?>
