<?php
// ═══════════════════════════════════════════════════════════
// logout.php — Backend Logout Abunawas Kasir
// Mendukung: GET (redirect) dan POST (JSON API)
// ═══════════════════════════════════════════════════════════

declare(strict_types=1);

session_start();

// ── Simpan nama untuk audit sebelum destroy ──
$userName = $_SESSION['name']     ?? 'Tidak diketahui';
$userRole = $_SESSION['role']     ?? '-';
$userId   = $_SESSION['user_id']  ?? null;

// ── Hancurkan session sepenuhnya ──
$_SESSION = [];

if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        [
            'expires'  => time() - 42000,
            'path'     => $params['path'],
            'domain'   => $params['domain'],
            'secure'   => $params['secure'],
            'httponly' => $params['httponly'],
            'samesite' => 'Strict',
        ]
    );
}

session_destroy();

// ── Tentukan respons berdasarkan Accept header / method ──
$wantsJson = (
    $_SERVER['REQUEST_METHOD'] === 'POST'
    || str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json')
);

if ($wantsJson) {
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode([
        'success' => true,
        'message' => 'Logout berhasil.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// ── Redirect ke halaman login ──
header('Location: index.html');
exit;
