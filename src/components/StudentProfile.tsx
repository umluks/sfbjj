import React, { useState } from 'react';
import type { Student, Belt, Degree, Gender } from '../types';
import { 
  User, 
  ShieldAlert, 
  Lock, 
  Flame, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';


interface StudentProfileProps {
  studentId: string;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ studentId, students, setStudents }) => {
  const student = students.find(s => s.id === studentId);

  if (!student) {
    return (
      <div className="text-center py-20 text-slate-500 card-premium">
        Aluno não encontrado no sistema.
      </div>
    );
  }

  // Active Tab: 'profile' or 'password'
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'password'>('profile');

  // Personal Info Form State
  const [formNome, setFormNome] = useState(student.nome);
  const [formDataNascimento, setFormDataNascimento] = useState(student.dataNascimento);
  const [formTelefone, setFormTelefone] = useState(student.telefone);
  const [formEmail, setFormEmail] = useState(student.email);
  const [formGenero, setFormGenero] = useState<Gender>(student.genero);
  const [formBairro, setFormBairro] = useState(student.bairro || '');
  const [formContatoEmergenciaNome, setFormContatoEmergenciaNome] = useState(student.contatoEmergenciaNome || '');
  const [formContatoEmergenciaTel, setFormContatoEmergenciaTel] = useState(student.contatoEmergenciaTel || '');

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Status/Alerts State
  const [infoSuccess, setInfoSuccess] = useState<string | null>(null);
  const [infoError, setInfoError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  // Formatting helpers
  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 15);
  };

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setInfoSuccess(null);
    setInfoError(null);

    if (!formNome || !formDataNascimento) {
      setInfoError('Nome e Data de Nascimento são obrigatórios.');
      return;
    }

    setStudents(prev => prev.map(s => {
      if (s.id === student.id) {
        return {
          ...s,
          nome: formNome,
          dataNascimento: formDataNascimento,
          telefone: formTelefone,
          email: formEmail,
          genero: formGenero,
          bairro: formBairro,
          contatoEmergenciaNome: formContatoEmergenciaNome,
          contatoEmergenciaTel: formContatoEmergenciaTel
        };
      }
      return s;
    }));

    // Update localStorage user name if changed
    const loggedStr = localStorage.getItem('sfbjj_logged_user');
    if (loggedStr) {
      const logged = JSON.parse(loggedStr);
      if (logged.studentId === student.id) {
        logged.nome = formNome;
        localStorage.setItem('sfbjj_logged_user', JSON.stringify(logged));
      }
    }

    setInfoSuccess('Informações pessoais atualizadas com sucesso!');
    setTimeout(() => setInfoSuccess(null), 4000);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccess(null);
    setPassError(null);

    const actualCurrentPassword = student.senha || '#sfbjj2026';

    if (currentPassword !== actualCurrentPassword) {
      setPassError('A senha atual digitada está incorreta.');
      return;
    }

    if (newPassword.length < 6) {
      setPassError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('A nova senha e a confirmação de senha não coincidem.');
      return;
    }

    // Save Password
    setStudents(prev => prev.map(s => {
      if (s.id === student.id) {
        return {
          ...s,
          senha: newPassword
        };
      }
      return s;
    }));

    // Clean inputs
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    
    setPassSuccess('Sua senha foi alterada com sucesso!');
    setTimeout(() => setPassSuccess(null), 4000);
  };

  // Helper to render beautiful visual BJJ belt
  const renderBeltBadge = (faixa: Belt, graus: Degree) => {
    let beltClass = '';
    let barColor = 'bg-black'; // Black sleeve bar standard

    switch (faixa) {
      case 'Branca':
        beltClass = 'bg-white text-slate-800 border border-slate-300';
        break;
      case 'Cinza':
        beltClass = 'bg-slate-400 text-slate-900 border border-slate-500';
        break;
      case 'Amarela':
        beltClass = 'bg-yellow-400 text-slate-900 border border-yellow-500';
        break;
      case 'Laranja':
        beltClass = 'bg-orange-500 text-white';
        break;
      case 'Verde':
        beltClass = 'bg-emerald-600 text-white';
        break;
      case 'Azul':
        beltClass = 'bg-blue-700 text-white';
        break;
      case 'Roxa':
        beltClass = 'bg-purple-700 text-white';
        break;
      case 'Marrom':
        beltClass = 'bg-amber-900 text-white';
        break;
      case 'Preta':
        beltClass = 'bg-black border border-gold-500/60 text-gold-500';
        barColor = 'bg-red-600'; // Red sleeve bar for black belts
        break;
    }

    return (
      <div className={`w-32 h-6 rounded flex items-center relative overflow-hidden font-bold text-[10px] tracking-wide shadow-sm ${beltClass}`}>
        <span className="pl-2 uppercase z-10">{faixa}</span>
        <div className={`absolute right-0 top-0 bottom-0 w-10 ${barColor === 'bg-red-600' ? 'bg-red-650' : 'bg-neutral-900'} flex items-center justify-around px-0.5 border-l border-obsidian-950`}>
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className={`w-1 h-3.5 rounded-sm transition-all ${idx < graus ? 'bg-amber-300 shadow-sm shadow-gold-500/50' : 'bg-neutral-800/80'}`}
            />
          ))}
        </div>
      </div>
    );
  };

  // Get current payment record
  const currentPayment = student.pagamentos?.[0]; // Usually holds current record

  return (
    <div className="space-y-6">
      {/* Header Profile Hero Card */}
      <div className="bg-gradient-to-r from-obsidian-850/80 to-obsidian-800/80 border border-obsidian-800/90 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden backdrop-blur-md">
        {/* Glow decoration */}
        <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] rounded-full bg-gold-500/5 blur-[100px] pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 z-10 relative">
          {/* Avatar Icon */}
          <div className="p-5 bg-gradient-to-br from-gold-500/20 to-gold-600/5 border border-gold-500/30 rounded-2xl text-gold-400">
            <Flame className="w-10 h-10 animate-float" />
          </div>

          {/* Student Info Summary */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
                {student.nome}
              </h1>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${student.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700/10 text-slate-400 border border-slate-750'}`}>
                {student.status}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Graduação:</span>
                {renderBeltBadge(student.faixa, student.graus)}
              </div>
              <div>
                <span className="text-slate-500">Total de Treinos:</span>{' '}
                <span className="font-extrabold text-gold-400">{student.totalTreinos} presenças</span>
              </div>
              {currentPayment && (
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Mensalidade ({currentPayment.mesRef}):</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    currentPayment.status === 'Pago' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : currentPayment.status === 'Pendente'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {currentPayment.status}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs and Form Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Navigation side card */}
        <div className="md:col-span-1 bg-obsidian-850 p-4 rounded-xl border border-obsidian-800/80 space-y-1">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${
              activeSubTab === 'profile'
                ? 'bg-gold-500/10 border-l-2 border-gold-500 text-gold-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-750'
            }`}
          >
            <User className="w-4.5 h-4.5" />
            Dados Pessoais
          </button>
          <button
            onClick={() => setActiveSubTab('password')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${
              activeSubTab === 'password'
                ? 'bg-gold-500/10 border-l-2 border-gold-500 text-gold-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-750'
            }`}
          >
            <Lock className="w-4.5 h-4.5" />
            Alterar Senha
          </button>
        </div>

        {/* Form Container */}
        <div className="md:col-span-3 card-premium">
          {activeSubTab === 'profile' ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-100">Atualizar Dados Pessoais</h2>
                <p className="text-slate-400 text-xs mt-1">
                  Mantenha suas informações de contato e emergência atualizadas para comunicação oficial.
                </p>
              </div>

              {infoSuccess && (
                <div className="flex items-center gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-400 text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{infoSuccess}</span>
                </div>
              )}

              {infoError && (
                <div className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{infoError}</span>
                </div>
              )}

              <form onSubmit={handleSaveInfo} className="space-y-4">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Nome Completo</label>
                  <input
                    type="text"
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    className="input-premium w-full"
                    required
                  />
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Telefone</label>
                    <input
                      type="text"
                      value={formTelefone}
                      onChange={(e) => setFormTelefone(formatPhone(e.target.value))}
                      className="input-premium w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">E-mail</label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="input-premium w-full"
                    />
                  </div>
                </div>

                {/* Birth & Gender */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Data de Nascimento</label>
                    <input
                      type="date"
                      value={formDataNascimento}
                      onChange={(e) => setFormDataNascimento(e.target.value)}
                      className="input-premium w-full"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Gênero</label>
                    <select
                      value={formGenero}
                      onChange={(e) => setFormGenero(e.target.value as Gender)}
                      className="input-premium w-full bg-obsidian-950"
                    >
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                </div>

                {/* Neighborhood (Bairro) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Bairro</label>
                  <input
                    type="text"
                    value={formBairro}
                    onChange={(e) => setFormBairro(e.target.value)}
                    className="input-premium w-full"
                    placeholder="Ex: Asa Sul, Guará..."
                  />
                </div>

                {/* Emergency Contact Header */}
                <div className="border-t border-obsidian-750 pt-4 mt-2">
                  <h3 className="text-xs font-extrabold text-gold-400 uppercase tracking-widest mb-3">Contato de Emergência</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Nome do Contato</label>
                      <input
                        type="text"
                        value={formContatoEmergenciaNome}
                        onChange={(e) => setFormContatoEmergenciaNome(e.target.value)}
                        placeholder="Nome do parente/amigo"
                        className="input-premium w-full"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Telefone do Contato</label>
                      <input
                        type="text"
                        value={formContatoEmergenciaTel}
                        onChange={(e) => setFormContatoEmergenciaTel(formatPhone(e.target.value))}
                        placeholder="(00) 00000-0000"
                        className="input-premium w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Read Only/System Fields Notice */}
                <div className="bg-obsidian-950 p-4 rounded-xl border border-obsidian-800 space-y-2 mt-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <ShieldAlert className="w-4 h-4 text-gold-500" />
                    Informações Restritas da Academia
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mt-2 pt-1">
                    <div>
                      <span className="text-slate-500 block">CPF:</span>
                      <span className="font-mono text-slate-300 font-semibold">{student.cpf}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Data de Matrícula:</span>
                      <span className="text-slate-300 font-semibold">{student.dataMatricula.split('-').reverse().join('/')}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Graduação Atual:</span>
                      <span className="text-slate-300 font-semibold">{student.faixa} ({student.graus} Graus)</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal pt-1.5 border-t border-obsidian-800">
                    Estes campos são gerenciados exclusivamente pela administração da Sagrada Família BJJ. Para retificá-los, por favor procure seu instrutor.
                  </p>
                </div>

                {/* Submit button */}
                <div className="flex justify-end pt-4">
                  <button type="submit" className="btn-gold px-8 py-2.5">
                    Salvar Informações
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-100">Alterar Senha de Acesso</h2>
                <p className="text-slate-400 text-xs mt-1">
                  Proteja sua conta alterando sua senha de acesso ao portal. A nova senha deve ter no mínimo 6 caracteres.
                </p>
              </div>

              {passSuccess && (
                <div className="flex items-center gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-400 text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{passSuccess}</span>
                </div>
              )}

              {passError && (
                <div className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm animate-shake">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{passError}</span>
                </div>
              )}

              <form onSubmit={handleSavePassword} className="space-y-4 max-w-md">
                {/* Current Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Senha Atual</label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="input-premium w-full pr-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300"
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Nova Senha</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-premium w-full pr-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Confirmar Nova Senha</label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-premium w-full pr-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300"
                    >
                      {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <div className="flex justify-start pt-4">
                  <button type="submit" className="btn-gold px-8 py-2.5">
                    Atualizar Senha
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
