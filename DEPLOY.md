
# 🚀 Guia de Deploy - IAC Farm (Versão Supabase)

Este documento descreve como configurar o backend no Supabase e publicar na Vercel.

## 1. Configuração do Supabase (Obrigatório)

Acesse seu painel em [supabase.com](https://supabase.com), selecione seu projeto e realize estes dois passos:

### A. Criar as Tabelas
Vá no menu **SQL Editor**, clique em **New Query** e execute o código abaixo:

```sql
-- Tabela de Diagnósticos de Plantas
CREATE TABLE IF NOT EXISTS plants (
  id SERIAL PRIMARY KEY,
  common_name TEXT NOT NULL,
  scientific_name TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  image_url TEXT,
  health_status TEXT,
  diagnosis_summary TEXT,
  full_diagnosis TEXT,
  confidence INTEGER,
  location TEXT
);

-- Tabela de Planos de Safra
CREATE TABLE IF NOT EXISTS crop_plans (
  id SERIAL PRIMARY KEY,
  crop_name TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar acesso público (opcional, dependendo da sua política de segurança)
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso Público" ON plants FOR ALL USING (true);

ALTER TABLE crop_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso Público Planos" ON crop_plans FOR ALL USING (true);
```

### B. Configurar o Storage (Para Fotos)
1. No menu lateral, clique em **Storage**.
2. Clique em **New Bucket**.
3. Nomeie o bucket exatamente como: `fotos-lavoura`.
4. **IMPORTANTE:** Marque a opção **Public Bucket** para que as imagens fiquem visíveis no histórico do App.

---

## 2. Deploy na Vercel

1. Suba seu código para um repositório no GitHub.
2. No dashboard da Vercel, clique em **"Add New"** -> **"Project"**.
3. Importe o repositório.
4. Em **Environment Variables**, você só precisa de uma:
   - `API_KEY`: Sua chave do Google Gemini (obtida em ai.google.dev).
5. O App já está configurado para ler o Supabase automaticamente através do arquivo `services/supabaseClient.ts`.
6. Clique em **Deploy**.

---

## 3. Revisão de Conexão
- **App:** `https://rigohljqktbabygidemt.supabase.co`
- **Banco:** PostgreSQL via Supabase.
- **IA:** Gemini 3 Pro (Processamento multimodal).
- **Voz:** Gemini TTS (Leitura de respostas).
