
import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  Tractor, 
  ShoppingCart, 
  HeartPulse, 
  Stethoscope,
  FileText,
  MapPin,
  Phone,
  ShieldCheck
} from 'lucide-react';
import { UserRole } from '../types';

interface RegistrationScreenProps {
  onBack: () => void;
  onRegister: (role: UserRole, data: any) => void;
  onGoogleLogin: (role: UserRole) => void;
  isLoading?: boolean;
}

const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ onBack, onRegister, onGoogleLogin, isLoading: externalLoading }) => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>(UserRole.PRODUCER);
  const [internalLoading, setInternalLoading] = useState(false);
  const [error, setError] = useState('');

  const isLoading = externalLoading || internalLoading;

  // Form States
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    document: '', // CPF or CNPJ
    phone: '',
    // Producer
    farmName: '',
    totalArea: '',
    mainCrops: '',
    location: '',
    // Retailer
    storeName: '',
    address: '',
    // Professional
    specialty: 'Agrônomo',
    registryNumber: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateDocument = (doc: string) => {
    const cleanDoc = doc.replace(/\D/g, '');
    if (role === UserRole.RETAILER) {
      return cleanDoc.length === 14; // CNPJ
    }
    return cleanDoc.length === 11; // CPF
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateDocument(formData.document)) {
      setError(role === UserRole.RETAILER ? 'CNPJ inválido (deve ter 14 dígitos)' : 'CPF inválido (deve ter 11 dígitos)');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setInternalLoading(true);
    onRegister(role, formData);
  };

  const roles = [
    { id: UserRole.PRODUCER, label: 'Produtor', icon: <Tractor size={24} />, desc: 'Gestão de safra e venda direta' },
    { id: UserRole.RETAILER, label: 'Varejo', icon: <ShoppingCart size={24} />, desc: 'Compra de produtores e insights' },
    { id: UserRole.PROFESSIONAL, label: 'Profissional', icon: <Stethoscope size={24} />, desc: 'Agrônomos e Nutricionistas' },
    { id: UserRole.CONSUMER, label: 'Consumidor', icon: <HeartPulse size={24} />, desc: 'Saúde e produtos locais' },
  ];

  return (
    <div className="min-h-screen w-full flex bg-stone-50 dark:bg-stone-950 font-sans transition-colors duration-300">
      
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/3 relative overflow-hidden bg-farm-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1932&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-farm-950 via-farm-900/60 to-transparent"></div>
        
        <div className="relative z-10 p-12 flex flex-col justify-between h-full text-white">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-inner ring-1 ring-white/30">
                <ShieldCheck size={20} className="text-emerald-400" />
             </div>
             <span className="text-xl font-black tracking-tighter">AGRO<span className="text-emerald-400">BRASIL</span></span>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl font-black leading-tight">Junte-se à revolução do campo.</h2>
            <p className="text-white/70 font-medium">Conectamos quem produz com quem consome, com inteligência e transparência.</p>
          </div>

          <div className="text-xs text-white/40 font-bold uppercase tracking-widest">
            © 2026 AgroBrasil Tecnologia
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-2/3 flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-xl">
          
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 font-bold text-sm mb-8 transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Voltar para o Login
          </button>

          <div className="mb-10">
            <h1 className="text-3xl font-black text-stone-900 dark:text-white tracking-tight mb-2">Criar sua conta</h1>
            <p className="text-stone-500 dark:text-stone-400 font-medium">Selecione seu perfil e preencha os dados abaixo.</p>
          </div>

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`p-6 rounded-3xl border-2 text-left transition-all flex flex-col gap-3 group ${role === r.id ? 'border-farm-500 bg-farm-50 dark:bg-farm-900/10' : 'border-stone-100 dark:border-stone-800 hover:border-stone-200 dark:hover:border-stone-700 bg-white dark:bg-stone-900'}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${role === r.id ? 'bg-farm-500 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-400 group-hover:text-stone-600'}`}>
                      {r.icon}
                    </div>
                    <div>
                      <h3 className={`font-black tracking-tight ${role === r.id ? 'text-farm-700 dark:text-farm-400' : 'text-stone-800 dark:text-stone-200'}`}>{r.label}</h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">{r.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full bg-stone-900 dark:bg-white dark:text-stone-900 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-xl shadow-stone-900/10"
              >
                Continuar <ArrowRight size={20} />
              </button>
            </div>
          )}

          {/* Step 2: Form Details */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
              
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Common Fields */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input 
                      type="text" 
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-farm-500 outline-none transition-all font-medium dark:text-white"
                      placeholder="Ex: João da Silva"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-farm-500 outline-none transition-all font-medium dark:text-white"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">
                    {role === UserRole.RETAILER ? 'CNPJ' : 'CPF'}
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input 
                      type="text" 
                      name="document"
                      required
                      value={formData.document}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-farm-500 outline-none transition-all font-medium dark:text-white"
                      placeholder={role === UserRole.RETAILER ? "00.000.000/0000-00" : "000.000.000-00"}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Telefone / WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input 
                      type="text" 
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-farm-500 outline-none transition-all font-medium dark:text-white"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                {/* Role Specific Fields */}
                {role === UserRole.PRODUCER && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Nome da Fazenda</label>
                      <input 
                        type="text" 
                        name="farmName"
                        required
                        value={formData.farmName}
                        onChange={handleInputChange}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl py-4 px-4 focus:ring-2 focus:ring-farm-500 outline-none transition-all font-medium dark:text-white"
                        placeholder="Ex: Fazenda Santa Maria"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Localização (Cidade/UF)</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                        <input 
                          type="text" 
                          name="location"
                          required
                          value={formData.location}
                          onChange={handleInputChange}
                          className="w-full bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-farm-500 outline-none transition-all font-medium dark:text-white"
                          placeholder="Ex: Campinas / SP"
                        />
                      </div>
                    </div>
                  </>
                )}

                {role === UserRole.RETAILER && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Nome do Estabelecimento</label>
                      <input 
                        type="text" 
                        name="storeName"
                        required
                        value={formData.storeName}
                        onChange={handleInputChange}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl py-4 px-4 focus:ring-2 focus:ring-farm-500 outline-none transition-all font-medium dark:text-white"
                        placeholder="Ex: Hortifruti do Bairro"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Endereço Comercial</label>
                      <input 
                        type="text" 
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl py-4 px-4 focus:ring-2 focus:ring-farm-500 outline-none transition-all font-medium dark:text-white"
                        placeholder="Rua, Número, Bairro"
                      />
                    </div>
                  </>
                )}

                {role === UserRole.PROFESSIONAL && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Especialidade</label>
                      <select 
                        name="specialty"
                        value={formData.specialty}
                        onChange={handleInputChange}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl py-4 px-4 focus:ring-2 focus:ring-farm-500 outline-none transition-all font-medium dark:text-white appearance-none"
                      >
                        <option value="Agrônomo">Agrônomo</option>
                        <option value="Nutricionista">Nutricionista</option>
                        <option value="Veterinário">Veterinário</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Registro Profissional (CREA/CRN)</label>
                      <input 
                        type="text" 
                        name="registryNumber"
                        required
                        value={formData.registryNumber}
                        onChange={handleInputChange}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl py-4 px-4 focus:ring-2 focus:ring-farm-500 outline-none transition-all font-medium dark:text-white"
                        placeholder="Ex: 123456-7"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input 
                      type="password" 
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-farm-500 outline-none transition-all font-medium dark:text-white"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-4">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-farm-600 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-farm-700 transition-colors shadow-xl shadow-farm-600/20 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={24} /> : <>Finalizar Cadastro <ArrowRight size={20} /></>}
                </button>
                
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-stone-500 dark:text-stone-400 font-bold text-sm py-2 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
                >
                  Alterar Perfil Selecionado
                </button>
              </div>
            </form>
          )}

          {/* Social Login - Only on Step 1 or as alternative */}
          {step === 1 && (
            <div className="mt-10">
              <div className="relative flex items-center justify-center mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200 dark:border-stone-800"></div>
                </div>
                <span className="relative px-4 bg-stone-50 dark:bg-stone-950 text-xs font-black text-stone-400 uppercase tracking-widest">Ou cadastre-se com</span>
              </div>

              <button 
                type="button"
                onClick={() => onGoogleLogin(role)}
                className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all shadow-sm"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continuar com Google
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationScreen;
