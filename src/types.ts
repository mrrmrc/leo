// src/types.ts

export interface ChildProfile {
  id?: string;
  parent_id?: string;
  name: string;
  age: number;
  diagnosis?: string;
  communication_level?: string;
  school_support?: string;
  parent_email?: string;
  assigned_exercises?: string[];
  
  // Difficulties
  phonetic_errors?: string;
  language_delays?: string;
  cognitive_difficulties?: string;
  has_adhd?: boolean;
  has_autism?: boolean;
  attention_span_minutes?: number;
  
  // Sensory & Emotional
  noise_hypersensitivity?: boolean;
  visual_sensitivity?: boolean;
  emotional_triggers?: string;
  triggers?: string;
  
  // Strengths & Interests
  special_interests?: string;
  favorite_games?: string;
  favorite_activities?: string;
  motivations?: string;
  
  // Educational Goals
  vocabulary_goals?: string;
  turn_taking_goals?: string;
  autonomy_goals?: string;
  emotional_regulation_goals?: string;
  pronunciation_goals?: string;

  created_at?: string;
  updated_at?: string;
}

export interface Session {
  id: string;
  child_id: string;
  type: 'chat' | 'vision' | 'supermarket' | 'home';
  context?: string;
  transcript: unknown;
  progress_notes?: string;
  difficulty_level: number;
  emotional_state_observed?: string;
  created_at: string;
}
