import type { AuditLogRecord } from '@/domain/models/graduation';

export interface IAuditRepository {
  log(record: AuditLogRecord): Promise<void>;
  getLogsByEntity(entidade: string, entidadeId: number): Promise<AuditLogRecord[]>;
}
