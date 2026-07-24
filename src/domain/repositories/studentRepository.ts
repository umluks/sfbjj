import type { Aluno, Belt, Degree } from '../models/student';

export interface IStudentRepository {
  getStudents(): Promise<Aluno[]>;
  createStudent(studentData: Omit<Aluno, 'id' | 'historicoGraduacoes' | 'pagamentos'>): Promise<Aluno>;
  updateStudent(id: number, studentData: Partial<Aluno>): Promise<void>;
  deleteStudent(id: number): Promise<void>;
  batchDeleteStudents(ids: number[]): Promise<void>;
  batchUpdateStatus(ids: number[], status: 'Ativo' | 'Inativo' | 'Pendente'): Promise<void>;
  insertGraduationHistory(
    alunoId: number,
    faixa: Belt,
    graus: Degree,
    dataGrad: string,
    avaliador: string
  ): Promise<any>;
  insertGraduationHistories(records: any[]): Promise<any[]>;
  insertStudentsBatch(students: Omit<Aluno, 'id' | 'historicoGraduacoes' | 'pagamentos'>[]): Promise<Aluno[]>;
  getStudentById(id: number): Promise<Aluno | null>;
  changePassword(id: number, currentPass: string, newPass: string): Promise<void>;
  addGraduation(studentId: number, data: { faixa: Belt; graus: Degree; data_graduacao: string; avaliador: string }): Promise<void>;
  updateGraduation(gradId: number, data: { faixa: Belt; graus: Degree; data_graduacao: string }): Promise<void>;
  deleteGraduation(gradId: number): Promise<void>;
}
