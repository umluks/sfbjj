import type { Aluno, Belt } from '@/domain/models/student';
import type { Frequencia } from '@/domain/models/attendance';
import type { GraduationDashboardMetrics } from '@/domain/models/graduation';
import { GraduationEligibilityEngine } from '@/domain/services/GraduationEligibilityEngine';
import { calculateIbjjfCategory } from '@/utils/ibjjfCalculator';
import { getBjjAge } from '@/application/services/diplomaService';

export class GetGraduationDashboardUseCase {
  public execute(students: Aluno[], attendances: Frequencia[] = []): GraduationDashboardMetrics {
    const activeStudents = students.filter(s => s.status === 'Ativo');

    let alunosAptos = 0;
    let alunosProximos = 0;
    let alunosComPendencias = 0;

    const distribuicaoPorFaixa: Record<Belt, number> = {
      'Branca': 0, 'Cinza e branca': 0, 'Cinza': 0, 'Cinza e preta': 0,
      'Amarela e branca': 0, 'Amarela': 0, 'Amarela e preta': 0,
      'Laranja e branca': 0, 'Laranja': 0, 'Laranja e preta': 0,
      'Verde e branca': 0, 'Verde': 0, 'Verde e preta': 0,
      'Azul': 0, 'Roxa': 0, 'Marrom': 0, 'Preta': 0,
      'Vermelha e preta': 0, 'Vermelha e branca': 0, 'Vermelha': 0
    };

    const distribuicaoPorIdade = {
      kidsCount: 0,
      adultoCount: 0,
      masterCount: 0
    };

    const distribuicaoPorCategoria: Record<string, number> = {};

    activeStudents.forEach(student => {
      // Faixa
      const faixa = student.faixa || 'Branca';
      distribuicaoPorFaixa[faixa] = (distribuicaoPorFaixa[faixa] || 0) + 1;

      // Idade
      const age = getBjjAge(student.dataNascimento);
      if (age < 16) {
        distribuicaoPorIdade.kidsCount++;
      } else if (age < 30) {
        distribuicaoPorIdade.adultoCount++;
      } else {
        distribuicaoPorIdade.masterCount++;
      }

      // Categoria IBJJF (quando houver peso)
      if (student.peso && student.dataNascimento) {
        try {
          const catObj = calculateIbjjfCategory({
            dataNascimento: student.dataNascimento,
            gender: student.genero || 'Masculino',
            modality: 'gi',
            weightKg: student.peso,
            beltColor: student.faixa || 'Branca'
          });
          const catName = catObj?.category || 'Geral';
          distribuicaoPorCategoria[catName] = (distribuicaoPorCategoria[catName] || 0) + 1;
        } catch {
          // ignora em erro de parse
        }
      }

      // Elegibilidade
      const eligibility = GraduationEligibilityEngine.calculateEligibility(student, attendances);
      if (eligibility.status === 'Apto') {
        alunosAptos++;
      } else if (eligibility.percentualEvolucao >= 75) {
        alunosProximos++;
      } else {
        alunosComPendencias++;
      }
    });

    return {
      totalAlunos: activeStudents.length,
      alunosAptos,
      alunosProximos,
      alunosComPendencias,
      distribuicaoPorFaixa,
      distribuicaoPorIdade,
      distribuicaoPorCategoria
    };
  }
}

export const getGraduationDashboardUseCase = new GetGraduationDashboardUseCase();
