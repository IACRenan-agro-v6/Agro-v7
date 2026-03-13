
import { Camera, CameraEvent } from '../components/CameraGrid'; // We will define interfaces properly or reuse types if needed, for now using loose typing for data file to avoid circular deps if types aren't extracted perfectly yet.
import { Lightbulb, Lock, Waves, Droplets, Zap, Unlock } from 'lucide-react';
import { PresentationPillar, TechSpec } from '../types';

// --- DASHBOARD DATA ---
export const REVENUE_BY_STORE = [
  { name: 'Sede Principal', value: 15200, color: '#35ad73' },
  { name: 'Loja da Cidade', value: 9800, color: '#3b82f6' },
  { name: 'Ceasa', value: 18500, color: '#f59e0b' },
  { name: 'Cooperativa', value: 7500, color: '#8b5cf6' },
];

export const STOCK_DATA = [
  { name: 'Soja', value: 550, color: '#fbbf24' },
  { name: 'Milho', value: 380, color: '#f87171' },
  { name: 'Café', value: 150, color: '#8b5cf6' },
  { name: 'Hortifruti', value: 95, color: '#35ad73' },
  { name: 'Insumos', value: 60, color: '#94a3b8' },
];

export const REVENUE_HISTORY = [
  { day: 'Seg', value: 35400 },
  { day: 'Ter', value: 42200 },
  { day: 'Qua', value: 38100 },
  { day: 'Qui', value: 52500 },
  { day: 'Sex', value: 45000 },
  { day: 'Sáb', value: 62000 },
  { day: 'Dom', value: 48400 },
];

export const RAIN_COMPARISON = [
    { month: 'Set', current: 120, past: 140 },
    { month: 'Out', current: 150, past: 130 },
    { month: 'Nov', current: 180, past: 110 },
    { month: 'Dez', current: 200, past: 160 },
    { month: 'Jan', current: 210, past: 240 },
    { month: 'Fev', current: 160, past: 180 },
];

export const RECENT_TRANSACTIONS = [
  { id: 1, store: 'Ceasa', product: '120cx Tomate', value: 'R$ 4.200,00', time: '10:30', status: 'completed' },
  { id: 2, store: 'Sede Principal', product: 'Venda Direta (Soja)', value: 'R$ 8.500,00', time: '09:15', status: 'completed' },
  { id: 3, store: 'Loja da Cidade', product: 'Milho Verde (Varejo)', value: 'R$ 350,00', time: '08:45', status: 'completed' },
  { id: 4, store: 'Cooperativa', product: 'Entrega Programada', value: 'R$ 6.200,00', time: '08:00', status: 'pending' },
];

export const ENERGY_GENERATION_DATA = [
  { time: '06:00', solar: 0.5, consumption: 2.1 },
  { time: '08:00', solar: 3.2, consumption: 4.5 },
  { time: '10:00', solar: 8.5, consumption: 5.2 },
  { time: '12:00', solar: 12.4, consumption: 6.1 },
  { time: '14:00', solar: 11.8, consumption: 5.8 },
  { time: '16:00', solar: 7.2, consumption: 4.2 },
  { time: '18:00', solar: 1.5, consumption: 3.5 },
];

