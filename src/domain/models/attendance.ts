export interface Frequencia {
  id: number;
  alunoId: number;
  aulaId: number;
  turmaId?: number;
  data: string; // YYYY-MM-DD
  horario: string; // HH:MM:SS
  createdAt: string;
  // Propriedades estendidas para junção na interface
  alunoNome?: string;
  turmaNome?: string;
  aulaHora?: string;
  aulaCategoria?: string;
  professorNome?: string;
}
