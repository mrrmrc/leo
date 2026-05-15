import { createClient } from '@supabase/supabase-js';

// Use a valid dummy URL if environment variables are missing to avoid build-time errors.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lib-placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'lib-placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
