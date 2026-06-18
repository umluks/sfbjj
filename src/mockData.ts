import type { Aluno, Aula, Aviso, Presenca } from './types';

export const INITIAL_SCHEDULE: Aula[] = [
  {
    id: 1,
    hora: '18:30 - 19:30',
    categoria: 'Infantil',
    professor: 'Lucas dos Anjos',
    diasSemana: [1, 3] // Seg, Qua
  },
  {
    id: 2,
    hora: '19:30 - 21:00',
    categoria: 'Adulto',
    professor: 'Lucas dos Anjos',
    diasSemana: [1, 3] // Seg, Qua
  },
  {
    id: 3,
    hora: '19:00 - 21:00',
    categoria: 'Open Match',
    professor: 'Lucas dos Anjos',
    diasSemana: [5] // Sex
  }
];

export const INITIAL_ANNOUNCEMENTS: Aviso[] = [
  {
    id: 1,
    titulo: '🥋 Graduação / Confraternização',
    conteudo: 'No dia 04 de junho, teremos a nossa grande cerimônia de graduação e confraternização! Para celebrar este momento especial!',
    data: '2026-05-18',
    fixado: true
  }
];

export const INITIAL_STUDENTS: Aluno[] = [];

export const INITIAL_ATTENDANCES: Presenca[] = [
  {
    id: 1,
    data: '2026-05-20',
    aulaId: 3,
    alunosPresentes: [1, 2, 4, 5]
  },
  {
    id: 2,
    data: '2026-05-19',
    aulaId: 4,
    alunosPresentes: [1, 2, 3]
  }
];