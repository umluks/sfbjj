import type { GraduationHistoryEvent, GraduationDashboardMetrics } from '@/domain/models/graduation';
import type { Belt, Degree } from '@/domain/models/student';

export interface IGraduationRepository {
  getGraduationHistory(alunoId: number): Promise<GraduationHistoryEvent[]>;
  addGraduationEvent(
    alunoId: number,
    data: {
      faixa: Belt;
      graus: Degree;
      dataGraduacao: string;
      professorId?: number | null;
      professorNome: string;
      observacoes?: string;
      usuarioLancamento: string;
    }
  ): Promise<GraduationHistoryEvent>;
  updateGraduationEvent(
    eventId: number,
    data: Partial<GraduationHistoryEvent>,
    usuario: string
  ): Promise<void>;
  softDeleteGraduationEvent(eventId: number, usuario: string): Promise<void>;
  getDashboardMetrics(): Promise<GraduationDashboardMetrics>;
}
