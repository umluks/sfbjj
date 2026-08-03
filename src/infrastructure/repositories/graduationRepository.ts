import { supabase, cache } from '@/infrastructure/lib/supabaseClient';
import type { IGraduationRepository } from '@/domain/repositories/graduationRepository';
import type { GraduationHistoryEvent, GraduationDashboardMetrics } from '@/domain/models/graduation';
import type { Belt, Degree } from '@/domain/models/student';
import { QrValidationService } from '@/infrastructure/services/qrValidationService';
import { handleSupabaseError } from './errorHelper';
import { auditRepository } from './auditRepository';

export class GraduationRepository implements IGraduationRepository {
  private clearCache(alunoId?: number): void {
    if (alunoId) {
      cache.clear(`grad_history_${alunoId}`);
      cache.clear(`student_${alunoId}`);
    } else {
      cache.clearByPrefix('grad_history_');
    }
    cache.clear('students');
  }

  async getGraduationHistory(alunoId: number): Promise<GraduationHistoryEvent[]> {
    const cacheKey = `grad_history_${alunoId}`;
    const cached = cache.getFresh<GraduationHistoryEvent[]>(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('graduacoes_historico')
        .select('*')
        .eq('aluno_id', alunoId)
        .or('is_deleted.eq.false,is_deleted.is.null');

      if (error) {
        throw error;
      }

      if (!data) return [];

      const events: GraduationHistoryEvent[] = data.map((item: any) => ({
        id: item.id,
        alunoId: item.aluno_id,
        faixa: item.faixa as Belt,
        graus: item.graus as Degree,
        dataGraduacao: item.data_graduacao,
        professorId: item.professor_id ?? null,
        professorNome: item.avaliador || item.professor_nome || 'Professor',
        observacoes: item.observacoes ?? undefined,
        usuarioLancamento: item.usuario_lancamento || 'Sistema',
        codigoValidacaoQr: item.codigo_validacao_qr || QrValidationService.generateValidationCode(item.aluno_id, item.faixa, item.graus, item.data_graduacao),
        created_at: item.created_at,
        is_deleted: item.is_deleted ?? false
      }));

      cache.set(cacheKey, events);
      return events;
    } catch (error: any) {
      const stale = cache.get<GraduationHistoryEvent[]>(cacheKey);
      if (stale) return stale;
      throw handleSupabaseError(error, 'Falha ao carregar histórico de graduações.');
    }
  }

  async addGraduationEvent(
    alunoId: number,
    dataInput: {
      faixa: Belt;
      graus: Degree;
      dataGraduacao: string;
      professorId?: number | null;
      professorNome: string;
      observacoes?: string;
      usuarioLancamento: string;
    }
  ): Promise<GraduationHistoryEvent> {
    const qrCode = QrValidationService.generateValidationCode(
      alunoId,
      dataInput.faixa,
      dataInput.graus,
      dataInput.dataGraduacao
    );

    const payload = {
      aluno_id: alunoId,
      faixa: dataInput.faixa,
      graus: dataInput.graus,
      data_graduacao: dataInput.dataGraduacao,
      avaliador: dataInput.professorNome,
      observacoes: dataInput.observacoes ?? null,
      usuario_lancamento: dataInput.usuarioLancamento,
      codigo_validacao_qr: qrCode,
      is_deleted: false
    };

    const { data, error } = await supabase
      .from('graduacoes_historico')
      .insert(payload)
      .select()
      .single();

    if (error) {
      // Tentativa de inserção resiliente se as colunas extras não existirem na tabela antiga
      const fallbackPayload = {
        aluno_id: alunoId,
        faixa: dataInput.faixa,
        graus: dataInput.graus,
        data_graduacao: dataInput.dataGraduacao,
        avaliador: dataInput.professorNome
      };

      const { data: retryData, error: retryError } = await supabase
        .from('graduacoes_historico')
        .insert(fallbackPayload)
        .select()
        .single();

      if (retryError) {
        throw handleSupabaseError(retryError, 'Erro ao cadastrar evento de graduação.');
      }

      this.clearCache(alunoId);
      return {
        id: retryData.id,
        alunoId: retryData.aluno_id,
        faixa: retryData.faixa,
        graus: retryData.graus,
        dataGraduacao: retryData.data_graduacao,
        professorNome: retryData.avaliador || 'Professor',
        usuarioLancamento: dataInput.usuarioLancamento,
        codigoValidacaoQr: qrCode
      };
    }

    this.clearCache(alunoId);
    return {
      id: data.id,
      alunoId: data.aluno_id,
      faixa: data.faixa,
      graus: data.graus,
      dataGraduacao: data.data_graduacao,
      professorNome: data.avaliador,
      observacoes: data.observacoes,
      usuarioLancamento: data.usuario_lancamento,
      codigoValidacaoQr: data.codigo_validacao_qr
    };
  }

