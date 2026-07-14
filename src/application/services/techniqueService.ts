import { TechniqueRepository } from '@/infrastructure/repositories/techniqueRepository';
import type { Technique } from '@/domain/models/technique';

export class TechniqueService {
  private techniqueRepo = new TechniqueRepository();

  async getTechniques(): Promise<Technique[]> {
    return this.techniqueRepo.getTechniques();
  }

  async createTechnique(technique: Omit<Technique, 'id' | 'created_at'>): Promise<Technique> {
    return this.techniqueRepo.createTechnique(technique);
  }

  async updateTechnique(id: number, technique: Partial<Technique>): Promise<void> {
    return this.techniqueRepo.updateTechnique(id, technique);
  }

  async deleteTechnique(id: number): Promise<void> {
    return this.techniqueRepo.deleteTechnique(id);
  }
}

export const techniqueService = new TechniqueService();
export default techniqueService;
