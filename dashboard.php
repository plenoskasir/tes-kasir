<?php
// ═══════════════════════════════════════════════════════════
// dashboard.php — Backend Cek Session Abunawas Kasir
// Endpoint: GET /dashboard.php
// Respons JSON: { valid: bool, user: {...} | null }
// ═══════════════════════════════════════════════════════════

declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

// ── Mulai session ──
session_start();

// ── Helper ──
function jsonOut(array $data, int $code = 200): never
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// ── Cek keberadaan session ──
if (empty($_SESSION['user_id']) || empty($_SESSION['login_at'])) {
    jsonOut(['valid' => false, 'user' => null]);
}

// ── Cek expired (12 jam) ──
$maxAge = 12 * 60 * 60; // detik
if ((time() - $_SESSION['login_at']) > $maxAge) {
    session_unset();
    session_destroy();
    jsonOut(['valid' => false, 'user' => null]);
}

// ── Perpanjang session ──
$_SESSION['login_at'] = time();

// ── Session valid ──
jsonOut([
    'valid' => true,
    'user'  => [
        'id'       => $_SESSION['user_id'],
        'username' => $_SESSION['username'],
        'name'     => $_SESSION['name'],
        'role'     => $_SESSION['role'],
        'avatar'   => $_SESSION['avatar'],
    ],
]);
