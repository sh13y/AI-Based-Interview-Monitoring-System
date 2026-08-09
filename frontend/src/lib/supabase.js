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

/**
 * Test live database connection by performing a fast ping.
 * @returns {{ connected: boolean, tableReady?: boolean, message: string }}
 */
export const testDatabaseConnection = async () => {
  if (!isSupabaseConfigured()) {
    return { connected: false, mode: 'Mock Data (No keys set)' };
  }
  try {
    const { data, error } = await supabase
      .from('candidates')
      .select('count', { count: 'exact', head: true });

    if (error) {
      return { connected: true, tableReady: false, message: error.message };
    }
    return { connected: true, tableReady: true, message: 'Database Connected & Tables Ready' };
  } catch (err) {
    return { connected: false, message: err.message };
  }
};

/**
 * FR-21: Write an entry to the audit_logs table.
 * Falls back to localStorage in demo mode.
 *
 * @param {{ action: string, entityType?: string, entityId?: string, details?: string, userEmail?: string }} entry
 */
export const writeAuditLog = async ({ action, entityType = null, entityId = null, details = null, userEmail = null }) => {
  const entry = {
    action,
    entity_type: entityType,
    entity_id: entityId ? String(entityId) : null,
    details,
    user_email: userEmail,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('audit_logs').insert([entry]);
    } catch (err) {
      console.warn('[AuditLog] Supabase write failed, falling back to localStorage:', err.message);
      _writeAuditLogLocal(entry);
    }
  } else {
    _writeAuditLogLocal(entry);
  }
};

/** Stores audit log entries in localStorage for demo mode. */
const _writeAuditLogLocal = (entry) => {
  try {
    const existing = JSON.parse(localStorage.getItem('mm_audit_logs') || '[]');
    existing.unshift({ id: `log-${Date.now()}`, ...entry });
    // Keep only the latest 100 entries
    localStorage.setItem('mm_audit_logs', JSON.stringify(existing.slice(0, 100)));
  } catch (e) {
    console.warn('[AuditLog] localStorage write failed:', e.message);
  }
};

/**
 * Retrieve audit logs (from Supabase or localStorage in demo mode).
 * @returns {Promise<Array>}
 */
export const getAuditLogs = async () => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (!error && data) return data;
    } catch (e) {
      console.warn('[AuditLog] Supabase read failed:', e.message);
    }
  }
  try {
    return JSON.parse(localStorage.getItem('mm_audit_logs') || '[]');
  } catch {
    return [];
  }
};

/**
 * FR-20: Trigger the automated data purge RPC function.
 * @returns {{ success: boolean, result?: object, message?: string }}
 */
export const runDataPurge = async () => {
  if (!isSupabaseConfigured()) {
    return {
      success: true,
      demo: true,
      result: { deleted_sessions: 3, deleted_scores: 3, deleted_transcripts: 2 },
      message: 'Demo mode: simulated purge of records older than 30 days.',
    };
  }
  try {
    const { data, error } = await supabase.rpc('purge_expired_records');
    if (error) return { success: false, message: error.message };
    return { success: true, result: data?.[0] || {}, message: 'Purge completed successfully.' };
  } catch (err) {
    return { success: false, message: err.message };
  }
};
