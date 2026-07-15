import type { DiplomaConfig } from '@/domain/models/diplomaConfig';

export interface IDiplomaConfigRepository {
  getConfig(): Promise<DiplomaConfig>;
  updateConfig(config: Partial<DiplomaConfig>): Promise<void>;
}
