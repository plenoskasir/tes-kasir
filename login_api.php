<?php
// ═══════════════════════════════════════════════════════════
// login_api.php — Backend Login Abunawas Kasir
// ═══════════════════════════════════════════════════════════

declare(strict_types=1);

// ── CORS & Header ──
header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');

// Izinkan request dari origin yang sama saja (sesuaikan jika deploy)
$allowed_origins = ['http://localhost', 'http://127.0.0.1'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins, true)) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Hanya izinkan POST ──
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed.', null, 405);
}

// ── Load Konfigurasi ──
require_once __DIR__ . '/config.php';

// ── Baca Body JSON ──
$body = file_get_contents('php://input');
$data = json_decode($body, true);

if (!$data) {
    jsonResponse(false, 'Request tidak valid.', null, 400);
}

$username = trim(strtolower($data['username'] ?? ''));
$password = $data['password'] ?? '';

if ($username === '' || $password === '') {
    jsonResponse(false, 'Username dan password wajib diisi.', null, 400);
}

// ── Koneksi Database ──
try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
} catch (PDOException $e) {
    // Log error server-side, jangan expose ke client
    error_log('[Kasir DB Error] ' . $e->getMessage());
    jsonResponse(false, 'Gagal terhubung ke database.', null, 500);
}

// ── Query User ──
$stmt = $pdo->prepare(
    'SELECT id, username, password_hash, name, role, avatar, is_active
     FROM users
     WHERE username = ?
     LIMIT 1'
);
$stmt->execute([$username]);
$user = $stmt->fetch();

// ── Verifikasi ──
if (!$user) {
    // Delay sedikit untuk mencegah brute force timing
    usleep(300_000);
    jsonResponse(false, 'Username atau password salah.');
}

if (!$user['is_active']) {
    jsonResponse(false, 'Akun dinonaktifkan. Hubungi admin.');
}

if (!password_verify($password, $user['password_hash'])) {
    usleep(300_000);
    jsonResponse(false, 'Username atau password salah.');
}

// ── Buat Session PHP ──
session_start();
session_regenerate_id(true); // Cegah session fixation

$_SESSION['user_id']  = $user['id'];
$_SESSION['username'] = $user['username'];
$_SESSION['name']     = $user['name'];
$_SESSION['role']     = $user['role'];
$_SESSION['avatar']   = $user['avatar'] ?: strtoupper(substr($user['username'], 0, 2));
$_SESSION['login_at'] = time();

// ── Update last_login di DB ──
try {
    $pdo->prepare('UPDATE users SET last_login = NOW() WHERE id = ?')
        ->execute([$user['id']]);
} catch (PDOException $e) {
    error_log('[Kasir DB Warning] last_login update: ' . $e->getMessage());
}

// ── Respons Sukses ──
jsonResponse(true, 'Login berhasil.', [
    'username' => $user['username'],
    'name'     => $user['name'],
    'role'     => $user['role'],
    'avatar'   => $_SESSION['avatar'],
]);


// ────────────────────────────────────────────
// Helper
// ────────────────────────────────────────────
function jsonResponse(bool $success, string $message, ?array $user = null, int $code = 200): never
{
    http_response_code($code);
    $payload = ['success' => $success, 'message' => $message];
    if ($user !== null) $payload['user'] = $user;
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}
