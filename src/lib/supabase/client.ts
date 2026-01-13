import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a lazy client that only initializes when actually used
let _supabase: SupabaseClient<Database> | null = null;

function getSupabaseClient(): SupabaseClient<Database> {
  if (!_supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase not configured - some features will not work');
      // Create a dummy client that will fail gracefully at runtime
      // This allows the build to succeed without env vars
      _supabase = createClient<Database>('https://placeholder.supabase.co', 'placeholder', {
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
    } else {
      _supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
    }
  }
  return _supabase;
}

export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_, prop) {
    const client = getSupabaseClient();
    const value = client[prop as keyof SupabaseClient<Database>];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});
