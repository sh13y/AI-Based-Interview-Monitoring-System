-- ============================================================
-- Modern Matrix AI Interview Monitoring System - Supabase Migration & Seed Data
-- ============================================================

-- 1. USERS TABLE (Auth & RBAC FR-01, FR-02)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  user_id_field VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'HR_Manager' CHECK (role IN ('Admin', 'HR_Manager')),
  profile_picture_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. CANDIDATES TABLE (Stores Candidate Profile & CV / Resume Data)
CREATE TABLE IF NOT EXISTS public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  position VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending Review' CHECK (status IN ('Evaluated', 'In Progress', 'Pending Review', 'Rejected')),
  date_registered DATE DEFAULT CURRENT_DATE NOT NULL,
  score INTEGER DEFAULT 0,
  notes TEXT,
  resume_url TEXT,
  resume_name VARCHAR(255),
  resume_size_kb INTEGER,
  keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure columns exist if table already created in prior migration
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS resume_url TEXT;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS resume_name VARCHAR(255);
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS resume_size_kb INTEGER;

-- 3. QUESTION BANK TABLE (FR-04 Question Bank Management)
CREATE TABLE IF NOT EXISTS public.question_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  difficulty VARCHAR(20) DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  keywords TEXT[],
  ai_scoring_enabled BOOLEAN DEFAULT TRUE,
  weights JSONB DEFAULT '{"honesty": 50, "attitude": 50, "confidence": 50, "relevance": 50}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. INTERVIEW SESSIONS TABLE (FR-06, FR-08, FR-09, FR-10 - Stores Audio Metadata & WAV Stream)
CREATE TABLE IF NOT EXISTS public.interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  session_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  duration_seconds INTEGER DEFAULT 0,
  questions_answered INTEGER DEFAULT 0,
  questions_total INTEGER DEFAULT 5,
  noise_level_db INTEGER DEFAULT 45,
  validation_status BOOLEAN DEFAULT TRUE,
  status VARCHAR(50) DEFAULT 'Pending Review',
  position VARCHAR(100),
  round VARCHAR(50) DEFAULT 'Round 1',
  audio_url TEXT,
  audio_format VARCHAR(50) DEFAULT 'WAV_16KHZ_PCM',
  audio_size_kb INTEGER,
  sample_rate INTEGER DEFAULT 16000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure audio columns exist if table already created
ALTER TABLE public.interview_sessions ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE public.interview_sessions ADD COLUMN IF NOT EXISTS audio_format VARCHAR(50) DEFAULT 'WAV_16KHZ_PCM';
ALTER TABLE public.interview_sessions ADD COLUMN IF NOT EXISTS audio_size_kb INTEGER;
ALTER TABLE public.interview_sessions ADD COLUMN IF NOT EXISTS sample_rate INTEGER DEFAULT 16000;

-- 5. BEHAVIORAL SCORES TABLE (AI Synthesis Metrics)
CREATE TABLE IF NOT EXISTS public.behavioral_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  honesty_score DECIMAL(5,2) NOT NULL,
  attitude_score DECIMAL(5,2) NOT NULL,
  confidence_score DECIMAL(5,2) NOT NULL,
  relevance_score DECIMAL(5,2) NOT NULL,
  overall_score DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TRANSCRIPTS TABLE (FR-12 OpenAI Whisper Speech-to-Text)
CREATE TABLE IF NOT EXISTS public.transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  wer_score DECIMAL(5,2) DEFAULT 5.06,
  cer_score DECIMAL(5,2) DEFAULT 3.10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.transcripts ADD COLUMN IF NOT EXISTS wer_score DECIMAL(5,2) DEFAULT 5.06;
ALTER TABLE public.transcripts ADD COLUMN IF NOT EXISTS cer_score DECIMAL(5,2) DEFAULT 3.10;

