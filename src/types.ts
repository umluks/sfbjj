export type Belt = 'Branca' | 'Azul' | 'Roxa' | 'Marrom' | 'Preta' | 'Verde' | 'Amarela' | 'Laranja' | 'Cinza';

export type Degree = 0 | 1 | 2 | 3 | 4;

export type PaymentStatus = 'Pago' | 'Pendente' | 'Atrasado';

export type Gender = 'Masculino' | 'Feminino' | 'Outro';

export interface PaymentRecord {
  id: string;
  mesRef: string; // e.g. "Maio/2026"
  valor: number;
  status: PaymentStatus;
  dataVencimento: string; // YYYY-MM-DD
  dataPagamento: string | null; // YYYY-MM-DD
}

export interface Student {
  id: string;
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
  totalTreinos: number; // Incrementado a cada presenca
  pagamentos: PaymentRecord[]; // Historico de pagamentos
}

export interface Attendance {
  id: string;
  data: string; // YYYY-MM-DD
  aulaId: string; // ID da Aula da Grade
  alunosPresentes: string[]; // List de IDs dos Alunos presentes
}

export interface ScheduleClass {
  id: string;
  hora: string; // e.g. "18:00 - 19:15"
  categoria: 'Infantil' | 'Adulto' | 'Open Match' | 'No-Gi';
  professor: string;
  diasSemana: number[]; // 1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta, 6 = Sábado
}

export interface Announcement {
  id: string;
  titulo: string;
  conteudo: string;
  data: string; // YYYY-MM-DD ou data formatada
  fixado: boolean;
}
