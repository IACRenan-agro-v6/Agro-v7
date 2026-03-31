# IAC Farm - Gestor Autônomo de Ecossistema Agro

O **IAC Farm** é uma plataforma inteligente para o agronegócio que conecta produtores, varejistas e consumidores finais através de inteligência artificial e dados em tempo real.

## 🚀 Configuração de Ambiente

Para rodar o projeto localmente ou em produção, você precisa configurar as seguintes variáveis de ambiente. Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`.

### Variáveis Necessárias

| Variável | Descrição | Onde Obter |
|----------|-----------|------------|
| `VITE_SUPABASE_URL` | URL do seu projeto Supabase | [Supabase Dashboard](https://supabase.com/dashboard) |
| `VITE_SUPABASE_ANON_KEY` | Chave anônima pública do Supabase | [Supabase Dashboard](https://supabase.com/dashboard) |
| `VITE_GEMINI_API_KEY` | Chave da API do Google Gemini | [Google AI Studio](https://aistudio.google.com/app/apikey) |

### Como Configurar

1.  **Copie o exemplo:**
    ```bash
    cp .env.example .env
    ```
2.  **Preencha os valores:** Abra o arquivo `.env` e insira as chaves obtidas nos respectivos serviços.
3.  **Reinicie o servidor:** Se o servidor estiver rodando, reinicie-o para carregar as novas variáveis.

## 🏗️ Arquitetura do Projeto

O Agro-v7 foi desenvolvido seguindo uma arquitetura modular, separando a lógica de negócios (hooks/services) da interface do usuário (components).

### 📄 Orquestrador Principal: `App.tsx`
O `App.tsx` atua como o **Hub Central** do layout. Ele não contém lógica pesada, mas orquestra:
- O estado de carregamento inicial da autenticação.
- A renderização condicional entre as telas de Login, Registro e o Dashboard principal.
- A integração visual entre o `Sidebar`, `Header` e a área de conteúdo dinâmico.

### 🔐 Contextos (`/contexts`)
- **`AuthContext.tsx`**: Gerencia todo o ciclo de vida do usuário (Login, Registro, Logout e Sessão Persistente) usando o Supabase Auth.

### ⚓ Hooks Principais (`/hooks`)
- **`useChat.ts`**: Gerencia o histórico de mensagens, integração com a IA Gemini, controle de áudio (TTS) e salvamento automático de mensagens offline.
- **`useConnectivity.ts`**: Monitora a volta da conexão e dispara a sincronização automática de tarefas pendentes no cache.
- **`useNavigation.ts`**: Controla a navegação interna entre as diferentes visões (Dashboard, Chat, Mercado, etc.) e o título do cabeçalho.
- **`useLocationWeather.ts`**: Captura a geolocalização do usuário e busca dados climáticos em tempo real.
- **`useTheme.ts`**: Gerencia a alternância e persistência do modo escuro/claro.
- **`useOnlineStatus.ts`**: Hook utilitário para detectar o estado da conexão (`navigator.onLine`).

### 🔄 Fluxo Principal do Usuário
```text
[Início]
   │
   ▼
[AuthContext] ─── (Não Logado) ──▶ [LoginScreen] ──▶ [Registro/Login]
   │                                                     │
   │ (Logado)                                            │
   ▼                                                     ▼
[App.tsx] ◀──────────────────────────────────────────────┘
   │
   ▼
[Dashboard] ◀─── [useNavigation] ───▶ [Outras Telas (Chat, Mercado, etc.)]
   │
   ▼
[Chat View] ◀─── [useChat] ───▶ [geminiService]
   │               │
   │               └─ (Se Offline) ──▶ [cacheService]
   │                                       │
   ▼                                       ▼
[Reconexão] ◀─── [useConnectivity] ◀─── [useOnlineStatus]
```

### 📁 Organização de Pastas
- **`/components`**: Componentes de interface (UI). Divididos entre telas completas (ex: `FarmDashboard`) e elementos menores (ex: `ChatMessage`).
- **`/services`**: Camada de infraestrutura. Contém os clientes do Supabase, Gemini e serviços de cache local (IndexedDB/LocalStorage).
- **`/utils`**: Funções utilitárias puras para manipulação de arquivos, áudio e formatação de dados.
- **`/data`**: Contém dados estáticos ou mocks utilizados para prototipagem e estados iniciais.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React + TypeScript + Tailwind CSS
- **IA:** Google Gemini (Multimodal, TTS, Grounding)
- **Backend/DB:** Supabase (Auth, Firestore-like DB, Storage)
- **Animações:** Framer Motion
- **Ícones:** Lucide React

## 📦 Instalação e Execução

1.  Instale as dependências:
    ```bash
    npm install
    ```
2.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```
3.  Acesse `http://localhost:3000` no seu navegador.

## 🛡️ Segurança

- Todas as chaves sensíveis são gerenciadas via variáveis de ambiente.
- O acesso ao banco de dados é protegido por políticas de segurança (RLS) no Supabase.
- Chaves de API de terceiros nunca devem ser expostas diretamente no código-fonte.