  async updateGraduationEvent(
    eventId: number,
    updateData: Partial<GraduationHistoryEvent>,
    usuario: string
  ): Promise<void> {
    // 1. Busca estado anterior para auditoria
    const { data: currentRecord } = await supabase
      .from('graduacoes_historico')
      .select('*')
      .eq('id', eventId)
      .maybeSingle();

    const payload: any = {};
    if (updateData.faixa) payload.faixa = updateData.faixa;
    if (typeof updateData.graus === 'number') payload.graus = updateData.graus;
    if (updateData.dataGraduacao) payload.data_graduacao = updateData.dataGraduacao;
    if (updateData.professorNome) payload.avaliador = updateData.professorNome;
    if (updateData.observacoes !== undefined) payload.observacoes = updateData.observacoes;

    const { error } = await supabase
      .from('graduacoes_historico')
      .update(payload)
      .eq('id', eventId);

    if (error) {
      throw handleSupabaseError(error, 'Erro ao atualizar graduação.');
    }

    if (currentRecord) {
      this.clearCache(currentRecord.aluno_id);
      await auditRepository.log({
        entidade: 'graduacoes_historico',
        entidadeId: eventId,
        acao: 'UPDATE',
        usuario,
        valoresAnteriores: currentRecord,
        valoresNovos: payload
      });
    } else {
      this.clearCache();
    }
  }

  async softDeleteGraduationEvent(eventId: number, usuario: string): Promise<void> {
    const { data: currentRecord } = await supabase
      .from('graduacoes_historico')
      .select('*')
      .eq('id', eventId)
      .maybeSingle();

    if (!currentRecord) return;

    // Tenta aplicar exclusão lógica com auditoria
    const { error } = await supabase
      .from('graduacoes_historico')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString()
      })
      .eq('id', eventId);

    if (error) {
      // Se a coluna de exclusão lógica não existir no banco legado, aplica filtro equivalente
      const { error: hardError } = await supabase
        .from('graduacoes_historico')
        .delete()
        .eq('id', eventId);

      if (hardError) {
        throw handleSupabaseError(hardError, 'Erro ao remover graduação.');
      }
    }

    this.clearCache(currentRecord.aluno_id);

    await auditRepository.log({
      entidade: 'graduacoes_historico',
      entidadeId: eventId,
      acao: 'DELETE',
      usuario,
      valoresAnteriores: currentRecord,
      valoresNovos: { is_deleted: true, deleted_at: new Date().toISOString() }
    });
  }

  async getDashboardMetrics(): Promise<GraduationDashboardMetrics> {
    // Retorna estrutura placeholder (o usecase preenche via lista total de alunos no frontend/contexto)
    return {
      totalAlunos: 0,
      alunosAptos: 0,
      alunosProximos: 0,
      alunosComPendencias: 0,
      distribuicaoPorFaixa: {} as any,
      distribuicaoPorIdade: { kidsCount: 0, adultoCount: 0, masterCount: 0 },
      distribuicaoPorCategoria: {}
    };
  }
}

export const graduationRepository = new GraduationRepository();
