export interface Turma {
  id: number;
  nome: string;
  categoria: 'Adulto' | 'Kids' | 'Open Match';
}

export interface Aula {
  id: number;
  hora: string; // ex: "18:00 - 19:15"
  categoria: 'Adulto' | 'Kids' | 'Open Match' | string;
  professor: string;
  professorId?: number;
  turmaId?: number;
  diasSemana: number[]; // 1 = Seg, 2 = Ter, etc.
}
