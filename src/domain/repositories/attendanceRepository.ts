import type { Frequencia } from '../models/attendance';

export interface IAttendanceRepository {
  getAttendanceByStudent(studentId: number): Promise<Frequencia[]>;
  checkIn(alunoId: number, aulaId: number, turmaId?: number, dateStr?: string): Promise<Frequencia>;
  checkInExternal(
    alunoId: number, 
    dataStr: string, 
    localExterno: string, 
    horarioStr?: string, 
    observacao?: string
  ): Promise<Frequencia>;
  deleteAttendance(attendanceId: number): Promise<void>;
  searchAttendance(filters: {
    startDate?: string;
    endDate?: string;
    categoria?: string;
    alunoId?: number;
  }): Promise<Frequencia[]>;
}

