import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'implicit',
  },
});

export interface UserSettings {
  youtube_api_key: string;
  default_region: string;
  fetch_count: number;
}
