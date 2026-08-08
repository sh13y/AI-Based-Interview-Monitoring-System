-- ============================================================
-- Modern Matrix AI Interview Monitoring System - Supabase Migration & Seed Data
-- ============================================================

-- 1. USERS TABLE
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

-- 2. CANDIDATES TABLE
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
  keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. QUESTION BANK TABLE
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

-- 4. INTERVIEW SESSIONS TABLE
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. BEHAVIORAL SCORES TABLE
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

-- 6. TRANSCRIPT TABLE
CREATE TABLE IF NOT EXISTS public.transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavioral_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated/anon read & write access
DROP POLICY IF EXISTS "Public read candidates" ON public.candidates;
DROP POLICY IF EXISTS "Public insert candidates" ON public.candidates;
DROP POLICY IF EXISTS "Public read question_bank" ON public.question_bank;
DROP POLICY IF EXISTS "Public insert question_bank" ON public.question_bank;
DROP POLICY IF EXISTS "Public read interview_sessions" ON public.interview_sessions;
DROP POLICY IF EXISTS "Public insert interview_sessions" ON public.interview_sessions;
DROP POLICY IF EXISTS "Public read behavioral_scores" ON public.behavioral_scores;
DROP POLICY IF EXISTS "Public insert behavioral_scores" ON public.behavioral_scores;
DROP POLICY IF EXISTS "Public read transcripts" ON public.transcripts;
DROP POLICY IF EXISTS "Public read users" ON public.users;
DROP POLICY IF EXISTS "Public insert users" ON public.users;
DROP POLICY IF EXISTS "Public update users" ON public.users;

CREATE POLICY "Public read candidates" ON public.candidates FOR SELECT USING (true);
CREATE POLICY "Public insert candidates" ON public.candidates FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read question_bank" ON public.question_bank FOR SELECT USING (true);
CREATE POLICY "Public insert question_bank" ON public.question_bank FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read interview_sessions" ON public.interview_sessions FOR SELECT USING (true);
CREATE POLICY "Public insert interview_sessions" ON public.interview_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read behavioral_scores" ON public.behavioral_scores FOR SELECT USING (true);
CREATE POLICY "Public insert behavioral_scores" ON public.behavioral_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read transcripts" ON public.transcripts FOR SELECT USING (true);

-- Full access to public.users for auth & lookup
CREATE POLICY "Public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Public insert users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update users" ON public.users FOR UPDATE USING (true);

-- ============================================================
-- SEED DUMMY DATA INTO SUPABASE DB
-- ============================================================

-- Seed Candidates
INSERT INTO public.candidates (id, full_name, email, position, status, date_registered, score, notes, keywords) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Jenny Adams', 'jenny.adams@email.com', 'Software Engineer', 'Evaluated', '2026-01-23', 90, 'Strong technical background with 5 years experience.', ARRAY['JavaScript', 'React', 'Node.js']),
  ('22222222-2222-2222-2222-222222222222', 'Mark Chen', 'mark.chen@email.com', 'Marketing Manager', 'In Progress', '2026-02-14', 89, 'Excellent communication skills, leadership potential.', ARRAY['SEO', 'Content Strategy', 'Analytics']),
  ('33333333-3333-3333-3333-333333333333', 'Raj Patel', 'raj.patel@email.com', 'HR Coordinator', 'Pending Review', '2026-04-02', 77, 'Good organizational skills, needs more experience.', ARRAY['Recruitment', 'Onboarding', 'HRIS']),
  ('44444444-4444-4444-4444-444444444444', 'James Wong', 'james.wong@email.com', 'Data Analyst', 'Rejected', '2026-03-03', 68, 'Technical skills need improvement.', ARRAY['SQL', 'Python', 'Tableau']),
  ('55555555-5555-5555-5555-555555555555', 'Sarah White', 'sarah.white@email.com', 'Product Manager', 'Evaluated', '2026-01-11', 85, 'Great product sense and stakeholder management.', ARRAY['Agile', 'Roadmap', 'User Research']),
  ('66666666-6666-6666-6666-666666666666', 'Allison Martinez', 'allison.martinez@email.com', 'AI Specialist', 'Evaluated', '2026-02-06', 80, 'Strong ML background, good at explaining complex topics.', ARRAY['Machine Learning', 'NLP', 'TensorFlow'])
ON CONFLICT (id) DO NOTHING;

-- Seed Questions
INSERT INTO public.question_bank (id, question_text, category, difficulty, keywords, ai_scoring_enabled, weights) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Can you describe your experience with coding in Python?', 'Technical', 'Medium', ARRAY['Python', 'Programming', 'Experience'], true, '{"honesty": 50, "attitude": 50, "confidence": 50, "relevance": 50}'),
  ('a2222222-2222-2222-2222-222222222222', 'How do you debug a piece of code you didn''t write?', 'Technical', 'Hard', ARRAY['Debugging', 'Problem Solving', 'Code Review'], true, '{"honesty": 40, "attitude": 50, "confidence": 60, "relevance": 50}'),
  ('a3333333-3333-3333-3333-333333333333', 'Discuss a challenging project you worked on recently.', 'Behavioral', 'Medium', ARRAY['Challenge', 'Project Management', 'Problem Solving'], true, '{"honesty": 60, "attitude": 50, "confidence": 50, "relevance": 40}'),
  ('a4444444-4444-4444-4444-444444444444', 'Explain a time when you used algorithms to solve a problem.', 'Technical', 'Hard', ARRAY['Algorithms', 'Data Structures', 'Optimization'], true, '{"honesty": 50, "attitude": 40, "confidence": 50, "relevance": 60}'),
  ('a5555555-5555-5555-5555-555555555555', 'What are your strengths as a software engineer?', 'Behavioral', 'Easy', ARRAY['Strengths', 'Self Assessment', 'Skills'], true, '{"honesty": 60, "attitude": 50, "confidence": 50, "relevance": 40}')
ON CONFLICT (id) DO NOTHING;

-- Seed Interview Sessions
INSERT INTO public.interview_sessions (id, candidate_id, session_date, duration_seconds, questions_answered, questions_total, noise_level_db, validation_status, status, position, round) VALUES
  ('b1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '2026-04-22T09:00:00Z', 1185, 5, 5, 42, true, 'Completed', 'Software Engineer', 'Round 1'),
  ('b2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '2026-04-20T14:00:00Z', 1320, 5, 5, 38, true, 'Completed', 'Marketing Manager', 'Round 1')
ON CONFLICT (id) DO NOTHING;

-- Seed Behavioral Scores
INSERT INTO public.behavioral_scores (id, session_id, honesty_score, attitude_score, confidence_score, relevance_score, overall_score) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 94.00, 89.00, 88.00, 91.00, 90.00),
  ('c2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 91.00, 90.00, 87.00, 88.00, 89.00)
ON CONFLICT (id) DO NOTHING;
 