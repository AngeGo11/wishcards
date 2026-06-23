-- Schéma MySQL pour le Livre d'Or de Départ à la Retraite
-- Compatible : PlanetScale, Railway, Aiven, hébergement MySQL classique

CREATE TABLE IF NOT EXISTS messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  signature VARCHAR(200) NULL,
  photo_url MEDIUMTEXT NULL,
  emoji VARCHAR(10) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_hash VARCHAR(64) NULL,
  INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rate_limits (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ip_hash VARCHAR(64) NOT NULL,
  window_start TIMESTAMP NOT NULL,
  submission_count INT UNSIGNED NOT NULL DEFAULT 1,
  UNIQUE KEY uk_ip_window (ip_hash, window_start),
  INDEX idx_window (window_start)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
