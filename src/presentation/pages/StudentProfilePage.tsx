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
import { User, Lock, Award } from 'lucide-react';

interface StudentProfilePageProps {
  alunoId?: number; // Passado quando o admin visualiza a página de um aluno específico
}

export const StudentProfilePage: React.FC<StudentProfilePageProps> = ({ alunoId }) => {
  const { loggedUser, updateLoggedUser } = useAuth();
  const { students, updateStudent, loadStudents } = useStudents();

  const isEditingAdmin = !alunoId && loggedUser?.role === 'admin';
  const isEditingTeacher = !alunoId && loggedUser?.role === 'teacher';
  const isStudent = loggedUser?.role === 'student';

  const contextStudent = students.find(s => s.id === alunoId);
  const [localStudent, setLocalStudent] = useState<Aluno | null>(null);

  const student = contextStudent || localStudent;

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'password' | 'graduacoes'>('profile');
  const [loading, setLoading] = useState(false);

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
  const isEditingOtherStudent = !!alunoId;

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
        fotoPerfil: loggedUser?.foto_perfil
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
        fotoPerfil: student.fotoPerfil
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
          foto_perfil: formData.foto_perfil 
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
  const handleAddGraduacao = async (faixa: Belt, graus: Degree, data: string) => {
    if (!student) return;
    const dateStr = `${data}-01`;
    const avaliador = loggedUser?.nome || 'Avaliador';
    
    await studentService.addGraduation(student.id, {
      faixa,
      graus,
      data_graduacao: dateStr,
      avaliador
    });

    // Recarrega informações do aluno para atualizar a UI
    if (alunoId) {
      const updated = await studentService.getStudentById(student.id);
      if (updated) setLocalStudent(updated);
      await loadStudents();
    } else if (isStudent) {
      const updated = await studentService.getStudentById(student.id);
      if (updated) setLocalStudent(updated);
    }
    alert('Graduação registrada com sucesso!');
  };

  const handleUpdateGraduacao = async (gradId: number, faixa: Belt, graus: Degree, data: string) => {
    if (!student) return;
    const dateStr = `${data}-01`;
    
    await studentService.updateGraduation(gradId, {
      faixa,
      graus,
      data_graduacao: dateStr
    });

    if (alunoId) {
      const updated = await studentService.getStudentById(student.id);
      if (updated) setLocalStudent(updated);
      await loadStudents();
    } else if (isStudent) {
      const updated = await studentService.getStudentById(student.id);
      if (updated) setLocalStudent(updated);
    }
    alert('Graduação atualizada com sucesso!');
  };

  const handleDeleteGraduacao = async (gradId: number) => {
    if (!student) return;
    await studentService.deleteGraduation(gradId);

    if (alunoId) {
      const updated = await studentService.getStudentById(student.id);
      if (updated) setLocalStudent(updated);
      await loadStudents();
    } else if (isStudent) {
      const updated = await studentService.getStudentById(student.id);
      if (updated) setLocalStudent(updated);
    }
    alert('Graduação removida com sucesso!');
  };

  const isProfileOfStudent = isStudent || isEditingOtherStudent;

  if (loading) {
    return <div className="text-center py-12 text-slate-500 font-bold uppercase tracking-wider text-xs">Carregando perfil...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3 justify-start">
          {isEditingOtherStudent ? 'Ficha do Aluno' : 'Meu Perfil'}
        </h1>
        <p className="text-slate-455 text-sm mt-1 uppercase tracking-wider font-bold">
          {isEditingOtherStudent ? `Visualizando Perfil de ${student?.nome || ''}` : 'Gerencie seus dados e senha de acesso'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Menu Lateral de Sub-abas */}
        <div className="lg:col-span-3 bg-obsidian-900 border border-obsidian-850 p-4 space-y-1 rounded-2xl shadow-lg">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'profile'
                ? 'bg-slate-100 text-obsidian-950 shadow-md shadow-black/10'
                : 'text-slate-400 hover:bg-obsidian-800 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            Dados Pessoais
          </button>

          {isProfileOfStudent && student && (
            <button
              onClick={() => setActiveSubTab('graduacoes')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'graduacoes'
                  ? 'bg-slate-100 text-obsidian-950 shadow-md shadow-black/10'
                  : 'text-slate-400 hover:bg-obsidian-800 hover:text-slate-200'
              }`}
            >
              <Award className="w-4 h-4 shrink-0" />
              Histórico de Graduações
            </button>
          )}

          {!isEditingOtherStudent && (
            <button
              onClick={() => setActiveSubTab('password')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'password'
                  ? 'bg-slate-100 text-obsidian-950 shadow-md shadow-black/10'
                  : 'text-slate-400 hover:bg-obsidian-800 hover:text-slate-200'
              }`}
            >
              <Lock className="w-4 h-4 shrink-0" />
              Alterar Senha
            </button>
          )}
        </div>

        {/* Workspace Central */}
        <div className="lg:col-span-9 bg-obsidian-900 border border-obsidian-850 p-6 md:p-8 rounded-2xl shadow-lg">
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
            />
          )}

          {activeSubTab === 'graduacoes' && student && (
            <GraduationHistoryTable
              student={student}
              canEdit={isStudent} // No original, apenas o próprio aluno logado na sua conta gerenciava seu histórico diretamente da tela de perfil (ou o admin edita na ficha dele)
              onAddGraduacao={handleAddGraduacao}
              onUpdateGraduacao={handleUpdateGraduacao}
              onDeleteGraduacao={handleDeleteGraduacao}
            />
          )}
        </div>
      </div>
    </div>
  );
};
export default StudentProfilePage;
