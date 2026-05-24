import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, AlertCircle, Flame } from 'lucide-react';
import type { Student, LoggedUser } from '../types';

interface LoginProps {
  students: Student[];
  onLoginSuccess: (user: LoggedUser) => void;
}

export const Login: React.FC<LoginProps> = ({ students, onLoginSuccess }) => {
  const [cpfInput, setCpfInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.toLowerCase().startsWith('a')) {
      setCpfInput(val.toLowerCase());
    } else {
      // CPF Mask (000.000.000-00)
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

    setTimeout(() => {
      const username = cpfInput.trim().toLowerCase();
      const cleanedCpfInput = username.replace(/\D/g, '');
      const adminPassword = localStorage.getItem('sfbjj_admin_password') || '#sfbjj2026';

      // 1. Check Admin Login
      if (username === 'admin' || cleanedCpfInput === '01334314101') {
        if (password === adminPassword) {
          onLoginSuccess({
            role: 'admin',
            nome: 'Administrador'
          });
          setLoading(false);
          return;
        } else {
          setError('Senha incorreta para o administrador.');
          setLoading(false);
          return;
        }
      }

      // 2. Check Student Login
      if (cleanedCpfInput.length > 0) {
        const student = students.find(s => s.cpf.replace(/\D/g, '') === cleanedCpfInput);
        if (student) {
          const studentPassword = student.senha || '#sfbjj2026';
          if (password === studentPassword) {
            if (student.status === 'Inativo') {
              setError('Sua matrícula está inativa. Entre em contato com a administração.');
              setLoading(false);
              return;
            }

            onLoginSuccess({
              role: 'student',
              studentId: student.id,
              nome: student.nome
            });
            setLoading(false);
            return;
          }
        }
      }

      // Default error fallback
      setError('CPF ou senha incorretos.');
      setLoading(false);
    }, 600); // Small delay for nice UX loader effect
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian-950 px-4 py-12 relative overflow-hidden">
      {/* Dynamic ambient backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gold-500/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[550px] h-[550px] rounded-full bg-gold-500/5 blur-[150px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10">
        {/* Brand Logo & Title */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="relative mb-3 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500" />
            <div className="relative p-4 bg-obsidian-900 border border-obsidian-750 rounded-full flex items-center justify-center">
              <img
                src="src/assets/logo-sfbjj.png"
                alt="Sagrada Família BJJ Logo"
                className="w-24 h-24 object-contain animate-float"
                onError={(e) => {
                  // Fallback if image doesn't exist
                  e.currentTarget.style.display = 'none';
                  const fb = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                  if (fb) fb.classList.remove('hidden');
                }}
              />
              <Flame className="w-12 h-12 text-gold-500 fallback-icon hidden" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold tracking-wider text-slate-100 uppercase leading-none">
            Sagrada Família <span className="text-gold-500">BJJ</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium tracking-widest uppercase mt-1.5">
            Portal do Aluno & Gestão
          </p>
        </div>

        {/* Glassmorphic Login Card */}
        <div className="bg-obsidian-850/60 backdrop-blur-xl border border-obsidian-750/90 rounded-2xl p-8 shadow-2xl shadow-black/50 relative overflow-hidden">
          <h2 className="text-lg font-bold text-slate-100 mb-6 text-center">
            Acesse sua Conta
          </h2>

          {error && (
            <div className="mb-6 flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* CPF / Username field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                CPF
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <User className="w-4.5 h-4.5" />
                </span>
                <input
                  type="text"
                  value={cpfInput}
                  onChange={handleCpfChange}
                  placeholder="Digite seu CPF"
                  className="input-premium w-full pl-11"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Senha
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-premium w-full pl-11 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold py-3 text-sm mt-8 relative overflow-hidden"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-obsidian-950 border-t-transparent rounded-full animate-spin" />
                  <span>Autenticando...</span>
                </div>
              ) : (
                <span>Entrar no Portal</span>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-[10px] text-center text-slate-500 mt-6 tracking-wide">
          Sagrada Família BJJ • Área Restrita • © 2026
        </p>
      </div>
    </div>
  );
};
