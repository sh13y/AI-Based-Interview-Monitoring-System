import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Check if Supabase env credentials exist
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
