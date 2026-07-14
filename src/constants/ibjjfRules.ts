export interface BeltInfo {
  name: string;
  color: string;
  textColor: string;
  barColor?: string;
  stripeColor?: string;
  minAge: number;
  maxAge?: number;
  minTime: string;
  description: string;
  category: 'infantil' | 'adulto' | 'coral_vermelha';
  stripes: number;
}

export interface IllegalMove {
  move: string;
  belts: string;
  ages: string;
  penalty: string;
}

export interface WeightDivision {
  class: string;
  adultLimit: string;
  masterLimit: string;
  juvenilLimit?: string;
}

export const belts: BeltInfo[] = [
  {
    name: 'Branca',
    color: '#FFFFFF',
    textColor: '#0F0F11',
    barColor: '#000000',
    minAge: 4,
    minTime: 'Nenhuma carência',
    description: 'Faixa de iniciante para todas as idades. Foco em aprender a postura, movimentação básica e conceitos fundamentais de autodefesa e respeito.',
    category: 'infantil',
    stripes: 4
  },
  {
    name: 'Cinza e Branca',
    color: '#A0A0A0',
    textColor: '#FFFFFF',
    barColor: '#FFFFFF',
    minAge: 4,
    maxAge: 15,
    minTime: 'Nenhuma carência',
    description: 'Grupo Cinza: Primeira transição das crianças. Introduz noções de competitividade saudável e disciplina básica.',
    category: 'infantil',
    stripes: 4
  },
  {
    name: 'Cinza',
    color: '#606060',
    textColor: '#FFFFFF',
    barColor: '#000000',
    minAge: 4,
    maxAge: 15,
    minTime: 'Nenhuma carência',
    description: 'Consolidação das técnicas básicas para crianças. Foco em agilidade, equilíbrio e técnicas de escape.',
    category: 'infantil',
    stripes: 4
  },
  {
    name: 'Cinza e Preta',
    color: '#404040',
    textColor: '#FFFFFF',
    barColor: '#000000',
    minAge: 4,
    maxAge: 15,
    minTime: 'Nenhuma carência',
    description: 'Nível avançado do grupo cinza, preparando a criança para desafios maiores.',
    category: 'infantil',
    stripes: 4
  },
  {
    name: 'Amarela e Branca',
    color: '#FFE600',
    textColor: '#0F0F11',
    barColor: '#FFFFFF',
    minAge: 7,
    maxAge: 15,
    minTime: 'Nenhuma carência',
    description: 'Grupo Amarelo: Início de técnicas de raspagem e finalizações mais estruturadas para crianças a partir de 7 anos.',
    category: 'infantil',
    stripes: 4
  },
  {
    name: 'Amarela',
    color: '#D4B200',
    textColor: '#FFFFFF',
    barColor: '#000000',
    minAge: 7,
    maxAge: 15,
    minTime: 'Nenhuma carência',
    description: 'Desenvolvimento de combinações de quedas e ataques básicos.',
    category: 'infantil',
    stripes: 4
  },
  {
    name: 'Amarela e Preta',
    color: '#A88E00',
    textColor: '#FFFFFF',
    barColor: '#000000',
    minAge: 7,
    maxAge: 15,
    minTime: 'Nenhuma carência',
    description: 'Nível sênior do grupo amarelo. Refinamento de controles laterais.',
    category: 'infantil',
    stripes: 4
  },
  {
    name: 'Laranja e Branca',
    color: '#FF8800',
    textColor: '#FFFFFF',
    barColor: '#FFFFFF',
    minAge: 10,
    maxAge: 15,
    minTime: 'Nenhuma carência',
    description: 'Grupo Laranja: Transição técnica importante para pré-adolescentes a partir de 10 anos. Foco em alavancas mais complexas.',
    category: 'infantil',
    stripes: 4
  },
  {
    name: 'Laranja',
    color: '#E06A00',
    textColor: '#FFFFFF',
    barColor: '#000000',
    minAge: 10,
    maxAge: 15,
    minTime: 'Nenhuma carência',
    description: 'Aprofundamento de transições e ataques duplos. Domínio do fluxo de rola.',
    category: 'infantil',
    stripes: 4
  },
  {
    name: 'Laranja e Preta',
    color: '#B85300',
    textColor: '#FFFFFF',
    barColor: '#000000',
    minAge: 10,
    maxAge: 15,
    minTime: 'Nenhuma carência',
    description: 'Preparação para o último grupo infantil (faixa verde).',
    category: 'infantil',
    stripes: 4
  },
  {
    name: 'Verde e Branca',
    color: '#00B82E',
    textColor: '#FFFFFF',
    barColor: '#FFFFFF',
    minAge: 13,
    maxAge: 15,
    minTime: 'Nenhuma carência',
    description: 'Grupo Verde: Nível técnico mais alto do Jiu-Jitsu infantil para adolescentes de 13 a 15 anos.',
    category: 'infantil',
    stripes: 4
  },
  {
    name: 'Verde',
    color: '#008F22',
    textColor: '#FFFFFF',
    barColor: '#000000',
    minAge: 13,
    maxAge: 15,
    minTime: 'Nenhuma carência',
    description: 'Domínio técnico completo do currículo infantil. Ritmo de luta forte.',
    category: 'infantil',
    stripes: 4
  },
  {
    name: 'Verde e Preta',
    color: '#006618',
    textColor: '#FFFFFF',
    barColor: '#000000',
    minAge: 13,
    maxAge: 15,
    minTime: 'Nenhuma carência',
    description: 'Faixa máxima infantil. Representa maturidade física e técnica completa antes da transição aos 16 anos.',
    category: 'infantil',
    stripes: 4
  },

  // Grupo Adulto (16+ anos)
  {
    name: 'Branca (Adulto)',
    color: '#FFFFFF',
    textColor: '#0F0F11',
    barColor: '#000000',
    minAge: 16,
    minTime: 'Nenhuma carência',
    description: 'Faixa de iniciante para jovens e adultos (a partir de 16 anos). Foco em aprender as posições básicas de guarda, escapes e controle postural.',
    category: 'adulto',
    stripes: 4
  },
  {
    name: 'Azul',
    color: '#0055FF',
    textColor: '#FFFFFF',
    barColor: '#000000',
    minAge: 16,
    minTime: '2 anos (1 ano se transferido de Verde Juvenil)',
    description: 'Primeira faixa de adultos (a partir de 16 anos). Foco em construir um arsenal técnico sólido, entender as posições de controle e desenvolver resistência nos sparrings.',
    category: 'adulto',
    stripes: 4
  },
  {
    name: 'Roxa',
    color: '#7A00E6',
    textColor: '#FFFFFF',
    barColor: '#000000',
    minAge: 16,
    minTime: '1 ano e meio',
    description: 'A faixa do refinamento de estilo. O praticante começa a conectar posições de forma fluida, criar guardas específicas e ensinar alunos iniciantes.',
    category: 'adulto',
    stripes: 4
  },
  {
    name: 'Marrom',
    color: '#5C3A21',
    textColor: '#FFFFFF',
    barColor: '#000000',
    minAge: 18,
    minTime: '1 ano',
    description: 'Nível avançado máximo antes da faixa preta. Foco na precisão milimétrica, eficiência de energia, finalizações seguras e maturidade mental no tatame.',
    category: 'adulto',
    stripes: 4
  },
  {
    name: 'Preta',
    color: '#151518',
    textColor: '#FFFFFF',
    barColor: '#E60000',
    minAge: 19,
    minTime: '31 anos de dedicação na preta para atingir o topo',
    description: 'O verdadeiro início dos estudos do Jiu-Jitsu. Representa maestria técnica, autodisciplina e a responsabilidade de passar a tradição adiante.\n\nPossui do 0 ao 6º Grau, com os seguintes tempos mínimos de permanência:\n• 1º, 2º e 3º Graus: 3 anos de carência em cada grau.\n• 4º, 5º e 6º Graus: 5 anos de carência em cada grau.\n\n(Totalizando 24 anos de atividade como faixa preta antes de poder pleitear a faixa Coral 7º Grau).',
    category: 'adulto',
    stripes: 6
  },

  // Faixas Especiais / Coral / Vermelha
  {
    name: 'Vermelha e Preta (Coral)',
    color: '#A00000',
    textColor: '#FFFFFF',
    barColor: '#FFFFFF',
    minAge: 50,
    minTime: '7 anos como faixa preta 6º grau',
    description: 'Faixa Especial correspondente ao 7º Grau (Mestre / Coral). Requer idade mínima de 50 anos e pelo menos 31 anos de faixa preta ativa.',
    category: 'coral_vermelha',
    stripes: 7
  },
  {
    name: 'Vermelha e Branca (Coral)',
    color: '#A00000',
    textColor: '#FFFFFF',
    barColor: '#151518',
    minAge: 57,
    minTime: '7 anos como faixa vermelha e preta 7º grau',
    description: 'Faixa Especial correspondente ao 8º Grau (Mestre / Coral). Exige idade mínima de 57 anos.',
    category: 'coral_vermelha',
    stripes: 8
  },
  {
    name: 'Vermelha',
    color: '#E60000',
    textColor: '#FFFFFF',
    barColor: '#D4AF37',
    minAge: 67,
    minTime: '10 anos como faixa vermelha e branca 8º grau',
    description: 'A faixa máxima do Jiu-Jitsu brasileiro correspondente ao 9º Grau (Grande Mestre). Requer idade mínima de 67 anos.',
    category: 'coral_vermelha',
    stripes: 9
  }
];