export const STORE_HISTORY_DETAILS: Record<string, { date: string; product: string; value: string; type: 'in' | 'out' }[]> = {
  'Sede Principal': [
    { date: 'Hoje, 09:15', product: 'Venda Direta (Soja)', value: 'R$ 8.500,00', type: 'in' },
    { date: 'Ontem', product: 'Soja em Grão (500sc)', value: 'R$ 67.500,00', type: 'in' },
    { date: '12/10/2024', product: 'Pagamento Fornecedor', value: '- R$ 12.000,00', type: 'out' },
    { date: '10/10/2024', product: 'Milho (Secagem)', value: 'R$ 18.000,00', type: 'in' },
    { date: '05/10/2024', product: 'Venda Insumos', value: 'R$ 2.400,00', type: 'in' },
  ],
  'Ceasa': [
    { date: 'Hoje, 10:30', product: '120cx Tomate', value: 'R$ 4.200,00', type: 'in' },
    { date: 'Ontem', product: 'Pimentão Amarelo (50cx)', value: 'R$ 2.100,00', type: 'in' },
    { date: '14/10/2024', product: 'Logística / Frete', value: '- R$ 350,00', type: 'out' },
    { date: '12/10/2024', product: 'Abobrinha Italiana', value: 'R$ 1.800,00', type: 'in' },
  ],
  'Loja da Cidade': [
    { date: 'Hoje, 08:45', product: 'Milho Verde (Varejo)', value: 'R$ 350,00', type: 'in' },
    { date: 'Ontem', product: 'Queijos Artesanais', value: 'R$ 890,00', type: 'in' },
    { date: '14/10/2024', product: 'Doces Caseiros', value: 'R$ 240,00', type: 'in' },
    { date: '13/10/2024', product: 'Hortaliças Diversas', value: 'R$ 560,00', type: 'in' },
  ],
  'Cooperativa': [
    { date: 'Hoje, 08:00', product: 'Entrega Programada (Café)', value: 'R$ 6.200,00', type: 'in' },
    { date: '01/10/2024', product: 'Adiantamento Safra', value: 'R$ 25.000,00', type: 'in' },
    { date: '28/09/2024', product: 'Compra de Adubo', value: '- R$ 8.500,00', type: 'out' },
  ]
};

// --- CAMERA & SECURITY DATA ---
export const CAMERAS = [
  { id: 'CAM-01', label: 'Portão Principal', isOnline: true, seed: 120, location: 'Entrada' },
  { id: 'CAM-02', label: 'Galpão de Maquinas', isOnline: true, seed: 121, location: 'Operacional' },
  { id: 'CAM-03', label: 'Silo de Grãos', isOnline: true, seed: 122, location: 'Armazenamento' },
  { id: 'CAM-04', label: 'Curral de Manejo', isOnline: true, seed: 123, location: 'Pecuária' },
  { id: 'CAM-05', label: 'Estufa Hidropônica A', isOnline: true, seed: 124, location: 'Cultivo' },
  { id: 'CAM-06', label: 'Estufa Hidropônica B', isOnline: true, seed: 125, location: 'Cultivo' },
  { id: 'CAM-07', label: 'Pasto Norte', isOnline: true, seed: 126, location: 'Pecuária' },
  { id: 'CAM-08', label: 'Pasto Sul', isOnline: false, seed: 127, location: 'Pecuária' },
  { id: 'CAM-09', label: 'Represa', isOnline: true, seed: 128, location: 'Recursos Hídricos' },
  { id: 'CAM-10', label: 'Casa de Bombas', isOnline: true, seed: 129, location: 'Infraestrutura' },
  { id: 'CAM-11', label: 'Pomar de Citrus', isOnline: true, seed: 130, location: 'Cultivo' },
  { id: 'CAM-12', label: 'Horta Orgânica', isOnline: true, seed: 131, location: 'Cultivo' },
  { id: 'CAM-13', label: 'Galinheiro', isOnline: true, seed: 132, location: 'Pecuária' },
  { id: 'CAM-14', label: 'Depósito de Insumos', isOnline: true, seed: 133, location: 'Armazenamento' },
  { id: 'CAM-15', label: 'Área de Lazer', isOnline: true, seed: 134, location: 'Sede' },
  { id: 'CAM-16', label: 'Portão dos Fundos', isOnline: true, seed: 135, location: 'Entrada' },
  { id: 'CAM-17', label: 'Entrada de Animais', isOnline: true, seed: 136, location: 'Pecuária' },
];

