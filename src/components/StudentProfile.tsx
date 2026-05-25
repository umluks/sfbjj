import React, { useState } from 'react';
import type { Student, Belt, Degree, Gender, LoggedUser } from '../types';
import { 
  User, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';


interface StudentProfileProps {
  studentId?: string;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  loggedUser: LoggedUser | null;
  setLoggedUser?: React.Dispatch<React.SetStateAction<LoggedUser | null>>;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ 
  studentId, 
  students, 
  setStudents, 
  loggedUser, 
  setLoggedUser 
}) => {
  const isEditingAdmin = !studentId && loggedUser?.role === 'admin';
  const student = students.find(s => s.id === studentId);

  if (!isEditingAdmin && !student) {
    return (
      <div className="text-center py-20 text-slate-500 card-premium">
        Aluno não encontrado no sistema.
      </div>
    );
  }

  // Helper to format date as DD/MM/AAAA
  const formatToDDMMAAAA = (dateStr: string) => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) return dateStr;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Active Tab: 'profile' or 'password'
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'password'>('profile');

  // Form States (conditional for admin/student)
  const [formNome, setFormNome] = useState(isEditingAdmin ? (loggedUser?.nome || 'Administrador') : (student?.nome || ''));
  const [formCpf, setFormCpf] = useState(isEditingAdmin ? '' : (student?.cpf || ''));
  const [formDataNascimento, setFormDataNascimento] = useState(isEditingAdmin ? '' : (student?.dataNascimento || ''));
  const [formTelefone, setFormTelefone] = useState(isEditingAdmin ? '' : (student?.telefone || ''));
  const [formEmail, setFormEmail] = useState(isEditingAdmin ? '' : (student?.email || ''));
  const [formGenero, setFormGenero] = useState<Gender>(isEditingAdmin ? 'Masculino' : (student?.genero || 'Masculino'));
  const [formBairro, setFormBairro] = useState(isEditingAdmin ? '' : (student?.bairro || ''));
  const [formDataMatricula, setFormDataMatricula] = useState(isEditingAdmin ? '' : (student?.dataMatricula || ''));
  const [formFaixa, setFormFaixa] = useState<Belt>(isEditingAdmin ? 'Branca' : (student?.faixa || 'Branca'));
  const [formGraus, setFormGraus] = useState<Degree>(isEditingAdmin ? 0 : (student?.graus || 0));
  const [formTurma, setFormTurma] = useState<'Kids' | 'Adulto'>(isEditingAdmin ? 'Adulto' : (student?.turma || 'Adulto'));
  const [formModalidade, setFormModalidade] = useState(isEditingAdmin ? 'Mensal' : (student?.modalidadePagamento || 'Mensal'));
  const [formUltimaGraduacao, setFormUltimaGraduacao] = useState(isEditingAdmin ? '' : (student ? formatToDDMMAAAA(student.dataUltimaGraduacao) : ''));
  const [formContatoEmergenciaNome, setFormContatoEmergenciaNome] = useState(isEditingAdmin ? '' : (student?.contatoEmergenciaNome || ''));
  const [formContatoEmergenciaTel, setFormContatoEmergenciaTel] = useState(isEditingAdmin ? '' : (student?.contatoEmergenciaTel || ''));
  const [formFotoPerfil, setFormFotoPerfil] = useState(isEditingAdmin ? (localStorage.getItem('sfbjj_admin_avatar') || '') : (student?.fotoPerfil || ''));

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

  const formatBrazilianDate = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1')
      .substring(0, 10);
  };
  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setInfoSuccess(null);
    setInfoError(null);

    if (!formNome) {
      setInfoError('Nome é obrigatório.');
      return;
    }

    if (isEditingAdmin) {
      localStorage.setItem('sfbjj_admin_name', formNome);
      localStorage.setItem('sfbjj_admin_avatar', formFotoPerfil);
      
      // Update logged user state
      if (setLoggedUser) {
        setLoggedUser(prev => prev ? { ...prev, nome: formNome } : null);
      }
      
      // Update localStorage user name if changed
      const loggedStr = localStorage.getItem('sfbjj_logged_user');
      if (loggedStr) {
        const logged = JSON.parse(loggedStr);
        logged.nome = formNome;
        localStorage.setItem('sfbjj_logged_user', JSON.stringify(logged));
      }

      setInfoSuccess('Informações do administrador atualizadas com sucesso!');
      setTimeout(() => setInfoSuccess(null), 4000);
      return;
    }

    if (!formDataNascimento) {
      setInfoError('Data de Nascimento é obrigatória.');
      return;
    }

    setStudents(prev => prev.map(s => {
      if (student && s.id === student.id) {
        return {
          ...s,
          nome: formNome,
          cpf: formCpf,
          dataNascimento: formDataNascimento,
          telefone: formTelefone,
          email: formEmail,
          genero: formGenero,
          bairro: formBairro,
          dataMatricula: formDataMatricula,
          faixa: formFaixa,
          graus: formGraus,
          turma: formTurma,
          modalidadePagamento: formModalidade,
          dataUltimaGraduacao: formUltimaGraduacao,
          contatoEmergenciaNome: formContatoEmergenciaNome,
          contatoEmergenciaTel: formContatoEmergenciaTel,
          fotoPerfil: formFotoPerfil
        };
      }
      return s;
    }));

    // Update localStorage user name if changed
    const loggedStr = localStorage.getItem('sfbjj_logged_user');
    if (loggedStr) {
      const logged = JSON.parse(loggedStr);
      if (student && logged.studentId === student.id) {
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

    const actualCurrentPassword = isEditingAdmin 
      ? (localStorage.getItem('sfbjj_admin_password') || '#sfbjj2026')
      : (student?.senha || '#sfbjj2026');

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
    if (isEditingAdmin) {
      localStorage.setItem('sfbjj_admin_password', newPassword);
    } else if (student) {
      setStudents(prev => prev.map(s => {
        if (s.id === student.id) {
          return {
            ...s,
            senha: newPassword
          };
        }
        return s;
      }));
    }

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

  return (
    <div className="space-y-6">
      {/* Header Profile Hero Card */}
      <div className="bg-gradient-to-r from-obsidian-850/80 to-obsidian-800/80 border border-obsidian-800/90 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden backdrop-blur-md">
        {/* Glow decoration */}
        <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] rounded-full bg-gold-500/5 blur-[100px] pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 z-10 relative">
          {/* Avatar / Profile Picture */}
          <div className="w-24 h-24 rounded-2xl overflow-hidden border border-gold-500/30 bg-gradient-to-br from-gold-500/10 to-gold-600/5 flex items-center justify-center text-4xl shadow-md shrink-0 select-none">
            {isEditingAdmin ? (
              formFotoPerfil ? (
                formFotoPerfil.length === 2 ? (
                  <span>{formFotoPerfil}</span>
                ) : (
                  <img src={formFotoPerfil} alt="Foto de perfil" className="w-full h-full object-cover" />
                )
              ) : (
                <span className="text-slate-400">🥋</span>
              )
            ) : student?.fotoPerfil ? (
              student.fotoPerfil.length === 2 ? (
                <span>{student.fotoPerfil}</span>
              ) : (
                <img src={student.fotoPerfil} alt="Foto de perfil" className="w-full h-full object-cover" />
              )
            ) : (
              <span className="text-slate-400">🥋</span>
            )}
          </div>

          {/* Student/Admin Info Summary */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
                {isEditingAdmin ? formNome : student?.nome}
              </h1>
              {!isEditingAdmin && student && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${student.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700/10 text-slate-400 border border-slate-750'}`}>
                  {student.status}
                </span>
              )}
              {isEditingAdmin && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gold-500/10 text-gold-400 border border-gold-500/20">
                  Administrador
                </span>
              )}
            </div>
            
            {!isEditingAdmin && student && (
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Graduação:</span>
                  {renderBeltBadge(student.faixa, student.graus)}
                </div>
              </div>
            )}
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
                {!isEditingAdmin && (
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
                )}

                {/* Birth & Gender */}
                {!isEditingAdmin && (
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
                )}

                {/* Neighborhood (Bairro) */}
                {!isEditingAdmin && (
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
                )}

                {/* Emergency Contact Header */}
                {!isEditingAdmin && (
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
                )}

                {/* Foto de Perfil */}
                <div className="border-t border-obsidian-750 pt-4 mt-2">
                  <h3 className="text-xs font-extrabold text-gold-400 uppercase tracking-widest mb-3">Foto de Perfil</h3>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Preview */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-gold-500/25 bg-obsidian-950 flex items-center justify-center text-3xl shadow-inner select-none shrink-0">
                      {formFotoPerfil ? (
                        formFotoPerfil.length === 2 ? (
                          <span>{formFotoPerfil}</span>
                        ) : (
                          <img src={formFotoPerfil} alt="Preview" className="w-full h-full object-cover" />
                        )
                      ) : (
                        <span className="text-slate-600">🥋</span>
                      )}
                    </div>
                    {/* Options */}
                    <div className="flex-1 space-y-3 w-full">
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-xs text-slate-500 mr-1">Avatares padrão:</span>
                        <button type="button" onClick={() => setFormFotoPerfil('👦')} className={`p-1.5 rounded-lg border text-lg hover:bg-obsidian-700 transition-colors ${formFotoPerfil === '👦' ? 'border-gold-500 bg-gold-500/10' : 'border-obsidian-700'}`}>👦</button>
                        <button type="button" onClick={() => setFormFotoPerfil('👨')} className={`p-1.5 rounded-lg border text-lg hover:bg-obsidian-700 transition-colors ${formFotoPerfil === '👨' ? 'border-gold-500 bg-gold-500/10' : 'border-obsidian-700'}`}>👨</button>
                        <button type="button" onClick={() => setFormFotoPerfil('🧑')} className={`p-1.5 rounded-lg border text-lg hover:bg-obsidian-700 transition-colors ${formFotoPerfil === '🧑' ? 'border-gold-500 bg-gold-500/10' : 'border-obsidian-700'}`}>🧑</button>
                        <button type="button" onClick={() => setFormFotoPerfil('👧')} className={`p-1.5 rounded-lg border text-lg hover:bg-obsidian-700 transition-colors ${formFotoPerfil === '👧' ? 'border-gold-500 bg-gold-500/10' : 'border-obsidian-700'}`}>👧</button>
                        <button type="button" onClick={() => setFormFotoPerfil('👩')} className={`p-1.5 rounded-lg border text-lg hover:bg-obsidian-700 transition-colors ${formFotoPerfil === '👩' ? 'border-gold-500 bg-gold-500/10' : 'border-obsidian-700'}`}>👩</button>
                        <button type="button" onClick={() => setFormFotoPerfil('👩‍🦰')} className={`p-1.5 rounded-lg border text-lg hover:bg-obsidian-700 transition-colors ${formFotoPerfil === '👩‍🦰' ? 'border-gold-500 bg-gold-500/10' : 'border-obsidian-700'}`}>👩‍🦰</button>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-slate-500">Ou envie sua foto:</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                if (event.target?.result) {
                                  setFormFotoPerfil(event.target.result as string);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="text-xs text-slate-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-obsidian-800 file:text-slate-200 hover:file:bg-obsidian-750 file:cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Editable Academic & System Fields */}
                {!isEditingAdmin && (
                  <div className="border-t border-obsidian-750 pt-4 mt-2">
                    <h3 className="text-xs font-extrabold text-gold-400 uppercase tracking-widest mb-3">Informações Acadêmicas</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">CPF</label>
                        <input
                          type="text"
                          value={formCpf}
                          onChange={(e) => setFormCpf(e.target.value)}
                          className="input-premium w-full font-mono"
                          placeholder="000.000.000-00"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Data de Matrícula</label>
                        <input
                          type="date"
                          value={formDataMatricula}
                          onChange={(e) => setFormDataMatricula(e.target.value)}
                          className="input-premium w-full"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Data da Última Graduação</label>
                        <input
                          type="text"
                          value={formUltimaGraduacao}
                          onChange={(e) => setFormUltimaGraduacao(formatBrazilianDate(e.target.value))}
                          className="input-premium w-full"
                          placeholder="DD/MM/AAAA"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Faixa Atual</label>
                        <select
                          value={formFaixa}
                          onChange={(e) => setFormFaixa(e.target.value as Belt)}
                          className="input-premium w-full bg-obsidian-950"
                        >
                          <option value="Branca">Branca</option>
                          <option value="Cinza">Cinza</option>
                          <option value="Amarela">Amarela</option>
                          <option value="Laranja">Laranja</option>
                          <option value="Verde">Verde</option>
                          <option value="Azul">Azul</option>
                          <option value="Roxa">Roxa</option>
                          <option value="Marrom">Marrom</option>
                          <option value="Preta">Preta</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Graus</label>
                        <select
                          value={formGraus}
                          onChange={(e) => setFormGraus(Number(e.target.value) as Degree)}
                          className="input-premium w-full bg-obsidian-950"
                        >
                          <option value={0}>0 Grau</option>
                          <option value={1}>1 Grau</option>
                          <option value={2}>2 Graus</option>
                          <option value={3}>3 Graus</option>
                          <option value={4}>4 Graus</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Turma</label>
                        <select
                          value={formTurma}
                          onChange={(e) => setFormTurma(e.target.value as 'Kids' | 'Adulto')}
                          className="input-premium w-full bg-obsidian-950"
                        >
                          <option value="Adulto">Adulto</option>
                          <option value="Kids">Kids</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Modalidade de Pagamento</label>
                        <select
                          value={formModalidade}
                          onChange={(e) => setFormModalidade(e.target.value)}
                          className="input-premium w-full bg-obsidian-950"
                        >
                          <option value="Mensal">Mensal</option>
                          <option value="Trimestral">Trimestral</option>
                          <option value="Semestral">Semestral</option>
                          <option value="Anual">Anual</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

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
