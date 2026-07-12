import { AttendanceRepository } from '@/infrastructure/repositories/attendanceRepository';
import type { Frequencia } from '@/domain/models/attendance';

export class AttendanceService {
  private attendanceRepo = new AttendanceRepository();

  async getAttendanceByStudent(studentId: number): Promise<Frequencia[]> {
    return this.attendanceRepo.getAttendanceByStudent(studentId);
  }

  async checkIn(alunoId: number, aulaId: number, turmaId?: number, dateStr?: string): Promise<Frequencia> {
    return this.attendanceRepo.checkIn(alunoId, aulaId, turmaId, dateStr);
  }

  async deleteAttendance(attendanceId: number): Promise<void> {
    return this.attendanceRepo.deleteAttendance(attendanceId);
  }

  async searchAttendance(filters: {
    startDate?: string;
    endDate?: string;
    categoria?: string;
    alunoId?: number;
  }): Promise<Frequencia[]> {
    return this.attendanceRepo.searchAttendance(filters);
  }
}

export const attendanceService = new AttendanceService();
export default attendanceService;