export const illegalMoves: IllegalMove[] = [
  { move: 'Bate-Estaca (Slam)', belts: 'Todas as faixas', ages: 'Todas as idades', penalty: 'Desclassificação Imediata' },
  { move: 'Chave de Cervical (Cervical Lock)', belts: 'Todas as faixas (Exceto estrangulamento sem torção)', ages: 'Todas as idades', penalty: 'Desclassificação Imediata' },
  { move: 'Chave de Calcanhar (Heel Hook)', belts: 'Branca a Marrom (Permitido Preta No-Gi sob regras específicas da categoria Adulto)', ages: 'Sub-18 / Master (Proibido)', penalty: 'Desclassificação Imediata' },
  { move: 'Cruzamento de Perna sobre o Joelho (Reaping)', belts: 'Branca a Marrom (Regulamentado na Preta)', ages: 'Todas as idades', penalty: 'Desclassificação Imediata' },
  { move: 'Projeção de Tesoura (Scissor Takedown)', belts: 'Todas as faixas', ages: 'Todas as idades', penalty: 'Desclassificação Imediata' },
  { move: 'Chave de Rins (Kidney Lock) / Fechar a Guarda com os Pés nos Rins', belts: 'Branca', ages: 'Infantil / Juvenil', penalty: 'Falta Grave / Punição' },
  { move: 'Mata-Leão no Pé (Toe Hold)', belts: 'Branca a Azul', ages: 'Sub-18 (Proibido)', penalty: 'Desclassificação / Punição' },
  { move: 'Cervical puxando a cabeça', belts: 'Todas as faixas', ages: 'Sub-15', penalty: 'Desclassificação Imediata' },
  { move: 'Mão de Vaca (Wrist Lock)', belts: 'Branca', ages: 'Infantil (Todas)', penalty: 'Falta Grave' },
  { move: 'Chave de Bíceps / Chave de Panturrilha', belts: 'Branca a Roxa', ages: 'Sub-18 (Proibido)', penalty: 'Desclassificação' }
];

