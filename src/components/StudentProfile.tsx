import React, { useState, useEffect } from 'react';
import type { Aluno, Belt, Degree, Gender, LoggedUser, Administrador } from '../types';
import { BAIRROS_DF, BELT_RANKS } from '../types';
import { useStudents } from '../contexts/StudentsContext';
import { BeltBadge } from './shared/BeltBadge';
import { getBeltsByAge, getBjjAge } from '../utils/bjj';
import { formatPhone, formatMonthYear } from '../utils/formatters';
import { supabase } from '../lib/supabase';
import { 
  User, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Award
} from 'lucide-react';

interface StudentProfileProps {
  alunoId?: number;
  loggedUser: LoggedUser | null;
  setLoggedUser?: React.Dispatch<React.SetStateAction<LoggedUser | null>>;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ 
  alunoId, 
  loggedUser, 
  setLoggedUser 
}) => {
  const { students, setStudents } = useStudents();

  const isEditingAdmin = !alunoId && loggedUser?.role === 'admin';
  const isEditingTeacher = !alunoId && loggedUser?.role === 'teacher';
  const isStudent = loggedUser?.role === 'student';

  // Tenta encontrar o aluno na lista global do contexto
  const contextStudent = students.find(s => s.id === alunoId);
  const [localStudent, setLocalStudent] = useState<Aluno | null>(null);

  const student = contextStudent || localStudent;

  // Estados dos Dados Pessoais do banco
  const [adminData, setAdminData] = useState<Administrador | null>(null);
  const [teacherData, setTeacherData] = useState<any>(null);

  // Active Tab: 'profile' or 'password' or 'graduacoes'
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'password' | 'graduacoes'>('profile');

  // Form States
  const [formNome, setFormNome] = useState('');
  const [formCpf, setFormCpf] = useState('');
  const [formDataNascimento, setFormDataNascimento] = useState('');
  const [formTelefone, setFormTelefone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formGenero, setFormGenero] = useState<Gender>('Masculino');
  const [formBairro, setFormBairro] = useState('');
  const [formDataMatricula, setFormDataMatricula] = useState('');
  const [formFaixa, setFormFaixa] = useState<Belt>('Branca');
  const [formGraus, setFormGraus] = useState<Degree>(0);
  const [formTurma, setFormTurma] = useState<'Kids' | 'Adulto'>('Adulto');
  const [formUltimaGraduacao, setFormUltimaGraduacao] = useState('');
  const [formContatoEmergenciaNome, setFormContatoEmergenciaNome] = useState('');
  const [formContatoEmergenciaTel, setFormContatoEmergenciaTel] = useState('');
  const [formFotoPerfil, setFormFotoPerfil] = useState('');

  // Converte YYYY-MM-DD para YYYY-MM para uso no input month
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

  // Efeito para buscar o próprio perfil do aluno caso a lista global esteja vazia (mitigação de vazamento de dados)
  useEffect(() => {
    async function fetchMyProfile() {
      if (isStudent && alunoId && !contextStudent) {
        const { data, error } = await supabase
          .from('alunos')
          .select('*, pagamentos!pagamentos_alunoId_fkey(*), graduacoes_historico!graduacoes_historico_aluno_id_fkey(*)')
          .eq('id', alunoId)
          .single();

        if (!error && data) {
          const mappedStudent: Aluno = {
            ...data,
            historicoGraduacoes: (data.graduacoes_historico || [])
              .map((g: any) => ({
                id: g.id,
                data: g.data_graduacao,
                faixa: g.faixa,
                graus: g.graus,
                avaliador: g.avaliador
              }))
              .sort((a: any, b: any) => new Date(a.data).getTime() - new Date(b.data).getTime())
          };
          setLocalStudent(mappedStudent);
        }
      }
    }
    fetchMyProfile();
  }, [isStudent, alunoId, contextStudent]);

  // Sincroniza formulário quando o objeto "student", "adminData" ou "teacherData" for alterado
  useEffect(() => {
    if (isEditingAdmin) {
      setFormNome(loggedUser?.nome || 'Administrador');
    } else if (isEditingTeacher && teacherData) {
      setFormNome(teacherData.nome);
      setFormEmail(teacherData.email || '');
      setFormTelefone(formatPhone(teacherData.telefone || ''));
    } else if (student) {
      setFormNome(student.nome);
      setFormCpf(student.cpf || '');
      setFormDataNascimento(student.dataNascimento || '');
      setFormTelefone(formatPhone(student.telefone || ''));
      setFormEmail(student.email || '');
      setFormGenero(student.genero || 'Masculino');
      setFormBairro(student.bairro || '');
      setFormDataMatricula(student.dataMatricula || '');
      setFormFaixa(student.faixa || 'Branca');
      setFormGraus(student.graus || 0);
      setFormTurma(student.turma || 'Adulto');
      setFormUltimaGraduacao(toMonthInputValue(student.dataUltimaGraduacao || ''));
      setFormContatoEmergenciaNome(student.contatoEmergenciaNome || '');
      setFormContatoEmergenciaTel(formatPhone(student.contatoEmergenciaTel || ''));
      setFormFotoPerfil(student.fotoPerfil || '');
    }
  }, [student, isEditingAdmin, isEditingTeacher, teacherData, loggedUser]);

  // Efeitos para carregar dados de Admin e Professor do Supabase
  useEffect(() => {
    async function fetchAdminData() {
      if (isEditingAdmin && loggedUser?.adminId) {
        const { data, error } = await supabase
          .from('administradores')
          .select('*')
          .eq('id', loggedUser.adminId)
          .single();
        if (!error && data) {
          setAdminData(data);
          setFormNome(data.nome);
          setFormFotoPerfil(data.foto_perfil || '');
        }
      }
    }
    fetchAdminData();
  }, [isEditingAdmin, loggedUser]);

  useEffect(() => {
    async function fetchTeacherData() {
      if (isEditingTeacher && loggedUser?.professorId) {
        const { data, error } = await supabase
          .from('professores')
          .select('*')
          .eq('id', loggedUser.professorId)
          .single();
        if (!error && data) {
          setTeacherData(data);
        }
      }
    }
    fetchTeacherData();
  }, [isEditingTeacher, loggedUser]);

  // Form States de Senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Status/Alerts
  const [infoSuccess, setInfoSuccess] = useState<string | null>(null);
  const [infoError, setInfoError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  if (!isEditingAdmin && !isEditingTeacher && !student) {
    return (
      <div className="text-center py-20 text-slate-500 card-premium">
        Usuário não encontrado no sistema.
      </div>
    );
  }

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoSuccess(null);
    setInfoError(null);

    if (!formNome) {
      setInfoError('Nome é obrigatório.');
      return;
    }

    if (isEditingAdmin && adminData) {
      const { error: updateError } = await supabase
        .from('administradores')
        .update({
          nome: formNome,
          foto_perfil: formFotoPerfil
        })
        .eq('id', adminData.id);

      if (updateError) {
        console.error('Error updating admin info:', updateError);
        setInfoError('Erro ao salvar as informações no banco de dados.');
        return;
      }

      setAdminData({ ...adminData, nome: formNome, foto_perfil: formFotoPerfil });

      if (setLoggedUser) {
        setLoggedUser(prev => prev ? { ...prev, nome: formNome } : null);
      }

      const loggedStr = sessionStorage.getItem('sfbjj_logged_user');
      if (loggedStr) {
        const logged = JSON.parse(loggedStr);
        logged.nome = formNome;
        sessionStorage.setItem('sfbjj_logged_user', JSON.stringify(logged));
      }

      setInfoSuccess('Informações do administrador atualizadas com sucesso!');
      setTimeout(() => setInfoSuccess(null), 4000);
      return;
    }

    if (isEditingTeacher && loggedUser?.professorId) {
      const { error: updateError } = await supabase
        .from('professores')
        .update({
          nome: formNome,
          email: formEmail,
          telefone: formTelefone
        })
        .eq('id', loggedUser.professorId);

      if (updateError) {
        console.error('Error updating teacher info:', updateError);
        setInfoError('Erro ao salvar as informações no banco de dados.');
        return;
      }

      if (teacherData) {
        setTeacherData({ ...teacherData, nome: formNome, email: formEmail, telefone: formTelefone });
      }

      if (setLoggedUser) {
        setLoggedUser(prev => prev ? { ...prev, nome: formNome } : null);
      }

      const loggedStr = sessionStorage.getItem('sfbjj_logged_user');
      if (loggedStr) {
        const logged = JSON.parse(loggedStr);
        logged.nome = formNome;
        sessionStorage.setItem('sfbjj_logged_user', JSON.stringify(logged));
      }

      setInfoSuccess('Informações do professor atualizadas com sucesso!');
      setTimeout(() => setInfoSuccess(null), 4000);
      return;
    }

    if (!student) return;

    // Valida CPF
    const cleanedCpf = formCpf.replace(/\D/g, '');
    if (!cleanedCpf) {
      setInfoError('O CPF é obrigatório.');
      return;
    }
    if (cleanedCpf.length !== 11) {
      setInfoError('O CPF deve conter exatamente 11 dígitos.');
      return;
    }

    // Contato de Emergência para menores
    const age = getBjjAge(formDataNascimento);
    if (age < 18) {
      if (!formContatoEmergenciaNome.trim() || !formContatoEmergenciaTel.trim()) {
        setInfoError('Para menores de idade, o Contato de Emergência é obrigatório.');
        return;
      }
    }

    // Valida Faixa
    const allowed = getBeltsByAge(formDataNascimento);
    if (!allowed.includes(formFaixa)) {
      setInfoError(`A faixa "${formFaixa}" não é permitida para a idade de ${age} anos.`);
      return;
    }

    const oldFaixa = student.faixa;
    const oldGraus = student.graus;
    if (BELT_RANKS[formFaixa] < BELT_RANKS[oldFaixa]) {
      setInfoError(`Não é permitido rebaixar a faixa de ${oldFaixa} para ${formFaixa}.`);
      return;
    }
    if (formFaixa === oldFaixa && formGraus < oldGraus) {
      setInfoError('Não é permitido diminuir a quantidade de graus.');
      return;
    }

    const dbUltimaGrad = formUltimaGraduacao ? `${formUltimaGraduacao}-01` : null;

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

    const updatedStudent: Aluno = {
      ...student,
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

    if (contextStudent) {
      setStudents(prev => prev.map(s => s.id === student.id ? updatedStudent : s));
    } else {
      setLocalStudent(updatedStudent);
    }

    const loggedStr = sessionStorage.getItem('sfbjj_logged_user');
    if (loggedStr) {
      const logged = JSON.parse(loggedStr);
      if (logged.alunoId === student.id) {
        logged.nome = formNome;
        sessionStorage.setItem('sfbjj_logged_user', JSON.stringify(logged));
      }
    }

    setInfoSuccess('Informações pessoais atualizadas com sucesso!');
    setTimeout(() => setInfoSuccess(null), 4000);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccess(null);
    setPassError(null);

    const actualCurrentPassword = isEditingAdmin 
      ? (adminData?.senha || '#sfbjj2026')
      : isEditingTeacher
      ? (teacherData?.senha || '')
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

    if (isEditingAdmin && adminData) {
      const { error: updateError } = await supabase
        .from('administradores')
        .update({ senha: newPassword })
        .eq('id', adminData.id);
        
      if (updateError) {
        console.error('Error updating admin password:', updateError);
        setPassError('Erro ao atualizar a senha no banco de dados.');
        return;
      }
      
      setAdminData({ ...adminData, senha: newPassword });
      setPassSuccess('Senha do administrador atualizada com sucesso!');
    } else if (isEditingTeacher && loggedUser?.professorId) {
      const { error: updateError } = await supabase
        .from('professores')
        .update({ senha: newPassword })
        .eq('id', loggedUser.professorId);
        
      if (updateError) {
        console.error('Error updating teacher password:', updateError);
        setPassError('Erro ao atualizar a senha no banco de dados.');
        return;
      }

      if (teacherData) {
        setTeacherData({ ...teacherData, senha: newPassword });
      }
      setPassSuccess('Senha do professor atualizada com sucesso!');
    } else if (student) {
      const { error: updateError } = await supabase
        .from('alunos')
        .update({ senha: newPassword })
        .eq('id', student.id);
        
      if (updateError) {
        console.error('Error updating student password:', updateError);
        setPassError('Erro ao atualizar a senha no banco de dados.');
        return;
      }

      const updatedWithPass = { ...student, senha: newPassword };
      if (contextStudent) {
        setStudents(prev => prev.map(s => s.id === student.id ? updatedWithPass : s));
      } else {
        setLocalStudent(updatedWithPass);
      }
      setPassSuccess('Sua senha foi atualizada com sucesso!');
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPassSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Profile Hero Card */}
      <div className="bg-obsidian-900/40 border border-obsidian-850/70 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-lg">
        <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] rounded-full bg-slate-500/5 blur-[100px] pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 z-10 relative">
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
            ) : isEditingTeacher ? (
              <span className="text-slate-400">🥋</span>
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

          <div className="flex-1 space-y-2 text-left">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
                {isEditingAdmin ? formNome : isEditingTeacher ? formNome : student?.nome}
              </h1>
              {!isEditingAdmin && !isEditingTeacher && student && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${student.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-750/10 text-slate-450 border border-slate-800'}`}>
                  {student.status}
                </span>
              )}
              {isEditingAdmin && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100/10 text-slate-350 border border-slate-200/10">
                  Administrador
                </span>
              )}
              {isEditingTeacher && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100/10 text-slate-350 border border-slate-200/10">
                  Professor
                </span>
              )}
            </div>
            
            {!isEditingAdmin && !isEditingTeacher && student && (
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Graduação:</span>
                  <BeltBadge faixa={student.faixa} graus={student.graus} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navegação e Formulários */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        <div className="md:col-span-1 bg-obsidian-900/40 p-4 rounded-xl border border-obsidian-850/60 backdrop-blur-md space-y-1">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
              activeSubTab === 'profile'
                ? 'bg-slate-100/5 border-l-2 border-slate-350 text-slate-105'
                : 'text-slate-450 hover:text-slate-200 hover:bg-obsidian-900/30'
            }`}
            type="button"
          >
            <User className="w-4 h-4" />
            Dados Pessoais
          </button>
          {!isEditingAdmin && !isEditingTeacher && (
            <button
              onClick={() => setActiveSubTab('graduacoes')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                activeSubTab === 'graduacoes'
                  ? 'bg-slate-100/5 border-l-2 border-slate-350 text-slate-105'
                  : 'text-slate-450 hover:text-slate-200 hover:bg-obsidian-900/30'
              }`}
              type="button"
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
            type="button"
          >
            <Lock className="w-4 h-4" />
            Alterar Senha
          </button>
        </div>

        {/* Painel do Formulário */}
        <div className="md:col-span-3 card-premium bg-obsidian-900/20 border border-obsidian-900/60 shadow-2xl backdrop-blur-md">
          {activeSubTab === 'profile' ? (
            <div className="space-y-6 text-left">
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

                {isStudent && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Data de Nascimento</label>
                      <input
                        type="date"
                        value={formDataNascimento}
                        className="input-premium w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                        disabled={true}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Gênero</label>
                      <select
                        value={formGenero}
                        className="input-premium w-full bg-obsidian-950 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={true}
                      >
                        <option value="Masculino">Masculino</option>
                        <option value="Feminino">Feminino</option>
                      </select>
                    </div>
                  </div>
                )}

                {isStudent && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Bairro</label>
                    <select
                      value={formBairro}
                      onChange={(e) => setFormBairro(e.target.value)}
                      className="input-premium w-full bg-obsidian-950 text-slate-200"
                    >
                      <option value="">Selecione o bairro...</option>
                      {formBairro && !BAIRROS_DF.includes(formBairro) && (
                        <option value={formBairro}>{formBairro}</option>
                      )}
                      {BAIRROS_DF.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                )}

                {isStudent && (
                  <div className="border-t border-obsidian-750 pt-4 mt-2">
                    <h3 className="text-xs font-extrabold text-gold-400 uppercase tracking-widest mb-3">
                      Contato de Emergência {getBjjAge(formDataNascimento) < 18 && <span className="text-xs text-red-400 normal-case font-normal">(Obrigatório para menores)</span>}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Nome do Contato</label>
                        <input
                          type="text"
                          value={formContatoEmergenciaNome}
                          onChange={(e) => setFormContatoEmergenciaNome(e.target.value)}
                          className="input-premium w-full"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Telefone do Contato</label>
                        <input
                          type="text"
                          value={formContatoEmergenciaTel}
                          onChange={(e) => setFormContatoEmergenciaTel(formatPhone(e.target.value))}
                          className="input-premium w-full"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {!isEditingTeacher && (
                  <div className="border-t border-obsidian-750 pt-4 mt-2">
                    <h3 className="text-xs font-extrabold text-gold-400 uppercase tracking-widest mb-3">Foto de Perfil</h3>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
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
                      <div className="flex-1 space-y-3 w-full">
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="text-xs text-slate-500 mr-1">Avatares padrão:</span>
                          <button type="button" onClick={() => setFormFotoPerfil('👦')} className={`p-1.5 rounded-lg border text-lg hover:bg-obsidian-700 transition-colors ${formFotoPerfil === '👦' ? 'border-gold-500 bg-gold-500/10' : 'border-obsidian-700'}`}>👦</button>
                          <button type="button" onClick={() => setFormFotoPerfil('👨')} className={`p-1.5 rounded-lg border text-lg hover:bg-obsidian-700 transition-colors ${formFotoPerfil === '👨' ? 'border-gold-500 bg-gold-500/10' : 'border-obsidian-700'}`}>👨</button>
                          <button type="button" onClick={() => setFormFotoPerfil('🧑')} className={`p-1.5 rounded-lg border text-lg hover:bg-obsidian-700 transition-colors ${formFotoPerfil === '🧑' ? 'border-gold-500 bg-gold-500/10' : 'border-obsidian-700'}`}>🧑</button>
                          <button type="button" onClick={() => setFormFotoPerfil('👧')} className={`p-1.5 rounded-lg border text-lg hover:bg-obsidian-700 transition-colors ${formFotoPerfil === '👧' ? 'border-gold-500 bg-gold-500/10' : 'border-obsidian-700'}`}>👧</button>
                          <button type="button" onClick={() => setFormFotoPerfil('👩')} className={`p-1.5 rounded-lg border text-lg hover:bg-obsidian-700 transition-colors ${formFotoPerfil === '👩' ? 'border-gold-500 bg-gold-500/10' : 'border-obsidian-700'}`}>👩</button>
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
                )}

                {isStudent && (
                  <div className="border-t border-obsidian-750 pt-4 mt-2">
                    <h3 className="text-xs font-extrabold text-gold-400 uppercase tracking-widest mb-3">Informações Acadêmicas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">CPF</label>
                        <input
                          type="text"
                          value={formCpf}
                          className="input-premium w-full font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={true}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Data da Última Graduação</label>
                        <input
                          type="month"
                          value={formUltimaGraduacao}
                          className="input-premium w-full disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={true}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Faixa Atual</label>
                        <select value={formFaixa} className="input-premium w-full bg-obsidian-950 disabled:opacity-50 disabled:cursor-not-allowed" disabled={true}>
                          <option value={formFaixa}>{formFaixa}</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Graus</label>
                        <select value={formGraus} className="input-premium w-full bg-obsidian-950 disabled:opacity-50 disabled:cursor-not-allowed" disabled={true}>
                          <option value={formGraus}>{formGraus} Graus</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Turma Principal (Automática)</label>
                        <select value={formTurma} className="input-premium w-full bg-obsidian-950 disabled:opacity-50 disabled:cursor-not-allowed" disabled={true}>
                          <option value={formTurma}>{formTurma}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <button type="submit" className="btn-gold px-8 py-2.5">
                    Salvar Informações
                  </button>
                </div>
              </form>
            </div>
          ) : activeSubTab === 'password' ? (
            <div className="space-y-6 text-left">
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
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-330"
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

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
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-330"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

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
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-330"
                    >
                      {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-start pt-4">
                  <button type="submit" className="btn-gold px-8 py-2.5">
                    Atualizar Senha
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-6 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-100">Histórico de Graduações</h2>
                  <p className="text-slate-400 text-xs mt-1">
                    Acompanhe a jornada, faixas e graus alcançados.
                  </p>
                </div>
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
                            {formatMonthYear(grad.data)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-start">
                              <BeltBadge faixa={grad.faixa} graus={grad.graus} />
                            </div>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
