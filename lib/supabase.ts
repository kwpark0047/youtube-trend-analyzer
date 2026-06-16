import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wuyqjmqpqydmyzjedkmj.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1eXFqbXFwcXlkbXl6amVka21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1NTI1MTQsImV4cCI6MjA5NzEyODUxNH0.onOAGZzU13XyReAVmag3uZ_H3PgUJLLEt3ggJB3V9Y0';

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
