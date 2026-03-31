
import { useLocation, useNavigate } from 'react-router-dom';
import { ViewMode } from '../types';

export const useNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Derive view from pathname
  const getPathView = (): ViewMode | 'registry' => {
    const path = location.pathname.replace('/', '');
    
    // Handle special cases or mapping if needed
    if (path === 'retail-insights') return 'retail_insights';
    if (path === 'consumer-hub') return 'consumer_hub';
    if (path === 'professional-hub') return 'professional_hub';
    
    return (path as ViewMode | 'registry') || 'chat';
  };

  const view = getPathView();

  const setView = (newView: ViewMode | 'registry') => {
    let path = newView as string;
    if (newView === 'retail_insights') path = 'retail-insights';
    if (newView === 'consumer_hub') path = 'consumer-hub';
    if (newView === 'professional_hub') path = 'professional-hub';
    
    navigate(`/${path}`);
  };

  const getHeaderTitle = () => {
    switch (view) {
      case 'chat': return 'IAC Farm - Assistente';
      case 'planner': return 'Planejamento';
      case 'cameras': return 'Segurança';
      case 'automations': return 'Acionamentos';
      case 'dashboard': return 'Minha Fazenda';
      case 'emater': return 'Canal EMATER';
      case 'presentation': return 'Relatório Executivo';
      case 'market': return 'Mercado & Cotações';
      case 'logistics': return 'Logística & Frete';
      case 'pos': return 'PDV Varejo';
      case 'retail_insights': return 'Insights Varejo';
      case 'consumer_hub': return 'Saúde & Nutrição';
      case 'professional_hub': return 'Hub do Profissional';
      case 'settings': return 'Configurações';
      case 'registry': return 'Minhas Plantas';
      default: return 'IAC Farm';
    }
  };

  return { view, setView, getHeaderTitle };
};
