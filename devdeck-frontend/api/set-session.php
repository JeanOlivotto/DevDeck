<?php

/**
 * API endpoint to set PHP session from JWT token
 * Called by frontend after successful login
 */

require_once __DIR__ . '/../config/config.php';
header('Content-Type: application/json');

// Permitir CORS se necessário (opcional, mas bom para evitar bloqueios)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$token = $input['token'] ?? null;
$email = $input['email'] ?? null;
$name = $input['name'] ?? null;

if (!$token) {
    http_response_code(400);
    echo json_encode(['error' => 'Token required']);
    exit;
}

// 1. Limpa qualquer sessão anterior para evitar conflito
session_unset();

// 2. Salva os dados novos
setAuthData($token, $email, $name);

// 3. Regenera o ID da sessão (segurança contra session fixation)
session_regenerate_id(true);

// 4. FORÇA a gravação da sessão no disco imediatamente
session_write_close();

http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Session set successfully',
    'debug_session_id' => session_id() // Apenas para debug se precisar
]);
