export type Belt = 'Branca' | 'Azul' | 'Roxa' | 'Marrom' | 'Preta' | 'Verde' | 'Amarela' | 'Laranja' | 'Cinza';

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
  status: 'Ativo' | 'Inativo';

  pagamentos: Pagamento[]; // Historico de pagamentos
  senha?: string; // Senha customizada do aluno
  turma: 'Kids' | 'Adulto';
  role?: 'admin' | 'student'; // Adicionado tipo de usuário
  fotoPerfil?: string; // Base64 data URI or avatar name
  modalidadePagamento?: string; // Default payment modality (e.g. Mensal, Trimestral)
  historicoGraduacoes?: GraduacaoHistorico[];
}

export interface Presenca {
  id: number;
  data: string; // YYYY-MM-DD
  aulaId: number; // ID da Aula da Grade
  alunosPresentes: number[]; // List de IDs dos Alunos presentes
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
