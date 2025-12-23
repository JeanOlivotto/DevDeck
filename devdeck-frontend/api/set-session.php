<?php
/**
 * API endpoint to set PHP session from JWT token
 * Called by frontend after successful login
 */

require_once __DIR__ . '/../config/config.php';
header('Content-Type: application/json');

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

// Store in PHP session
setAuthData($token, $email, $name);

http_response_code(200);
echo json_encode(['success' => true, 'message' => 'Session set']);
