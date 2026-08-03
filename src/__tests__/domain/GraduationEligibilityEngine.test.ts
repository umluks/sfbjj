import { GraduationEligibilityEngine } from '@/domain/services/GraduationEligibilityEngine';
import type { Aluno, Belt, Degree } from '@/domain/models/student';
import type { Frequencia } from '@/domain/models/attendance';

export function runGraduationEligibilityEngineTests() {
  const results: { name: string; passed: boolean; error?: any }[] = [];

  const assert = (condition: boolean, message: string) => {
    if (!condition) throw new Error(`Assertion Failed: ${message}`);
  };

  const mockStudent: Aluno = {
    id: 1,
    nome: 'Carlos Gracie',
    cpf: '000.000.000-00',
    dataNascimento: '1995-05-10',
    telefone: '61999999999',
    email: 'carlos@sfbjj.com',
    genero: 'Masculino',
    dataMatricula: '2022-01-01',
    bairro: 'Asa Norte',
    faixa: 'Branca' as Belt,
    graus: 2 as Degree,
    dataUltimaGraduacao: '2024-01-01',
    contatoEmergenciaNome: 'Contato',
    contatoEmergenciaTel: '61999999999',
    status: 'Ativo',
    pagamentos: [],
    turma: 'Adulto',
    peso: 76
  };

  try {
    const attendances: Frequencia[] = Array.from({ length: 40 }).map((_, i) => ({
      id: i + 1,
      alunoId: 1,
      data: '2024-08-01',
      horario: '19:00:00',
      createdAt: '2024-08-01T19:00:00Z'
    }));

    const eligibility = GraduationEligibilityEngine.calculateEligibility(mockStudent, attendances);

    assert(eligibility.alunoId === 1, 'alunoId correto');
    assert(eligibility.totalTreinos === 40, 'totalTreinos igual a 40');
    assert(eligibility.proximaFaixa === 'Branca', 'próxima faixa branca');
    assert(eligibility.proximoGrau === 3, 'próximo grau 3');
    results.push({ name: 'Cálculo de elegibilidade e indicadores', passed: true });
  } catch (err) {
    results.push({ name: 'Cálculo de elegibilidade e indicadores', passed: false, error: err });
  }

  return results;
}
