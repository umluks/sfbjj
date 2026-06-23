export type Belt =
  | 'Branca'
  // Infantis (04 a 15 anos)
  | 'Cinza e branca' | 'Cinza' | 'Cinza e preta'
  | 'Amarela e branca' | 'Amarela' | 'Amarela e preta'
  | 'Laranja e branca' | 'Laranja' | 'Laranja e preta'
  | 'Verde e branca' | 'Verde' | 'Verde e preta'
  // Adultos (a partir dos 16 anos)
  | 'Azul' | 'Roxa' | 'Marrom' | 'Preta'
  | 'Vermelha e preta' | 'Vermelha e branca' | 'Vermelha';

export const BELT_RANKS: Record<Belt, number> = {
  'Branca': 1,
  // Infantis
  'Cinza e branca': 2,
  'Cinza': 3,
  'Cinza e preta': 4,
  'Amarela e branca': 5,
  'Amarela': 6,
  'Amarela e preta': 7,
  'Laranja e branca': 8,
  'Laranja': 9,
  'Laranja e preta': 10,
  'Verde e branca': 11,
  'Verde': 12,
  'Verde e preta': 13,
  // Adultos
  'Azul': 14,
  'Roxa': 15,
  'Marrom': 16,
  'Preta': 17,
  'Vermelha e preta': 18,
  'Vermelha e branca': 19,
  'Vermelha': 20
};

export const getBjjAge = (birthDateStr: string): number => {
  if (!birthDateStr) return 16; // default to adult if not specified
  const birthYear = new Date(birthDateStr).getFullYear();
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear;
};

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

export type Degree = 0 | 1 | 2 | 3 | 4;

export type PaymentStatus = 'Pago' | 'Pendente' | 'Atrasado';

export type Gender = 'Masculino' | 'Feminino' | 'Outro';

export interface GraduacaoHistorico {
  id: number;
  data: string; // YYYY-MM-DD
  faixa: Belt;
  graus: Degree;
  avaliador?: string; // Nome do professor que graduou
}

export interface Pagamento {
  id: number;
  alunoId?: number;
  mesRef: string; // e.g. "Maio/2026"
  valor: number;
  status: PaymentStatus;
  dataVencimento: string; // YYYY-MM-DD
  dataPagamento: string | null; // YYYY-MM-DD
}

export interface Aluno {
  id: number;
  nome: string;
  cpf: string;
  dataNascimento: string; // YYYY-MM-DD
  telefone: string;
  email: string;
  genero: Gender;
  dataMatricula: string; // YYYY-MM-DD
  bairro: string;
  faixa: Belt;
  graus: Degree;

  dataUltimaGraduacao: string; // Data da última graduação
  contatoEmergenciaNome: string;
  contatoEmergenciaTel: string;
  status: 'Ativo' | 'Inativo' | 'Graduado';

  pagamentos: Pagamento[]; // Historico de pagamentos
  senha?: string; // Senha customizada do aluno
  turma: 'Kids' | 'Adulto';
  role?: 'admin' | 'student' | 'teacher'; // Adicionado tipo de usuário
  fotoPerfil?: string; // Base64 data URI or avatar name
  modalidadePagamento?: string; // Default payment modality (e.g. Mensal, Trimestral)
  historicoGraduacoes?: GraduacaoHistorico[];
}

export interface Graduacao {
  id: number;
  aluno_id: number;
  faixa_antiga: string | null;
  nova_faixa: string;
  quantidade_graus: number;
  data_graduacao: string; // YYYY-MM-DD
  professor_id: number | null;
  created_at?: string;
}

export interface Professor {
  id: number;
  nome: string;
  email: string;
  senha?: string;
  telefone: string;
  cbjj?: string; // Adicionado número CBJJ
}

export interface Turma {
  id: number;
  nome: string;
  categoria: 'Infantil' | 'Adulto Iniciante' | 'Adulto' | 'Avançado' | 'Open Match' | 'No-Gi';
}

export interface Aula {
  id: number;
  hora: string; // e.g. "18:00 - 19:15"
  categoria: 'Infantil' | 'Adulto Iniciante' | 'Adulto' | 'Avançado' | 'Open Match' | 'No-Gi' | string;
  professor: string;
  professorId?: number; // Relacional
  turmaId?: number; // Relacional
  diasSemana: number[]; // 1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta, 6 = Sábado
}

export interface Aviso {
  id: number;
  titulo: string;
  conteudo: string;
  data: string; // YYYY-MM-DD ou data formatada
  fixado: boolean;
}

export interface LoggedUser {
  role: 'admin' | 'student' | 'teacher';
  alunoId?: number;
  professorId?: number;
  nome: string;
}
