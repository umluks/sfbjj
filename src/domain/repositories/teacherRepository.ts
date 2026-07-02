import type { Professor } from '../models/teacher';

export interface ITeacherRepository {
  getTeachers(): Promise<Professor[]>;
  createTeacher(teacherData: Omit<Professor, 'id'>): Promise<Professor>;
  updateTeacher(id: number, teacherData: Partial<Professor>): Promise<void>;
  deleteTeacher(id: number): Promise<void>;
  changePassword(id: number, currentPass: string, newPass: string): Promise<void>;
}
