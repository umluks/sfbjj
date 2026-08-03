import type { GraduationHistoryEvent } from '@/domain/models/graduation';
import { graduationRepository } from '@/infrastructure/repositories/graduationRepository';
import { getDurationFriendly, parseSafeDate } from '@/utils/formatters';

export class GetGraduationHistoryUseCase {
  public async execute(alunoId: number): Promise<GraduationHistoryEvent[]> {
    const history = await graduationRepository.getGraduationHistory(alunoId);
    
    // Ordena do mais recente para o mais antigo (ordem decrescente)
    const sorted = [...history].sort((a, b) => {
      const timeA = parseSafeDate(a.dataGraduacao).getTime();
      const timeB = parseSafeDate(b.dataGraduacao).getTime();
      return timeB - timeA;
    });

    // Calcula tempo na faixa e métricas agregadas da timeline
    const todayStr = new Date().toISOString().substring(0, 10);
    return sorted.map((event, index) => {
      const dateAnterior = index === 0 ? todayStr : sorted[index - 1].dataGraduacao;
      const tempoNaFaixaFriendly = getDurationFriendly(event.dataGraduacao, dateAnterior);
      
      const dateGrad = parseSafeDate(event.dataGraduacao);
      const dateAnt = parseSafeDate(dateAnterior);
      const diffMonths = Math.max(0, Math.floor((dateAnt.getTime() - dateGrad.getTime()) / (1000 * 60 * 60 * 24 * 30.4375)));

      return {
        ...event,
        tempoNaFaixaMeses: diffMonths,
        tempoDesdeUltimaGraduacaoFriendly: tempoNaFaixaFriendly,
        grausAcumulados: event.graus
      };
    });
  }
}

export const getGraduationHistoryUseCase = new GetGraduationHistoryUseCase();
