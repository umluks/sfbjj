import type { Belt } from '../types';

/**
 * Calcula a idade de Jiu-Jitsu do aluno com base no ano de nascimento.
 * A idade de BJJ é a diferença entre o ano atual e o ano de nascimento.
 */
export const getBjjAge = (birthDateStr: string): number => {
  if (!birthDateStr) return 16; // idade padrão adulta se não informada
  const birthYear = new Date(birthDateStr).getFullYear();
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear;
};

/**
 * Retorna as faixas permitidas com base na idade de Jiu-Jitsu do aluno.
 */
export const getBeltsByAge = (birthDateStr?: string): Belt[] => {
  if (!birthDateStr) {
    return [
      'Branca',
      'Cinza e branca', 'Cinza', 'Cinza e preta',
      'Amarela e branca', 'Amarela', 'Amarela e preta',
      'Laranja e branca', 'Laranja', 'Laranja e preta',
      'Verde e branca', 'Verde', 'Verde e preta',
      'Azul', 'Roxa', 'Marrom', 'Preta',
      'Vermelha e preta', 'Vermelha e branca', 'Vermelha'
    ];
  }
  const age = getBjjAge(birthDateStr);
  if (age >= 4 && age <= 15) {
    return [
      'Branca',
      'Cinza e branca', 'Cinza', 'Cinza e preta',
      'Amarela e branca', 'Amarela', 'Amarela e preta',
      'Laranja e branca', 'Laranja', 'Laranja e preta',
      'Verde e branca', 'Verde', 'Verde e preta'
    ];
  } else {
    return [
      'Branca',
      'Azul', 'Roxa', 'Marrom', 'Preta',
      'Vermelha e preta', 'Vermelha e branca', 'Vermelha'
    ];
  }
};
