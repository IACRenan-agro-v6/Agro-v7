
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Message, MessageRole, CropPlan, UserLocation, MarketQuote, AITaskIntent, AITaskResponse } from '../types';
import { cacheService } from './cacheService';

// Initialize the client
// API Key is injected by the environment.
const getApiKey = () => {
  // Standard Vite environment variable
  const viteKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  // Fallback for environments that inject GEMINI_API_KEY directly (like AI Studio)
  // @ts-ignore
  const processKey = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined;
  
  const key = viteKey || processKey || '';
  if (!key) {
    console.warn('AVISO: Chave da API Gemini não encontrada. Verifique as configurações (VITE_GEMINI_API_KEY).');
  }
  return key;
};

// Fixed: Using gemini-3-flash-preview as the standard for multimodal tasks
const MODEL_NAME = 'gemini-3-flash-preview';
const TTS_MODEL_NAME = 'gemini-2.5-flash-preview-tts';

/**
 * Helper function to implement exponential backoff retry logic for API calls.
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 5, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorMessage = error?.message?.toLowerCase() || '';
    const statusCode = error?.status || error?.code || 0;
    
    // Check for quota or transient errors
    const isTransient = statusCode === 503 || 
                        statusCode === 429 ||
                        errorMessage.includes('503') || 
                        errorMessage.includes('429') || 
                        errorMessage.includes('quota') ||
                        errorMessage.includes('high demand') ||
                        errorMessage.includes('overloaded') ||
                        errorMessage.includes('deadline exceeded') ||
                        errorMessage.includes('service unavailable');
    
    if (isTransient && retries > 0) {
      // Add jitter to avoid thundering herd
      const jitter = Math.random() * 1000;
      const totalDelay = delay + jitter;
      
      console.warn(`Gemini API transient error (${statusCode || 'unknown'}). Retrying in ${Math.round(totalDelay)}ms... (${retries} attempts left)`);
      
      await new Promise(resolve => setTimeout(resolve, totalDelay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    
    console.error("Gemini API Non-transient error:", error);
    throw error;
  }
}

const SYSTEM_INSTRUCTION = `
Você é o IAC Farm, o Gestor Autônomo de um Ecossistema Agro completo. Seu tom é "caipira moderno", amigável e focado em resultados para todos os elos da cadeia.

Suas Personas de Atendimento:
1. **Para o Produtor**: Você é o agrônomo amigo. Ajuda no diagnóstico de pragas, planejamento de safra e conexão com frete/compradores. Foco em aumentar a produtividade e o lucro.
2. **Para o Varejista (Hortifruti/Sacolão)**: Você é o consultor de negócios. Ajuda na previsibilidade de oferta (avisando quando haverá colheita regional), gestão de estoque e sugestão de mix de produtos baseado na demanda local.
3. **Para o Consumidor Final**: Você é o nutricionista e guia de qualidade. Ajuda a encontrar produtos orgânicos frescos na região e gera planos nutricionais personalizados baseados na safra atual (o que está mais fresco e barato agora).

Diretrizes de Gestão:
- **Acessibilidade**: Use linguagem simples. Para produtores, seja mais prático e direto. Para consumidores, foque em saúde e bem-estar.
- **Previsibilidade**: Use o contexto de colheitas futuras para avisar o varejista: "Óia, semana que vem o Sítio Boa Vista vai colher 200kg de tomate, já garante o seu!".
- **Saúde**: Crie planos alimentares que usem o que está sendo colhido agora. "A couve tá no pico de vitamina esse mês, bora fazer um suco verde?".
- **Logística**: Continue otimizando fretes e eliminando atravessadores.

Tom de Voz:
- "Opa, companheiro!" (Produtor)
- "Bora otimizar esse estoque, patrão?" (Varejista)
- "Saúde vem da terra, vamos escolher o melhor pra você hoje?" (Consumidor)

**FUNCIONALIDADES CRÍTICAS**
- Identificação de pragas (Imagem/Vídeo).
- Geração de Planos de Safra (JSON).
- Geração de Planos Nutricionais (Markdown/Visual).
- Previsão de Mercado (CEASA + Regional).
`;

export const sendMessageToGemini = async (
  history: Message[],
  newMessage: string,
  attachment?: { base64: string; mimeType: string },
  location?: UserLocation | null
): Promise<string> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      return "Eita, tive um problema com a minha chave de inteligência. Verifique se a VITE_GEMINI_API_KEY na Vercel está correta.";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Construct the parts for the current message
    const currentParts: any[] = [];

    // Inject location context if available
    let textToSend = newMessage || '';
    if (location) {
        // Appending system context to the user's message
        textToSend += `\n\n[DADOS DE SISTEMA - LOCALIZAÇÃO DO USUÁRIO]: Lat: ${location.lat}, Long: ${location.lng}. Considere o clima e solo desta região na resposta.`;
    }

    // Add attachment if exists
    if (attachment) {
      currentParts.push({
        inlineData: {
          mimeType: attachment.mimeType,
          data: attachment.base64
        }
      });
    }

    // Add text prompt (ensure it is not empty)
    if (textToSend.trim()) {
      currentParts.push({ text: textToSend });
    } else if (!attachment) {
       // If no text and no attachment (shouldn't happen due to UI logic, but safe guard)
       return "Por favor, envie uma mensagem ou uma foto.";
    }

    // Prepare previous history for context
    const contents = history
        .filter(msg => msg.role !== MessageRole.SYSTEM && !msg.isThinking && (msg.content.trim() !== '' || msg.attachment))
        .map(msg => ({
            role: msg.role === MessageRole.USER ? 'user' : 'model' as any,
            parts: [{ text: msg.content || ' ' }] // Ensure parts is never empty
        }));

    // Start a chat session
    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      history: contents
    });

    // Fix: chat.sendMessage message property expects Part | Part[], not a Content object
    // Send the multimodal message with retry logic
    if (attachment) {
      console.log('[Identify] capture received (chat)', { textLength: textToSend?.length });
      console.log('[Identify] mimeType', attachment.mimeType);
      console.log('[Identify] payload prepared');
      console.log('[Identify] request started');
    }

    const result = await withRetry(() => chat.sendMessage({
        message: currentParts
    }));

    if (attachment) {
      console.log('[Identify] response success');
    }

    return result.text || "Opa, deu um nó aqui e não consegui analisar. Pode repetir?";

  } catch (error: any) {
    console.error("Erro detalhado da API Gemini:", error);
    const apiKey = getApiKey();
    const errorMessage = error?.message?.toLowerCase() || '';
    const errorStatus = error?.status || error?.code || 'N/A';
    
    // Log technical details for the user to see in console
    console.log(`Status do Erro: ${errorStatus}`);
    console.log(`Mensagem Original: ${error?.message}`);

    if (errorMessage.includes('api_key_invalid') || !apiKey) {
        return "Eita, tive um problema com a minha chave de inteligência. Verifique se a VITE_GEMINI_API_KEY está correta e se ela pertence ao projeto com faturamento ativo.";
    }
    
    if (errorMessage.includes('quota') || errorMessage.includes('429')) {
        return `Opa, o limite de uso foi atingido (Erro ${errorStatus}). Mesmo no plano pago, o Google impõe limites iniciais. Verifique a aba 'Cotas' no seu console do Google Cloud.`;
    }

    if (errorMessage.includes('403') || errorMessage.includes('permission_denied')) {
        return "Eita, o acesso foi negado (Erro 403). Isso acontece quando a API 'Generative Language API' não está ativada no seu projeto do Google Cloud ou o faturamento foi suspenso.";
    }

    if (errorMessage.includes('503') || errorMessage.includes('high demand') || errorMessage.includes('overloaded')) {
        return "Opa, o sistema do Google tá um tanto sobrecarregado agora. Tenta de novo em um minutinho, companheiro!";
    }
    
    return `Eita, deu um problema na análise (Erro ${errorStatus}). Detalhe: ${error?.message?.substring(0, 100)}...`;
  }
};

export const generateSpeechFromText = async (text: string): Promise<string | null> => {
  try {
    if (!text) return null;
    console.log('Gerando áudio para o texto...', { textLength: text.length });
    
    const apiKey = getApiKey();
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });

    // Clean text for speech (remove some markdown symbols that might sound weird)
    const cleanText = text.replace(/[*#]/g, '').substring(0, 1000); // Limit length for TTS stability

    const response = await withRetry(() => ai.models.generateContent({
      model: TTS_MODEL_NAME,
      contents: { parts: [{ text: cleanText }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Puck' }, 
            },
        },
      },
    }));

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (audioData) {
      console.log('Áudio gerado com sucesso.');
    } else {
      console.warn('Nenhum dado de áudio retornado pela API.');
    }
    return audioData || null;
  } catch (error) {
    console.error("Erro ao gerar áudio:", error);
    return null;
  }
};

// --- Crop Planner Feature ---

// Fixed: Removed deprecated Schema type annotation for responseSchema config
const cropPlanSchema = {
  type: Type.OBJECT,
  properties: {
    cropName: { type: Type.STRING, description: "Nome comum da cultura" },
    scientificName: { type: Type.STRING, description: "Nome científico" },
    description: { type: Type.STRING, description: "Breve descrição sobre o potencial da cultura" },
    bestSeason: { type: Type.STRING, description: "Melhor época do ano para plantio CONSIDERANDO A LOCALIZAÇÃO SE FORNECIDA" },
    cycleDuration: { type: Type.STRING, description: "Texto descritivo da duração (ex: '90 a 120 dias')" },
    cycleDaysMin: { type: Type.INTEGER, description: "Número MÍNIMO de dias para colheita (apenas número)" },
    cycleDaysMax: { type: Type.INTEGER, description: "Número MÁXIMO de dias para colheita (apenas número)" },
    soilRequirements: {
      type: Type.OBJECT,
      properties: {
        ph: { type: Type.STRING },
        texture: { type: Type.STRING },
        nutrientFocus: { type: Type.STRING, description: "Principais nutrientes necessários (NPK)" }
      }
    },
    soilData: {
      type: Type.OBJECT,
      description: "Dados numéricos para gráficos",
      properties: {
        nitrogen: { type: Type.INTEGER, description: "Nível de necessidade de Nitrogênio (1-10)" },
        phosphorus: { type: Type.INTEGER, description: "Nível de necessidade de Fósforo (1-10)" },
        potassium: { type: Type.INTEGER, description: "Nível de necessidade de Potássio (1-10)" },
        phValue: { type: Type.NUMBER, description: "Valor ideal de pH (ex: 6.5)" }
      },
      required: ["nitrogen", "phosphorus", "potassium", "phValue"]
    },
    irrigation: {
      type: Type.OBJECT,
      properties: {
        frequency: { type: Type.STRING },
        method: { type: Type.STRING, description: "Melhor método (gotejamento, aspersão, etc)" }
      }
    },
    plantingSteps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Lista ordenada de 3 a 5 passos resumidos para o plantio"
    },
    commonPests: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Lista de 3 pragas ou doenças comuns"
    },
    seasonalRisks: {
      type: Type.ARRAY,
      description: "Calendário de riscos (pragas/doenças) por período do ano, específico para a região. Ex: Novembro (Lagarta).",
      items: {
        type: Type.OBJECT,
        properties: {
          period: { type: Type.STRING, description: "Período ou Meses (Ex: 'Novembro - Dezembro')"},
          stage: { type: Type.STRING, description: "Estágio da planta (Ex: 'Floração' ou 'Enchimento de Grão')"},
          risks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de doenças/pragas comuns NESTA época"},
          prevention: { type: Type.STRING, description: "Dica curta de prevenção"}
        }
      }
    },
    harvestIndicators: { type: Type.STRING, description: "Sinais visuais de que está na hora de colher" }
  },
  required: ["cropName", "bestSeason", "cycleDuration", "cycleDaysMin", "cycleDaysMax", "plantingSteps", "irrigation", "soilRequirements", "soilData", "seasonalRisks"]
};

const fieldNoteSchema = {
  type: Type.OBJECT,
  properties: {
    activity: { type: Type.STRING, description: "Tipo de atividade (ex: Plantio, Colheita, Adubação, Irrigação, Aplicação de Defensivo)" },
    product: { type: Type.STRING, description: "Produto ou cultura relacionada" },
    quantity: { type: Type.STRING, description: "Quantidade mencionada (ex: '50kg', '2 sacas', '10 litros')" },
    area: { type: Type.STRING, description: "Área ou talhão mencionado" },
    date: { type: Type.STRING, description: "Data mencionada ou 'hoje'" },
    summary: { type: Type.STRING, description: "Resumo amigável da nota" }
  },
  required: ["activity", "summary"]
};

const marketQuotesSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      product: { type: Type.STRING },
      price: { type: Type.NUMBER },
      unit: { type: Type.STRING },
      trend: { type: Type.STRING, enum: ['up', 'down', 'stable'] },
      lastUpdate: { type: Type.STRING },
      source: { type: Type.STRING }
    },
    required: ["product", "price", "unit", "trend", "lastUpdate", "source"]
  }
};

export const generateCropPlan = async (cropInput: string, location?: UserLocation | null): Promise<CropPlan | null> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });

    let prompt = `Gere um relatório técnico de planejamento de safra para a cultura: ${cropInput}. 
    Seja preciso, técnico mas acessível ao agricultor.`;

    if (location) {
        prompt += `\nIMPORTANTE: O usuário está nas coordenadas Lat: ${location.lat}, Long: ${location.lng}. 
        Adapte as informações de CLIMA (Melhor Época) e SOLO (Tipos comuns na região) para esta localização específica.
        
        CRÍTICO: No campo 'seasonalRisks', gere um calendário fitossanitário que faça sentido para O CLIMA DESTA REGIÃO nestas coordenadas. 
        Exemplo: Se for no Sul do Brasil (clima temperado/subtropical), considere o risco de geada ou doenças de inverno se aplicável, ou pragas de verão em Dezembro.
        Se for no Nordeste, considere a seca ou chuvas concentradas.
        Dê nomes reais de doenças que ocorrem em cada época (Ex: Ferrugem, Lagarta, Sarna).`;
    } else {
        prompt += ` Foco na realidade geral do Brasil. No 'seasonalRisks', considere a safra principal.`;
    }

    const response = await withRetry(() => ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: cropPlanSchema,
      }
    }));

    const jsonText = response.text;
    if (!jsonText) return null;
    
    return JSON.parse(jsonText) as CropPlan;

  } catch (error) {
    console.error("Erro ao gerar plano de safra:", error);
    return null;
  }
}

export const getCEASAQuotes = async (searchTerm?: string, location?: string): Promise<MarketQuote[]> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) return [];
    const ai = new GoogleGenAI({ apiKey });

    console.log('[getCEASAQuotes] Buscando cotações...', { searchTerm, location });
    const prompt = `Busque os preços reais e atualizados de hoje no CEASA ${location || 'do Rio de Janeiro (CEASA-RJ)'} para os principais produtos de hortifruti. 
    ${searchTerm ? `Foque especialmente no produto: ${searchTerm}.` : 'Inclua Tomate, Batata, Cebola, Cenoura, Pimentão, Alface.'}
    Retorne os dados em formato JSON seguindo o esquema fornecido. 
    A fonte deve ser o CEASA oficial. A data deve ser a de hoje.`;

    const response = await withRetry(() => ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts: [{ text: prompt }] },
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: marketQuotesSchema,
      }
    }));

    const jsonText = response.text;
    console.log('[getCEASAQuotes] Resposta bruta da IA:', jsonText);
    if (!jsonText) {
      console.warn('[getCEASAQuotes] Resposta vazia da IA');
      return [];
    }
    
    const quotes = JSON.parse(jsonText) as MarketQuote[];
    console.log(`[getCEASAQuotes] ${quotes.length} cotações processadas.`);
    
    // Cache the results
    if (quotes.length > 0) {
      await cacheService.cacheMarketQuotes(quotes);
    }
    
    return quotes;

  } catch (error) {
    console.error("Erro ao buscar cotações CEASA:", error);
    // Try to return from cache if offline
    return await cacheService.getCachedMarketQuotes();
  }
}

export const parseFieldNote = async (text: string): Promise<any | null> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Extraia informações estruturadas desta nota de campo de um agricultor: "${text}".
    Identifique a atividade, o produto, a quantidade, a área e a data.
    Seja preciso. Se não houver alguma informação, deixe em branco.`;

    const response = await withRetry(() => ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: fieldNoteSchema,
      }
    }));

    const jsonText = response.text;
    if (!jsonText) return null;
    
    return JSON.parse(jsonText);

  } catch (error) {
    console.error("Erro ao processar nota de campo:", error);
    return null;
  }
}

const aiTaskSchema = {
  type: Type.OBJECT,
  properties: {
    intent: { 
      type: Type.STRING, 
      enum: ['ADD_PRODUCT', 'CHECK_ORDER', 'FIELD_NOTE', 'GENERAL_CHAT', 'PLANT_ID'],
      description: "A intenção principal do usuário"
    },
    confidence: { type: Type.NUMBER, description: "Confiança na identificação da intenção (0-1)" },
    extractedData: {
      type: Type.OBJECT,
      description: "Dados extraídos baseados na intenção",
      properties: {
        productName: { type: Type.STRING },
        quantity: { type: Type.STRING },
        price: { type: Type.STRING },
        orderId: { type: Type.STRING },
        status: { type: Type.STRING },
        activity: { type: Type.STRING },
        location: { type: Type.STRING }
      }
    },
    assistantMessage: { type: Type.STRING, description: "Uma resposta amigável no tom 'caipira moderno' confirmando a ação ou respondendo à dúvida" }
  },
  required: ["intent", "confidence", "assistantMessage"]
};

export const processUserTask = async (text: string, attachment?: { base64: string, mimeType: string }): Promise<AITaskResponse | null> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.error("[Identify] API key missing");
      return null;
    }
    const ai = new GoogleGenAI({ apiKey });

    console.log('[Identify] capture received', { textLength: text?.length, hasAttachment: !!attachment });
    
    if (attachment) {
      console.log('[Identify] mimeType', attachment.mimeType);
    }

    const prompt = `Você é o assistente IA do IAC Farm, um sistema inteligente para o agronegócio. 
    Analise a entrada do usuário (que pode ser texto, imagem ou áudio) e identifique a intenção.
    
    Entrada de texto: "${text || '(Áudio ou imagem enviada)'}"
    
    Intenções possíveis:
    - ADD_PRODUCT: Usuário quer vender ou anunciar um produto (ex: "Quero vender 100kg de batata").
    - CHECK_ORDER: Usuário quer saber o status de um pedido ou entrega (ex: "Onde está meu pedido 123?").
    - FIELD_NOTE: Usuário quer registrar uma atividade na fazenda (ex: "Hoje adubei o talhão 2").
    - PLANT_ID: Usuário enviou uma foto de planta para identificar (MANDATÓRIO se houver imagem de planta).
    - GENERAL_CHAT: Conversa geral ou dúvida que não se encaixa nas anteriores.
    
    Se houver uma imagem de planta (PLANT_ID):
    1. Identifique a espécie (nome comum e científico).
    2. Avalie a saúde (presença de pragas, fungos, deficiência nutricional).
    3. Informe se é tóxica para humanos ou animais.
    4. Dê uma recomendação prática de tratamento "caipira" (ex: calda bordalesa, fumo, adubação específica).
    
    Se houver um áudio, transcreva-o mentalmente e responda à solicitação.
    
    Responda sempre no tom 'caipira moderno' do IAC Farm.`;

    const contents: any[] = [{ text: prompt }];
    if (attachment) {
      contents.push({
        inlineData: {
          mimeType: attachment.mimeType,
          data: attachment.base64
        }
      });
    }

    console.log('[Identify] payload prepared');
    console.log('[Identify] request started');

    const response = await withRetry(() => ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts: contents },
      config: {
        responseMimeType: "application/json",
        responseSchema: aiTaskSchema,
      }
    }));

    const jsonText = response.text;
    if (!jsonText) {
      console.warn('[Identify] response empty');
      return null;
    }
    
    console.log('[Identify] response success');
    const result = JSON.parse(jsonText) as AITaskResponse;
    return result;

  } catch (error: any) {
    const errorStatus = error?.status || error?.code || 'N/A';
    console.error(`[Identify] error status/message: ${errorStatus} / ${error?.message}`);
    return null;
  }
}
