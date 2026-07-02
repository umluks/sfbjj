import type { Aula, Turma } from '../models/class';

export interface IClassRepository {
  getClasses(): Promise<Aula[]>;
  createClass(classData: Omit<Aula, 'id'>): Promise<Aula>;
  updateClass(id: number, classData: Partial<Aula>): Promise<void>;
  deleteClass(id: number): Promise<void>;
  
  getTurmas(): Promise<Turma[]>;
  createTurma(turmaData: Omit<Turma, 'id'>): Promise<Turma>;
  updateTurma(id: number, turmaData: Partial<Turma>): Promise<void>;
  deleteTurma(id: number): Promise<void>;
}
