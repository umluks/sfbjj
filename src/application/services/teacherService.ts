import { TeacherRepository } from '@/infrastructure/repositories/teacherRepository';
import type { Professor } from '@/domain/models/teacher';

export class TeacherService {
  private teacherRepo = new TeacherRepository();

  async getTeachers(): Promise<Professor[]> {
    return this.teacherRepo.getTeachers();
  }

  async createTeacher(teacherData: Omit<Professor, 'id'>): Promise<Professor> {
    return this.teacherRepo.createTeacher(teacherData);
  }

  async updateTeacher(id: number, teacherData: Partial<Professor>): Promise<void> {
    return this.teacherRepo.updateTeacher(id, teacherData);
  }

  async deleteTeacher(id: number): Promise<void> {
    return this.teacherRepo.deleteTeacher(id);
  }

  async changePassword(id: number, currentPass: string, newPass: string): Promise<void> {
    return this.teacherRepo.changePassword(id, currentPass, newPass);
  }
}

export const teacherService = new TeacherService();
export default teacherService;
