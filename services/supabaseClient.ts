import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logs as requested by user
console.log('VITE_SUPABASE_URL:', rawUrl);
console.log('VITE_SUPABASE_ANON_KEY length:', rawKey?.length);

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

// Fallback for dev if variables are missing
const devUrl = 'https://placeholder-project.supabase.co';
const devKey = 'placeholder-key-missing-in-env';

const SUPABASE_URL = isSupabaseConfigured ? rawUrl : devUrl;
const SUPABASE_KEY = isSupabaseConfigured ? rawKey : devKey;

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase não configurado corretamente. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY na Vercel.'
  );
  if (import.meta.env.DEV) {
    console.info('Rodando em modo desenvolvimento com placeholders.');
  }
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
