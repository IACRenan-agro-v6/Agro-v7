
import { createClient } from '@supabase/supabase-js';

// Tenta obter das variáveis de ambiente do Vite
const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validação da URL
const isValidUrl = (url: string | undefined): url is string => {
    if (!url) return false;
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

const SUPABASE_URL = isValidUrl(rawUrl) ? rawUrl : '';
const SUPABASE_KEY = (rawKey && rawKey.length > 10) ? rawKey : '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("ERRO DE CONFIGURAÇÃO: Supabase URL ou Anon Key não configuradas nas variáveis de ambiente (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).");
}

// Inicializa o cliente
export const supabase = createClient(SUPABASE_URL || 'https://placeholder.supabase.co', SUPABASE_KEY || 'placeholder');
