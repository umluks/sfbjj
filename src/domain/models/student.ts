import type { Pagamento } from './payment';

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

export type Degree = 0 | 1 | 2 | 3 | 4;

export type Gender = 'Masculino' | 'Feminino';

export interface GraduacaoHistorico {
  id: number;
  data: string; // YYYY-MM-DD
  faixa: Belt;
  graus: Degree;
  avaliador?: string;
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
  status: 'Ativo' | 'Inativo' | 'Pendente' | 'Aguardando' | 'Graduado';
  pagamentos: Pagamento[];
  senha?: string;
  turma: 'Kids' | 'Adulto';
  role?: 'admin' | 'student' | 'teacher';
  fotoPerfil?: string; // Base64 ou nome avatar
  modalidadePagamento?: string;
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
