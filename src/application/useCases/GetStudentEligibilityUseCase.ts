import type { Aluno } from '@/domain/models/student';
import type { Frequencia } from '@/domain/models/attendance';
import type { GraduationEligibility } from '@/domain/models/graduation';
import { GraduationEligibilityEngine } from '@/domain/services/GraduationEligibilityEngine';

export class GetStudentEligibilityUseCase {
  public execute(student: Aluno, attendances: Frequencia[] = []): GraduationEligibility {
    return GraduationEligibilityEngine.calculateEligibility(student, attendances);
  }
}

export const getStudentEligibilityUseCase = new GetStudentEligibilityUseCase();
