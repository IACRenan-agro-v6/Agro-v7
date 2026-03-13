import React from 'react';
import { 
  BrainCircuit, 
  Cctv, 
  Zap, 
  Smartphone, 
  Globe, 
  ShieldCheck, 
  Leaf, 
  Cpu, 
  Wifi, 
  Printer,
  Sprout,
  BarChart3
} from 'lucide-react';
import { PRESENTATION_PILLARS, PRESENTATION_TECH_SPECS } from '../data/mockData';
import { PresentationPillar } from '../types';

const SystemPresentation: React.FC = () => {
  const handlePrint = () => {
    // Change title temporarily for the PDF filename
    const originalTitle = document.title;
    document.title = "Relatorio_Executivo_IAC_Farm";
    
    // Small timeout to ensure title is updated before print dialog triggers
    setTimeout(() => {
      window.print();
      // Revert title after print dialog closes
      setTimeout(() => {
          document.title = originalTitle;
      }, 500);
    }, 100);
  };

  const getPillarIcon = (type: PresentationPillar['iconType']) => {
    switch(type) {
      case 'brain': return <BrainCircuit size={24} />;
      case 'cctv': return <Cctv size={24} />;
      case 'zap': return <Zap size={24} />;
      case 'chart': return <BarChart3 size={24} />;
      default: return <BrainCircuit size={24} />;
    }
  };

  const getPillarStyles = (color: PresentationPillar['color']) => {
    switch(color) {
      case 'blue': return { bg: 'bg-blue-100', text: 'text-blue-600', dot: 'bg-blue-500' };
      case 'red': return { bg: 'bg-red-100', text: 'text-red-600', dot: 'bg-red-500' };
      case 'amber': return { bg: 'bg-amber-100', text: 'text-amber-600', dot: 'bg-amber-500' };
      case 'green': return { bg: 'bg-green-100', text: 'text-green-600', dot: 'bg-green-500' };
      default: return { bg: 'bg-stone-100', text: 'text-stone-600', dot: 'bg-stone-500' };
    }
  };

  return (
    <div id="system-presentation" className="w-full h-full overflow-y-auto bg-white text-stone-900 animate-fade-in relative">
      
      {/* ROBUST PRINT STYLES */}
      <style>{`
        @media print {
          /* 1. Global Page Reset */
          @page {
            size: A4;
            margin: 0mm;
          }
          
          /* 2. Reset SPA Containers (CRITICAL) */
          html, body, #root, main {
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            position: static !important;
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* 3. Hide EVERYTHING by default using visibility to avoid layout collapse issues during calculation */
          body * {
            visibility: hidden;
            height: 0; /* Try to collapse hidden elements */
            overflow: hidden;
          }

          /* 4. Show ONLY the presentation container and its children */
          #system-presentation, #system-presentation * {
            visibility: visible;
            height: auto;
            overflow: visible;
          }

          /* 5. Position the presentation absolutely over everything else to ensure it starts at top of page 1 */
          #system-presentation {
            position: absolute;
            top: 0;
            left: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            z-index: 9999;
          }

          /* 6. Force Graphics & Colors */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-shadow: none !important;
            text-shadow: none !important;
          }

          /* 7. Hide Specific UI Elements explicitly */
          .print-hidden, button, nav, aside, .sidebar {
            display: none !important;
          }

          /* Typography Scale for Print */
          h1 { font-size: 32pt !important; line-height: 1.1 !important; }
          h2 { font-size: 20pt !important; }
          p, li { font-size: 11pt !important; line-height: 1.5 !important; color: #1c1917 !important; }

          /* Layout Helpers */
          .break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          .page-break-before {
            break-before: page;
            page-break-before: always;
            margin-top: 0 !important;
            padding-top: 2rem !important;
          }
        }
      `}</style>

      {/* Floating Action Button */}
      <div className="fixed top-24 right-8 z-50 print-hidden animate-slide-in-right">
        <button 
          onClick={handlePrint}
          className="flex items-center gap-3 bg-stone-900 hover:bg-farm-600 text-white px-6 py-4 rounded-full shadow-2xl hover:shadow-farm-500/30 transition-all font-bold text-sm transform hover:-translate-y-1 group"
        >
          <Printer size={20} className="group-hover:animate-bounce" /> 
          <span>Exportar PDF</span>
        </button>
      </div>

      {/* --- PAGE 1: COVER --- */}
      <div className="min-h-screen w-full flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-stone-50 to-stone-100 relative overflow-hidden print:h-[297mm] print:min-h-[297mm] print:p-0 print:bg-white">
        
        {/* Abstract Background Shapes (Screen Only) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30 print-hidden">
           <div className="absolute -top-[20%] -right-[20%] w-[70%] h-[70%] bg-farm-200 rounded-full blur-[120px]"></div>
           <div className="absolute top-[40%] -left-[10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center print:pt-32">
          <div className="bg-white p-6 rounded-3xl shadow-2xl mb-8 ring-1 ring-stone-900/5 print:border-none print:shadow-none print:mb-6">
             <Leaf size={80} className="text-farm-600" />
          </div>
          
          <div className="mb-6 space-y-2">
            <h2 className="text-xl md:text-2xl font-bold text-stone-400 tracking-[0.3em] uppercase print:text-stone-500 print:text-lg">Ecossistema Digital</h2>
            <h1 className="text-6xl md:text-8xl font-black text-stone-900 tracking-tighter leading-[0.9] print:text-6xl">
              IAC <span className="text-farm-600">FARM</span>
            </h1>
          </div>

          <div className="w-24 h-2 bg-farm-500 rounded-full mb-8 print:mb-12 print:bg-farm-600"></div>

          <p className="text-xl md:text-3xl text-stone-600 max-w-3xl font-light leading-relaxed mb-12 print:text-xl print:text-stone-800 print:max-w-xl">
            A revolução da agricultura de precisão unindo<br/> 
            <strong className="text-stone-900">Inteligência Artificial</strong>, <strong className="text-stone-900">IoT</strong> e <strong className="text-stone-900">Gestão</strong>.
          </p>

          <div className="grid grid-cols-2 gap-4 text-left mt-8 print:w-full print:max-w-xl print:gap-12 print:mt-16">
             <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-stone-200 print:border-none print:p-0">
                <div className="text-xs text-stone-400 font-bold uppercase tracking-wider print:text-stone-500">Desenvolvido por</div>
                <div className="text-lg font-bold text-stone-800">Instituto Agronômico</div>
             </div>
             <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-stone-200 print:border-none print:p-0">
                <div className="text-xs text-stone-400 font-bold uppercase tracking-wider print:text-stone-500">Parceria Técnica</div>
                <div className="text-lg font-bold text-stone-800">EMATER</div>
             </div>
          </div>
        </div>

        {/* Footer decoration for Cover */}
        <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-r from-farm-500 via-green-400 to-blue-500 print:block"></div>
      </div>

      {/* --- PAGE 2: CONTENT --- */}
      <div className="max-w-5xl mx-auto p-8 md:p-16 page-break-before print:w-full print:max-w-none print:p-12">
        
        {/* Header for internal pages */}
        <div className="hidden print:flex justify-between items-center border-b border-stone-200 pb-4 mb-12">
           <div className="text-stone-400 text-xs font-bold uppercase tracking-widest">Relatório Técnico - 2024</div>
           <div className="flex items-center gap-2 font-bold text-stone-900">
              <Leaf size={16} className="text-farm-600" /> IAC FARM
           </div>
        </div>

        <div className="mb-12 print:mb-10">
          <h2 className="text-4xl font-bold mb-6 text-stone-900">Visão Geral</h2>
          <p className="text-lg text-stone-600 leading-relaxed text-justify mb-8">
            O <strong>IAC Farm</strong> é uma plataforma centralizada projetada para o produtor rural moderno. 
            Diferente de sistemas fragmentados, nossa solução integra diagnóstico fitossanitário via IA Generativa, 
            controle de automação (IoT) e segurança patrimonial em uma única interface intuitiva. 
            O objetivo é reduzir custos operacionais, mitigar riscos climáticos e aumentar a produtividade através de dados.
          </p>

          {/* Video Presentation Section */}
          <div className="bg-stone-100 rounded-3xl overflow-hidden shadow-xl border border-stone-200 print:hidden mb-12">
            <div className="p-4 bg-stone-900 flex items-center justify-between">
              <span className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <BrainCircuit size={16} className="text-farm-400" /> Apresentação do Ecossistema
              </span>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>
            </div>
            <div className="aspect-video w-full bg-black flex items-center justify-center">
              <video 
                controls 
                className="w-full h-full"
                poster="https://picsum.photos/seed/farm-video/1280/720"
              >
                <source src="https://hoepznsyzdlrzzlrlurp.supabase.co/storage/v1/object/public/videos/apresentacao_clickparts.mp4.mp4" type="video/mp4" />
                Seu navegador não suporta vídeos.
              </video>
            </div>
          </div>
        </div>

        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 print:gap-6">
           {PRESENTATION_PILLARS.map((pillar) => {
             const styles = getPillarStyles(pillar.color);
             return (
               <div key={pillar.id} className="bg-stone-50 p-8 rounded-3xl border border-stone-100 break-inside-avoid print:border-stone-200 print:p-6">
                  <div className="flex items-center justify-between mb-4">
                     <div className={`w-12 h-12 ${styles.bg} ${styles.text} rounded-xl flex items-center justify-center print:bg-white print:border print:border-stone-200`}>
                        {getPillarIcon(pillar.iconType)}
                     </div>
                     <span className="text-5xl font-black text-stone-200 print:text-stone-300">{pillar.id}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-stone-900">{pillar.title}</h3>
                  <p className="text-stone-500 text-sm mb-4">{pillar.description}</p>
                  <ul className="space-y-2 text-stone-700 text-sm font-medium">
                    {pillar.items.map((item, idx) => (
                      <li key={idx} className="flex gap-2 items-center">
                        <div className={`w-1.5 h-1.5 rounded-full ${styles.dot}`}></div> {item}
                      </li>
                    ))}
                  </ul>
               </div>
             );
           })}
        </div>

        {/* Technical Architecture Block */}
        <div className="mb-12 break-inside-avoid">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-stone-200 pb-2">
            <Cpu size={24} className="text-stone-400" />
            Infraestrutura Tecnológica
          </h2>
          
          <div className="bg-stone-900 text-white rounded-3xl p-8 md:p-10 relative overflow-hidden print:bg-stone-900 print:text-white print:rounded-2xl print:p-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 print:gap-4">
                {PRESENTATION_TECH_SPECS.map((spec, idx) => {
                   let icon = <Globe size={18} />;
                   let color = 'text-farm-400';
                   if (spec.iconType === 'mobile') { icon = <Smartphone size={18} />; color = 'text-blue-400'; }
                   if (spec.iconType === 'shield') { icon = <ShieldCheck size={18} />; color = 'text-green-400'; }

                   return (
                      <div key={idx} className="text-left">
                         <div className={`mb-3 ${color} font-bold flex items-center gap-2`}>{icon} {spec.title}</div>
                         <p className="text-stone-400 text-xs leading-relaxed print:text-stone-300">{spec.description}</p>
                      </div>
                   );
                })}
             </div>
          </div>
        </div>

        {/* Connectivity & Support */}
        <div className="flex flex-col md:flex-row gap-8 items-center bg-blue-50 border border-blue-100 p-8 rounded-3xl break-inside-avoid print:bg-blue-50 print:border-blue-200 print:p-6">
           <div className="flex-1">
              <h2 className="text-xl font-bold text-blue-900 mb-2">Conexão EMATER</h2>
              <p className="text-blue-800/70 text-sm mb-4 leading-relaxed">
                Ponte direta entre pesquisa e campo. Recebimento de boletins, alertas sanitários e suporte técnico.
              </p>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2 text-xs font-bold text-blue-700 bg-white px-3 py-2 rounded border border-blue-100">
                    <Wifi size={14} /> Suporte Remoto
                 </div>
                 <div className="flex items-center gap-2 text-xs font-bold text-blue-700 bg-white px-3 py-2 rounded border border-blue-100">
                    <Sprout size={14} /> Pesquisa Aplicada
                 </div>
              </div>
           </div>
           <div className="w-24 h-24 bg-blue-200 rounded-full flex items-center justify-center print:bg-white print:border print:border-blue-200">
               <Leaf size={40} className="text-blue-600" />
           </div>
        </div>

        {/* Footer for last page */}
        <div className="mt-16 border-t border-stone-200 pt-8 text-center print:mt-12">
           <div className="flex items-center justify-center gap-2 mb-2">
              <Leaf size={16} className="text-farm-600" />
              <span className="font-bold text-stone-900 tracking-tight">IAC FARM 2.0</span>
           </div>
           <p className="text-stone-400 text-[10px] uppercase tracking-widest">Tecnologia para o Campo</p>
        </div>

      </div>
    </div>
  );
};

export default SystemPresentation;