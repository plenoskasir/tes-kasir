<?php
// ═══════════════════════════════════════════════════════════
// config.php — Konfigurasi Abunawas Kasir
//
// ⚠️  FILE INI BERISI DATA SENSITIF.
//     PASTIKAN sudah masuk .gitignore sebelum commit!
// ═══════════════════════════════════════════════════════════

declare(strict_types=1);

// ── Database ──
define('DB_HOST', 'localhost');
define('DB_NAME', 'abunawas_kasir');   // Nama database MySQL Anda
define('DB_USER', 'root');             // User MySQL (ganti sesuai server)
define('DB_PASS', '');                 // Password MySQL

// ── Aplikasi ──
define('APP_NAME',    'Abunawas Percetakan & Konveksi');
define('APP_VERSION', '2.0.0');
define('APP_ENV',     'production');   // 'development' | 'production'

// ── Session ──
define('SESSION_NAME',     'kasir_sess');
define('SESSION_LIFETIME', 43200); // 12 jam (detik)

// ── Keamanan ──
define('BCRYPT_COST', 12); // Cost factor untuk password_hash

// ── Timezone ──
date_default_timezone_set('Asia/Makassar'); // WIB: Asia/Jakarta | WITA: Asia/Makassar | WIT: Asia/Jayapura

// ── Error Reporting (non-production: E_ALL, production: 0) ──
if (APP_ENV === 'development') {
    ini_set('display_errors', '1');
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', '0');
    error_reporting(0);
}

// ── Session Config ──
ini_set('session.name',             SESSION_NAME);
ini_set('session.gc_maxlifetime',   (string) SESSION_LIFETIME);
ini_set('session.cookie_lifetime',  (string) SESSION_LIFETIME);
ini_set('session.cookie_httponly',  '1');
ini_set('session.cookie_samesite',  'Strict');
// ini_set('session.cookie_secure', '1'); // Aktifkan jika sudah HTTPS

// ─────────────────────────────────────────
// SQL Pembuatan Tabel (jalankan sekali saat setup)
// ─────────────────────────────────────────
/*
CREATE TABLE IF NOT EXISTS `users` (
  `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `username`      VARCHAR(50)     NOT NULL UNIQUE,
  `password_hash` VARCHAR(255)    NOT NULL,
  `name`          VARCHAR(100)    NOT NULL,
  `role`          ENUM('boss','admin','kasir') NOT NULL DEFAULT 'kasir',
  `avatar`        VARCHAR(10)     DEFAULT NULL,
  `is_active`     TINYINT(1)      NOT NULL DEFAULT 1,
  `last_login`    DATETIME        DEFAULT NULL,
  `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Akun Boss default (password: 1234)
INSERT INTO `users` (`username`, `password_hash`, `name`, `role`, `avatar`) VALUES
  ('boss',  '$2y$12$...hashnya...', 'Boss Owner',  'boss',  'BO'),
  ('admin', '$2y$12$...hashnya...', 'Admin Toko',  'admin', 'AD'),
  ('kasir', '$2y$12$...hashnya...', 'Kasir Toko',  'kasir', 'KS');

-- Generate hash dengan: echo password_hash('1234', PASSWORD_BCRYPT, ['cost' => 12]);
*/
