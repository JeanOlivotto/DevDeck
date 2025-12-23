<?php
// Configurações gerais do sistema
define('APP_NAME', 'DevDeck');
define('APP_VERSION', '2.0.0');

// Configurações da API
define('IS_LOCAL', in_array($_SERVER['HTTP_HOST'], ['localhost', '127.0.0.1', 'localhost:8000']));
define('API_BASE_URL', IS_LOCAL ? 'http://localhost:3000/api' : 'https://dev-deck-api.vercel.app/api');
define('WS_URL', IS_LOCAL ? 'http://localhost:3000' : 'https://dev-deck-api.vercel.app');

// Configurações Pusher
define('PUSHER_KEY', 'c4f7fea1d37fea1c1c73');
define('PUSHER_CLUSTER', 'us2');

// Configurações de sessão
define('SESSION_NAME', 'DEVDECK_SESSION');
define('TOKEN_KEY', 'devdeck_auth_token');

// Timezone
date_default_timezone_set('America/Sao_Paulo');

// Detectar base path automaticamente
$scriptPath = dirname($_SERVER['SCRIPT_NAME']);
$basePath = ($scriptPath === '/' || $scriptPath === '\\') ? '' : $scriptPath;
define('BASE_PATH', $basePath);

// Função helper para criar URLs corretas
function url($path) {
    $path = ltrim($path, '/');
    return BASE_PATH . '/' . $path;
}

// Iniciar sessão
if (session_status() === PHP_SESSION_NONE) {
    session_name(SESSION_NAME);
    session_start();
}

// Funções auxiliares
function isLoggedIn() {
    return isset($_SESSION['auth_token']) && !empty($_SESSION['auth_token']);
}

function getAuthToken() {
    return $_SESSION['auth_token'] ?? null;
}

function getUserEmail() {
    return $_SESSION['user_email'] ?? null;
}

function getUserName() {
    return $_SESSION['user_name'] ?? null;
}

function setAuthData($token, $email, $name) {
    $_SESSION['auth_token'] = $token;
    $_SESSION['user_email'] = $email;
    $_SESSION['user_name'] = $name;
}

function clearAuthData() {
    unset($_SESSION['auth_token']);
    unset($_SESSION['user_email']);
    unset($_SESSION['user_name']);
    session_destroy();
}

function redirect($path) {
    header("Location: $path");
    exit;
}

function apiRequest($endpoint, $method = 'GET', $data = null, $requireAuth = true) {
    $url = API_BASE_URL . $endpoint;
    $headers = ['Content-Type: application/json'];
    
    if ($requireAuth && isLoggedIn()) {
        $headers[] = 'Authorization: Bearer ' . getAuthToken();
    }
    
    $options = [
        'http' => [
            'method' => $method,
            'header' => implode("\r\n", $headers),
            'content' => $data ? json_encode($data) : null,
            'ignore_errors' => true
        ]
    ];
    
    $context = stream_context_create($options);
    $response = file_get_contents($url, false, $context);
    
    $httpCode = 200;
    if (isset($http_response_header)) {
        preg_match('/HTTP\/\d\.\d\s+(\d+)/', $http_response_header[0], $matches);
        $httpCode = intval($matches[1] ?? 200);
    }
    
    return [
        'code' => $httpCode,
        'data' => json_decode($response, true)
    ];
}
