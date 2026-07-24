import React, { useState } from 'react';
import { useAuth } from '@/application/hooks/useAuth';
import type { LoggedUser } from '@/domain/models/auth';
import logoSFBJJ from '@/assets/logo-sfbjj.png';
import { 
  Flame, 
  ArrowLeft, 
  User, 
  UserPlus,
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { formatCPF } from '@/utils/formatters';
import { StudentRegisterModal } from '@/presentation/components/auth/StudentRegisterModal';

interface LoginPageProps {
  onLoginSuccess: (user: LoggedUser) => void;
  onBackToLanding: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBackToLanding }) => {
  const { login } = useAuth();
  const [cpfInput, setCpfInput] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleIdentifierChange = (value: string) => {
    const onlyNumbers = value.replace(/[.-]/g, '');
    const hasLettersOrAt = /[a-zA-Z@]/.test(value);

    if (hasLettersOrAt) {
      setCpfInput(value);
    } else if (/^\d+$/.test(onlyNumbers)) {
      setCpfInput(formatCPF(value));
    } else {
      setCpfInput(value);
    }
  };

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Pequeno timeout de 600ms para manter o efeito de carregamento de UX
    setTimeout(async () => {
      try {
        const user = await login(cpfInput, password);
        onLoginSuccess(user);
      } catch (err: any) {
        console.error('Login error:', err);
        setError(err.message || 'Credenciais incorretas ou falha de conexão.');
      } finally {
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian-950 px-4 py-12 relative overflow-hidden">
      {/* Backgrounds */}
      <div className="absolute top-[-25%] left-[-15%] w-[600px] h-[600px] rounded-full bg-slate-500/5 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-15%] w-[650px] h-[650px] rounded-full bg-slate-500/5 blur-[160px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10">
        {/* Brand Logo & Title */}
        <button
          onClick={() => {
            onBackToLanding();
            window.scrollTo({ top: 0 });
          }}
          className="flex flex-col items-center mb-10 text-center w-full focus:outline-none group"
          type="button"
        >
          <div className="relative mb-4">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-slate-200/20 to-slate-400/20 rounded-full blur opacity-45 group-hover:opacity-75 transition duration-500" />
            <div className="relative p-1.5 bg-obsidian-900 border border-obsidian-850 rounded-full flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-300">
              <img
                src={logoSFBJJ}
                alt="Sagrada Família BJJ Logo"
                className="w-20 h-20 rounded-full object-cover animate-float"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fb = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                  if (fb) fb.classList.remove('hidden');
                }}
              />
              <Flame className="w-10 h-10 text-slate-300 fallback-icon hidden" />
            </div>
          </div>
          <h1 className="text-xl font-black tracking-wider text-slate-100 uppercase leading-none group-hover:text-white transition-colors">
            Sagrada Família <span className="text-gold-550 font-black">BJJ</span>
          </h1>
          <p className="text-[10px] text-slate-550 font-bold tracking-widest uppercase mt-2 group-hover:text-slate-400 transition-colors">
            Portal do Aluno & Gestão
          </p>
        </button>

        {/* Glassmorphic Login Card */}
        <div className="bg-obsidian-800/40 border border-obsidian-750/60 rounded-2xl p-8 shadow-2xl backdrop-blur-lg relative overflow-hidden">
          <h2 className="text-base font-bold text-slate-250 mb-6 text-center tracking-wide">
            Acesse sua Conta
          </h2>

          {error && (
            <div className="mb-6 flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* CPF / E-mail Input */}
            <div>
              <label htmlFor="identifier" className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                E-mail ou CPF
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-slate-300 transition-colors">
                  <User className="w-4.5 h-4.5" />
                </div>
                <input
                  id="identifier"
                  type="text"
                  placeholder="exemplo@email.com ou 000.000.000-00"
                  className="w-full bg-obsidian-950/70 border border-obsidian-700 hover:border-obsidian-600 focus:border-slate-500 rounded-xl pl-11 pr-4 py-3.5 text-sm text-slate-200 placeholder:text-slate-650 focus:outline-none focus:ring-1 focus:ring-slate-500/25 transition-all"
                  value={cpfInput}
                  onChange={(e) => handleIdentifierChange(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Senha
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-slate-300 transition-colors">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-obsidian-950/70 border border-obsidian-700 hover:border-obsidian-600 focus:border-slate-500 rounded-xl pl-11 pr-11 py-3.5 text-sm text-slate-200 placeholder:text-slate-650 focus:outline-none focus:ring-1 focus:ring-slate-500/25 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-white text-obsidian-950 font-bold py-3.5 px-4 rounded-xl text-sm transition-all duration-300 shadow-lg shadow-white/5 active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-obsidian-950" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <span>Entrar no Sistema</span>
              )}
            </button>
          </form>

          {/* Divider e Cadastro de Aluno */}
          <div className="mt-6 pt-5 border-t border-obsidian-750/60 text-center">
            <p className="text-xs text-slate-400 font-medium mb-3">
              Não tem uma conta ainda?
            </p>
            <button
              type="button"
              onClick={() => setShowRegisterModal(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-obsidian-950/80 hover:bg-obsidian-900 border border-gold-500/30 hover:border-gold-500/60 text-gold-450 hover:text-gold-400 font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-md"
              disabled={loading}
            >
              <UserPlus className="w-4 h-4" />
              <span>Criar Conta de Aluno</span>
            </button>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => {
            onBackToLanding();
            window.scrollTo({ top: 0 });
          }}
          className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-slate-450 hover:text-slate-350 transition-colors w-full focus:outline-none"
          disabled={loading}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para a Página Inicial</span>
        </button>
      </div>

      {/* Modal de Auto-Cadastro de Aluno */}
      <StudentRegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={async (credentials) => {
          setShowRegisterModal(false);
          setCpfInput(credentials.identifier);
          setPassword(credentials.password);
          try {
            setLoading(true);
            const user = await login(credentials.identifier, credentials.password);
            onLoginSuccess(user);
          } catch (err: any) {
            setError(err.message || 'Falha ao autenticar o novo aluno.');
          } finally {
            setLoading(false);
          }
        }}
      />
    </div>
  );
};
export default LoginPage;
