// Testes Manuais - DevDeck Frontend Convites e Grupos
// Execute no console (F12) do navegador para testar

console.log('🧪 Iniciando Testes Manuais do DevDeck Frontend\n');

// ============================================================================
// 1. TESTES DE CONVITES
// ============================================================================
console.log('📋 1. TESTES DE CONVITES\n');

// 1.1 Carregar convites pendentes
async function test_loadPendingInvites() {
    console.log('✓ Testando: loadPendingInvites()');
    try {
        const invites = await loadPendingInvites();
        console.log('  Resultado:', invites);
        console.log('  Convites carregados:', invites.length);
        return invites;
    } catch (error) {
        console.error('  ❌ Erro:', error.message);
        return null;
    }
}

// 1.2 Verificar atualização de UI
function test_updateInvitesDisplay() {
    console.log('✓ Testando: updateInvitesDisplay()');
    try {
        updateInvitesDisplay();
        const badge = document.getElementById('invites-badge');
        const container = document.getElementById('pending-invites-container');
        console.log('  Badge encontrado:', badge !== null);
        console.log('  Container encontrado:', container !== null);
        console.log('  Badge visível:', !badge?.classList.contains('hidden'));
        console.log('  Número de convites:', pendingInvites.length);
        return true;
    } catch (error) {
        console.error('  ❌ Erro:', error.message);
        return false;
    }
}

// 1.3 Verificar estado de convites
function test_checkInvitesState() {
    console.log('✓ Testando: Estado de convites');
    console.log('  pendingInvites:', pendingInvites);
    console.log('  Total de convites:', pendingInvites.length);
    return pendingInvites;
}

// ============================================================================
// 2. TESTES DE GRUPOS
// ============================================================================
console.log('\n👥 2. TESTES DE GRUPOS\n');

// 2.1 Carregar grupos
async function test_loadGroups() {
    console.log('✓ Testando: loadGroups()');
    try {
        const groups = await loadGroups();
        console.log('  Resultado:', groups);
        console.log('  Total de grupos:', groups.length);
        return groups;
    } catch (error) {
        console.error('  ❌ Erro:', error.message);
        return null;
    }
}

// 2.2 Verificar estado de grupos
function test_checkGroupsState() {
    console.log('✓ Testando: Estado de grupos');
    console.log('  allGroups:', allGroups);
    console.log('  Total de grupos:', allGroups.length);
    allGroups.forEach((group, index) => {
        console.log(`  [${index}] ID: ${group.id}, Nome: ${group.name}`);
    });
    return allGroups;
}

// 2.3 Obter detalhes de um grupo
async function test_getGroupDetails(groupId = 1) {
    console.log(`✓ Testando: getGroupDetails(${groupId})`);
    try {
        const group = await getGroupDetails(groupId);
        console.log('  Resultado:', group);
        return group;
    } catch (error) {
        console.error('  ❌ Erro:', error.message);
        return null;
    }
}

// 2.4 Listar membros de um grupo
async function test_getGroupMembers(groupId = 1) {
    console.log(`✓ Testando: getGroupMembers(${groupId})`);
    try {
        const members = await getGroupMembers(groupId);
        console.log('  Resultado:', members);
        console.log('  Total de membros:', members.length);
        return members;
    } catch (error) {
        console.error('  ❌ Erro:', error.message);
        return null;
    }
}

// ============================================================================
// 3. TESTES DE MODAIS
// ============================================================================
console.log('\n🎨 3. TESTES DE MODAIS\n');

// 3.1 Verificar elementos de modais
function test_checkModalElements() {
    console.log('✓ Testando: Elementos de modais');
    
    const modals = {
        groupModal: document.getElementById('group-modal'),
        inviteMemberModal: document.getElementById('invite-member-modal'),
        groupMembersModal: document.getElementById('group-members-modal')
    };
    
    Object.entries(modals).forEach(([name, element]) => {
        console.log(`  ${name}: ${element !== null ? '✓' : '❌'}`);
    });
    
    return Object.values(modals).every(m => m !== null);
}

// 3.2 Abrir modal de grupo
function test_openGroupModal(groupId = null) {
    console.log(`✓ Testando: openGroupModal(${groupId})`);
    try {
        openGroupModal(groupId);
        const modal = document.getElementById('group-modal');
        console.log('  Modal aberto:', !modal.classList.contains('hidden'));
        return true;
    } catch (error) {
        console.error('  ❌ Erro:', error.message);
        return false;
    }
}

// 3.3 Fechar modal de grupo
function test_closeGroupModal() {
    console.log('✓ Testando: closeGroupModal()');
    try {
        closeGroupModal();
        const modal = document.getElementById('group-modal');
        console.log('  Modal fechado:', modal.classList.contains('hidden'));
        return true;
    } catch (error) {
        console.error('  ❌ Erro:', error.message);
        return false;
    }
}