export const MOCK_EVENTS = [
    { id: 'evt-1', time: '10:15 AM', type: 'motion', description: 'Movimento Detectado - Zona Norte', severity: 'medium', camLabel: 'Portão Principal' },
    { id: 'evt-4', time: '09:30 AM', type: 'system', description: 'Falha de Conexão - Câmera 3', severity: 'medium', camLabel: 'Pasto Sul' },
    { id: 'evt-5', time: '08:00 AM', type: 'system', description: 'Sistema Armado', severity: 'low', camLabel: 'Central' },
    { id: 'evt-6', time: '04:00 AM', type: 'animal', description: 'Animal fora do perímetro', severity: 'high', camLabel: 'Curral' },
    { id: 'evt-7', time: '02:15 AM', type: 'motion', description: 'Movimento - Galpão', severity: 'medium', camLabel: 'Galpão' },
];

// --- EMATER CHANNEL DATA ---
export const NEWS_DATA = [
  {
    id: 1,
    title: 'Previsão de Safra Recorde para o Milho na Região Sudeste',
    category: 'Agricultura',
    date: '12 Out, 2024',
    author: 'Carlos Silva',
    readTime: '4 min',
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=1200&auto=format&fit=crop', // Corn field
    summary: 'Estudos indicam um aumento de 15% na produtividade devido às novas técnicas de manejo de solo implementadas no último ciclo.',
    fullContent: `...` // Truncated for brevity
  },
  {
    id: 2,
    title: 'Campanha de Vacinação contra Febre Aftosa Prorrogada',
    category: 'Pecuária',
    date: '10 Out, 2024',
    author: 'Dra. Ana Paula',
    readTime: '3 min',
    image: 'https://images.unsplash.com/photo-1544600122-c2e912239457?q=80&w=1200&auto=format&fit=crop', // Cattle
    summary: 'Produtores têm até o final do mês para regularizar a vacinação do rebanho. Confira os pontos de distribuição e calendário oficial.',
    fullContent: `...`
  },
  {
    id: 3,
    title: 'Novo Programa de Crédito Rural para Energia Solar',
    category: 'Sustentabilidade',
    date: '08 Out, 2024',
    author: 'Economia Rural',
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1200&auto=format&fit=crop', // Solar panels
    summary: 'Governo lança linha de crédito com juros baixos (2.5% a.a) para instalação de painéis fotovoltaicos em propriedades rurais.',
    fullContent: `...`
  },
  {
    id: 4,
    title: 'Tecnologia de Drones Revolucionando a Pulverização',
    category: 'Inovação',
    date: '05 Out, 2024',
    author: 'Tech Agro',
    readTime: '4 min',
    image: 'https://images.unsplash.com/photo-1508614589041-895b8c9d7418?q=80&w=1200&auto=format&fit=crop', // Drone
    summary: 'Uso de VANTs reduz desperdício de defensivos em até 40% e aumenta precisão em áreas de difícil acesso e topografia complexa.',
    fullContent: `...`
  },
  {
    id: 5,
    title: 'Alta na Exportação de Frutas Tropicais',
    category: 'Mercado',
    date: '03 Out, 2024',
    author: 'Jornal do Mercado',
    readTime: '3 min',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=1200&auto=format&fit=crop', // Fruits
    summary: 'Brasil bate recorde de envio de manga e melão para a Europa. Valorização do dólar favorece produtores do Nordeste.',
    fullContent: `...`
  },
  {
    id: 6,
    title: 'Workshop: Manejo Biológico de Pragas',
    category: 'Eventos',
    date: '01 Out, 2024',
    author: 'Educação EMATER',
    readTime: '2 min',
    image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=1200&auto=format&fit=crop', // Insect/Nature
    summary: 'Inscreva-se para o curso prático sobre controle biológico utilizando inimigos naturais. Vagas limitadas na sede da EMATER.',
    fullContent: `...`
  },
  {
    id: 7,
    title: 'Safra de Soja 2024/2025: Expectativas e Clima',
    category: 'Agricultura',
    date: '29 Set, 2024',
    author: 'Meteorologia Agrícola',
    readTime: '6 min',
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ced72a?q=80&w=1200&auto=format&fit=crop', // Soy field
    summary: 'Análise completa do impacto do El Niño na próxima safra de soja. Prepare-se para janelas de plantio mais curtas.',
    fullContent: `...`
  },
  {
    id: 8,
    title: 'Preços do Café Arábica em Alta na Bolsa',
    category: 'Mercado',
    date: '25 Set, 2024',
    author: 'Jornal do Mercado',
    readTime: '3 min',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200&auto=format&fit=crop', // Coffee
    summary: 'Escassez de chuva no Vietnã impacta oferta global e beneficia cafeicultores brasileiros. Veja cotações.',
    fullContent: `...`
  },
  {
    id: 9,
    title: 'Feira de Máquinas Agrícolas em Ribeirão Preto',
    category: 'Eventos',
    date: '20 Set, 2024',
    author: 'AgroNews',
    readTime: '2 min',
    image: 'https://images.unsplash.com/photo-1532054995963-c741dd442bd3?q=80&w=1200&auto=format&fit=crop', // Tractor
    summary: 'A maior feira do setor apresentará tratores autônomos e colheitadeiras com IA na próxima semana.',
    fullContent: `...`
  },
  {
    id: 10,
    title: 'Controle de Nematoides em Hortaliças',
    category: 'Técnica',
    date: '18 Set, 2024',
    author: 'Dra. Helena Souza',
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=1200&auto=format&fit=crop', // Plant lab/hand
    summary: 'Novas abordagens biológicas para controle de nematoides em culturas de tomate e pimentão.',
    fullContent: `...`
  }
];

