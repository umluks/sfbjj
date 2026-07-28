import React, { useState, useEffect } from 'react';
import { useAuth } from '@/application/hooks/useAuth';
import { useStudents } from '@/application/contexts/StudentsContext';
import { studentService } from '@/application/services/studentService';
import { teacherService } from '@/application/services/teacherService';
import { adminService } from '@/application/services/adminService';
import type { Aluno, Belt, Degree } from '@/domain/models/student';
import { PersonalInfoForm } from '@/presentation/components/profile/PersonalInfoForm';
import { ChangePasswordForm } from '@/presentation/components/profile/ChangePasswordForm';
import { GraduationHistoryTable } from '@/presentation/components/profile/GraduationHistoryTable';
import { calculateIbjjfCategory } from '@/utils/ibjjfCalculator';
import { User, Lock, Award } from 'lucide-react';

interface StudentProfilePageProps {
  alunoId?: number; // Passado quando o admin visualiza a página de um aluno específico
  initialSubTab?: 'profile' | 'password' | 'graduacoes';
  hideSidebarMenu?: boolean;
}

export const StudentProfilePage: React.FC<StudentProfilePageProps> = ({ alunoId, initialSubTab, hideSidebarMenu }) => {
  const { loggedUser, updateLoggedUser } = useAuth();
  const { students, updateStudent, loadStudents } = useStudents();

  const isEditingAdmin = !alunoId && loggedUser?.role === 'admin';
  const isEditingTeacher = !alunoId && loggedUser?.role === 'teacher';
  const isStudent = loggedUser?.role === 'student';

  const contextStudent = students.find(s => s.id === alunoId);
  const [localStudent, setLocalStudent] = useState<Aluno | null>(null);

  const student = contextStudent || localStudent;

  const ibjjfCategory = React.useMemo(() => {
    if (!student || !student.peso) return null;
    try {
      return calculateIbjjfCategory({
        dataNascimento: student.dataNascimento,
        gender: student.genero || 'Masculino',
        modality: 'gi',
        weightKg: student.peso,
        beltColor: student.faixa || 'Branca'
      });
    } catch {
      return null;
    }
  }, [student]);

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'password' | 'graduacoes'>(initialSubTab || 'profile');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Efeito para carregar dados do aluno específico caso não esteja no contexto
  useEffect(() => {
    async function fetchStudentProfile() {
      if (alunoId && !contextStudent) {
        setLoading(true);
        try {
          const data = await studentService.getStudentById(alunoId);
          if (data) {
            setLocalStudent(data);
          }
        } catch (err) {
          console.error('Erro ao carregar perfil do aluno:', err);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchStudentProfile();
  }, [alunoId, contextStudent]);

  // Se o alunoId foi passado, quer dizer que estamos editando a ficha de OUTRO aluno
  // Exceto se o usuário logado for o próprio aluno visualizando sua própria ficha
  const isEditingOtherStudent = !!alunoId && loggedUser?.role !== 'student';

  // Monta os dados iniciais do formulário
  const getInitialFormData = () => {
    if (isEditingAdmin) {
      return { nome: loggedUser?.nome || 'Administrador', fotoPerfil: loggedUser?.foto_perfil };
    }
    if (isEditingTeacher) {
      return { 
        nome: loggedUser?.nome || 'Professor', 
        email: loggedUser?.email,
        telefone: loggedUser?.telefone,
        fotoPerfil: loggedUser?.foto_perfil,
        assinatura: loggedUser?.assinatura
      };
    }
    if (student) {
      return {
        nome: student.nome,
        cpf: student.cpf,
        dataNascimento: student.dataNascimento,
        telefone: student.telefone,
        email: student.email,
        genero: student.genero,
        bairro: student.bairro,
        dataMatricula: student.dataMatricula,
        faixa: student.faixa,
        graus: student.graus,
        turma: student.turma,
        contatoEmergenciaNome: student.contatoEmergenciaNome,
        contatoEmergenciaTel: student.contatoEmergenciaTel,
        fotoPerfil: student.fotoPerfil,
        peso: student.peso
      };
    }
    return { nome: '' };
  };

  const handleSaveInfo = async (formData: any) => {
    try {
      if (isEditingAdmin && loggedUser?.adminId) {
        await adminService.updateAdmin(loggedUser.adminId, formData);
        updateLoggedUser({ ...loggedUser, nome: formData.nome, foto_perfil: formData.foto_perfil });
        alert('Perfil administrador atualizado com sucesso!');
      } else if (isEditingTeacher && loggedUser?.professorId) {
        await teacherService.updateTeacher(loggedUser.professorId, formData);
        updateLoggedUser({ 
          ...loggedUser, 
          nome: formData.nome, 
          email: formData.email, 
          telefone: formData.telefone,
          foto_perfil: formData.foto_perfil,
          assinatura: formData.assinatura
        });
        alert('Perfil professor atualizado com sucesso!');
      } else if (student) {
        await updateStudent(student.id, formData);
        
        // Atualiza estado local se não estiver no contexto global
        if (!contextStudent) {
          setLocalStudent(prev => prev ? { ...prev, ...formData } : null);
        }

        // Se for o próprio aluno logado editando, atualiza a sessão
        if (isStudent && loggedUser?.alunoId === student.id) {
          updateLoggedUser({ 
            ...loggedUser, 
            nome: formData.nome,
            foto_perfil: formData.fotoPerfil
          });
        }
        alert('Perfil do aluno atualizado com sucesso!');
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar informações.');
    }
  };

  const handleSavePassword = async (currentPass: string, newPass: string) => {
    // Se o usuário logado é Administrador, ele tem permissão para alterar diretamente a senha sem necessitar da senha atual
    if (loggedUser?.role === 'admin') {
      if (student) {
        await studentService.updateStudent(student.id, { senha: newPass });
      } else if (isEditingAdmin && loggedUser?.adminId) {
        await adminService.updateAdmin(loggedUser.adminId, { senha: newPass });
      } else if (isEditingTeacher && loggedUser?.professorId) {
        await teacherService.updateTeacher(loggedUser.professorId, { senha: newPass });
      } else {
        throw new Error('Usuário não encontrado para redefinição de senha.');
      }
      return;
    }

    if (isEditingAdmin && loggedUser?.adminId) {
      await adminService.changePassword(loggedUser.adminId, currentPass, newPass);
    } else if (isEditingTeacher && loggedUser?.professorId) {
      await teacherService.changePassword(loggedUser.professorId, currentPass, newPass);
    } else if (student) {
      await studentService.changePassword(student.id, currentPass, newPass);
    } else {
      throw new Error('Usuário inválido para troca de senha.');
    }
  };

  // Handlers para o histórico de graduação do aluno
  const formatGradDateStr = (data: string): string => {
    if (!data) return new Date().toISOString().substring(0, 10);
    if (data.length === 7) return `${data}-01`;
    return data;
  };

  const syncStudentCurrentBelt = async (studentId: number) => {
    const updated = await studentService.getStudentById(studentId);
    if (updated) {
      setLocalStudent(updated);
      if (updated.historicoGraduacoes && updated.historicoGraduacoes.length > 0) {
        const sorted = [...updated.historicoGraduacoes].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
        const latest = sorted[0];
        await updateStudent(studentId, { faixa: latest.faixa, graus: latest.graus, dataUltimaGraduacao: latest.data });
      }
    }
    await loadStudents();
  };

  const handleAddGraduacao = async (faixa: Belt, graus: Degree, data: string) => {
    if (!student) return;
    const dateStr = formatGradDateStr(data);
    const avaliador = loggedUser?.nome || 'Avaliador';
    
    await studentService.addGraduation(student.id, {
      faixa,
      graus,
      data_graduacao: dateStr,
      avaliador
    });

    await syncStudentCurrentBelt(student.id);
    alert('Graduação registrada com sucesso!');
  };

  const handleUpdateGraduacao = async (gradId: number, faixa: Belt, graus: Degree, data: string) => {
    if (!student) return;
    const dateStr = formatGradDateStr(data);

    if (gradId < 0) {
      // Se for um registro sintético (-999), insere no banco como nova graduação
      const avaliador = loggedUser?.nome || 'Avaliador';
      await studentService.addGraduation(student.id, {
        faixa,
        graus,
        data_graduacao: dateStr,
        avaliador
      });
    } else {
      await studentService.updateGraduation(gradId, {
        faixa,
        graus,
        data_graduacao: dateStr
      });
    }

    await syncStudentCurrentBelt(student.id);
    alert('Graduação atualizada com sucesso!');
  };

  const handleDeleteGraduacao = async (gradId: number) => {
    if (!student) return;
    if (gradId < 0) return;

    await studentService.deleteGraduation(gradId);
    await syncStudentCurrentBelt(student.id);
    alert('Graduação removida com sucesso!');
  };

  const isProfileOfStudent = isStudent || isEditingOtherStudent || loggedUser?.role === 'admin';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Carregando perfil...</p>
      </div>
    );
  }

  // Dados para exibição do Header Banner
  const profileName = isEditingAdmin 
    ? (loggedUser?.nome || 'Administrador') 
    : isEditingTeacher 
      ? (loggedUser?.nome || 'Professor') 
      : (student?.nome || loggedUser?.nome || 'Usuário');

  const profileAvatar = isEditingAdmin 
    ? loggedUser?.foto_perfil 
    : isEditingTeacher 
      ? loggedUser?.foto_perfil 
      : student?.fotoPerfil;

  const profileRole = isEditingAdmin 
    ? 'Administrador' 
    : isEditingTeacher 
      ? 'Professor' 
      : 'Aluno';

  return (
    <div className="space-y-8 animate-fade-in pb-12 text-left">
      {/* Header Titular */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
            <User className="w-8 h-8 text-gold-500" />
            {hideSidebarMenu && activeSubTab === 'graduacoes' 
              ? 'Histórico de Graduações' 
              : isEditingOtherStudent 
                ? 'Ficha do Aluno' 
                : 'Meu Perfil'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {hideSidebarMenu && activeSubTab === 'graduacoes'
              ? 'Acompanhe todas as suas promoções de faixas e graus'
              : isEditingOtherStudent 
                ? `Gerenciando a ficha completa de ${student?.nome || ''}` 
                : 'Gerencie seus dados cadastrais, informações de treino e segurança'}
          </p>
        </div>
      </div>

      {/* Hero Banner de Perfil */}
      {student && !isEditingAdmin && !isEditingTeacher && (
        <div className="card-premium p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-gold-550/5 to-transparent blur-3xl rounded-full pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center gap-5 z-10 text-center sm:text-left w-full md:w-auto">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gold-550/30 bg-obsidian-950 flex items-center justify-center text-4xl shadow-inner shrink-0 relative group">
              {profileAvatar ? (
                profileAvatar.length <= 2 ? (
                  <span>{profileAvatar}</span>
                ) : (
                  <img src={profileAvatar} alt={profileName} className="w-full h-full object-cover" />
                )
              ) : (
                <span className="text-slate-500">🥋</span>
              )}
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-obsidian-950 rounded-full" />
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <h2 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-wide">
                  {profileName}
                </h2>
                <span className="text-[9.5px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                  {profileRole}
                </span>
                {student.status && (
                  <span className={`text-[9.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    student.status === 'Ativo' 
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                      : 'text-orange-400 bg-orange-500/10 border-orange-500/20'
                  }`}>
                    {student.status}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start text-xs text-slate-350 font-medium">
                {student.faixa && (
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-gold-500" />
                    <span className="font-bold text-slate-200">{student.faixa}</span>
                    <span className="text-zinc-500">({student.graus} {student.graus === 1 ? 'grau' : 'graus'})</span>
                  </div>
                )}
                {student.turma && (
                  <span className="text-zinc-500 font-semibold">• Turma: <strong className="text-slate-200">{student.turma}</strong></span>
                )}
                {student.bairro && (
                  <span className="text-zinc-500 font-semibold">• Bairro: <strong className="text-slate-200">{student.bairro}</strong></span>
                )}
              </div>
            </div>
          </div>

          {student && student.peso ? (
            <div className="flex flex-wrap items-center gap-4 z-10 w-full md:w-auto justify-center md:justify-end border-t md:border-t-0 md:border-l border-obsidian-800 pt-4 md:pt-0 md:pl-6">
              <div className="text-center md:text-right space-y-1">
                <span className="text-[9.5px] font-bold text-zinc-500 uppercase tracking-widest block">Peso Atual</span>
                <span className="text-xs font-black text-gold-450 block font-mono">
                  {student.peso} kg
                </span>
              </div>
              {ibjjfCategory && (
                <div className="text-center md:text-right space-y-1 border-l border-obsidian-800 pl-4">
                  <span className="text-[9.5px] font-bold text-zinc-500 uppercase tracking-widest block">Categoria Oficial</span>
                  <span className="text-xs font-black text-slate-100 block uppercase tracking-wide">
                    {ibjjfCategory.category} • {ibjjfCategory.weightClass.name}
                  </span>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Sub-Abas de Navegação */}
      {!hideSidebarMenu && (
        <div className="flex items-center gap-2 p-1.5 bg-obsidian-900 border border-obsidian-850 rounded-2xl overflow-x-auto no-scrollbar shadow-inner">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`flex items-center gap-2.5 px-5 py-3 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap rounded-xl ${
              activeSubTab === 'profile'
                ? 'bg-gold-550/15 text-gold-400 border border-gold-550/30 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-850 border border-transparent'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Dados Cadastrais</span>
          </button>

          {isProfileOfStudent && (
            <button
              onClick={() => setActiveSubTab('graduacoes')}
              className={`flex items-center gap-2.5 px-5 py-3 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap rounded-xl ${
                activeSubTab === 'graduacoes'
                  ? 'bg-gold-550/15 text-gold-400 border border-gold-550/30 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-850 border border-transparent'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Histórico de Graduações</span>
            </button>
          )}

          <button
            onClick={() => setActiveSubTab('password')}
            className={`flex items-center gap-2.5 px-5 py-3 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap rounded-xl ${
              activeSubTab === 'password'
                ? 'bg-gold-550/15 text-gold-400 border border-gold-550/30 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-850 border border-transparent'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Segurança / Senha</span>
          </button>
        </div>
      )}

      {/* Conteúdo Central */}
      <div className="bg-obsidian-900 border border-obsidian-850 p-6 md:p-8 rounded-2xl shadow-xl">
        {activeSubTab === 'profile' && (
          <PersonalInfoForm
            initialData={getInitialFormData()}
            role={loggedUser?.role || 'student'}
            isEditingOtherStudent={isEditingOtherStudent}
            onSave={handleSaveInfo}
          />
        )}

        {activeSubTab === 'password' && (
          <ChangePasswordForm 
            onSavePassword={handleSavePassword}
            isAdminOverride={loggedUser?.role === 'admin'}
          />
        )}

        {activeSubTab === 'graduacoes' && student && (
          <GraduationHistoryTable
            student={student}
            canEdit={isProfileOfStudent}
            onAddGraduacao={handleAddGraduacao}
            onUpdateGraduacao={handleUpdateGraduacao}
            onDeleteGraduacao={handleDeleteGraduacao}
          />
        )}
      </div>
    </div>
  );
};
export default StudentProfilePage;
