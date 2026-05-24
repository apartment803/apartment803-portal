-- ============================================
-- APARTMENT 803 — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================

-- 1. CLIENTS table (one row per business client)
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  minute_limit INTEGER DEFAULT 300,
  minutes_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USERS table (one row per portal user — admin or client)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CLIENT PHONE NUMBERS (maps Retell phone numbers to clients)
CREATE TABLE client_phone_numbers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  phone_number TEXT NOT NULL UNIQUE,
  agent_name TEXT DEFAULT 'AI Agent',
  retell_agent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CALL LOGS (one row per call — populated by Retell webhook)
CREATE TABLE call_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  retell_call_id TEXT UNIQUE,
  direction TEXT DEFAULT 'inbound' CHECK (direction IN ('inbound', 'outbound')),
  caller_number TEXT,
  duration_seconds INTEGER DEFAULT 0,
  outcome TEXT DEFAULT 'completed',
  transcript TEXT,
  agent_name TEXT,
  call_analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

-- Admins can see everything
CREATE POLICY "Admins full access to clients" ON clients
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

CREATE POLICY "Admins full access to users" ON users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- Clients can only see their own data
CREATE POLICY "Clients see own record" ON clients
  FOR SELECT USING (
    id = (SELECT client_id FROM users WHERE users.id = auth.uid())
  );

CREATE POLICY "Users see own profile" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Clients see own phone numbers" ON client_phone_numbers
  FOR SELECT USING (
    client_id = (SELECT client_id FROM users WHERE users.id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Clients see own call logs" ON call_logs
  FOR SELECT USING (
    client_id = (SELECT client_id FROM users WHERE users.id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- CREATE YOUR ADMIN USER
-- After running this, go to Authentication → Users → Add User
-- Then run:
-- INSERT INTO users (id, email, role) VALUES ('<your-auth-user-id>', 'you@youremail.com', 'admin');
-- ============================================

-- Helper function to update minutes_used
CREATE OR REPLACE FUNCTION update_client_minutes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE clients
  SET minutes_used = (
    SELECT COALESCE(SUM(duration_seconds) / 60, 0)
    FROM call_logs
    WHERE client_id = NEW.client_id
    AND created_at >= date_trunc('month', NOW())
  )
  WHERE id = NEW.client_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_minutes_on_call
AFTER INSERT ON call_logs
FOR EACH ROW EXECUTE FUNCTION update_client_minutes();
