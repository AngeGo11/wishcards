-- Schéma PostgreSQL pour Supabase
-- Exécuter dans : Supabase Dashboard → SQL Editor → New query

CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  signature VARCHAR(200),
  photo_url TEXT,
  emoji VARCHAR(10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_hash VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at DESC);

CREATE TABLE IF NOT EXISTS rate_limits (
  id BIGSERIAL PRIMARY KEY,
  ip_hash VARCHAR(64) NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  submission_count INT NOT NULL DEFAULT 1,
  UNIQUE (ip_hash, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits (window_start);

-- Activer Row Level Security (optionnel — l'app utilise la connexion serveur)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Politique lecture publique des messages (via service role côté serveur uniquement)
CREATE POLICY "Service role full access messages"
  ON messages FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access rate_limits"
  ON rate_limits FOR ALL
  USING (true)
  WITH CHECK (true);
