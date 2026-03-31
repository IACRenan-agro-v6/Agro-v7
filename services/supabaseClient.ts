import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logs (Safe for production as they don't leak the key)
console.log('[Supabase] VITE_SUPABASE_URL:', rawUrl || 'MISSING');
console.log('[Supabase] VITE_SUPABASE_ANON_KEY:', rawKey ? 'PRESENT (Length: ' + rawKey.length + ')' : 'MISSING');

const isValidUrl = (url: string | undefined): url is string => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Fallback values for development or to prevent hard crash on module load
export const isSupabaseConfigured = isValidUrl(rawUrl) && !!rawKey && rawKey.length > 10;

const SUPABASE_URL = isSupabaseConfigured ? rawUrl : 'https://placeholder-project.supabase.co';
const SUPABASE_KEY = isSupabaseConfigured ? rawKey : 'placeholder-key-missing-in-env';

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase não configurado corretamente. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY na Vercel.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
