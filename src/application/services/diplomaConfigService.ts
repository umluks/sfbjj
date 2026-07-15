import { DiplomaConfigRepository } from '@/infrastructure/repositories/diplomaConfigRepository';
import type { DiplomaConfig } from '@/domain/models/diplomaConfig';

export class DiplomaConfigService {
  private configRepo = new DiplomaConfigRepository();

  async getConfig(): Promise<DiplomaConfig> {
    return this.configRepo.getConfig();
  }

  async updateConfig(config: Partial<DiplomaConfig>): Promise<void> {
    return this.configRepo.updateConfig(config);
  }
}

export const diplomaConfigService = new DiplomaConfigService();
export default diplomaConfigService;