export const RESEARCH_DATA = [
  { id: 1, title: 'Manejo Integrado de Pragas na Soja', author: 'Dra. Helena Souza', year: '2024', type: 'Artigo Técnico', downloads: 1240 },
  { id: 2, title: 'Eficiência do Uso da Água em Pivôs Centrais', author: 'Eng. Carlos Mendes', year: '2023', type: 'Estudo de Caso', downloads: 850 },
  { id: 3, title: 'Novas Variedades de Café Resistentes à Ferrugem', author: 'Instituto Agronômico', year: '2024', type: 'Boletim Técnico', downloads: 2100 },
  { id: 4, title: 'Guia de Correção de Acidez do Solo', author: 'EMATER Técnica', year: '2023', type: 'Manual Prático', downloads: 5300 },
  { id: 5, title: 'Adubação Verde em Culturas Anuais', author: 'Dr. Roberto Campos', year: '2022', type: 'Artigo Técnico', downloads: 980 },
  { id: 6, title: 'Automação na Pecuária Leiteira', author: 'Tecnologia Rural', year: '2024', type: 'Estudo de Caso', downloads: 1500 },
  { id: 7, title: 'Catálogo de Sementes de Milho 2024', author: 'EMATER', year: '2024', type: 'Manual Prático', downloads: 4100 },
  { id: 8, title: 'Impactos do Clima na Fruticultura', author: 'Meteorologia Agrícola', year: '2022', type: 'Boletim Técnico', downloads: 1100 }
];

