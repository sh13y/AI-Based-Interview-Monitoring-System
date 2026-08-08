import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Configuration
 *
 * Reads credentials from Vite environment variables (.env.local).
 * If no credentials are set, the app falls back to demo mode with mock data.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/** Returns true when Supabase credentials are present and the client is initialized. */
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabase);
};

// Test live database connection by performing a fast ping
export const testDatabaseConnection = async () => {
  if (!isSupabaseConfigured()) {
    return { connected: false, mode: 'Mock Data (No keys set)' };
  }

  try {
    // Ping Supabase public health or query table
    const { data, error } = await supabase.from('candidates').select('count', { count: 'exact', head: true });

    if (error) {
      // If table doesn't exist yet or permission denied, connection itself works
      return { connected: true, tableReady: false, message: error.message };
    }

    return { connected: true, tableReady: true, message: 'Database Connected & Tables Ready' };
  } catch (err) {
    return { connected: false, message: err.message };
  }
};
