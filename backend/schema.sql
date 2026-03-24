-- ============================================================
--  PsychoFlow — Supabase PostgreSQL Schema
--  Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ── 1. USERS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name  TEXT        NOT NULL,
  email      TEXT        UNIQUE NOT NULL,
  role       TEXT        NOT NULL CHECK (role IN ('donor', 'receiver')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 1. DONORS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS donors (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  amount     NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  date       DATE        NOT NULL DEFAULT CURRENT_DATE,
  note       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. RECIPIENTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recipients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT         NOT NULL,
  amount_received NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (amount_received >= 0),
  date            DATE         NOT NULL DEFAULT CURRENT_DATE,
  note            TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. ALLOCATIONS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS allocations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id     UUID REFERENCES donors(id)     ON DELETE CASCADE,
  recipient_id UUID REFERENCES recipients(id) ON DELETE CASCADE,
  amount       NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  date         DATE          NOT NULL DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes for faster lookups ────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_allocations_donor     ON allocations(donor_id);
CREATE INDEX IF NOT EXISTS idx_allocations_recipient ON allocations(recipient_id);
CREATE INDEX IF NOT EXISTS idx_donors_date           ON donors(date DESC);
CREATE INDEX IF NOT EXISTS idx_recipients_date       ON recipients(date DESC);

-- ── Row-Level Security (enable after testing if needed) ───────
-- ALTER TABLE donors      ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE recipients  ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;

-- ── Optional: seed data for testing ──────────────────────────
-- INSERT INTO donors(name,amount,date,note)
-- VALUES ('Anonymous',50,'2026-03-10','First donation'),
--        ('John K.',15,'2026-03-14',NULL);

-- INSERT INTO recipients(name,amount_received,date,note)
-- VALUES ('Sarah',50,'2026-03-10','Rural Kenya — hygiene support'),
--        ('Aisha',0,'2026-03-11','Nigeria — education');

-- INSERT INTO allocations(donor_id,recipient_id,amount,date)
-- SELECT d.id, r.id, 50, '2026-03-10'
-- FROM donors d, recipients r
-- WHERE d.name='Anonymous' AND r.name='Sarah';