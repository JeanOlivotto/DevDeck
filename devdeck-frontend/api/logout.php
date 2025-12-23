<?php
/**
 * Script para processar logout via POST
 * Pode ser usado como endpoint ou incluído em páginas
 */

require_once __DIR__ . '/config/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'logout') {
    clearAuthData();
    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'message' => 'Logout realizado com sucesso']);
    exit;
}

// Se acessado diretamente via GET, redirecionar para index
clearAuthData();
redirect('/index.php');