// --- AUTOMATION DEVICES DATA ---
export const AUTOMATION_DEVICES = [
    { 
      id: 'light-1', name: 'Holofotes do Galpão', type: 'light', category: 'Iluminação', location: 'Sede Operacional',
      isActive: false, isLoading: false, restricted: false, schedules: [{id: 's1', time: '18:30', action: 'on', days: ['Diário']}] 
    },
    { 
      id: 'light-2', name: 'Luzes do Curral', type: 'light', category: 'Iluminação', location: 'Pecuária',
      isActive: true, isLoading: false, restricted: false, schedules: [] 
    },
    { 
      id: 'light-3', name: 'Jardim da Sede', type: 'light', category: 'Iluminação', location: 'Social',
      isActive: false, isLoading: false, restricted: false, schedules: [] 
    },
    { 
      id: 'gate-1', name: 'Pórtico Principal', type: 'gate', category: 'Acesso', location: 'Entrada Norte',
      isActive: false, isLoading: false, restricted: true, schedules: [] 
    },
    { 
      id: 'gate-2', name: 'Acesso Pasto 04', type: 'gate', category: 'Acesso', location: 'Pecuária',
      isActive: true, isLoading: false, restricted: false, schedules: [] 
    },
    { 
      id: 'pump-1', name: 'Bomba Poço Artesiano', type: 'pump', category: 'Hidráulica', location: 'Captação',
      isActive: true, isLoading: false, restricted: true, meta: 'Vazão: 12m³/h', schedules: [] 
    },
    { 
      id: 'pump-2', name: 'Recalque Caixa Central', type: 'pump', category: 'Hidráulica', location: 'Reservatório',
      isActive: false, isLoading: false, restricted: true, meta: 'Nível: 90%', schedules: [] 
    },
    { 
      id: 'irr-1', name: 'Pivô Central 01', type: 'irrigation', category: 'Irrigação', location: 'Lavoura Soja',
      isActive: false, isLoading: false, restricted: true, meta: 'Umidade Solo: 32%', schedules: [] 
    },
    { 
      id: 'irr-2', name: 'Gotejamento Estufa', type: 'irrigation', category: 'Irrigação', location: 'Hortifruti',
      isActive: true, isLoading: false, restricted: false, meta: 'Fertirrigação: ON', schedules: [] 
    },
];

// --- PRESENTATION DATA ---
export const PRESENTATION_PILLARS: PresentationPillar[] = [
  {
    id: '01',
    title: 'IA Generativa (Gemini)',
    description: 'O cérebro do sistema, capaz de analisar imagens e dados complexos.',
    iconType: 'brain',
    color: 'blue',
    items: [
      'Diagnóstico visual de pragas.',
      'Chatbot consultor agronômico.',
      'Planejamento de safra regional.'
    ]
  },
  {
    id: '02',
    title: 'Segurança Inteligente',
    description: 'Proteção patrimonial com visão computacional integrada.',
    iconType: 'cctv',
    color: 'red',
    items: [
      'Detecção de intrusão e movimento.',
      'Grid de monitoramento remoto.',
      'Histórico de eventos de risco.'
    ]
  },
  {
    id: '03',
    title: 'Automação IoT',
    description: 'Controle total da infraestrutura da fazenda na palma da mão.',
    iconType: 'zap',
    color: 'amber',
    items: [
      'Acionamento remoto de pivôs.',
      'Controle de iluminação e acesso.',
      'Gestão de energia solar.'
    ]
  },
  {
    id: '04',
    title: 'Gestão 360°',
    description: 'Dados financeiros e produtivos para tomada de decisão.',
    iconType: 'chart',
    color: 'green',
    items: [
      'Fluxo de caixa e vendas por canal.',
      'Controle de estoque de grãos.',
      'Integração com cotações.'
    ]
  }
];

export const PRESENTATION_TECH_SPECS: TechSpec[] = [
  {
    title: 'Nuvem Híbrida',
    description: 'Operação com sincronização em nuvem e suporte a modo offline crítico (PWA).',
    iconType: 'globe',
    color: 'farm'
  },
  {
    title: 'Multi-Device',
    description: 'Responsividade total para Tablets, Smartphones e Desktops sem instalação.',
    iconType: 'mobile',
    color: 'blue'
  },
  {
    title: 'Segurança',
    description: 'Criptografia ponta-a-ponta e controle de acesso hierárquico (Admin/Operador).',
    iconType: 'shield',
    color: 'green'
  }
];
