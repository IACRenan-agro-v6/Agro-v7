import React, { useState } from 'react';
import { Newspaper, FlaskConical, Phone, Mail, ChevronRight, Download, ExternalLink, Search, Calendar, MapPin, Send, X, Clock, User, Share2, Filter, ChevronDown, Loader2 } from 'lucide-react';
import { NEWS_DATA, RESEARCH_DATA } from '../data/mockData';

type Tab = 'news' | 'research' | 'contact';

interface NewsItem {
  id: number;
  title: string;
  category: string;
  date: string;
  image: string;
  summary: string;
  fullContent: string;
  author: string;
  readTime: string;
}

const EmaterChannel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('news');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  
  // State for News Pagination
  const [visibleNewsCount, setVisibleNewsCount] = useState(6);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // State for Research Filters
  const [researchType, setResearchType] = useState('Todos');
  const [researchYear, setResearchYear] = useState('Todos');

  const handleShare = (news: NewsItem) => {
    if (navigator.share) {
      navigator.share({
        title: news.title,
        text: news.summary,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert("Link copiado para a área de transferência!");
    }
  };

  const loadMoreNews = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleNewsCount(prev => prev + 6);
      setIsLoadingMore(false);
    }, 800); // Simulate network delay
  };

  // Derived Data
  const visibleNews = NEWS_DATA.slice(0, visibleNewsCount);
  const hasMoreNews = visibleNewsCount < NEWS_DATA.length;

  const researchTypes = ['Todos', ...Array.from(new Set(RESEARCH_DATA.map(item => item.type)))];
  const researchYears = ['Todos', ...Array.from(new Set(RESEARCH_DATA.map(item => item.year))).sort().reverse()];

  const filteredResearch = RESEARCH_DATA.filter(item => {
    const typeMatch = researchType === 'Todos' || item.type === researchType;
    const yearMatch = researchYear === 'Todos' || item.year === researchYear;
    return typeMatch && yearMatch;
  });

  return (
    <div className="w-full h-full overflow-y-auto bg-stone-50 relative">
      {/* Hero Header */}
      <div className="bg-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 px-8 py-12 max-w-6xl mx-auto">
           <div className="inline-flex items-center gap-2 bg-blue-800/50 backdrop-blur-sm px-3 py-1 rounded-full border border-blue-400/30 text-xs font-bold tracking-widest uppercase mb-4">
              <Newspaper size={14} /> Canal Oficial
           </div>
           <h1 className="text-4xl md:text-5xl font-bold mb-4">Canal EMATER</h1>
           <p className="text-blue-100 text-lg max-w-2xl leading-relaxed">
             Sua fonte direta de informações, pesquisas técnicas e suporte especializado para o campo.
             Conectando conhecimento ao produtor.
           </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-20 bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex gap-8 overflow-x-auto">
           <button 
             onClick={() => setActiveTab('news')}
             className={`py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'news' ? 'border-blue-600 text-blue-800' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
           >
             <Newspaper size={18} /> Informativos & Notícias
           </button>
           <button 
             onClick={() => setActiveTab('research')}
             className={`py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'research' ? 'border-blue-600 text-blue-800' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
           >
             <FlaskConical size={18} /> Pesquisas & Técnica
           </button>
           <button 
             onClick={() => setActiveTab('contact')}
             className={`py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'contact' ? 'border-blue-600 text-blue-800' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
           >
             <Phone size={18} /> Fale Conosco
           </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-6xl mx-auto p-4 md:p-8 pb-24">
        
        {/* NEWS TAB */}
        {activeTab === 'news' && (
          <div className="animate-slide-up space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
               <div><h2 className="text-2xl font-bold text-stone-800">Notícias do Campo</h2><p className="text-stone-500">Atualizações sobre o agronegócio e comunicados oficiais.</p></div>
               <div className="relative"><input type="text" placeholder="Buscar notícias..." className="pl-10 pr-4 py-2 rounded-full border border-stone-200 bg-white focus:ring-2 focus:ring-blue-100 outline-none w-64 text-sm"/><Search className="absolute left-3 top-2.5 text-stone-400" size={16} /></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleNews.map(news => (
                <div key={news.id} onClick={() => setSelectedNews(news)} className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer flex flex-col h-full ring-1 ring-stone-900/5">
                  <div className="h-52 overflow-hidden relative shrink-0">
                    <img src={news.image} alt={news.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur text-blue-900 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-md uppercase tracking-wider">{news.category}</div>
                  </div>
                  <div className="p-6 flex flex-col flex-1 relative">
                    <div className="flex items-center gap-3 text-stone-400 text-xs font-bold mb-3"><span className="flex items-center gap-1"><Calendar size={12} /> {news.date}</span><span className="w-1 h-1 rounded-full bg-stone-300"></span><span className="flex items-center gap-1"><Clock size={12} /> {news.readTime}</span></div>
                    <h3 className="text-lg font-bold text-stone-900 mb-3 leading-tight group-hover:text-blue-700 transition-colors">{news.title}</h3>
                    <p className="text-stone-500 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">{news.summary}</p>
                    <button className="text-blue-600 font-bold text-xs uppercase tracking-widest flex items-center gap-1 group/btn mt-auto">Ler completo <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" /></button>
                  </div>
                </div>
              ))}
            </div>

            {hasMoreNews && (
               <div className="flex justify-center pt-8">
                  <button 
                    onClick={loadMoreNews} 
                    disabled={isLoadingMore}
                    className="flex items-center gap-2 px-8 py-4 bg-white border border-stone-200 text-stone-600 font-bold rounded-full hover:bg-stone-50 hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm disabled:opacity-50"
                  >
                    {isLoadingMore ? <Loader2 size={20} className="animate-spin" /> : <ChevronDown size={20} />}
                    {isLoadingMore ? 'Carregando...' : 'Carregar Mais Notícias'}
                  </button>
               </div>
            )}
          </div>
        )}

        {/* RESEARCH TAB */}
        {activeTab === 'research' && (
          <div className="animate-slide-up space-y-8">
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-4 flex-1">
                 <div className="p-3 bg-blue-100 rounded-xl text-blue-600"><FlaskConical size={32} /></div>
                 <div><h3 className="text-lg font-bold text-blue-900">Biblioteca Técnica EMATER</h3><p className="text-blue-700/80 text-sm">Acesse estudos, manuais e cartilhas desenvolvidas por nossos especialistas.</p></div>
               </div>
               
               {/* Filters */}
               <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
                 <div className="relative">
                    <select 
                      value={researchType}
                      onChange={(e) => setResearchType(e.target.value)}
                      className="appearance-none w-full md:w-48 bg-white border border-blue-200 text-stone-700 py-3 pl-4 pr-10 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
                    >
                      {researchTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <Filter className="absolute right-3 top-3.5 text-blue-400 pointer-events-none" size={16} />
                 </div>
                 <div className="relative">
                    <select 
                      value={researchYear}
                      onChange={(e) => setResearchYear(e.target.value)}
                      className="appearance-none w-full md:w-32 bg-white border border-blue-200 text-stone-700 py-3 pl-4 pr-10 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
                    >
                      {researchYears.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                    <Calendar className="absolute right-3 top-3.5 text-blue-400 pointer-events-none" size={16} />
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredResearch.length > 0 ? (
                filteredResearch.map(item => (
                  <div key={item.id} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm hover:border-blue-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                     <div className="flex items-start gap-4"><div className="hidden md:flex w-12 h-12 bg-stone-100 rounded-lg items-center justify-center text-stone-400 font-bold text-xs uppercase">PDF</div><div><h4 className="font-bold text-stone-800 text-lg">{item.title}</h4><div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500 mt-1"><span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> {item.type}</span><span>•</span><span>Autor: {item.author}</span><span>•</span><span>Ano: {item.year}</span></div></div></div>
                     <button className="flex items-center gap-2 text-stone-500 hover:text-blue-600 font-medium text-sm border border-stone-200 hover:border-blue-200 px-4 py-2 rounded-lg transition-colors bg-stone-50 hover:bg-white w-full md:w-auto justify-center"><Download size={16} /> Baixar ({item.downloads})</button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-stone-400 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
                   <p className="font-bold">Nenhum resultado encontrado para este filtro.</p>
                   <button onClick={() => {setResearchType('Todos'); setResearchYear('Todos')}} className="mt-2 text-blue-600 text-sm font-bold hover:underline">Limpar Filtros</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONTACT TAB */}
        {activeTab === 'contact' && (
          <div className="animate-slide-up grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                  <h3 className="text-xl font-bold text-stone-800 mb-6">Canais de Atendimento</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl border border-stone-100"><div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center"><Phone size={20} /></div><div><p className="text-xs font-bold text-stone-400 uppercase tracking-wider">WhatsApp & Telefone</p><p className="text-lg font-bold text-stone-800">(11) 99999-0000</p></div></div>
                    <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl border border-stone-100"><div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><Mail size={20} /></div><div><p className="text-xs font-bold text-stone-400 uppercase tracking-wider">E-mail Oficial</p><p className="text-lg font-bold text-stone-800">duvidas@emater.sp.gov.br</p></div></div>
                    <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl border border-stone-100"><div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center"><MapPin size={20} /></div><div><p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Escritório Regional</p><p className="text-lg font-bold text-stone-800">Av. das Nações, 1200 - Centro</p></div></div>
                  </div>
                </div>
                <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg shadow-blue-600/20 relative overflow-hidden">
                   <div className="relative z-10"><h3 className="text-xl font-bold mb-2">Visita Técnica</h3><p className="text-blue-100 mb-4 text-sm">Precisa de um agrônomo na sua propriedade? Agende uma visita técnica através do nosso portal de serviços.</p><button className="bg-white text-blue-700 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-50 transition-colors">Solicitar Visita <ExternalLink size={14} /></button></div>
                   <div className="absolute right-[-20px] bottom-[-20px] opacity-20"><FlaskConical size={120} /></div>
                </div>
             </div>
             <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm h-fit">
               <h3 className="text-xl font-bold text-stone-800 mb-2">Envie sua Dúvida</h3>
               <p className="text-stone-500 text-sm mb-6">Nossos especialistas responderão em até 24h úteis.</p>
               <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Seu Nome</label>
                     <input type="text" placeholder="Nome Completo" className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-stone-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"/>
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Seu E-mail</label>
                     <input type="email" placeholder="exemplo@email.com" className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-stone-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"/>
                   </div>
                 </div>
                 <div><label className="block text-xs font-bold text-stone-700 uppercase mb-1">Assunto</label><select className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-stone-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"><option>Manejo de Pragas</option><option>Análise de Solo</option><option>Crédito Rural</option><option>Outros</option></select></div>
                 <div><label className="block text-xs font-bold text-stone-700 uppercase mb-1">Sua Mensagem</label><textarea rows={5} placeholder="Descreva sua dúvida com detalhes..." className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-stone-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium resize-none"></textarea></div>
                 <button className="w-full bg-farm-600 hover:bg-farm-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-farm-600/20 transition-all flex items-center justify-center gap-2"><Send size={18} /> Enviar Mensagem</button>
               </form>
             </div>
          </div>
        )}
      </div>

      {/* FULL SCREEN NEWS READER MODAL */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setSelectedNews(null)}></div>
           <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative z-10 animate-slide-up flex flex-col">
              <button onClick={() => setSelectedNews(null)} className="absolute top-4 right-4 z-20 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-md transition-all border border-white/20"><X size={24} /></button>
              <div className="relative h-64 md:h-80 w-full shrink-0">
                 <img src={selectedNews.image} alt={selectedNews.title} className="w-full h-full object-cover"/>
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                 <div className="absolute bottom-6 left-6 md:left-10 right-6 text-white"><span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block shadow-lg shadow-blue-600/30">{selectedNews.category}</span><h1 className="text-2xl md:text-4xl font-black leading-tight shadow-black drop-shadow-md">{selectedNews.title}</h1></div>
              </div>
              <div className="p-6 md:p-10">
                 <div className="flex flex-wrap items-center gap-6 pb-6 border-b border-stone-100 text-stone-500 text-sm font-medium mb-8">
                    <div className="flex items-center gap-2"><User size={16} className="text-farm-600" /> Por <span className="text-stone-800">{selectedNews.author}</span></div>
                    <div className="flex items-center gap-2"><Calendar size={16} className="text-farm-600" /> {selectedNews.date}</div>
                    <div className="flex items-center gap-2"><Clock size={16} className="text-farm-600" /> {selectedNews.readTime} de leitura</div>
                    <button onClick={() => handleShare(selectedNews)} className="ml-auto flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-bold uppercase text-xs tracking-wider"><Share2 size={16} /> Compartilhar</button>
                 </div>
                 <div className="prose prose-lg prose-stone max-w-none text-justify text-stone-700 leading-loose">
                    {selectedNews.fullContent.split('\n').map((paragraph, idx) => (paragraph.trim() && <p key={idx} className="mb-6">{paragraph.trim()}</p>))}
                 </div>
                 <div className="mt-12 pt-8 border-t border-stone-100 flex justify-center"><button onClick={() => setSelectedNews(null)} className="px-8 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold transition-colors">Fechar Leitura</button></div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default EmaterChannel;