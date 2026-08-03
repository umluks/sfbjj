import { supabase } from '@/infrastructure/lib/supabaseClient';
import type { IAuditRepository } from '@/domain/repositories/auditRepository';
import type { AuditLogRecord } from '@/domain/models/graduation';

export class AuditRepository implements IAuditRepository {
  async log(record: AuditLogRecord): Promise<void> {
    try {
      const payload = {
        entidade: record.entidade,
        entidade_id: record.entidadeId,
        acao: record.acao,
        usuario: record.usuario || 'Sistema',
        ip: record.ip || null,
        valores_anteriores: record.valoresAnteriores || null,
        valores_novos: record.valoresNovos || null
      };

      const { error } = await supabase
        .from('audit_logs')
        .insert(payload);

      if (error) {
        console.warn('Alerta auditoria (não-bloqueante):', error.message);
      }
    } catch (err) {
      console.warn('Erro silencioso ao gravar log de auditoria:', err);
    }
  }

  async getLogsByEntity(entidade: string, entidadeId: number): Promise<AuditLogRecord[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('entidade', entidade)
        .eq('entidade_id', entidadeId)
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map((item: any) => ({
        id: item.id,
        entidade: item.entidade,
        entidadeId: item.entidade_id,
        acao: item.acao,
        usuario: item.usuario,
        ip: item.ip,
        valoresAnteriores: item.valores_anteriores,
        valoresNovos: item.valores_novos,
        created_at: item.created_at
      }));
    } catch {
      return [];
    }
  }
}

export const auditRepository = new AuditRepository();
