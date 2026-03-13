import React, { useState } from 'react';
import { User, Lock, ArrowRight, Loader2, CheckCircle2, Tractor, ShoppingCart, HeartPulse, Stethoscope } from 'lucide-react';
import { UserRole } from '../types';

interface LoginScreenProps {
  onLogin: (role: UserRole) => void;
  onGoToRegister: () => void;
}

// Vector Logo Component for AgroBrasil (Large)
const AgroBrasilLogoLarge = () => (
  <div className="flex items-center gap-4">
    {/* Corn Icon Circle */}
    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-inner ring-2 ring-white/30 relative overflow-hidden group">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform">
        <path d="M7 5C7 3.34315 8.34315 2 10 2H14C15.6569 2 17 3.34315 17 5V16C17 19.3137 14.3137 22 11 22H13C9.68629 22 7 19.3137 7 16V5Z" fill="#FBBF24" />
        <path d="M7 6H17" stroke="#D97706" strokeWidth="0.5" strokeLinecap="round"/>
        <path d="M7 9H17" stroke="#D97706" strokeWidth="0.5" strokeLinecap="round"/>
        <path d="M7 12H17" stroke="#D97706" strokeWidth="0.5" strokeLinecap="round"/>
        <path d="M7 15H15" stroke="#D97706" strokeWidth="0.5" strokeLinecap="round"/>
        <path d="M10 2V18" stroke="#D97706" strokeWidth="0.5" strokeLinecap="round"/>
        <path d="M14 2V18" stroke="#D97706" strokeWidth="0.5" strokeLinecap="round"/>
        <path d="M7 14C5 14 2 16 2 19C2 21 5 22 7 20" fill="#4ADE80" stroke="#16A34A" strokeWidth="1" strokeLinejoin="round"/>
        <path d="M17 14C19 14 22 16 22 19C22 21 19 22 17 20" fill="#4ADE80" stroke="#16A34A" strokeWidth="1" strokeLinejoin="round"/>
      </svg>
    </div>
    
    {/* Text */}
    <div className="flex flex-col leading-none">
        <h1 className="text-3xl font-black tracking-tighter">
          <span className="text-[#4ADE80]">AGRO</span>
          <span className="text-[#60A5FA]">BRASIL</span>
        </h1>
        <span className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase pl-1">Tecnologia</span>
    </div>
  </div>
);

// Vector Logo for Form Header (Dark Text)
const AgroBrasilLogoForm = () => (
  <div className="flex items-center justify-center gap-3 mb-6">
    <div className="w-12 h-12 bg-stone-900 rounded-full flex items-center justify-center ring-2 ring-farm-500">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 5C7 3.34315 8.34315 2 10 2H14C15.6569 2 17 3.34315 17 5V16C17 19.3137 14.3137 22 11 22H13C9.68629 22 7 19.3137 7 16V5Z" fill="#FBBF24" />
        <path d="M7 14C5 14 2 16 2 19C2 21 5 22 7 20" fill="#4ADE80" />
        <path d="M17 14C19 14 22 16 22 19C22 21 19 22 17 20" fill="#4ADE80" />
      </svg>
    </div>
    <div className="text-2xl font-black tracking-tighter">
       <span className="text-[#35ad73]">AGRO</span>
       <span className="text-[#3b82f6]">BRASIL</span>
    </div>
  </div>
);