export const weightsMascGi: WeightDivision[] = [
  { class: 'Galo', adultLimit: 'Até 57.50 kg', masterLimit: 'Até 57.50 kg', juvenilLimit: 'Até 53.50 kg' },
  { class: 'Pluma', adultLimit: 'Até 64.00 kg', masterLimit: 'Até 64.00 kg', juvenilLimit: 'Até 58.50 kg' },
  { class: 'Pena', adultLimit: 'Até 70.00 kg', masterLimit: 'Até 70.00 kg', juvenilLimit: 'Até 64.00 kg' },
  { class: 'Leve', adultLimit: 'Até 76.00 kg', masterLimit: 'Até 76.00 kg', juvenilLimit: 'Até 69.00 kg' },
  { class: 'Médio', adultLimit: 'Até 82.30 kg', masterLimit: 'Até 82.30 kg', juvenilLimit: 'Até 74.00 kg' },
  { class: 'Meio-Pesado', adultLimit: 'Até 88.30 kg', masterLimit: 'Até 88.30 kg', juvenilLimit: 'Até 79.30 kg' },
  { class: 'Pesado', adultLimit: 'Até 94.30 kg', masterLimit: 'Até 94.30 kg', juvenilLimit: 'Até 84.30 kg' },
  { class: 'Super-Pesado', adultLimit: 'Até 100.50 kg', masterLimit: 'Até 100.50 kg', juvenilLimit: 'Até 89.30 kg' },
  { class: 'Pesadíssimo', adultLimit: 'Sem limite de peso', masterLimit: 'Sem limite de peso', juvenilLimit: 'Sem limite' }
];

