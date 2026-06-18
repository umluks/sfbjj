import React, { useState } from 'react';
import { Award, Eye, BookOpen, AlertCircle, Check, Download, Printer, Scale, Skull, FileText } from 'lucide-react';

interface BeltInfo {
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

interface IllegalMove {
  move: string;
  belts: string;
  ages: string;
  penalty: string;
}

interface WeightDivision {
  class: string;
  adultLimit: string;
  masterLimit: string;
  juvenilLimit?: string;
}

export const GraduationSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'poster' | 'rules' | 'calculator-belts' | 'calculator-weights' | 'weights' | 'fouls'>('poster');
  const [selectedBelt, setSelectedBelt] = useState<BeltInfo | null>(null);
  const [calcAge, setCalcAge] = useState<number>(18);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | 'infantil' | 'adulto'>('all');
  
  // Filtros da Tabela de Pesos
  const [weightTab, setWeightTab] = useState<'masc-gi' | 'masc-nogi' | 'fem-gi' | 'fem-nogi'>('masc-gi');

  // Dados oficiais do Sistema de Graduação IBJJF
  const belts: BeltInfo[] = [
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
      description: 'O verdadeiro início dos estudos do Jiu-Jitsu. Representa maestria técnica, autodisciplina e a responsabilidade de passar a tradição adiante. Possui do 0 ao 6º Grau.',
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

  // Faltas Técnicas e Movimentos Ilegais (Tabela oficial simplificada)
  const illegalMoves: IllegalMove[] = [
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

  // Pesos Oficiais Masculino (Adulto e Juvenil)
  const weightsMascGi: WeightDivision[] = [
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

  const weightsMascNoGi: WeightDivision[] = [
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

  // Pesos Oficiais Feminino
  const weightsFemGi: WeightDivision[] = [
    { class: 'Galo', adultLimit: 'Até 48.50 kg', masterLimit: 'Até 48.50 kg', juvenilLimit: 'Até 44.30 kg' },
    { class: 'Pluma', adultLimit: 'Até 53.50 kg', masterLimit: 'Até 53.50 kg', juvenilLimit: 'Até 48.30 kg' },
    { class: 'Pena', adultLimit: 'Até 58.50 kg', masterLimit: 'Até 58.50 kg', juvenilLimit: 'Até 52.50 kg' },
    { class: 'Leve', adultLimit: 'Até 64.00 kg', masterLimit: 'Até 64.00 kg', juvenilLimit: 'Até 56.50 kg' },
    { class: 'Médio', adultLimit: 'Até 69.00 kg', masterLimit: 'Até 69.00 kg', juvenilLimit: 'Até 60.50 kg' },
    { class: 'Meio-Pesado', adultLimit: 'Até 74.00 kg', masterLimit: 'Até 74.00 kg', juvenilLimit: 'Até 65.00 kg' },
    { class: 'Pesado', adultLimit: 'Até 79.30 kg', masterLimit: 'Até 79.30 kg', juvenilLimit: 'Até 69.00 kg' },
    { class: 'Super-Pesado', adultLimit: 'Sem limite de peso', masterLimit: 'Sem limite de peso', juvenilLimit: 'Sem limite' }
  ];

  const weightsFemNoGi: WeightDivision[] = [
    { class: 'Galo', adultLimit: 'Até 46.50 kg', masterLimit: 'Até 46.50 kg', juvenilLimit: 'Até 42.50 kg' },
    { class: 'Pluma', adultLimit: 'Até 51.50 kg', masterLimit: 'Até 51.50 kg', juvenilLimit: 'Até 46.50 kg' },
    { class: 'Pena', adultLimit: 'Até 56.50 kg', masterLimit: 'Até 56.50 kg', juvenilLimit: 'Até 50.50 kg' },
    { class: 'Leve', adultLimit: 'Até 61.50 kg', masterLimit: 'Até 61.50 kg', juvenilLimit: 'Até 54.50 kg' },
    { class: 'Médio', adultLimit: 'Até 66.50 kg', masterLimit: 'Até 66.50 kg', juvenilLimit: 'Até 58.50 kg' },
    { class: 'Meio-Pesado', adultLimit: 'Até 71.50 kg', masterLimit: 'Até 71.50 kg', juvenilLimit: 'Até 62.50 kg' },
    { class: 'Pesado', adultLimit: 'Até 76.50 kg', masterLimit: 'Até 76.50 kg', juvenilLimit: 'Até 66.50 kg' },
    { class: 'Super-Pesado', adultLimit: 'Sem limite de peso', masterLimit: 'Sem limite de peso', juvenilLimit: 'Sem limite' }
  ];

  const getBeltBackground = (belt: BeltInfo) => {
    if (belt.name === 'Vermelha e Preta (Coral)') {
      return 'linear-gradient(45deg, #FF1A1A 25%, #151518 25%, #151518 50%, #FF1A1A 50%, #FF1A1A 75%, #151518 75%, #151518 100%)';
    }
    if (belt.name === 'Vermelha e Branca (Coral)') {
      return 'linear-gradient(45deg, #FF1A1A 25%, #FFFFFF 25%, #FFFFFF 50%, #FF1A1A 50%, #FF1A1A 75%, #FFFFFF 75%, #FFFFFF 100%)';
    }
    return belt.color;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // URL oficial do Poster de Graduação IBJJF
    window.open('https://ibjjf.com/sites/default/files/2024-02/IBJJF_Graduation_System_Poster_Port.pdf', '_blank');
  };

  const handleDownloadRulebook = () => {
    // URL oficial do Livro de Regras IBJJF
    window.open('https://ibjjf.com/sites/default/files/2024-02/IBJJF_Rules_Book_v5.2_Port.pdf', '_blank');
  };

  const filteredBelts = belts.filter(belt => {
    const matchesCategory = selectedCategoryFilter === 'all' || 
                            (selectedCategoryFilter === 'infantil' && belt.category === 'infantil') ||
                            (selectedCategoryFilter === 'adulto' && (belt.category === 'adulto' || belt.category === 'coral_vermelha'));
    return matchesCategory;
  });

  const getEligibleBelts = (age: number) => {
    return belts.filter(belt => {
      if (age < belt.minAge) return false;
      if (belt.maxAge && age > belt.maxAge) return false;
      return true;
    });
  };

  const eligibleBelts = getEligibleBelts(calcAge);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-16 print:bg-white print:text-black">
      
      {/* Header da Página */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-obsidian-850 pb-6 print:hidden">
        <div>
          <span className="text-xs font-bold text-zinc-550 uppercase tracking-widest block mb-1">
            Regulamentação Oficial
          </span>
          <h1 className="text-3xl font-black tracking-tight text-slate-100 uppercase">
            Sistema Geral de Graduação IBJJF
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Consulte faixas, tempos de carência, livro de regras, golpes ilegais e pesos oficiais para competições.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-2 bg-obsidian-900/60 border border-obsidian-850/80 p-1.5 rounded-xl shadow-lg backdrop-blur-md">
          <button
            onClick={() => setActiveTab('poster')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all duration-300 border ${
              activeTab === 'poster'
                ? 'bg-slate-100 border-slate-200 text-obsidian-950 font-black shadow-md shadow-black/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-obsidian-850/40'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Poster de Faixas
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all duration-300 border ${
              activeTab === 'rules'
                ? 'bg-slate-100 border-slate-200 text-obsidian-950 font-black shadow-md shadow-black/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-obsidian-850/40'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Livro de Regras
          </button>
          <button
            onClick={() => setActiveTab('fouls')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all duration-300 border ${
              activeTab === 'fouls'
                ? 'bg-slate-100 border-slate-200 text-obsidian-950 font-black shadow-md shadow-black/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-obsidian-850/40'
            }`}
          >
            <Skull className="w-3.5 h-3.5" />
            Golpes Ilegais
          </button>
          <button
            onClick={() => setActiveTab('weights')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all duration-300 border ${
              activeTab === 'weights'
                ? 'bg-slate-100 border-slate-200 text-obsidian-950 font-black shadow-md shadow-black/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-obsidian-850/40'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            Tabela de Pesos
          </button>
          <button
            onClick={() => setActiveTab('calculator-belts')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all duration-300 border ${
              activeTab === 'calculator-belts'
                ? 'bg-slate-100 border-slate-200 text-obsidian-950 font-black shadow-md shadow-black/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-obsidian-850/40'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Calculadora Faixas
          </button>
          <button
            onClick={() => setActiveTab('calculator-weights')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all duration-300 border ${
              activeTab === 'calculator-weights'
                ? 'bg-slate-100 border-slate-200 text-obsidian-950 font-black shadow-md shadow-black/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-obsidian-850/40'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            Calculadora Pesos
          </button>
        </div>
      </div>

      {/* -------------------- TAB 1: POSTER INTERATIVO + DOWNLOAD -------------------- */}
      {activeTab === 'poster' && (
        <div className="space-y-6">
          
          {/* Ações de Impressão e Download */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-obsidian-900 p-4 border border-obsidian-800 print:hidden">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mr-2 shrink-0">Visualização:</span>
              <button
                onClick={() => setSelectedCategoryFilter('all')}
                className={`px-3 py-1.5 font-bold text-[9px] uppercase tracking-wider border transition-all ${
                  selectedCategoryFilter === 'all'
                    ? 'border-zinc-300 bg-zinc-300 text-obsidian-950'
                    : 'border-obsidian-750 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setSelectedCategoryFilter('infantil')}
                className={`px-3 py-1.5 font-bold text-[9px] uppercase tracking-wider border transition-all ${
                  selectedCategoryFilter === 'infantil'
                    ? 'border-zinc-300 bg-zinc-300 text-obsidian-950'
                    : 'border-obsidian-750 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Infantil
              </button>
              <button
                onClick={() => setSelectedCategoryFilter('adulto')}
                className={`px-3 py-1.5 font-bold text-[9px] uppercase tracking-wider border transition-all ${
                  selectedCategoryFilter === 'adulto'
                    ? 'border-zinc-300 bg-zinc-300 text-obsidian-950'
                    : 'border-obsidian-750 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Adulto
              </button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-obsidian-850 hover:bg-obsidian-800 text-zinc-300 hover:text-slate-100 border border-obsidian-750 font-bold text-[9px] uppercase tracking-wider transition-colors"
                title="Imprimir Poster Local"
              >
                <Printer className="w-3.5 h-3.5" /> Imprensa
              </button>
              
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gold-500/10 hover:bg-gold-500/20 text-gold-450 hover:text-gold-400 border border-gold-500/20 font-bold text-[9px] uppercase tracking-wider transition-colors"
                title="Baixar Poster Oficial IBJJF PDF"
              >
                <Download className="w-3.5 h-3.5" /> Baixar Poster Oficial PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Grid Visual do Poster */}
            <div className="lg:col-span-8 space-y-8 print:w-full print:col-span-12">
              
              {/* Categoria: Infantil */}
              {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'infantil') && (
                <div className="space-y-4">
                  <div className="border-l-2 border-zinc-500 pl-3 print:border-black">
                    <h3 className="text-sm font-black tracking-widest text-zinc-300 uppercase print:text-black">
                      Graduação Infantil (4 a 15 anos)
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredBelts.filter(b => b.category === 'infantil').map((belt) => (
                      <button
                        key={belt.name}
                        onClick={() => setSelectedBelt(belt)}
                        className={`group p-4 bg-obsidian-900 border transition-all duration-300 text-left flex flex-col justify-between h-40 hover:-translate-y-1 print:border-black print:bg-white print:text-black ${
                          selectedBelt?.name === belt.name
                            ? 'border-zinc-300 shadow-gold-glow bg-obsidian-850'
                            : 'border-obsidian-800 hover:border-obsidian-750'
                        }`}
                      >
                        <div 
                          className="w-full h-7 border border-black/20 flex items-center justify-end relative shadow-inner overflow-hidden mb-3"
                          style={{ background: getBeltBackground(belt) }}
                        >
                          {belt.barColor && (
                            <div className="w-1/3 h-full absolute right-0 flex items-center justify-around px-1" style={{ backgroundColor: belt.barColor }}>
                              <div className="w-[2px] h-3/4 bg-white/70 opacity-30" />
                              <div className="w-[2px] h-3/4 bg-white/70 opacity-30" />
                              <div className="w-[2px] h-3/4 bg-white/70 opacity-30" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-100 truncate print:text-black">
                            {belt.name}
                          </h4>
                          <span className="text-[10px] text-zinc-500 block mt-1">
                            Idade: {belt.minAge} a 15 anos
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Categoria: Adulto & Master */}
              {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'adulto') && (
                <div className="space-y-4">
                  <div className="border-l-2 border-zinc-450 pl-3 print:border-black">
                    <h3 className="text-sm font-black tracking-widest text-zinc-300 uppercase print:text-black">
                      Graduação Adulto e Master (16+ anos)
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredBelts.filter(b => b.category === 'adulto' || b.category === 'coral_vermelha').map((belt) => (
                      <button
                        key={belt.name}
                        onClick={() => setSelectedBelt(belt)}
                        className={`group p-4 bg-obsidian-900 border transition-all duration-300 text-left flex flex-col justify-between h-40 hover:-translate-y-1 print:border-black print:bg-white print:text-black ${
                          selectedBelt?.name === belt.name
                            ? 'border-zinc-300 shadow-gold-glow bg-obsidian-850'
                            : 'border-obsidian-800 hover:border-obsidian-750'
                        }`}
                      >
                        <div 
                          className="w-full h-7 border border-black/20 flex items-center justify-end relative shadow-inner overflow-hidden mb-3"
                          style={{ background: getBeltBackground(belt) }}
                        >
                          {belt.barColor && (
                            <div className="w-1/3 h-full absolute right-2 flex items-center justify-center gap-[2px] px-1 border-y border-black" style={{ backgroundColor: belt.barColor }}>
                              <div className="w-[3px] h-[80%] bg-white" />
                              <div className="w-[3px] h-[80%] bg-white" />
                            </div>
                          )}
                          <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-black/40" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-100 print:text-black">
                            {belt.name}
                          </h4>
                          <span className="text-[10px] text-zinc-500 block mt-1">
                            Idade Mínima: {belt.minAge} anos
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Painel de Detalhes Lateral */}
            <div className="lg:col-span-4 bg-obsidian-900 border border-obsidian-800 p-6 sticky top-24 print:hidden">
              {selectedBelt ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase tracking-widest font-black text-zinc-500">Faixa Selecionada</span>
                    <h3 className="text-xl font-black text-slate-100">{selectedBelt.name}</h3>
                    
                    <div 
                      className="w-full h-12 border border-black/30 flex items-center justify-end relative overflow-hidden shadow-lg"
                      style={{ background: getBeltBackground(selectedBelt) }}
                    >
                      {selectedBelt.barColor && (
                        <div className="w-1/4 h-full absolute right-6 flex items-center justify-center gap-1 px-1.5" style={{ backgroundColor: selectedBelt.barColor }}>
                          {Array.from({ length: Math.min(4, selectedBelt.stripes || 0) }).map((_, i) => (
                            <div key={i} className="w-[4px] h-[85%] bg-white" />
                          ))}
                        </div>
                      )}
                      <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-black/40" />
                    </div>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-obsidian-950 border border-obsidian-850">
                        <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider block mb-1">Idade Mínima</span>
                        <span className="font-extrabold text-slate-250 text-sm">{selectedBelt.minAge} anos</span>
                      </div>
                      <div className="p-3 bg-obsidian-950 border border-obsidian-850">
                        <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider block mb-1">Carência Mínima</span>
                        <span className="font-extrabold text-slate-250 text-[11.5px] leading-tight block">{selectedBelt.minTime}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-obsidian-950 border border-obsidian-850">
                      <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider block mb-1">Graus (Pontas)</span>
                      <p className="text-slate-300 leading-relaxed">
                        Pode receber até <strong className="text-slate-100">{selectedBelt.stripes} graus</strong> antes de progredir de faixa.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider block">Descrição & Foco Técnico</span>
                      <p className="text-slate-400 leading-relaxed text-justify">
                        {selectedBelt.description}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-96 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-obsidian-850">
                  <Award className="w-12 h-12 text-zinc-700 animate-pulse mb-3" />
                  <h4 className="font-bold text-slate-250 text-sm">Selecione uma faixa</h4>
                  <p className="text-xs text-zinc-500 mt-1 max-w-[200px]">
                    Clique em qualquer faixa à esquerda para visualizar seus detalhes de graduação.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* -------------------- TAB 2: LIVRO DE REGRAS -------------------- */}
      {activeTab === 'rules' && (
        <div className="space-y-8 max-w-4xl mx-auto">
          
          <div className="bg-obsidian-900 border border-obsidian-800 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-obsidian-800 pb-4">
              <div>
                <h3 className="text-sm font-black tracking-widest text-zinc-200 uppercase flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gold-500" /> Livro de Regras Oficiais IBJJF
                </h3>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Última atualização consolidada do Livro de Regras Técnicas de Jiu-Jitsu.
                </p>
              </div>
              <button
                onClick={handleDownloadRulebook}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gold-500/10 hover:bg-gold-500/20 text-gold-450 hover:text-gold-400 border border-gold-500/20 font-bold text-[9px] uppercase tracking-wider transition-colors shrink-0"
              >
                <Download className="w-3.5 h-3.5" /> Baixar Livro de Regras (PDF)
              </button>
            </div>

            {/* Pontuação Oficial */}
            <div className="space-y-4">
              <h4 className="text-xs font-black tracking-widest text-zinc-300 uppercase">
                Sistema de Pontuação de Luta (Pontos por Posição)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-obsidian-950 border border-obsidian-850">
                  <span className="text-2xl font-black text-slate-100 block">4</span>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1 block">Montada / Costas</span>
                </div>
                <div className="p-4 bg-obsidian-950 border border-obsidian-850">
                  <span className="text-2xl font-black text-slate-100 block">3</span>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1 block">Passagem de Guarda</span>
                </div>
                <div className="p-4 bg-obsidian-950 border border-obsidian-850">
                  <span className="text-2xl font-black text-slate-100 block">2</span>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1 block">Queda / Raspagem / Joelho Barriga</span>
                </div>
                <div className="p-4 bg-obsidian-950 border border-obsidian-850">
                  <span className="text-2xl font-black text-slate-100 block">Vantagens</span>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1 block">Quase Pontuações / Ataque Perigoso</span>
                </div>
              </div>
            </div>

            {/* Tempos de Luta */}
            <div className="space-y-4">
              <h4 className="text-xs font-black tracking-widest text-zinc-300 uppercase">
                Duração das Lutas (Categoria Adulto por Faixa)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs text-center">
                <div className="p-3 bg-obsidian-950 border border-obsidian-850">
                  <span className="font-extrabold text-slate-200 block">Branca</span>
                  <span className="text-zinc-500 font-semibold block mt-1">5 minutos</span>
                </div>
                <div className="p-3 bg-obsidian-950 border border-obsidian-850">
                  <span className="font-extrabold text-slate-200 block">Azul</span>
                  <span className="text-zinc-500 font-semibold block mt-1">6 minutos</span>
                </div>
                <div className="p-3 bg-obsidian-950 border border-obsidian-850">
                  <span className="font-extrabold text-slate-200 block">Roxa</span>
                  <span className="text-zinc-500 font-semibold block mt-1">7 minutos</span>
                </div>
                <div className="p-3 bg-obsidian-950 border border-obsidian-850">
                  <span className="font-extrabold text-slate-200 block">Marrom</span>
                  <span className="text-zinc-500 font-semibold block mt-1">8 minutos</span>
                </div>
                <div className="p-3 bg-obsidian-950 border border-obsidian-850">
                  <span className="font-extrabold text-slate-200 block">Preta</span>
                  <span className="text-zinc-500 font-semibold block mt-1">10 minutos</span>
                </div>
              </div>
            </div>

            {/* Punições e Faltas Disciplinares */}
            <div className="p-4 bg-obsidian-950 border border-obsidian-850 text-xs text-slate-400 space-y-2">
              <span className="font-bold text-slate-350 block uppercase tracking-wider">
                Progressão de Faltas por Falta de Combatividade (Amarrar a Luta)
              </span>
              <ul className="list-decimal pl-5 space-y-1.5">
                <li><strong>1ª Falta:</strong> Advertência Verbal do Árbitro.</li>
                <li><strong>2ª Falta:</strong> Punição (1 ponto concedido ao oponente).</li>
                <li><strong>3ª Falta:</strong> Punição Gravíssima (2 pontos concedidos ao oponente).</li>
                <li><strong>4ª Falta:</strong> Desclassificação imediata do atleta infrator.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- TAB 3: GOLPES ILEGAIS -------------------- */}
      {activeTab === 'fouls' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="bg-obsidian-900 border border-obsidian-800 p-6 space-y-6">
            <div>
              <h3 className="text-sm font-black tracking-widest text-zinc-200 uppercase flex items-center gap-2">
                <Skull className="w-4 h-4 text-red-500" /> Movimentos Proibidos & Golpes Ilegais
              </h3>
              <p className="text-[11px] text-zinc-500 mt-1">
                Faltas técnicas graves e movimentos que resultam em penalização ou desclassificação instantânea baseada nas faixas e faixas etárias.
              </p>
            </div>

            <div className="overflow-x-auto border border-obsidian-850">
              <table className="w-full text-left text-xs text-slate-350 border-collapse">
                <thead>
                  <tr className="border-b border-obsidian-800 bg-obsidian-950 text-zinc-450 uppercase tracking-widest text-[9px]">
                    <th className="py-3.5 px-4">Golpe / Movimento</th>
                    <th className="py-3.5 px-4">Faixa Banida</th>
                    <th className="py-3.5 px-4">Idade Banida</th>
                    <th className="py-3.5 px-4 text-right">Punição</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-obsidian-850">
                  {illegalMoves.map((foul, index) => (
                    <tr key={index} className="hover:bg-obsidian-850/30">
                      <td className="py-3.5 px-4 font-bold text-slate-200">{foul.move}</td>
                      <td className="py-3.5 px-4 font-mono text-[10px] text-zinc-450">{foul.belts}</td>
                      <td className="py-3.5 px-4 text-zinc-400">{foul.ages}</td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-red-400 text-[10px] uppercase">{foul.penalty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 bg-red-950/10 border border-red-900/20 text-xs text-red-400/90 leading-relaxed flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-1">Atenção no Tatame (Bate-Estaca / Slam):</span>
                Elevar o oponente que o está mantendo em triângulo ou chave de braço na guarda e batê-lo intencionalmente contra o tatame é considerado **Bate-Estaca**, resultando em desclassificação imediata do infrator em **todas** as categorias e faixas competitivas sob as regras CBJJ/IBJJF.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- TAB 4: TABELA DE PESOS E CATEGORIAS -------------------- */}
      {activeTab === 'weights' && (
        <div className="space-y-6 max-w-6xl mx-auto">
          
          <div className="bg-obsidian-900 border border-obsidian-800 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-obsidian-850 pb-4">
              <div>
                <h3 className="text-sm font-black tracking-widest text-zinc-200 uppercase flex items-center gap-2">
                  <Scale className="w-4 h-4 text-gold-500" /> Tabela de Pesos IBJJF
                </h3>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Verifique os pesos limites oficiais para competições com Kimono (Gi) ou sem Kimono (No-Gi).
                </p>
              </div>

              {/* Sub-abas de peso */}
              <div className="flex flex-wrap gap-1 bg-obsidian-950 border border-obsidian-850 p-1 shrink-0">
                <button
                  onClick={() => setWeightTab('masc-gi')}
                  className={`px-2.5 py-1 text-[9px] uppercase tracking-wider font-bold transition-all ${
                    weightTab === 'masc-gi' ? 'bg-zinc-200 text-obsidian-950' : 'text-zinc-550 hover:text-zinc-300'
                  }`}
                >
                  Masc. (Gi)
                </button>
                <button
                  onClick={() => setWeightTab('masc-nogi')}
                  className={`px-2.5 py-1 text-[9px] uppercase tracking-wider font-bold transition-all ${
                    weightTab === 'masc-nogi' ? 'bg-zinc-200 text-obsidian-950' : 'text-zinc-550 hover:text-zinc-300'
                  }`}
                >
                  Masc. (No-Gi)
                </button>
                <button
                  onClick={() => setWeightTab('fem-gi')}
                  className={`px-2.5 py-1 text-[9px] uppercase tracking-wider font-bold transition-all ${
                    weightTab === 'fem-gi' ? 'bg-zinc-200 text-obsidian-950' : 'text-zinc-550 hover:text-zinc-300'
                  }`}
                >
                  Fem. (Gi)
                </button>
                <button
                  onClick={() => setWeightTab('fem-nogi')}
                  className={`px-2.5 py-1 text-[9px] uppercase tracking-wider font-bold transition-all ${
                    weightTab === 'fem-nogi' ? 'bg-zinc-200 text-obsidian-950' : 'text-zinc-550 hover:text-zinc-300'
                  }`}
                >
                  Fem. (No-Gi)
                </button>
              </div>
            </div>

            {/* Renderizar Tabela Correspondente */}
            <div className="overflow-x-auto border border-obsidian-850">
              <table className="w-full text-left text-xs text-slate-350 border-collapse">
                <thead>
                  <tr className="border-b border-obsidian-800 bg-obsidian-950 text-zinc-450 uppercase tracking-widest text-[9px]">
                    <th className="py-3.5 px-4">Categoria de Peso</th>
                    <th className="py-3.5 px-4">Adulto (18-29)</th>
                    <th className="py-3.5 px-4">Master 1 (30-35)</th>
                    <th className="py-3.5 px-4">Master 2+ (36+)</th>
                    <th className="py-3.5 px-4 text-right">Juvenil (16-17)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-obsidian-850">
                  {/* Masculino Com Kimono */}
                  {weightTab === 'masc-gi' && weightsMascGi.map((row, idx) => (
                    <tr key={idx} className="hover:bg-obsidian-850/30">
                      <td className="py-3.5 px-4 font-bold text-slate-200">{row.class}</td>
                      <td className="py-3.5 px-4 text-zinc-350">{row.adultLimit}</td>
                      <td className="py-3.5 px-4 text-zinc-400">{row.masterLimit}</td>
                      <td className="py-3.5 px-4 text-zinc-450">{row.masterLimit}</td>
                      <td className="py-3.5 px-4 text-right text-zinc-450">{row.juvenilLimit || 'N/A'}</td>
                    </tr>
                  ))}
                  
                  {/* Masculino Sem Kimono */}
                  {weightTab === 'masc-nogi' && weightsMascNoGi.map((row, idx) => (
                    <tr key={idx} className="hover:bg-obsidian-850/30">
                      <td className="py-3.5 px-4 font-bold text-slate-200">{row.class}</td>
                      <td className="py-3.5 px-4 text-zinc-350">{row.adultLimit}</td>
                      <td className="py-3.5 px-4 text-zinc-400">{row.masterLimit}</td>
                      <td className="py-3.5 px-4 text-zinc-450">{row.masterLimit}</td>
                      <td className="py-3.5 px-4 text-right text-zinc-450">{row.juvenilLimit || 'N/A'}</td>
                    </tr>
                  ))}

                  {/* Feminino Com Kimono */}
                  {weightTab === 'fem-gi' && weightsFemGi.map((row, idx) => (
                    <tr key={idx} className="hover:bg-obsidian-850/30">
                      <td className="py-3.5 px-4 font-bold text-slate-200">{row.class}</td>
                      <td className="py-3.5 px-4 text-zinc-350">{row.adultLimit}</td>
                      <td className="py-3.5 px-4 text-zinc-400">{row.masterLimit}</td>
                      <td className="py-3.5 px-4 text-zinc-450">{row.masterLimit}</td>
                      <td className="py-3.5 px-4 text-right text-zinc-450">{row.juvenilLimit || 'N/A'}</td>
                    </tr>
                  ))}

                  {/* Feminino Sem Kimono */}
                  {weightTab === 'fem-nogi' && weightsFemNoGi.map((row, idx) => (
                    <tr key={idx} className="hover:bg-obsidian-850/30">
                      <td className="py-3.5 px-4 font-bold text-slate-200">{row.class}</td>
                      <td className="py-3.5 px-4 text-zinc-350">{row.adultLimit}</td>
                      <td className="py-3.5 px-4 text-zinc-400">{row.masterLimit}</td>
                      <td className="py-3.5 px-4 text-zinc-450">{row.masterLimit}</td>
                      <td className="py-3.5 px-4 text-right text-zinc-450">{row.juvenilLimit || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-obsidian-950 border border-obsidian-850 text-xs text-zinc-500 leading-relaxed space-y-1">
              <span className="font-bold text-zinc-400 block">Dica de Competição (Pesagem):</span>
              <p>Nas lutas <strong>Com Kimono (Gi)</strong>, a pesagem ocorre imediatamente antes da primeira luta do atleta, já usando o Kimono. Nas competições <strong>Sem Kimono (No-Gi)</strong>, o atleta deve estar vestindo a bermuda e rashguard oficial de competição no momento de subir na balança.</p>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- TAB 5: CALCULADORA DE ELEGIBILIDADE DE FAIXAS -------------------- */}
      {activeTab === 'calculator-belts' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-obsidian-900 border border-obsidian-800 p-6 md:p-8 space-y-6">
            <div className="text-center max-w-xl mx-auto">
              <h3 className="text-md font-black tracking-widest text-zinc-200 uppercase">
                Calculadora de Elegibilidade de Faixas
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Insira a idade para visualizar quais faixas e grupos da IBJJF são permitidos.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 bg-obsidian-950 p-6 border border-obsidian-850">
              <label htmlFor="calc-age-input" className="text-xs font-bold text-zinc-550 uppercase tracking-widest">
                Idade do Praticante: <span className="text-slate-100 text-lg font-black ml-1">{calcAge} anos</span>
              </label>
              <div className="w-full flex items-center gap-4">
                <span className="text-[10px] text-zinc-650 font-bold">4 anos</span>
                <input
                  id="calc-age-input"
                  type="range"
                  min="4"
                  max="80"
                  value={calcAge}
                  onChange={(e) => setCalcAge(parseInt(e.target.value))}
                  className="flex-1 accent-zinc-350 cursor-pointer bg-obsidian-800 h-1.5 rounded-none"
                />
                <span className="text-[10px] text-zinc-650 font-bold">80 anos</span>
              </div>
              <div className="flex gap-2">
                {[8, 12, 16, 18, 30, 50].map((quickAge) => (
                  <button
                    key={quickAge}
                    onClick={() => setCalcAge(quickAge)}
                    className="px-2.5 py-1 bg-obsidian-900 hover:bg-obsidian-850 border border-obsidian-800 text-[10px] font-bold text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    {quickAge} anos
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black tracking-widest text-zinc-300 uppercase flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" /> Faixas Elegíveis para {calcAge} anos:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {eligibleBelts.map((belt) => (
                  <div key={belt.name} className="p-4 bg-obsidian-950 border border-obsidian-850 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-4 border border-black/20 shrink-0 relative overflow-hidden" style={{ background: getBeltBackground(belt) }}>
                        <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-black/40" />
                      </div>
                      <div>
                        <span className="font-extrabold text-xs text-slate-200 block">{belt.name}</span>
                        <span className="text-[9px] text-zinc-500 uppercase tracking-wider block mt-0.5">
                          Min: {belt.minAge} anos {belt.maxAge ? `| Max: ${belt.maxAge} anos` : ''}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-zinc-500 block uppercase tracking-widest">Carência</span>
                      <span className="text-[10px] font-bold text-slate-350">{belt.minTime === 'Nenhuma carência' ? 'Livre' : belt.minTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- TAB 6: CALCULADORA DE PESOS E CATEGORIAS -------------------- */}
      {activeTab === 'calculator-weights' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-obsidian-900 border border-obsidian-800 p-6 md:p-8 space-y-6">
            <WeightAndCategoryCalculator 
              weightsMascGi={weightsMascGi} 
              weightsMascNoGi={weightsMascNoGi} 
              weightsFemGi={weightsFemGi} 
              weightsFemNoGi={weightsFemNoGi} 
            />
          </div>
        </div>
      )}

    </div>
  );
};

// Componente Interno Auxiliar para a Calculadora de Pesos e Categorias
const WeightAndCategoryCalculator: React.FC<{
  weightsMascGi: WeightDivision[];
  weightsMascNoGi: WeightDivision[];
  weightsFemGi: WeightDivision[];
  weightsFemNoGi: WeightDivision[];
}> = ({ weightsMascGi, weightsMascNoGi, weightsFemGi, weightsFemNoGi }) => {
  const currentYear = new Date().getFullYear();
  const [birthYear, setBirthYear] = useState<number>(currentYear - 25);
  const [gender, setGender] = useState<'masculino' | 'feminino'>('masculino');
  const [modality, setModality] = useState<'gi' | 'nogi'>('gi');
  const [weightKg, setWeightKg] = useState<number>(75);
  const [beltColor, setBeltColor] = useState<string>('Branca');

  const calculatedAge = currentYear - birthYear;

  // Tabela de Categorias, Faixa-Etária e Tempo Regulamentar
  const getCategoryAndFightTime = (age: number, belt: string) => {
    let category = '';
    let fightTime = '';
    let isMasterOrAdult = false;

    if (age === 4) {
      category = 'PRÉ-MIRIM I';
      fightTime = '02 minutos';
    } else if (age === 5) {
      category = 'PRÉ-MIRIM II';
      fightTime = '02 minutos';
    } else if (age === 6) {
      category = 'PRÉ-MIRIM III';
      fightTime = '02 minutos';
    } else if (age === 7) {
      category = 'MIRIM I';
      fightTime = '03 minutos';
    } else if (age === 8) {
      category = 'MIRIM II';
      fightTime = '03 minutos';
    } else if (age === 9) {
      category = 'MIRIM III';
      fightTime = '03 minutos';
    } else if (age === 10) {
      category = 'INFANTIL I';
      fightTime = '04 minutos';
    } else if (age === 11) {
      category = 'INFANTIL II';
      fightTime = '04 minutos';
    } else if (age === 12) {
      category = 'INFANTIL III';
      fightTime = '04 minutos';
    } else if (age === 13) {
      category = 'INFANTO-JUVENIL I';
      fightTime = '04 minutos';
    } else if (age === 14) {
      category = 'INFANTO-JUVENIL II';
      fightTime = '04 minutos';
    } else if (age === 15) {
      category = 'INFANTO-JUVENIL III';
      fightTime = '04 minutos';
    } else if (age === 16) {
      category = 'JUVENIL I';
      fightTime = '05 minutos';
    } else if (age === 17) {
      category = 'JUVENIL II';
      fightTime = '05 minutos';
    } else if (age >= 18 && age < 30) {
      category = 'ADULTO';
      isMasterOrAdult = true;
      if (belt === 'Branca') fightTime = '05 minutos';
      else if (belt === 'Azul') fightTime = '06 minutos';
      else if (belt === 'Roxa') fightTime = '07 minutos';
      else if (belt === 'Marrom') fightTime = '08 minutos';
      else fightTime = '10 minutos'; // Preta
    } else if (age >= 30 && age < 36) {
      category = 'MASTER 1';
      isMasterOrAdult = true;
      if (belt === 'Branca' || belt === 'Azul') fightTime = '05 minutos';
      else fightTime = '06 minutos'; // Roxa, Marrom, Preta
    } else if (age >= 36 && age < 41) {
      category = 'MASTER 2';
      isMasterOrAdult = true;
      fightTime = '05 minutos';
    } else if (age >= 41 && age < 46) {
      category = 'MASTER 3';
      isMasterOrAdult = true;
      fightTime = '05 minutos';
    } else if (age >= 46 && age < 51) {
      category = 'MASTER 4';
      isMasterOrAdult = true;
      fightTime = '05 minutos';
    } else if (age >= 51 && age < 56) {
      category = 'MASTER 5';
      isMasterOrAdult = true;
      fightTime = '05 minutos';
    } else if (age >= 56 && age < 61) {
      category = 'MASTER 6';
      isMasterOrAdult = true;
      fightTime = '05 minutos';
    } else if (age >= 61) {
      category = 'MASTER 7';
      isMasterOrAdult = true;
      fightTime = '05 minutos';
    } else {
      category = 'Não elegível (Idade inferior a 4 anos)';
      fightTime = '0 minutos';
    }

    return { category, fightTime, isMasterOrAdult };
  };

  const { category: finalCategory, fightTime: finalFightTime } = getCategoryAndFightTime(calculatedAge, beltColor);

  // Determinar limite de peso e divisão baseados no peso informado e dados da tabela
  const getWeightClass = () => {
    let activeList: WeightDivision[] = [];
    if (gender === 'masculino') {
      activeList = modality === 'gi' ? weightsMascGi : weightsMascNoGi;
    } else {
      activeList = modality === 'gi' ? weightsFemGi : weightsFemNoGi;
    }

    // Filtragem simples baseada nos limites de peso da tabela
    // Extrai o número do limite (ex: "Até 76.00 kg" -> 76.00)
    const parseLimit = (limitStr: string): number => {
      if (limitStr.includes('Sem limite') || limitStr.includes('Sem limite de peso')) return 999;
      const match = limitStr.match(/[\d.]+/);
      return match ? parseFloat(match[0]) : 999;
    };

    // Identifica a coluna correta a consultar
    let divisionFound = activeList[activeList.length - 1]; // Padrão: Pesadíssimo/Ultra-pesado
    
    for (const div of activeList) {
      let limitStr = div.adultLimit;
      if (calculatedAge >= 30) {
        limitStr = div.masterLimit;
      } else if (calculatedAge === 16 || calculatedAge === 17) {
        limitStr = div.juvenilLimit || div.adultLimit;
      }
      
      const limitVal = parseLimit(limitStr);
      if (weightKg <= limitVal) {
        divisionFound = div;
        break;
      }
    }

    let limitText = divisionFound.adultLimit;
    if (calculatedAge >= 30) {
      limitText = divisionFound.masterLimit;
    } else if (calculatedAge === 16 || calculatedAge === 17) {
      limitText = divisionFound.juvenilLimit || divisionFound.adultLimit;
    }

    return {
      name: divisionFound.class,
      limit: limitText
    };
  };

  const weightClass = getWeightClass();

  return (
    <div className="mt-8 border-t border-obsidian-850 pt-8 space-y-6">
      <div className="border-l-2 border-gold-500 pl-3">
        <h3 className="text-sm font-black tracking-widest text-zinc-300 uppercase">
          Calculadora Dinâmica de Pesos e Categorias
        </h3>
        <p className="text-[11px] text-zinc-550 mt-1">
          Informe seu ano de nascimento e dados físicos para saber exatamente sua categoria, tempo regulamentar de luta e divisão de peso oficial.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-obsidian-950 p-6 border border-obsidian-850">
        
        {/* Entradas */}
        <div className="md:col-span-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
                Ano de Nascimento
              </label>
              <input
                type="number"
                min={currentYear - 90}
                max={currentYear}
                value={birthYear}
                onChange={(e) => setBirthYear(parseInt(e.target.value) || currentYear)}
                className="w-full bg-obsidian-900 border border-obsidian-800 text-slate-100 px-3 py-2 text-xs font-bold focus:border-zinc-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
                Peso Atual (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="10"
                max="250"
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value) || 70)}
                className="w-full bg-obsidian-900 border border-obsidian-800 text-slate-100 px-3 py-2 text-xs font-bold focus:border-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
                Gênero
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-obsidian-900 border border-obsidian-800 text-slate-200 px-2 py-2 text-xs font-bold focus:border-zinc-500 focus:outline-none"
              >
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
                Modalidade
              </label>
              <select
                value={modality}
                onChange={(e) => setModality(e.target.value as any)}
                className="w-full bg-obsidian-900 border border-obsidian-800 text-slate-200 px-2 py-2 text-xs font-bold focus:border-zinc-500 focus:outline-none"
              >
                <option value="gi">De Kimono (Gi)</option>
                <option value="nogi">Sem Kimono (No-Gi)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
                Faixa
              </label>
              <select
                value={beltColor}
                onChange={(e) => setBeltColor(e.target.value)}
                className="w-full bg-obsidian-900 border border-obsidian-800 text-slate-200 px-2 py-2 text-xs font-bold focus:border-zinc-500 focus:outline-none"
              >
                <option value="Branca">Branca</option>
                <option value="Azul">Azul</option>
                <option value="Roxa">Roxa</option>
                <option value="Marrom">Marrom</option>
                <option value="Preta">Preta</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="md:col-span-6 bg-obsidian-900/40 border border-obsidian-800 p-4 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-[9px] font-black text-gold-500 uppercase tracking-widest block">
              Resultado Calculado (Ano de Referência: {currentYear})
            </span>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider block">Categoria de Idade</span>
                <span className="text-sm font-black text-slate-200 block">{finalCategory}</span>
                <span className="text-[10px] text-zinc-650 font-bold block mt-0.5">{calculatedAge} anos de idade</span>
              </div>

              <div>
                <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider block">Tempo Reg. de Luta</span>
                <span className="text-sm font-black text-slate-200 block">{finalFightTime}</span>
                <span className="text-[10px] text-zinc-650 font-semibold block mt-0.5">
                  Final: {finalCategory.startsWith('MASTER') || finalCategory.startsWith('ADULTO') 
                    ? 'Mesmo tempo' 
                    : 'Dobro do tempo regulamentar'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-obsidian-850 pt-3">
              <div>
                <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider block">Categoria de Peso</span>
                <span className="text-sm font-black text-slate-200 block">Peso {weightClass.name}</span>
              </div>

              <div>
                <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider block">Limite de Peso Divisão</span>
                <span className="text-sm font-black text-slate-200 block">{weightClass.limit}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-obsidian-950 border border-obsidian-850/50 text-[10px] text-zinc-500">
            Finais das categorias juvenis/infantis possuem tempo regulamentar estendido ou dobrado nas semifinais/finais conforme a organização oficial do evento.
          </div>
        </div>

      </div>
    </div>
  );
};

