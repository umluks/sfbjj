import React, { useState } from 'react';
import type { Aluno, Belt, Degree, Gender, LoggedUser, GraduacaoHistorico } from '../types';
import { supabase } from '../lib/supabase';
import { 
  User, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Award,
  Plus
} from 'lucide-react';


interface StudentProfileProps {
  alunoId?: number;
  students: Aluno[];
  setStudents: React.Dispatch<React.SetStateAction<Aluno[]>>;
  loggedUser: LoggedUser | null;
  setLoggedUser?: React.Dispatch<React.SetStateAction<LoggedUser | null>>;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ 
  alunoId, 
  students, 
  setStudents, 
  loggedUser, 
  setLoggedUser 
}) => {
  const isEditingAdmin = !alunoId && loggedUser?.role === 'admin';
  const isStudent = loggedUser?.role === 'student';

  const student = students.find(s => s.id === alunoId);

  if (!isEditingAdmin && !student) {
    return (
      <div className="text-center py-20 text-slate-500 card-premium">
        Aluno não encontrado no sistema.
      </div>
    );
  }

  // Helper para formatar data como MM/AAAA (apenas mês/ano)
  const formatToMonthYear = (dateStr: string) => {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length >= 2) {
      return `${parts[1]}/${parts[0]}`;
    }
    if (dateStr.includes('/')) {
      const p = dateStr.split('/');
      if (p.length >= 2) return `${p[1]}/${p[p.length - 1]}`;
    }
    return dateStr;
  };

  // Converte YYYY-MM-DD ou DD/MM/AAAA para YYYY-MM (para input type="month")
  const toMonthInputValue = (dateStr: string) => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) {
      const p = dateStr.split('/');
      if (p.length === 3) return `${p[2]}-${p[1].padStart(2, '0')}`;
    }
    if (dateStr.includes('-')) {
      return dateStr.substring(0, 7);
    }
    return '';
  };

  // Active Tab: 'profile' or 'password' or 'graduacoes'
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'password' | 'graduacoes'>('profile');

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

  const [formUltimaGraduacao, setFormUltimaGraduacao] = useState(isEditingAdmin ? '' : (student ? toMonthInputValue(student.dataUltimaGraduacao || '') : ''));
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
  const [gradError, setGradError] = useState<string | null>(null);
  
  // New Graduation State
  const [showGradModal, setShowGradModal] = useState(false);
  const [newGradFaixa, setNewGradFaixa] = useState<Belt>('Branca');
  const [newGradGrau, setNewGradGrau] = useState<Degree>(0);
  const [newGradData, setNewGradData] = useState(new Date().toISOString().split('T')[0]);

  // Formatting helpers
  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 15);
  };


  const handleSaveInfo = async (e: React.FormEvent) => {
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

    if (!student) return;

    if (!formDataNascimento) {
      setInfoError('Data de Nascimento é obrigatória.');
      return;
    }

    // formUltimaGraduacao está no formato YYYY-MM (input type="month")
    const dbUltimaGrad = formUltimaGraduacao ? `${formUltimaGraduacao}-01` : null;

    // Update in supabase
    const { error: updateError } = await supabase
      .from('alunos')
      .update({
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
        dataUltimaGraduacao: dbUltimaGrad,
        contatoEmergenciaNome: formContatoEmergenciaNome,
        contatoEmergenciaTel: formContatoEmergenciaTel,
        fotoPerfil: formFotoPerfil
      })
      .eq('id', student.id);

    if (updateError) {
      console.error('Error updating student info:', updateError);
      setInfoError('Erro ao salvar as informações no banco de dados.');
      return;
    }

    setStudents(prev => prev.map(s => {
      if (student && s.id === student?.id) {
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
          dataUltimaGraduacao: dbUltimaGrad || '',
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
      if (student && logged.alunoId === student.id) {
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

    if (isEditingAdmin) {
      localStorage.setItem('sfbjj_admin_password', newPassword);
      setPassSuccess('Senha do administrador atualizada com sucesso!');
    } else {
      setStudents(prev => prev.map(s => {
        if (student && s.id === student.id) {
          return { ...s, senha: newPassword };
        }
        return s;
      }));
      setPassSuccess('Sua senha foi atualizada com sucesso!');
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPassSuccess(null), 4000);
  };

  const handleAddGraduacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStudent || !student) return;

    if (!newGradData) {
      setGradError('A data da graduação é obrigatória.');
      return;
    }

    // Insere novo registro de graduação no supabase
    const { data: newGradDataDb, error: gradInsertError } = await supabase
      .from('graduacoes_historico')
      .insert({
        aluno_id: student.id,
        faixa: newGradFaixa,
        graus: newGradGrau,
        data_graduacao: newGradData,
        avaliador: loggedUser.nome
      })
      .select()
      .single();

    if (gradInsertError) {
      console.error('Error inserting graduation record:', gradInsertError);
      setGradError('Erro ao registrar graduação no banco de dados.');
      return;
    }

    // Update faixa, graus, and dataUltimaGraduacao in alunos table
    const { error: studentUpdateError } = await supabase
      .from('alunos')
      .update({
        faixa: newGradFaixa,
        graus: newGradGrau,
        data_graduacao: newGradData
      })
      .eq('id', student.id);

    if (studentUpdateError) {
      console.error('Error updating student graduation details:', studentUpdateError);
    }

    const newGrad: GraduacaoHistorico = {
      id: newGradDataDb ? newGradDataDb.id : Date.now(),
      data: newGradData,
      faixa: newGradFaixa,
      graus: newGradGrau,
      avaliador: loggedUser.nome
    };

    setStudents(prev => prev.map(s => {
      if (s.id === student.id) {
        const hist = s.historicoGraduacoes || [];
        return {
          ...s,
          faixa: newGradFaixa,
          graus: newGradGrau,
          dataUltimaGraduacao: newGradData,
          historicoGraduacoes: [...hist, newGrad]
        };
      }
      return s;
    }));
    
    // Atualiza estados locais do formulário também
    setFormFaixa(newGradFaixa);
    setFormGraus(newGradGrau);
    setFormUltimaGraduacao(toMonthInputValue(newGradData));

    setShowGradModal(false);
  };

  const renderBeltBadge = (faixa: Belt, graus: Degree) => {
    let beltClass = 'bg-slate-200 text-slate-800'; // Default branca
    let barColor = 'bg-black'; // Default black sleeve bar

    switch (faixa) {
      case 'Branca':
        beltClass = 'bg-slate-200 text-slate-800 border border-slate-350';
        break;
      case 'Cinza':
        beltClass = 'bg-gray-500 text-white';
        break;
      case 'Amarela':
        beltClass = 'bg-yellow-400 text-black';
        break;
      case 'Laranja':
        beltClass = 'bg-orange-500 text-white';
        break;
      case 'Verde':
        beltClass = 'bg-green-600 text-white';
        break;
      case 'Azul':
        beltClass = 'bg-blue-600 text-white border border-blue-700';
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
              className={`w-1 h-3.5 rounded-sm transition-all ${idx < graus ? 'bg-white shadow-[0_0_3px_rgba(255,255,255,0.7)]' : 'bg-neutral-800/80'}`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Profile Hero Card */}
      <div className="bg-obsidian-900/40 border border-obsidian-850/70 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-lg">
        {/* Glow decoration */}
        <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] rounded-full bg-slate-500/5 blur-[100px] pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 z-10 relative">
          {/* Avatar / Profile Picture */}
          <div className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-200/15 bg-gradient-to-br from-slate-100/5 to-slate-200/5 flex items-center justify-center text-4xl shadow-md shrink-0 select-none">
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

          {/* Aluno/Admin Info Summary */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
                {isEditingAdmin ? formNome : student?.nome}
              </h1>
              {!isEditingAdmin && student && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${student.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-750/10 text-slate-450 border border-slate-800'}`}>
                  {student.status}
                </span>
              )}
              {isEditingAdmin && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100/10 text-slate-350 border border-slate-200/10">
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
        <div className="md:col-span-1 bg-obsidian-900/40 p-4 rounded-xl border border-obsidian-850/60 backdrop-blur-md space-y-1">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
              activeSubTab === 'profile'
                ? 'bg-slate-100/5 border-l-2 border-slate-350 text-slate-105'
                : 'text-slate-450 hover:text-slate-200 hover:bg-obsidian-900/30'
            }`}
          >
            <User className="w-4 h-4" />
            Dados Pessoais
          </button>
          {!isEditingAdmin && (
            <button
              onClick={() => setActiveSubTab('graduacoes')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                activeSubTab === 'graduacoes'
                  ? 'bg-slate-100/5 border-l-2 border-slate-350 text-slate-105'
                  : 'text-slate-450 hover:text-slate-200 hover:bg-obsidian-900/30'
              }`}
            >
              <Award className="w-4 h-4" />
              Graduações
            </button>
          )}
          <button
            onClick={() => setActiveSubTab('password')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
              activeSubTab === 'password'
                ? 'bg-slate-100/5 border-l-2 border-slate-350 text-slate-105'
                : 'text-slate-450 hover:text-slate-200 hover:bg-obsidian-900/30'
            }`}
          >
            <Lock className="w-4 h-4" />
            Alterar Senha
          </button>
        </div>

        {/* Form Container */}
        <div className="md:col-span-3 card-premium bg-obsidian-900/20 border border-obsidian-900/60 shadow-2xl backdrop-blur-md">
          {activeSubTab === 'profile' ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-100">Atualizar Dados Pessoais</h2>
                <p className="text-slate-400 text-xs mt-1">
                  Mantenha suas informações de contato e emergência atualizadas para comunicação oficial.
                  {isStudent && " Alguns campos são restritos e só podem ser alterados na secretaria."}
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
                    className="input-premium w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                    disabled={isStudent}
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
                        className="input-premium w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                        disabled={isStudent}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Gênero</label>
                      <select
                        value={formGenero}
                        onChange={(e) => setFormGenero(e.target.value as Gender)}
                        className="input-premium w-full bg-obsidian-950 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isStudent}
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
                          className="input-premium w-full font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="000.000.000-00"
                          disabled={isStudent}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Data de Matrícula</label>
                        <input
                          type="date"
                          value={formDataMatricula}
                          onChange={(e) => setFormDataMatricula(e.target.value)}
                          className="input-premium w-full disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isStudent}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Data da Última Graduação</label>
                        <input
                          type="month"
                          value={formUltimaGraduacao}
                          onChange={(e) => setFormUltimaGraduacao(e.target.value)}
                          className="input-premium w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Faixa Atual</label>
                        <select
                          value={formFaixa}
                          onChange={(e) => setFormFaixa(e.target.value as Belt)}
                          className="input-premium w-full bg-obsidian-950 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          className="input-premium w-full bg-obsidian-950 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value={0}>0 Grau</option>
                          <option value={1}>1 Grau</option>
                          <option value={2}>2 Graus</option>
                          <option value={3}>3 Graus</option>
                          <option value={4}>4 Graus</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Turma Principal</label>
                        <select
                          value={formTurma}
                          onChange={(e) => setFormTurma(e.target.value as 'Kids' | 'Adulto')}
                          className="input-premium w-full bg-obsidian-950 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="Adulto">Adulto</option>
                          <option value="Kids">Kids</option>
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
          ) : activeSubTab === 'password' ? (
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
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-100">Histórico de Graduações</h2>
                  <p className="text-slate-400 text-xs mt-1">
                    Acompanhe a jornada, faixas e graus alcançados.
                  </p>
                </div>
                {isStudent && (
                  <button 
                    onClick={() => setShowGradModal(true)}
                    className="btn-gold flex items-center gap-2 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Registrar Graduação
                  </button>
                )}
              </div>

              <div className="mt-4 border border-obsidian-750 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-obsidian-850 text-xs uppercase text-slate-400 border-b border-obsidian-750">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Data</th>
                      <th className="px-4 py-3 font-semibold">Faixa & Grau</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-obsidian-750/50">
                    {student?.historicoGraduacoes && student.historicoGraduacoes.length > 0 ? (
                      student.historicoGraduacoes.slice().reverse().map((grad) => (
                        <tr key={grad.id} className="hover:bg-obsidian-800/30 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-xs font-mono">
                            {formatToMonthYear(grad.data)}
                          </td>
                          <td className="px-4 py-3">
                            {renderBeltBadge(grad.faixa, grad.graus)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="px-4 py-8 text-center text-slate-500 text-xs">
                          Nenhum registro de graduação encontrado para este aluno.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Modal de Registro de Graduação (Only Student) */}
              {showGradModal && isStudent && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                  <div className="bg-obsidian-850 border border-obsidian-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-scale-up">
                    <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-gold-500" />
                      Nova Graduação
                    </h3>

                    {gradError && (
                      <div className="mb-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{gradError}</span>
                      </div>
                    )}

                    <form onSubmit={handleAddGraduacao} className="space-y-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Nova Faixa</label>
                        <select
                          value={newGradFaixa}
                          onChange={(e) => setNewGradFaixa(e.target.value as Belt)}
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
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Novo Grau</label>
                        <select
                          value={newGradGrau}
                          onChange={(e) => setNewGradGrau(Number(e.target.value) as Degree)}
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
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Data da Graduação</label>
                        <input
                          type="date"
                          value={newGradData}
                          onChange={(e) => setNewGradData(e.target.value)}
                          className="input-premium w-full bg-obsidian-950"
                          required
                        />
                      </div>

                      <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-obsidian-750">
                        <button 
                          type="button" 
                          onClick={() => setShowGradModal(false)}
                          className="btn-obsidian px-4 py-2 text-xs"
                        >
                          Cancelar
                        </button>
                        <button type="submit" className="btn-gold px-4 py-2 text-xs">
                          Registrar
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
