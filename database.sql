-- database.sql (Project LEO)
-- PostgreSQL / Supabase Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table for Parent Profiles
CREATE TABLE IF NOT EXISTS parent_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for parents
ALTER TABLE parent_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can view own profile" ON parent_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Parents can update own profile" ON parent_profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Table for Child Profiles (Pedagogical DNA)
CREATE TABLE IF NOT EXISTS child_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  parent_id UUID REFERENCES parent_profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Basic Info
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  diagnosis TEXT, -- e.g., ASD, ADHD, Dysphasia
  communication_level TEXT, -- e.g., Non-verbal, Basic, Fluent
  
  -- Difficulties
  phonetic_errors TEXT,
  language_delays TEXT,
  cognitive_difficulties TEXT,
  has_adhd BOOLEAN DEFAULT false,
  has_autism BOOLEAN DEFAULT false,
  attention_span_minutes INTEGER,
  
  -- Sensory & Emotional
  noise_hypersensitivity BOOLEAN DEFAULT false,
  visual_sensitivity BOOLEAN DEFAULT false,
  emotional_triggers TEXT,
  
  -- Strengths & Interests
  special_interests TEXT, -- The "bridge" for AI engagement
  favorite_games TEXT,
  favorite_activities TEXT,
  motivations TEXT,
  
  -- Educational Goals
  vocabulary_goals TEXT,
  turn_taking_goals TEXT,
  autonomy_goals TEXT,
  emotional_regulation_goals TEXT,
  pronunciation_goals TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for children
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can manage their child profiles" ON child_profiles FOR ALL USING (parent_id = auth.uid());

-- 3. Table for Sessions (Memories & Progress)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  child_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'chat', 'vision', 'supermarket', 'home'
  context TEXT, -- e.g., "Kitchen session"
  transcript JSONB, -- Full conversation history
  progress_notes TEXT, -- AI-generated notes on goals achieved
  difficulty_level INTEGER DEFAULT 1, -- Adaptive difficulty (1-5)
  emotional_state_observed TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can view their child's sessions" ON sessions FOR SELECT USING (
  EXISTS (SELECT 1 FROM child_profiles WHERE child_profiles.id = sessions.child_id AND child_profiles.parent_id = auth.uid())
);
CREATE POLICY "Parents can create their child's sessions" ON sessions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM child_profiles WHERE child_profiles.id = sessions.child_id AND child_profiles.parent_id = auth.uid())
);

-- 4. Privacy & GDPR Consent Log
CREATE TABLE IF NOT EXISTS privacy_consents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  parent_id UUID REFERENCES parent_profiles(id) ON DELETE CASCADE NOT NULL,
  consent_type TEXT NOT NULL, -- 'data_processing', 'ai_training_opt_out', etc.
  is_accepted BOOLEAN DEFAULT false,
  ip_address TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE privacy_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can view their own consents" ON privacy_consents FOR SELECT USING (parent_id = auth.uid());