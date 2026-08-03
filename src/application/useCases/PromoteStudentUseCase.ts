import type { Aluno, Belt, Degree } from '@/domain/models/student';
import type { GraduationHistoryEvent } from '@/domain/models/graduation';
import { GraduationRulesEngine } from '@/domain/services/GraduationRulesEngine';
import { studentService } from '@/application/services/studentService';
import { graduationRepository } from '@/infrastructure/repositories/graduationRepository';
import { auditRepository } from '@/infrastructure/repositories/auditRepository';
import { getHighestGraduacao } from '@/constants';

export interface PromoteStudentInput {
  student: Aluno;
  novaFaixa: Belt;
  novoGrau: Degree;
  dataGraduacao: string;
  professorId?: number | null;
  professorNome: string;
  observacoes?: string;
  usuarioLancamento: string;
  bypassValidation?: boolean;
}

export class PromoteStudentUseCase {
  public async execute(input: PromoteStudentInput): Promise<GraduationHistoryEvent> {
    const { student, novaFaixa, novoGrau, dataGraduacao, professorId, professorNome, observacoes, usuarioLancamento, bypassValidation } = input;

    // 1. Validação de Regras e Linha do Tempo
    if (!bypassValidation) {
      const existingHistory = await graduationRepository.getGraduationHistory(student.id);

      const validationResult = GraduationRulesEngine.validateGraduationTimeline(
        student.dataNascimento,
        { faixa: novaFaixa, graus: novoGrau, dataGraduacao },
        existingHistory,
        null
      );

      if (!validationResult.isValid) {
        throw new Error(validationResult.error || 'Promoção de graduação inválida para a linha do tempo.');
      }
    }

    // 2. Registrar evento na tabela de histórico de graduação
    const event = await graduationRepository.addGraduationEvent(student.id, {
      faixa: novaFaixa,
      graus: novoGrau,
      dataGraduacao,
      professorId,
      professorNome,
      observacoes,
      usuarioLancamento
    });

    // 3. Atualizar a ficha do aluno com a maior e mais recente faixa derivada do histórico completo
    const allHistory = await graduationRepository.getGraduationHistory(student.id);
    const highest = getHighestGraduacao(allHistory);

    const faixaAtualizada = highest ? (highest.faixa as Belt) : novaFaixa;
    const grauAtualizado = highest ? (highest.graus as Degree) : novoGrau;
    const dataAtualizada = highest ? highest.dataGraduacao : dataGraduacao;

    const valoresAnteriores = {
      faixa: student.faixa,
      graus: student.graus,
      dataUltimaGraduacao: student.dataUltimaGraduacao
    };

    const novosValores = {
      faixa: faixaAtualizada,
      graus: grauAtualizado,
      dataUltimaGraduacao: dataAtualizada
    };

    await studentService.updateStudent(student.id, novosValores);

    // 4. Log de auditoria imutável
    await auditRepository.log({
      entidade: 'alunos_graduacao',
      entidadeId: student.id,
      acao: 'PROMOTE',
      usuario: usuarioLancamento,
      valoresAnteriores,
      valoresNovos: { ...novosValores, professorNome, observacoes, eventId: event.id }
    });

    return event;
  }
}

export const promoteStudentUseCase = new PromoteStudentUseCase();