// 3.4 Abrir modal de convidar membro
function test_openInviteMemberModal(groupId = 1) {
    console.log(`✓ Testando: openInviteMemberModal(${groupId})`);
    try {
        openInviteMemberModal(groupId);
        const modal = document.getElementById('invite-member-modal');
        console.log('  Modal aberto:', !modal.classList.contains('hidden'));
        return true;
    } catch (error) {
        console.error('  ❌ Erro:', error.message);
        return false;
    }
}

// ============================================================================
// 4. TESTES DE API
// ============================================================================
console.log('\n🔌 4. TESTES DE API\n');

// 4.1 Testar chamada à API de convites
async function test_api_invites() {
    console.log('✓ Testando: API /groups/invites/pending');
    try {
        const response = await DevDeck.fetchApi('/groups/invites/pending');
        console.log('  Status: ✓ Conectado');
        console.log('  Resposta:', response);
        return response;
    } catch (error) {
        console.error('  ❌ Erro:', error.message);
        return null;
    }
}

// 4.2 Testar chamada à API de grupos
async function test_api_groups() {
    console.log('✓ Testando: API /groups');
    try {
        const response = await DevDeck.fetchApi('/groups');
        console.log('  Status: ✓ Conectado');
        console.log('  Total de grupos:', response.length);
        return response;
    } catch (error) {
        console.error('  ❌ Erro:', error.message);
        return null;
    }
}

// ============================================================================
// 5. TESTES DE VALIDAÇÃO
// ============================================================================
console.log('\n✅ 5. TESTES DE VALIDAÇÃO\n');

// 5.1 Validar estrutura de convites
function test_validate_invites_structure() {
    console.log('✓ Testando: Estrutura de convites');
    if (pendingInvites.length === 0) {
        console.log('  ⚠️ Sem convites para validar');
        return true;
    }
    
    const invite = pendingInvites[0];
    const required = ['id', 'groupId', 'userId', 'group', 'user'];
    const valid = required.every(field => field in invite);
    
    console.log('  Campos requeridos:', required);
    console.log('  Validação:', valid ? '✓' : '❌');
    
    return valid;
}

// 5.2 Validar estrutura de grupos
function test_validate_groups_structure() {
    console.log('✓ Testando: Estrutura de grupos');
    if (allGroups.length === 0) {
        console.log('  ⚠️ Sem grupos para validar');
        return true;
    }
    
    const group = allGroups[0];
    const required = ['id', 'name', 'createdBy', 'owner'];
    const valid = required.every(field => field in group);
    
    console.log('  Campos requeridos:', required);
    console.log('  Validação:', valid ? '✓' : '❌');
    
    return valid;
}

// ============================================================================
// 6. TESTES DE SEGURANÇA
// ============================================================================
console.log('\n🔐 6. TESTES DE SEGURANÇA\n');

// 6.1 Verificar autenticação
function test_check_authentication() {
    console.log('✓ Testando: Autenticação');
    const token = localStorage.getItem('devdeck_auth_token');
    console.log('  Token JWT existente:', token !== null);
    console.log('  Token válido:', token && token.length > 20);
    
    if (token) {
        try {
            const decoded = jwt_decode(token);
            console.log('  Decodificado:', decoded);
            console.log('  User ID:', decoded.sub || decoded.userId);
        } catch (e) {
            console.log('  ⚠️ Não foi possível decodificar');
        }
    }
    
    return token !== null;
}

// 6.2 Verificar XSS prevention
function test_check_xss_prevention() {
    console.log('✓ Testando: XSS Prevention');
    const testString = '<script>alert("XSS")</script>';
    const escaped = escapeHtml(testString);
    const safe = !escaped.includes('<script>');
    
    console.log('  String de teste:', testString);
    console.log('  Escapada:', escaped);
    console.log('  Segura:', safe ? '✓' : '❌');
    
    return safe;
}

// ============================================================================
// 7. SUITE DE TESTES RÁPIDOS
// ============================================================================

