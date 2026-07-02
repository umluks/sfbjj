import { ClassRepository } from '@/infrastructure/repositories/classRepository';
import type { Aula, Turma } from '@/domain/models/class';

export class ClassService {
  private classRepo = new ClassRepository();

  async getClasses(): Promise<Aula[]> {
    return this.classRepo.getClasses();
  }

  async createClass(classData: Omit<Aula, 'id'>): Promise<Aula> {
    return this.classRepo.createClass(classData);
  }

  async updateClass(id: number, classData: Partial<Aula>): Promise<void> {
    return this.classRepo.updateClass(id, classData);
  }

  async deleteClass(id: number): Promise<void> {
    return this.classRepo.deleteClass(id);
  }

  async getTurmas(): Promise<Turma[]> {
    return this.classRepo.getTurmas();
  }

  async createTurma(turmaData: Omit<Turma, 'id'>): Promise<Turma> {
    return this.classRepo.createTurma(turmaData);
  }

  async updateTurma(id: number, turmaData: Partial<Turma>): Promise<void> {
    return this.classRepo.updateTurma(id, turmaData);
  }

  async deleteTurma(id: number): Promise<void> {
    return this.classRepo.deleteTurma(id);
  }
}

export const classService = new ClassService();
export default classService;
