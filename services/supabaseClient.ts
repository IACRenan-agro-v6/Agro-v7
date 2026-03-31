import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidUrl = (url: string | undefined): url is string => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

if (!isValidUrl(rawUrl) || !rawKey || rawKey.length <= 10) {
  throw new Error(
    'Supabase não configurado corretamente. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY na Vercel.'
  );
}

export const supabase = createClient(rawUrl, rawKey);