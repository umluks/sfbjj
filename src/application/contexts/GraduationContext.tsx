import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Aluno, Belt, Degree } from '@/domain/models/student';
import type { GraduationEligibility, GraduationHistoryEvent, GraduationDashboardMetrics } from '@/domain/models/graduation';
import { useStudents } from '@/application/contexts/StudentsContext';
import { useAuth } from '@/application/hooks/useAuth';
import { getStudentEligibilityUseCase } from '@/application/useCases/GetStudentEligibilityUseCase';
import { promoteStudentUseCase } from '@/application/useCases/PromoteStudentUseCase';
import { getGraduationHistoryUseCase } from '@/application/useCases/GetGraduationHistoryUseCase';
import { getGraduationDashboardUseCase } from '@/application/useCases/GetGraduationDashboardUseCase';
import { graduationRepository } from '@/infrastructure/repositories/graduationRepository';

interface GraduationContextType {
  getEligibilityForStudent: (student: Aluno) => GraduationEligibility;
  getHistoryForStudent: (alunoId: number) => Promise<GraduationHistoryEvent[]>;
  promoteStudent: (
    student: Aluno,
    novaFaixa: Belt,
    novoGrau: Degree,
    dataGraduacao: string,
    professorId?: number | null,
    professorNome?: string,
    observacoes?: string,
    bypassValidation?: boolean
  ) => Promise<GraduationHistoryEvent>;
  updateGraduationEvent: (eventId: number, data: Partial<GraduationHistoryEvent>) => Promise<void>;
  softDeleteGraduationEvent: (eventId: number) => Promise<void>;
  dashboardMetrics: GraduationDashboardMetrics;
  loading: boolean;
}

const GraduationContext = createContext<GraduationContextType | undefined>(undefined);

export const GraduationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { students, loadStudents } = useStudents();
  const { loggedUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const getEligibilityForStudent = useCallback((student: Aluno): GraduationEligibility => {
    return getStudentEligibilityUseCase.execute(student, []);
  }, []);

  const getHistoryForStudent = useCallback(async (alunoId: number): Promise<GraduationHistoryEvent[]> => {
    return getGraduationHistoryUseCase.execute(alunoId);
  }, []);

  const promoteStudent = useCallback(async (
    student: Aluno,
    novaFaixa: Belt,
    novoGrau: Degree,
    dataGraduacao: string,
    professorId?: number | null,
    professorNome?: string,
    observacoes?: string,
    bypassValidation?: boolean
  ): Promise<GraduationHistoryEvent> => {
    setLoading(true);
    try {
      const avaliador = professorNome || loggedUser?.nome || 'Professor Master';
      const usuarioLancamento = loggedUser?.nome || 'Sistema';

      const event = await promoteStudentUseCase.execute({
        student,
        novaFaixa,
        novoGrau,
        dataGraduacao,
        professorId,
        professorNome: avaliador,
        observacoes,
        usuarioLancamento,
        bypassValidation
      });

      await loadStudents();
      return event;
    } finally {
      setLoading(false);
    }
  }, [loggedUser, loadStudents]);

  const updateGraduationEvent = useCallback(async (eventId: number, data: Partial<GraduationHistoryEvent>): Promise<void> => {
    setLoading(true);
    try {
      const usuario = loggedUser?.nome || 'Sistema';
      await graduationRepository.updateGraduationEvent(eventId, data, usuario);
      await loadStudents();
    } finally {
      setLoading(false);
    }
  }, [loggedUser, loadStudents]);

  const softDeleteGraduationEvent = useCallback(async (eventId: number): Promise<void> => {
    setLoading(true);
    try {
      const usuario = loggedUser?.nome || 'Sistema';
      await graduationRepository.softDeleteGraduationEvent(eventId, usuario);
      await loadStudents();
    } finally {
      setLoading(false);
    }
  }, [loggedUser, loadStudents]);

  const dashboardMetrics = useMemo(() => {
    return getGraduationDashboardUseCase.execute(students, []);
  }, [students]);

  return (
    <GraduationContext.Provider
      value={{
        getEligibilityForStudent,
        getHistoryForStudent,
        promoteStudent,
        updateGraduationEvent,
        softDeleteGraduationEvent,
        dashboardMetrics,
        loading
      }}
    >
      {children}
    </GraduationContext.Provider>
  );
};

export const useGraduation = () => {
  const context = useContext(GraduationContext);
  if (!context) {
    throw new Error('useGraduation deve ser usado dentro de um GraduationProvider');
  }
  return context;
};
