import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, AlertCircle, Flame } from 'lucide-react';
import type { Aluno, LoggedUser } from '../types';
import { supabase } from '../lib/supabase';

import logoSFBJJ from '../assets/logo-sfbjj.jpg';

interface LoginProps {
  students: Aluno[];
  onLoginSuccess: (user: LoggedUser) => void;
  onBackToLanding: () => void;
}

export const Login: React.FC<LoginProps> = ({ students, onLoginSuccess, onBackToLanding }) => {
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
      const adminPassword = localStorage.getItem('sfbjj_admin_password') || '#sfbjj2026';

      // 1. Verifica Login Admin
      if (username === 'admin' || cleanedCpfInput === '01334314101') {
        if (password === adminPassword) {
          const adminStudent = students.find(s => s.cpf.replace(/\D/g, '') === '01334314101');
          const adminName = adminStudent ? adminStudent.nome : 'Lucas Santiago Gonçalves dos Anjos';
          onLoginSuccess({
            role: 'admin',
            nome: adminName
          });
          setLoading(false);
          return;
        } else {
          setError('Senha incorreta para o administrador.');
          setLoading(false);
          return;
        }
      }

      // 2. Verifica Login Professor (se parecer um e-mail)
      if (username.includes('@')) {
        const { data: profData } = await supabase
          .from('professores')
          .select('*')
          .eq('email', username)
          .single();
          
        if (profData && profData.senha === password) {
          onLoginSuccess({
            role: 'teacher',
            professorId: profData.id,
            nome: profData.nome
          });
          setLoading(false);
          return;
        }
      }

      // 3. Verifica Login Aluno
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
              role: student.role || 'student',
              alunoId: student.id,
              nome: student.nome
            });
            setLoading(false);
            return;
          }
        }
      }

      // Fallback de erro padrão
      setError('Credenciais incorretas.');
      setLoading(false);
    }, 600); // Pequeno atraso para um efeito legal de carregamento (UX)
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian-950 px-4 py-12 relative overflow-hidden">
      {/* Dynamic ambient backgrounds */}
      <div className="absolute top-[-25%] left-[-15%] w-[600px] h-[600px] rounded-full bg-slate-500/5 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-15%] w-[650px] h-[650px] rounded-full bg-slate-500/5 blur-[160px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10">
        {/* Brand Logo & Title */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="relative mb-4 group">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-slate-200/20 to-slate-400/20 rounded-full blur opacity-45 group-hover:opacity-75 transition duration-500" />
            <div className="relative p-1.5 bg-obsidian-900 border border-obsidian-850 rounded-full flex items-center justify-center shadow-xl">
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
          <h1 className="text-xl font-black tracking-wider text-slate-100 uppercase leading-none">
            Sagrada Família <span className="text-gold-550 font-black">BJJ</span>
          </h1>
          <p className="text-[10px] text-slate-550 font-bold tracking-widest uppercase mt-2">
            Portal do Aluno & Gestão
          </p>
        </div>

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
            {/* CPF / Username field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                CPF, Email ou Admin
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
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

            {/* Password field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Senha
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
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
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
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

        {/* Footer info */}
        <p className="text-[9px] text-center text-slate-600 mt-8 tracking-widest uppercase font-bold">
          Sagrada Família BJJ • Área Restrita • © 2026
        </p>
      </div>
    </div>
  );
};