async function runAllTests() {
    console.clear();
    console.log('🧪 EXECUTANDO SUITE COMPLETA DE TESTES\n');
    console.log('='.repeat(50) + '\n');
    
    const results = {
        convites: {},
        grupos: {},
        modais: {},
        api: {},
        validacao: {},
        seguranca: {}
    };
    
    // Convites
    console.log('📋 CONVITES');
    results.convites.load = await test_loadPendingInvites() !== null;
    results.convites.updateUI = test_updateInvitesDisplay();
    results.convites.state = test_checkInvitesState() !== null;
    
    // Grupos
    console.log('\n👥 GRUPOS');
    results.grupos.load = await test_loadGroups() !== null;
    results.grupos.state = test_checkGroupsState() !== null;
    
    // Modais
    console.log('\n🎨 MODAIS');
    results.modais.elements = test_checkModalElements();
    results.modais.openClose = test_openGroupModal() && test_closeGroupModal();
    
    // API
    console.log('\n🔌 API');
    results.api.invites = await test_api_invites() !== null;
    results.api.groups = await test_api_groups() !== null;
    
    // Validação
    console.log('\n✅ VALIDAÇÃO');
    results.validacao.invites = test_validate_invites_structure();
    results.validacao.groups = test_validate_groups_structure();
    
    // Segurança
    console.log('\n🔐 SEGURANÇA');
    results.seguranca.auth = test_check_authentication();
    results.seguranca.xss = test_check_xss_prevention();
    
    // Resumo
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMO DOS TESTES\n');
    
    let totalTests = 0;
    let passedTests = 0;
    
    Object.entries(results).forEach(([category, tests]) => {
        const passed = Object.values(tests).filter(v => v).length;
        const total = Object.values(tests).length;
        totalTests += total;
        passedTests += passed;
        
        const emoji = passed === total ? '✅' : '⚠️';
        console.log(`${emoji} ${category.toUpperCase()}: ${passed}/${total} testes passaram`);
    });
    
    console.log(`\n${passedTests === totalTests ? '✅' : '⚠️'} TOTAL: ${passedTests}/${totalTests} testes passaram\n`);
    
    return results;
}

// ============================================================================
// 8. GUIA DE COMANDOS
// ============================================================================

console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                    🧪 GUIA DE TESTES MANUAIS                              ║
╚════════════════════════════════════════════════════════════════════════════╝

COMANDOS RÁPIDOS NO CONSOLE:

1️⃣ TESTAR TUDO:
   runAllTests()

2️⃣ TESTES DE CONVITES:
   await test_loadPendingInvites()
   test_updateInvitesDisplay()
   test_checkInvitesState()

3️⃣ TESTES DE GRUPOS:
   await test_loadGroups()
   test_checkGroupsState()
   await test_getGroupDetails(1)
   await test_getGroupMembers(1)

4️⃣ TESTES DE MODAIS:
   test_checkModalElements()
   test_openGroupModal()
   test_closeGroupModal()
   test_openInviteMemberModal(1)

5️⃣ TESTES DE API:
   await test_api_invites()
   await test_api_groups()

6️⃣ TESTES DE VALIDAÇÃO:
   test_validate_invites_structure()
   test_validate_groups_structure()

7️⃣ TESTES DE SEGURANÇA:
   test_check_authentication()
   test_check_xss_prevention()

8️⃣ ESTADOS GLOBAIS:
   console.log(pendingInvites)
   console.log(allGroups)
   console.log(groupModalState)

9️⃣ FUNÇÕES ÚTEIS:
   // Recarregar tudo
   await loadPendingInvites();
   await loadGroups();
   
   // Abrir um modal
   openGroupModal()        // Criar grupo
   openGroupModal(1)       // Editar grupo 1
   openInviteMemberModal(1) // Convidar membro ao grupo 1
   openGroupMembersModal(1) // Ver membros do grupo 1

🔟 REQUISIÇÕES DIRETAS:
   // Ver convites
   const invites = await DevDeck.fetchApi('/groups/invites/pending');
   
   // Ver grupos
   const groups = await DevDeck.fetchApi('/groups');
   
   // Ver membros
   const members = await DevDeck.fetchApi('/groups/1/members');

DICAS:
- Use F12 para abrir DevTools
- Use Ctrl+Shift+J para abrir Console
- Ctrl+L para limpar console
- Use copy(obj) para copiar objeto
- Use table(array) para ver array em tabela

═════════════════════════════════════════════════════════════════════════════
`);

// Expor globalmente
window.test_loadPendingInvites = test_loadPendingInvites;
window.test_updateInvitesDisplay = test_updateInvitesDisplay;
window.test_checkInvitesState = test_checkInvitesState;
window.test_loadGroups = test_loadGroups;
window.test_checkGroupsState = test_checkGroupsState;
window.test_getGroupDetails = test_getGroupDetails;
window.test_getGroupMembers = test_getGroupMembers;
window.test_checkModalElements = test_checkModalElements;
window.test_openGroupModal = test_openGroupModal;
window.test_closeGroupModal = test_closeGroupModal;
window.test_openInviteMemberModal = test_openInviteMemberModal;
window.test_api_invites = test_api_invites;
window.test_api_groups = test_api_groups;
window.test_validate_invites_structure = test_validate_invites_structure;
window.test_validate_groups_structure = test_validate_groups_structure;
window.test_check_authentication = test_check_authentication;
window.test_check_xss_prevention = test_check_xss_prevention;
window.runAllTests = runAllTests;
