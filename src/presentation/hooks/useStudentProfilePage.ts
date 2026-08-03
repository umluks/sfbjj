import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/application/hooks/useAuth';
import { useStudents } from '@/application/contexts/StudentsContext';
import { studentService } from '@/application/services/studentService';
import { teacherService } from '@/application/services/teacherService';
import { adminService } from '@/application/services/adminService';
import type { Aluno, Belt, Degree } from '@/domain/models/student';
import type { GraduationHistoryEvent } from '@/domain/models/graduation';
import { GraduationEligibilityEngine } from '@/domain/services/GraduationEligibilityEngine';
import { GraduationRulesEngine } from '@/domain/services/GraduationRulesEngine';
import { getGraduationHistoryUseCase } from '@/application/useCases/GetGraduationHistoryUseCase';
import { promoteStudentUseCase } from '@/application/useCases/PromoteStudentUseCase';
import { graduationRepository } from '@/infrastructure/repositories/graduationRepository';
import { calculateIbjjfCategory } from '@/utils/ibjjfCalculator';
import { getHighestGraduacao } from '@/constants';

interface UseStudentProfilePageParams {
  alunoId?: number;
  initialSubTab?: 'profile' | 'password' | 'graduacoes';
}

export function useStudentProfilePage({ alunoId, initialSubTab }: UseStudentProfilePageParams) {
  const { loggedUser, updateLoggedUser } = useAuth();
  const { students, updateStudent, loadStudents } = useStudents();

  const isEditingAdmin = !alunoId && loggedUser?.role === 'admin';
  const isEditingTeacher = !alunoId && loggedUser?.role === 'teacher';
  const isStudent = loggedUser?.role === 'student';

  const contextStudent = students.find(s => s.id === alunoId);
  const [localStudent, setLocalStudent] = useState<Aluno | null>(null);
  const [loading, setLoading] = useState(false);
  const [historyEvents, setHistoryEvents] = useState<GraduationHistoryEvent[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'password' | 'graduacoes'>(initialSubTab || 'profile');

  const student = contextStudent || localStudent;
  const isEditingOtherStudent = !!alunoId && loggedUser?.role !== 'student';
  const isProfileOfStudent = isStudent || isEditingOtherStudent || loggedUser?.role === 'admin';

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Carrega histórico estruturado de graduações
  useEffect(() => {
    async function loadHistory() {
      if (student?.id) {
        try {
          const events = await getGraduationHistoryUseCase.execute(student.id);
          setHistoryEvents(events);
        } catch (err) {
          console.error('Erro ao carregar histórico de graduação:', err);
        }
      }
    }
    loadHistory();
  }, [student?.id, student?.faixa, student?.graus]);

  // Carrega aluno caso não esteja no contexto
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

  // Obtém a faixa, graus e última graduação a partir do registro mais recente do histórico
  const effectiveStudent = useMemo(() => {
    if (!student) return null;
    if (historyEvents && historyEvents.length > 0) {
      const topGrad = historyEvents[0];
      return {
        ...student,
        faixa: topGrad.faixa,
        graus: topGrad.graus,
        dataUltimaGraduacao: topGrad.dataGraduacao
      };
    }
    return student;
  }, [student, historyEvents]);

  // Categoria IBJJF
  const ibjjfCategory = useMemo(() => {
    if (!effectiveStudent || !effectiveStudent.peso) return null;
    try {
      return calculateIbjjfCategory({
        dataNascimento: effectiveStudent.dataNascimento,
        gender: effectiveStudent.genero || 'Masculino',
        modality: 'gi',
        weightKg: effectiveStudent.peso,
        beltColor: effectiveStudent.faixa || 'Branca'
      });
    } catch {
      return null;
    }
  }, [effectiveStudent]);

  // Elegibilidade calculada pelo motor de domínio
  const eligibility = useMemo(() => {
    if (!effectiveStudent) return null;
    return GraduationEligibilityEngine.calculateEligibility(effectiveStudent, []);
  }, [effectiveStudent]);

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

  const lastTeacherName = historyEvents.length > 0 ? historyEvents[0].professorNome : 'Professor Master';

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
        cep: student.cep,
        logradouro: student.logradouro,
        numero: student.numero,
        complemento: student.complemento,
        cidade: student.cidade,
        uf: student.uf,
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
        if (!contextStudent) {
          setLocalStudent(prev => prev ? { ...prev, ...formData } : null);
        }
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

  const refreshHistory = async (studentId: number) => {
    const updatedEvents = await getGraduationHistoryUseCase.execute(studentId);
    setHistoryEvents(updatedEvents);

    const updated = await studentService.getStudentById(studentId);
    if (updated) {
      setLocalStudent(updated);
      if (updated.historicoGraduacoes && updated.historicoGraduacoes.length > 0) {
        const highest = getHighestGraduacao(updated.historicoGraduacoes);
        if (highest && highest.faixa) {
          await updateStudent(studentId, {
            faixa: highest.faixa as Belt,
            graus: highest.graus ?? 0,
            dataUltimaGraduacao: highest.data
          });
        }
      }
    }
    await loadStudents();
  };

  const handleAddGraduacao = async (faixa: Belt, graus: Degree, data: string, observacoes?: string) => {
    if (!student) return;

    const timelineCheck = GraduationRulesEngine.validateGraduationTimeline(
      student.dataNascimento,
      { faixa, graus, dataGraduacao: data },
      historyEvents,
      null
    );

    if (!timelineCheck.isValid) {
      throw new Error(timelineCheck.error || 'Graduação inconsistente com a linha do tempo.');
    }

    const avaliador = loggedUser?.nome || 'Professor';

    await promoteStudentUseCase.execute({
      student,
      novaFaixa: faixa,
      novoGrau: graus,
      dataGraduacao: data,
      professorNome: avaliador,
      observacoes,
      usuarioLancamento: loggedUser?.nome || 'Sistema',
      bypassValidation: true
    });

    await refreshHistory(student.id);
    alert('Graduação registrada com sucesso!');
  };

  const handleUpdateGraduacao = async (gradId: number, faixa: Belt, graus: Degree, data: string, observacoes?: string) => {
    if (!student) return;

    const timelineCheck = GraduationRulesEngine.validateGraduationTimeline(
      student.dataNascimento,
      { faixa, graus, dataGraduacao: data },
      historyEvents,
      gradId
    );

    if (!timelineCheck.isValid) {
      throw new Error(timelineCheck.error || 'Graduação inconsistente com a linha do tempo.');
    }

    const usuario = loggedUser?.nome || 'Sistema';

    if (gradId < 0) {
      await promoteStudentUseCase.execute({
        student,
        novaFaixa: faixa,
        novoGrau: graus,
        dataGraduacao: data,
        professorNome: usuario,
        observacoes,
        usuarioLancamento: usuario,
        bypassValidation: true
      });
    } else {
      await graduationRepository.updateGraduationEvent(gradId, {
        faixa,
        graus,
        dataGraduacao: data,
        observacoes
      }, usuario);
    }

    await refreshHistory(student.id);
    alert('Graduação atualizada com sucesso!');
  };

  const handleDeleteGraduacao = async (gradId: number) => {
    if (!student) return;
    if (gradId < 0) return;

    const usuario = loggedUser?.nome || 'Sistema';
    await graduationRepository.softDeleteGraduationEvent(gradId, usuario);
    await refreshHistory(student.id);
    alert('Graduação removida com sucesso!');
  };

  return {
    student,
    effectiveStudent,
    historyEvents,
    loading,
    loggedUser,
    activeSubTab,
    setActiveSubTab,
    isEditingAdmin,
    isEditingTeacher,
    isEditingOtherStudent,
    isProfileOfStudent,
    profileName,
    profileAvatar,
    profileRole,
    ibjjfCategory,
    eligibility,
    lastTeacherName,
    getInitialFormData,
    handleSaveInfo,
    handleSavePassword,
    handleAddGraduacao,
    handleUpdateGraduacao,
    handleDeleteGraduacao
  };
}