export const weightsMascNoGi: WeightDivision[] = [
  { class: 'Galo', adultLimit: 'Até 55.50 kg', masterLimit: 'Até 55.50 kg', juvenilLimit: 'Até 51.50 kg' },
  { class: 'Pluma', adultLimit: 'Até 61.50 kg', masterLimit: 'Até 61.50 kg', juvenilLimit: 'Até 56.50 kg' },
  { class: 'Pena', adultLimit: 'Até 67.50 kg', masterLimit: 'Até 67.50 kg', juvenilLimit: 'Até 61.50 kg' },
  { class: 'Leve', adultLimit: 'Até 73.50 kg', masterLimit: 'Até 73.50 kg', juvenilLimit: 'Até 66.50 kg' },
  { class: 'Médio', adultLimit: 'Até 79.50 kg', masterLimit: 'Até 79.50 kg', juvenilLimit: 'Até 71.50 kg' },
  { class: 'Meio-Pesado', adultLimit: 'Até 85.50 kg', masterLimit: 'Até 85.50 kg', juvenilLimit: 'Até 76.50 kg' },
  { class: 'Pesado', adultLimit: 'Até 91.50 kg', masterLimit: 'Até 91.50 kg', juvenilLimit: 'Até 81.50 kg' },
  { class: 'Super-Pesado', adultLimit: 'Até 97.50 kg', masterLimit: 'Até 97.50 kg', juvenilLimit: 'Até 86.50 kg' },
  { class: 'Ultra-Pesado', adultLimit: 'Sem limite de peso', masterLimit: 'Sem limite de peso', juvenilLimit: 'Sem limite' }
];

export const weightsFemGi: WeightDivision[] = [
  { class: 'Galo', adultLimit: 'Até 48.50 kg', masterLimit: 'Até 48.50 kg', juvenilLimit: 'Até 44.30 kg' },
  { class: 'Pluma', adultLimit: 'Até 53.50 kg', masterLimit: 'Até 53.50 kg', juvenilLimit: 'Até 48.30 kg' },
  { class: 'Pena', adultLimit: 'Até 58.50 kg', masterLimit: 'Até 58.50 kg', juvenilLimit: 'Até 52.50 kg' },
  { class: 'Leve', adultLimit: 'Até 64.00 kg', masterLimit: 'Até 64.00 kg', juvenilLimit: 'Até 56.50 kg' },
  { class: 'Médio', adultLimit: 'Até 69.00 kg', masterLimit: 'Até 69.00 kg', juvenilLimit: 'Até 60.50 kg' },
  { class: 'Meio-Pesado', adultLimit: 'Até 74.00 kg', masterLimit: 'Até 74.00 kg', juvenilLimit: 'Até 65.00 kg' },
  { class: 'Pesado', adultLimit: 'Até 79.30 kg', masterLimit: 'Até 79.30 kg', juvenilLimit: 'Até 69.00 kg' },
  { class: 'Super-Pesado', adultLimit: 'Sem limite de peso', masterLimit: 'Sem limite de peso', juvenilLimit: 'Sem limite' }
];

export const weightsFemNoGi: WeightDivision[] = [
  { class: 'Galo', adultLimit: 'Até 46.50 kg', masterLimit: 'Até 46.50 kg', juvenilLimit: 'Até 42.50 kg' },
  { class: 'Pluma', adultLimit: 'Até 51.50 kg', masterLimit: 'Até 51.50 kg', juvenilLimit: 'Até 46.50 kg' },
  { class: 'Pena', adultLimit: 'Até 56.50 kg', masterLimit: 'Até 56.50 kg', juvenilLimit: 'Até 50.50 kg' },
  { class: 'Leve', adultLimit: 'Até 61.50 kg', masterLimit: 'Até 61.50 kg', juvenilLimit: 'Até 54.50 kg' },
  { class: 'Médio', adultLimit: 'Até 66.50 kg', masterLimit: 'Até 66.50 kg', juvenilLimit: 'Até 58.50 kg' },
  { class: 'Meio-Pesado', adultLimit: 'Até 71.50 kg', masterLimit: 'Até 71.50 kg', juvenilLimit: 'Até 62.50 kg' },
  { class: 'Pesado', adultLimit: 'Até 76.50 kg', masterLimit: 'Até 76.50 kg', juvenilLimit: 'Até 66.50 kg' },
  { class: 'Super-Pesado', adultLimit: 'Sem limite de peso', masterLimit: 'Sem limite de peso', juvenilLimit: 'Sem limite' }
];