-- 7. AUDIT LOGS TABLE (FR-21 System Audit Logging)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  user_email VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id VARCHAR(255),
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavioral_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Permissive Row Level Security Policies for Application CRUD
DROP POLICY IF EXISTS "Public read candidates" ON public.candidates;
DROP POLICY IF EXISTS "Public insert candidates" ON public.candidates;
DROP POLICY IF EXISTS "Public update candidates" ON public.candidates;
DROP POLICY IF EXISTS "Public delete candidates" ON public.candidates;
DROP POLICY IF EXISTS "Public read question_bank" ON public.question_bank;
DROP POLICY IF EXISTS "Public insert question_bank" ON public.question_bank;
DROP POLICY IF EXISTS "Public update question_bank" ON public.question_bank;
DROP POLICY IF EXISTS "Public delete question_bank" ON public.question_bank;
DROP POLICY IF EXISTS "Public read interview_sessions" ON public.interview_sessions;
DROP POLICY IF EXISTS "Public insert interview_sessions" ON public.interview_sessions;
DROP POLICY IF EXISTS "Public update interview_sessions" ON public.interview_sessions;
DROP POLICY IF EXISTS "Public read behavioral_scores" ON public.behavioral_scores;
DROP POLICY IF EXISTS "Public insert behavioral_scores" ON public.behavioral_scores;
DROP POLICY IF EXISTS "Public read transcripts" ON public.transcripts;
DROP POLICY IF EXISTS "Public insert transcripts" ON public.transcripts;
DROP POLICY IF EXISTS "Public read users" ON public.users;
DROP POLICY IF EXISTS "Public insert users" ON public.users;
DROP POLICY IF EXISTS "Public update users" ON public.users;
DROP POLICY IF EXISTS "Public read audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Public insert audit_logs" ON public.audit_logs;

CREATE POLICY "Public read candidates" ON public.candidates FOR SELECT USING (true);
CREATE POLICY "Public insert candidates" ON public.candidates FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update candidates" ON public.candidates FOR UPDATE USING (true);
CREATE POLICY "Public delete candidates" ON public.candidates FOR DELETE USING (true);

CREATE POLICY "Public read question_bank" ON public.question_bank FOR SELECT USING (true);
CREATE POLICY "Public insert question_bank" ON public.question_bank FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update question_bank" ON public.question_bank FOR UPDATE USING (true);
CREATE POLICY "Public delete question_bank" ON public.question_bank FOR DELETE USING (true);

CREATE POLICY "Public read interview_sessions" ON public.interview_sessions FOR SELECT USING (true);
CREATE POLICY "Public insert interview_sessions" ON public.interview_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update interview_sessions" ON public.interview_sessions FOR UPDATE USING (true);

CREATE POLICY "Public read behavioral_scores" ON public.behavioral_scores FOR SELECT USING (true);
CREATE POLICY "Public insert behavioral_scores" ON public.behavioral_scores FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read transcripts" ON public.transcripts FOR SELECT USING (true);
CREATE POLICY "Public insert transcripts" ON public.transcripts FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Public insert users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update users" ON public.users FOR UPDATE USING (true);

CREATE POLICY "Public read audit_logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Public insert audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- 8. AUTOMATED 30-DAY DATA PURGE FUNCTION (FR-20)
DROP FUNCTION IF EXISTS public.purge_expired_records();
DROP FUNCTION IF EXISTS public.purge_expired_records(integer);

CREATE OR REPLACE FUNCTION public.purge_expired_records()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER := 0;
  retention_cutoff TIMESTAMP WITH TIME ZONE;
BEGIN
  -- 30 days retention policy
  retention_cutoff := NOW() - INTERVAL '30 days';

  -- Delete interview sessions older than 30 days (cascades to transcripts & scores)
  DELETE FROM public.interview_sessions
  WHERE session_date < retention_cutoff;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  -- Record the purge action in the audit log
  INSERT INTO public.audit_logs (action, entity_type, details)
  VALUES (
    'AUTOMATED_DATA_PURGE',
    'interview_sessions',
    format('Automated 30-day retention purge removed %s expired interview session records and audio data.', deleted_count)
  );

  RETURN deleted_count;
END;
$$;

