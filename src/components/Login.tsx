import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, AlertCircle, Flame } from 'lucide-react';
import type { LoggedUser } from '../types';
import { supabase } from '../lib/supabase';

import logoSFBJJ from '../assets/logo-sfbjj.png';

interface LoginProps {
  onLoginSuccess: (user: LoggedUser) => void;
  onBackToLanding: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onBackToLanding }) => {
  const [cpfInput, setCpfInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Se for admin, iniciar com letra 'a' ou conter '@' ou conter outras letras, não aplica máscara de CPF
    if (val.toLowerCase().startsWith('a') || val.includes('@') || /[a-zA-Z]/.test(val)) {
      setCpfInput(val.toLowerCase());
    } else {
      // Máscara de CPF (000.000.000-00)
      const digits = val.replace(/\D/g, '');
      let formatted = digits;
      if (digits.length > 3) {
        formatted = `${digits.slice(0, 3)}.${digits.slice(3)}`;
      }
      if (digits.length > 6) {
        formatted = `${formatted.slice(0, 7)}.${digits.slice(6)}`;
      }
      if (digits.length > 9) {
        formatted = `${formatted.slice(0, 11)}-${digits.slice(9, 11)}`;
      }
      setCpfInput(formatted.substring(0, 14));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(async () => {
      const username = cpfInput.trim().toLowerCase();
      const cleanedCpfInput = username.replace(/\D/g, '');

      try {
        // 1. Verifica Login Admin
        if (username === 'admin@sfbjj.com') {
          const { data: adminData } = await supabase
            .from('administradores')
            .select('*')
            .eq('email', 'admin@sfbjj.com')
            .single();

          if (adminData) {
            if (adminData.senha === password) {
              onLoginSuccess({
                role: 'admin',
                adminId: adminData.id,
                nome: adminData.nome
              });
              setLoading(false);
              return;
            } else {
              setError('Senha incorreta para o administrador.');
              setLoading(false);
              return;
            }
          }
        }

        // 2. Verifica Login Professor (se parecer um e-mail)
        if (username.includes('@')) {
          const { data: profData } = await supabase
            .from('professores')
            .select('*')
            .eq('email', username)
            .single();

          if (profData) {
            if (profData.senha === password) {
              onLoginSuccess({
                role: 'teacher',
                professorId: profData.id,
                nome: profData.nome
              });
              setLoading(false);
              return;
            } else {
              setError('Senha incorreta para o professor.');
              setLoading(false);
              return;
            }
          }
        }

        // 3. Verifica Login Aluno de forma pontual no Supabase
        if (cleanedCpfInput.length > 0) {
          // Busca o aluno filtrando por CPF formatado ou sem formatação
          const { data: student, error: dbError } = await supabase
            .from('alunos')
            .select('*')
            .or(`cpf.eq."${cpfInput}",cpf.eq."${cleanedCpfInput}"`)
            .maybeSingle();

          if (dbError) {
            console.error('Error fetching student login data:', dbError);
            setError('Erro ao autenticar. Tente novamente.');
            setLoading(false);
            return;
          }

          if (student) {
            const studentPassword = student.senha || '#sfbjj2026';
            if (password === studentPassword) {
              if (student.status === 'Inativo') {
                setError('Sua matrícula está inativa. Entre em contato com a administração.');
                setLoading(false);
                return;
              }

              onLoginSuccess({
                role: student.role || 'student',
                alunoId: student.id,
                nome: student.nome
              });
              setLoading(false);
              return;
            } else {
              setError('Senha incorreta.');
              setLoading(false);
              return;
            }
          }
        }

        // Se passar por todas as etapas e não achar ou não bater
        setError('Credenciais incorretas.');
      } catch (err: any) {
        console.error('Login error:', err);
        setError('Falha de conexão com o servidor de autenticação.');
      } finally {
        setLoading(false);
      }
    }, 600); // Mantém o delay do efeito de carregamento de UX
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
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo CPF / Username */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-username" className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                CPF ou E-mail
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="login-username"
                  type="text"
                  value={cpfInput}
                  onChange={handleCpfChange}
                  placeholder="Seu CPF ou E-mail"
                  className="input-premium w-full pl-10"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-password" className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Senha
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-premium w-full pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-350 transition-colors"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Botão de Envio */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold py-3 text-xs tracking-wider font-bold uppercase mt-8 relative overflow-hidden"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-obsidian-950 border-t-transparent rounded-full animate-spin" />
                  <span>Autenticando...</span>
                </div>
              ) : (
                <span>Entrar no Portal</span>
              )}
            </button>
            <button
              type="button"
              onClick={onBackToLanding}
              className="w-full text-center mt-4 text-[10px] text-slate-550 hover:text-slate-300 transition-all duration-200 uppercase tracking-widest font-black"
            >
              ← Voltar para o início
            </button>
          </form>
        </div>

        {/* Rodapé */}
        <p className="text-[9px] text-center text-slate-600 mt-8 tracking-widest uppercase font-bold">
          Sagrada Família BJJ • Área Restrita • © 2026
        </p>
      </div>
    </div>
  );
};
