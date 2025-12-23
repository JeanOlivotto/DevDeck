<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><?php echo $pageTitle ?? APP_NAME; ?></title>
    <link rel="icon" type="image/png" href="<?php echo url('img/logo-DevDesck-removebg-preview.png'); ?>">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="<?php echo url('assets/css/style.css'); ?>">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Pusher JS SDK -->
    <script src="https://js.pusher.com/8.2.0/pusher.min.js"></script>
    
    <!-- JWT Decode -->
    <script src="https://cdn.jsdelivr.net/npm/jwt-decode@3.1.2/build/jwt-decode.min.js"></script>
    
    <script>
        const API_BASE_URL = '<?php echo API_BASE_URL; ?>';
        const WS_URL = '<?php echo WS_URL; ?>';
        const PUSHER_KEY = '<?php echo PUSHER_KEY; ?>';
        const PUSHER_CLUSTER = '<?php echo PUSHER_CLUSTER; ?>';
        const BASE_PATH = '<?php echo BASE_PATH; ?>';
    </script>
    
    <!-- Carregar main.js primeiro -->
    <script src="<?php echo url('assets/js/main.js'); ?>"></script>
</head>
<body class="min-h-screen p-4 sm:p-8 flex flex-col items-center">