const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onGoToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.PRODUCER);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay for realism
    setTimeout(() => {
      // Validação: Aceita o usuário antigo (IAC/iac2010) OU o novo Master (iac/123)
      const isLegacyUser = username === 'IAC' && password === 'iac2010';
      const isMasterUser = username.toLowerCase() === 'iac' && password === '123';

      if (isLegacyUser || isMasterUser) {
        setIsSuccess(true);
        setTimeout(() => {
            onLogin(role);
        }, 800);
      } else {
        setError('Usuário ou senha incorretos.');
        setIsLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex bg-stone-50 dark:bg-stone-950 font-sans transition-colors duration-300">
      
      {/* Left Side - Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-farm-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625246333195-0929b7c3835b?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center opacity-60 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-farm-950 via-farm-900/60 to-transparent"></div>
        
        <div className="relative z-10 p-16 flex flex-col justify-between h-full text-white">
          <div>
             <AgroBrasilLogoLarge />
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-tight max-w-lg">
              Cultivando o futuro com <span className="text-[#4ADE80]">inteligência</span> e <span className="text-[#60A5FA]">precisão</span>.
            </h1>
            <p className="text-lg text-gray-300 max-w-md leading-relaxed">
              Acesse sua central de monitoramento AgroBrasil. Diagnósticos via IA, segurança e controle total da sua lavoura em um só lugar.
            </p>
          </div>

          <div className="text-xs text-gray-500 font-mono">
            © 2024 AGROBRASIL & EMATER. Todos os direitos reservados.
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-stone-900 relative">
        <div className="w-full max-w-md space-y-8 animate-slide-up">
          
          <div className="text-center lg:text-left">
            <div className="lg:hidden mb-8">
               <AgroBrasilLogoForm />
            </div>
            <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">Bem-vindo de volta!</h2>
            <p className="mt-2 text-stone-500 dark:text-stone-400">Acesse o sistema AgroBrasil com suas credenciais.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              {/* Role Selection */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setRole(UserRole.PRODUCER)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${role === UserRole.PRODUCER ? 'border-farm-500 bg-farm-50 dark:bg-farm-900/20 text-farm-700 dark:text-farm-300' : 'border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-stone-400 hover:border-stone-200 dark:hover:border-stone-700'}`}
                >
                  <Tractor size={20} className="mb-1" />
                  <span className="text-[10px] font-bold uppercase">Produtor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole(UserRole.RETAILER)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${role === UserRole.RETAILER ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-stone-400 hover:border-stone-200 dark:hover:border-stone-700'}`}
                >
                  <ShoppingCart size={20} className="mb-1" />
                  <span className="text-[10px] font-bold uppercase">Varejo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole(UserRole.CONSUMER)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${role === UserRole.CONSUMER ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300' : 'border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-stone-400 hover:border-stone-200 dark:hover:border-stone-700'}`}
                >
                  <HeartPulse size={20} className="mb-1" />
                  <span className="text-[10px] font-bold uppercase">Consumidor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole(UserRole.PROFESSIONAL)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${role === UserRole.PROFESSIONAL ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-stone-400 hover:border-stone-200 dark:hover:border-stone-700'}`}
                >
                  <User size={20} className="mb-1" />
                  <span className="text-[10px] font-bold uppercase">Profissional</span>
                </button>
              </div>

              {/* Username Input */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-stone-400 group-focus-within:text-farm-600 transition-colors" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500 transition-all font-medium"
                  placeholder="Usuário (iac)"
                />
              </div>

              {/* Password Input */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-stone-400 group-focus-within:text-farm-600 transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500 transition-all font-medium"
                  placeholder="Senha"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-farm-600 focus:ring-farm-500 border-stone-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-stone-600 cursor-pointer select-none">
                  Lembrar de mim
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-farm-600 hover:text-farm-500 hover:underline">
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2 animate-shake">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className={`
                w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl text-sm font-bold text-white transition-all duration-300
                ${isSuccess 
                  ? 'bg-green-500 shadow-lg shadow-green-500/30 scale-105' 
                  : 'bg-stone-900 hover:bg-stone-800 shadow-lg shadow-stone-900/30 hover:-translate-y-0.5'
                }
                ${isLoading ? 'cursor-not-allowed opacity-90' : ''}
              `}
            >
              {isLoading ? (
                isSuccess ? (
                   <CheckCircle2 className="animate-bounce" size={20} />
                ) : (
                   <Loader2 className="animate-spin" size={20} />
                )
              ) : (
                <span className="flex items-center gap-2">
                  Entrar no Sistema <ArrowRight size={18} />
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-4">
            <div className="relative">
               <div className="absolute inset-0 flex items-center">
                 <div className="w-full border-t border-stone-200 dark:border-stone-800"></div>
               </div>
               <div className="relative flex justify-center text-xs uppercase font-black tracking-widest">
                 <span className="px-2 bg-white dark:bg-stone-950 text-stone-400">Ou acesse com</span>
               </div>
            </div>

            <button 
              type="button"
              className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 py-3 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all shadow-sm text-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>

            <p className="text-center text-sm text-stone-500 dark:text-stone-400 font-medium mt-2">
              Não tem uma conta? <button onClick={onGoToRegister} className="text-farm-600 font-black hover:underline">Cadastre-se agora</button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginScreen;