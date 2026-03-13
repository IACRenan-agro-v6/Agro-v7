
import { createClient } from '@supabase/supabase-js';

// Tenta obter das variáveis de ambiente do Vite
const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallbacks seguros
const DEFAULT_URL = 'https://hoepznsyzdlrzzlrlurp.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvZXB6bnN5emRscnp6bHJsdXJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNzE3MzgsImV4cCI6MjA3ODc0NzczOH0.0W-dZiHbd4PIQcB8FDZIBgdNVlAtKPIBaUvbSdCVlNc';

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

const SUPABASE_URL = isValidUrl(rawUrl) ? rawUrl : DEFAULT_URL;
const SUPABASE_KEY = (rawKey && rawKey.length > 10) ? rawKey : DEFAULT_KEY;

if (!isValidUrl(rawUrl)) {
    console.info("Supabase URL não configurada ou inválida nas variáveis de ambiente. Usando fallback.");
}

// Inicializa o cliente
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
