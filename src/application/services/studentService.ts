import { StudentRepository } from '@/infrastructure/repositories/studentRepository';
import type { Aluno, Belt, Degree } from '@/domain/models/student';

export class StudentService {
  private studentRepo = new StudentRepository();

  async getStudents(): Promise<Aluno[]> {
    return this.studentRepo.getStudents();
  }

  async createStudent(studentData: Omit<Aluno, 'id' | 'historicoGraduacoes' | 'pagamentos'>): Promise<Aluno> {
    return this.studentRepo.createStudent(studentData);
  }

  async updateStudent(id: number, studentData: Partial<Aluno>): Promise<void> {
    return this.studentRepo.updateStudent(id, studentData);
  }

  async deleteStudent(id: number): Promise<void> {
    return this.studentRepo.deleteStudent(id);
  }

  async batchDeleteStudents(ids: number[]): Promise<void> {
    return this.studentRepo.batchDeleteStudents(ids);
  }

  async batchUpdateStatus(ids: number[], status: 'Ativo' | 'Inativo' | 'Pendente'): Promise<void> {
    return this.studentRepo.batchUpdateStatus(ids, status);
  }

  async insertGraduationHistory(
    alunoId: number,
    faixa: Belt,
    graus: Degree,
    dataGrad: string,
    avaliador: string
  ): Promise<any> {
    return this.studentRepo.insertGraduationHistory(alunoId, faixa, graus, dataGrad, avaliador);
  }

  /**
   * Importa múltiplos alunos e cria seu histórico de graduação inicial.
   */
  async importStudents(
    students: Omit<Aluno, 'id' | 'historicoGraduacoes' | 'pagamentos'>[],
    avaliador: string
  ): Promise<{ insertedStudents: Aluno[]; insertedHistory: any[] }> {
    // 1. Insere todos os alunos
    const insertedAlunos = await this.studentRepo.insertStudentsBatch(students);

    let insertedGrads: any[] = [];
    if (insertedAlunos && insertedAlunos.length > 0) {
      // 2. Prepara histórico de graduação inicial para cada aluno inserido
      const graducoesToInsert = insertedAlunos.map(aluno => ({
        aluno_id: aluno.id,
        faixa: aluno.faixa,
        graus: aluno.graus,
        data_graduacao: aluno.dataUltimaGraduacao || aluno.dataMatricula,
        avaliador
      }));

      insertedGrads = await this.studentRepo.insertGraduationHistories(graducoesToInsert);
    }

    return {
      insertedStudents: insertedAlunos,
      insertedHistory: insertedGrads
    };
  }

  async getStudentById(id: number): Promise<Aluno | null> {
    return this.studentRepo.getStudentById(id);
  }

  async changePassword(id: number, currentPass: string, newPass: string): Promise<void> {
    return this.studentRepo.changePassword(id, currentPass, newPass);
  }

  async addGraduation(studentId: number, data: { faixa: Belt; graus: Degree; data_graduacao: string; avaliador: string }): Promise<void> {
    return this.studentRepo.addGraduation(studentId, data);
  }

  async updateGraduation(gradId: number, data: { faixa: Belt; graus: Degree; data_graduacao: string }): Promise<void> {
    return this.studentRepo.updateGraduation(gradId, data);
  }

  async deleteGraduation(gradId: number): Promise<void> {
    return this.studentRepo.deleteGraduation(gradId);
  }
}

export const studentService = new StudentService();
export default studentService;
