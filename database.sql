-- database.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for Parent Profiles
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

-- Table for Child Profiles
CREATE TABLE IF NOT EXISTS child_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  parent_id UUID REFERENCES parent_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  diagnosis TEXT,
  communication_level TEXT,

  -- Difficulties
  phonetic_errors TEXT,
  language_delays TEXT,
  cognitive_difficulties TEXT,
  adhd BOOLEAN DEFAULT false,
  autism BOOLEAN DEFAULT false,
  attention_span INTEGER, -- in minutes

  -- Sensory
  noise_hypersensitivity BOOLEAN DEFAULT false,
  visual_sensitivity BOOLEAN DEFAULT false,
  emotional_triggers TEXT,

  -- Strengths & Interests
  special_interests TEXT,
  favorite_games TEXT,
  favorite_activities TEXT,
  motivations TEXT,

  -- Goals
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

-- Table for Sessions/Memories
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  child_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- e.g., 'chat', 'vision', 'supermarket'
  context TEXT,
  transcript JSONB,
  progress_notes TEXT,
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