-- 9. SEED DATA FOR DEMO & TESTING (Valid Hexadecimal UUIDs: 0-9, a-f)
INSERT INTO public.candidates (id, full_name, email, position, status, score, resume_name, keywords) VALUES
('c0000000-0000-0000-0000-000000000001', 'Janith Perera', 'janith.p@example.com', 'Senior Software Engineer', 'Evaluated', 92, 'janith_perera_cv.pdf', ARRAY['Java', 'SQL', 'Docker', 'React']),
('c0000000-0000-0000-0000-000000000002', 'Sanduni Fernando', 'sanduni.f@example.com', 'Full Stack Developer', 'Evaluated', 88, 'sanduni_fernando_cv.pdf', ARRAY['Python', 'Node.js', 'PostgreSQL', 'Machine Learning']),
('c0000000-0000-0000-0000-000000000003', 'Kavinda Silva', 'kavinda.s@example.com', 'DevOps Engineer', 'In Progress', 78, 'kavinda_silva_cv.pdf', ARRAY['AWS', 'Kubernetes', 'CI/CD', 'Terraform']),
('c0000000-0000-0000-0000-000000000004', 'Nadeesha Jayawardena', 'nadeesha.j@example.com', 'Product Manager', 'Pending Review', 65, 'nadeesha_j_cv.pdf', ARRAY['Agile', 'Scrum', 'Jira', 'Roadmapping'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_bank (id, question_text, category, difficulty, keywords) VALUES
('b0000000-0000-0000-0000-000000000001', 'Explain the difference between clustered and non-clustered indexing in relational databases.', 'Technical', 'Medium', ARRAY['SQL', 'Indexing', 'B-Tree', 'Performance']),
('b0000000-0000-0000-0000-000000000002', 'Describe a challenging project conflict you faced with a teammate and how you resolved it.', 'Behavioral', 'Medium', ARRAY['Conflict Resolution', 'Communication', 'Teamwork']),
('b0000000-0000-0000-0000-000000000003', 'How do you handle zero-downtime database schema migrations in a high-traffic production system?', 'Technical', 'Hard', ARRAY['Migrations', 'Replication', 'Zero Downtime', 'Blue-Green']),
('b0000000-0000-0000-0000-000000000004', 'What steps do you take when you encounter an unexpected critical system failure during an interview or deployment?', 'Situational', 'Hard', ARRAY['Incident Management', 'RCA', 'Recovery', 'Logs'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 10. WHISPER MODEL SCORE COLUMNS (FR-12 AI Scoring)
-- Stores raw output from the trained Whisper ASR model
-- ============================================================
ALTER TABLE public.behavioral_scores ADD COLUMN IF NOT EXISTS whisper_predicted_score DECIMAL(5,2) DEFAULT NULL;
ALTER TABLE public.behavioral_scores ADD COLUMN IF NOT EXISTS whisper_similarity_score DECIMAL(5,4) DEFAULT NULL;
ALTER TABLE public.behavioral_scores ADD COLUMN IF NOT EXISTS whisper_is_relevant BOOLEAN DEFAULT NULL;
ALTER TABLE public.behavioral_scores ADD COLUMN IF NOT EXISTS whisper_filename VARCHAR(255) DEFAULT NULL;

-- ============================================================
-- 11. AUDIO RECORDINGS STORAGE BUCKET (FR-06 Audio Stream Capture)
-- Run this in the Supabase Dashboard → Storage → New Bucket
-- OR execute via SQL editor (requires storage extension):
-- ============================================================

-- Create the audio-recordings bucket (public so playback URLs work)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio-recordings',
  'audio-recordings',
  true,
  52428800,  -- 50 MB max per file
  ARRAY['audio/wav', 'audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/wave']
)
ON CONFLICT (id) DO NOTHING;

-- RLS: Allow public read (playback)
DROP POLICY IF EXISTS "Public read audio recordings" ON storage.objects;
CREATE POLICY "Public read audio recordings"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'audio-recordings');

-- RLS: Allow authenticated inserts (recording upload)
DROP POLICY IF EXISTS "Allow audio upload" ON storage.objects;
CREATE POLICY "Allow audio upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'audio-recordings');

-- RLS: Allow delete (for data purge FR-20)
DROP POLICY IF EXISTS "Allow audio delete" ON storage.objects;
CREATE POLICY "Allow audio delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'audio-recordings');