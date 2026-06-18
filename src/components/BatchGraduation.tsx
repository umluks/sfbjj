import React, { useState, useMemo } from 'react';
import type { Aluno, Belt, Degree, LoggedUser } from '../types';
import { BELT_RANKS, getBeltsByAge, getBjjAge } from '../types';
import { supabase } from '../lib/supabase';
import { jsPDF } from 'jspdf';
import {
  Award,
  Search,
  CheckSquare,
  Square,
  Printer,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react';

interface BatchGraduationProps {
  students: Aluno[];
  setStudents: React.Dispatch<React.SetStateAction<Aluno[]>>;
  loggedUser: LoggedUser | null;
}

export const BatchGraduation: React.FC<BatchGraduationProps> = ({
  students,
  setStudents,
  loggedUser
}) => {
  // Busca e Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBelt, setFilterBelt] = useState<string>('Todos');
  const [filterTurma, setFilterTurma] = useState<string>('Todos');

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Seleção para download/impressão em lote
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

  // Estado das graduações individuais (faixa, graus e data configurados por aluno)
  // Estrutura: { [alunoId]: { faixa: Belt, graus: Degree, data: string } }
  const [individualConfigs, setIndividualConfigs] = useState<
    Record<number, { faixa: Belt; graus: Degree; data: string }>
  >({});

  // Status de Processamento por Aluno
  const [studentProcessing, setStudentProcessing] = useState<Record<number, boolean>>({});
  const [studentSuccess, setStudentSuccess] = useState<Record<number, string | null>>({});
  const [studentError, setStudentError] = useState<Record<number, string | null>>({});

  // Alunos que foram confirmados nesta sessão
  const [confirmedStudentIds, setConfirmedStudentIds] = useState<number[]>([]);

  // Filtra estudantes ativos
  const activeStudents = useMemo(() => {
    return students.filter((s) => s.status === 'Ativo');
  }, [students]);

  // Aplica filtros e busca
  const filteredStudents = useMemo(() => {
    return activeStudents.filter((student) => {
      const currentBelt = student.faixa_atual || student.faixa;
      const matchesSearch = student.nome
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesBelt = filterBelt === 'Todos' || currentBelt === filterBelt;
      const matchesTurma = filterTurma === 'Todos' || student.turma === filterTurma;
      return matchesSearch && matchesBelt && matchesTurma;
    });
  }, [activeStudents, searchQuery, filterBelt, filterTurma]);

  // Paginação
  const totalItems = filteredStudents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = useMemo(() => {
    return filteredStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStudents, startIndex, itemsPerPage]);

  // Inicializa ou obtém a configuração individual de um aluno
  const getStudentConfig = (student: Aluno) => {
    if (individualConfigs[student.id]) {
      return individualConfigs[student.id];
    }
    // Configuração inicial padrão baseada no estado atual do aluno
    return {
      faixa: student.faixa_atual || student.faixa,
      graus: student.graus_atuais ?? student.graus,
      data: new Date().toISOString().split('T')[0]
    };
  };

  const handleUpdateConfig = (
    studentId: number,
    field: 'faixa' | 'graus' | 'data',
    value: any
  ) => {
    // Busca a configuração atual ou cria a padrão baseada no aluno
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const currentConf = individualConfigs[studentId] || {
      faixa: student.faixa_atual || student.faixa,
      graus: student.graus_atuais ?? student.graus,
      data: new Date().toISOString().split('T')[0]
    };

    setIndividualConfigs((prev) => ({
      ...prev,
      [studentId]: {
        ...currentConf,
        [field]: value
      }
    }));
  };

  // Handlers de paginação
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Handlers de seleção para lote
  const handleToggleSelectStudent = (id: number) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllPage = () => {
    const pageIds = paginatedStudents.map((s) => s.id);
    const allSelected = pageIds.every((id) => selectedStudentIds.includes(id));

    if (allSelected) {
      setSelectedStudentIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedStudentIds((prev) => [
        ...prev,
        ...pageIds.filter((id) => !prev.includes(id))
      ]);
    }
  };

  const isAllPageSelected = useMemo(() => {
    if (paginatedStudents.length === 0) return false;
    return paginatedStudents.every((s) => selectedStudentIds.includes(s.id));
  }, [paginatedStudents, selectedStudentIds]);

  const handleClearSelection = () => {
    setSelectedStudentIds([]);
  };

  // Helpers de formatação
  const renderBeltBadge = (faixa: Belt, graus: Degree) => {
    let beltClass = '';
    let barColor = 'bg-black';
    let stripeStyle: React.CSSProperties | undefined;

    const lowerFaixa = faixa.toLowerCase();

    if (lowerFaixa.includes('cinza')) {
      beltClass = 'bg-slate-400 text-slate-950 border border-slate-500';
      barColor = 'bg-neutral-950';
    } else if (lowerFaixa.includes('amarela')) {
      beltClass = 'bg-yellow-400 text-slate-950 border border-yellow-500';
      barColor = 'bg-neutral-950';
    } else if (lowerFaixa.includes('laranja')) {
      beltClass = 'bg-orange-500 text-white';
      barColor = 'bg-neutral-950';
    } else if (lowerFaixa.includes('verde')) {
      beltClass = 'bg-emerald-600 text-white';
      barColor = 'bg-neutral-950';
    } else if (lowerFaixa === 'azul') {
      beltClass = 'bg-blue-600 text-white border border-blue-700';
      barColor = 'bg-neutral-950';
    } else if (lowerFaixa === 'roxa') {
      beltClass = 'bg-purple-700 text-white border border-purple-800';
      barColor = 'bg-neutral-950';
    } else if (lowerFaixa === 'marrom') {
      beltClass = 'bg-amber-900 text-white border border-amber-950';
      barColor = 'bg-neutral-950';
    } else if (lowerFaixa === 'preta') {
      beltClass = 'bg-neutral-950 border border-gold-500/75 text-gold-450';
      barColor = 'bg-red-650';
    } else if (lowerFaixa === 'vermelha e preta') {
      stripeStyle = {
        background: 'repeating-linear-gradient(90deg, #b91c1c, #b91c1c 12px, #171717 12px, #171717 24px)'
      };
      beltClass = 'text-white border border-red-700';
      barColor = 'bg-neutral-950';
    } else if (lowerFaixa === 'vermelha e branca') {
      stripeStyle = {
        background: 'repeating-linear-gradient(90deg, #b91c1c, #b91c1c 12px, #f8fafc 12px, #f8fafc 24px)'
      };
      beltClass = 'text-neutral-950 border border-red-700';
      barColor = 'bg-neutral-950';
    } else if (lowerFaixa === 'vermelha') {
      beltClass = 'bg-red-750 text-white border border-red-850';
      barColor = 'bg-neutral-950';
    } else {
      beltClass = 'bg-white text-slate-900 border border-slate-300';
      barColor = 'bg-neutral-900';
    }

    const hasWhiteStripe = (lowerFaixa.includes('e branca') && !lowerFaixa.includes('vermelha'));
    const hasBlackStripe = (lowerFaixa.includes('e preta') && !lowerFaixa.includes('vermelha'));

    return (
      <div 
        className={`w-24 h-5.5 rounded flex items-center relative overflow-hidden font-extrabold text-[9px] tracking-wider shadow-sm select-none ${beltClass}`}
        style={stripeStyle}
      >
        <span className={`pl-1.5 uppercase z-10 ${lowerFaixa === 'vermelha e branca' ? 'text-black bg-white/60 px-0.5 rounded-sm' : ''}`}>{faixa}</span>

        {/* Horizontal stripe for child mixed belts */}
        {hasWhiteStripe && (
          <div className="absolute inset-x-0 top-[38%] bottom-[38%] bg-white border-y border-neutral-300/30 z-0 pointer-events-none" />
        )}
        {hasBlackStripe && (
          <div className="absolute inset-x-0 top-[38%] bottom-[38%] bg-neutral-950 border-y border-neutral-800/30 z-0 pointer-events-none" />
        )}

        <div className={`absolute right-0 top-0 bottom-0 w-6.5 ${barColor} flex items-center justify-around px-0.5 border-l border-obsidian-950/45`}>
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className={`w-0.5 h-2.5 rounded-sm transition-all ${idx < graus ? 'bg-white shadow-[0_0_3px_rgba(255,255,255,0.7)]' : 'bg-neutral-800/40'}`}
            />
          ))}
        </div>
      </div>
    );
  };

  const getRomanDegrees = (graus: number): string => {
    switch (graus) {
      case 0:
        return 'GRAU INICIAL';
      case 1:
        return 'I GRAU';
      case 2:
        return 'II GRAUS';
      case 3:
        return 'III GRAUS';
      case 4:
        return 'IV GRAUS';
      default:
        return '';
    }
  };

  const formatDateLong = (dateStr: string): string => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const day = parseInt(parts[2], 10);
    const monthIndex = parseInt(parts[1], 10) - 1;
    const year = parts[0];
    const months = [
      'janeiro',
      'fevereiro',
      'março',
      'abril',
      'maio',
      'junho',
      'julho',
      'agosto',
      'setembro',
      'outubro',
      'novembro',
      'dezembro'
    ];
    return `${day.toString().padStart(2, '0')} de ${months[monthIndex]} de ${year}`;
  };

  // Geração de PDF do Diploma conforme Imagem (Fundo Branco, Listras Canto, Brasão e Assinatura)
  const generateDiplomaPDF = (
    studentName: string,
    novaFaixa: string,
    graus: number,
    dataGrad: string
  ): jsPDF => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const W = doc.internal.pageSize.getWidth(); // 297 mm
    const H = doc.internal.pageSize.getHeight(); // 210 mm

    // --- 1. Plano de Fundo Branco ---
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, W, H, 'F');

    // --- 2. Listras Decorativas nos Cantos (Laranja e Preto) ---
    // Canto Superior Esquerdo
    // Listra Preta Sólida (Canto)
    doc.setFillColor(30, 30, 30);
    doc.triangle(0, 0, 45, 0, 0, 45, 'F');
    // Listra Laranja Larga
    doc.setFillColor(230, 80, 40);
    doc.triangle(49, 0, 58, 0, 0, 58, 'F');
    doc.triangle(49, 0, 0, 58, 0, 49, 'F');
    // Listra Laranja Estreita
    doc.setFillColor(230, 80, 40);
    doc.triangle(63, 0, 66, 0, 0, 66, 'F');
    doc.triangle(63, 0, 0, 66, 0, 63, 'F');

    // Canto Inferior Direito
    // Listra Preta Sólida (Canto)
    doc.setFillColor(30, 30, 30);
    doc.triangle(W, H, W - 45, H, W, H - 45, 'F');
    // Listra Laranja Larga
    doc.setFillColor(230, 80, 40);
    doc.triangle(W - 49, H, W - 58, H, W, H - 58, 'F');
    doc.triangle(W - 49, H, W, H - 58, W, H - 49, 'F');
    // Listra Laranja Estreita
    doc.setFillColor(230, 80, 40);
    doc.triangle(W - 63, H, W - 66, H, W, H - 66, 'F');
    doc.triangle(W - 63, H, W, H - 66, W, H - 63, 'F');

    // --- 3. Desenho de Marca D'água sutil (Flor de Lis no Fundo) ---
    doc.setDrawColor(245, 245, 245);
    doc.setFillColor(252, 252, 252);
    doc.setLineWidth(1);
    // Desenha círculos concêntricos sutis no fundo para dar textura de diploma
    doc.circle(W / 2, H / 2, 70, 'D');
    doc.circle(W / 2, H / 2, 60, 'D');

    // --- 4. Título Principal (SAGRADA FAMÍLIA) ---
    doc.setTextColor(30, 30, 30);
    doc.setFont('times', 'bold');
    doc.setFontSize(32);
    doc.text('SAGRADA FAMÍLIA', W / 2, 36, { align: 'center' });

    // Sub-título JIU-JITSU
    doc.setTextColor(230, 80, 40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('— JIU-JITSU —', W / 2, 45, { align: 'center' });

    // --- 5. Emblema Circular Central ---
    const badgeX = W / 2;
    const badgeY = 74;
    const badgeR = 15;
    // Círculo Preto Externo
    doc.setFillColor(30, 30, 30);
    doc.circle(badgeX, badgeY, badgeR, 'F');
    // Círculo Laranja Interno
    doc.setDrawColor(230, 80, 40);
    doc.setLineWidth(0.8);
    doc.circle(badgeX, badgeY, badgeR - 1.5, 'D');
    // Iniciais do Emblema
    doc.setTextColor(255, 255, 255);
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.text('SF', badgeX, badgeY + 2.5, { align: 'center' });
    // Pequeno texto curvo ou circular simulado
    doc.setFontSize(5);
    doc.text('LUCAS DOS ANJOS', badgeX, badgeY - 8, { align: 'center' });
    doc.text('BJJ BRASÍLIA', badgeX, badgeY + 9, { align: 'center' });

    // --- 6. Textos do Diploma ---
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(
      'A SAGRADA FAMÍLIA BRASÍLIA JIU-JITSU CONFERE A GRADUAÇÃO DE',
      W / 2,
      106,
      { align: 'center' }
    );

    // Faixa e Graus
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    const beltText = `FAIXA ${novaFaixa.toUpperCase()} ${getRomanDegrees(graus)}`;
    doc.text(`${beltText}   AO ALUNO`, W / 2, 115, { align: 'center' });

    // Nome do Aluno
    doc.setTextColor(15, 17, 23);
    doc.setFont('times', 'bold');
    doc.setFontSize(30);
    doc.text(studentName.toUpperCase(), W / 2, 132, { align: 'center' });

    // Separador (Linha cinza com Diamante Laranja)
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.4);
    doc.line(W / 2 - 60, 138, W / 2 + 60, 138);

    doc.setFillColor(230, 80, 40); // Diamante
    doc.triangle(W / 2, 136, W / 2 + 2, 138, W / 2, 140, 'F');
    doc.triangle(W / 2, 136, W / 2, 140, W / 2 - 2, 138, 'F');

    // Data de Outorga por extenso
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(
      `em graduação presencial realizada em ${formatDateLong(dataGrad)}`,
      W / 2,
      148,
      { align: 'center' }
    );

    // --- 7. Assinatura do Professor (Lucas Santiago) ---
    const sigY = 175;
    // Linha sutil de assinatura
    doc.setDrawColor(160, 160, 160);
    doc.setLineWidth(0.3);
    doc.line(W / 2 - 40, sigY, W / 2 + 40, sigY);

    // Rabisco/Caligrafia Simulado
    doc.setTextColor(80, 80, 100);
    doc.setFont('times', 'italic');
    doc.setFontSize(14);
    doc.text('L. dos Anjos', W / 2, sigY - 2, { align: 'center' });

    // Rodapé de identificação
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('LUCAS SANTIAGO GONÇALVES DOS ANJOS', W / 2, sigY + 4, { align: 'center' });

    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('PROFESSOR', W / 2, sigY + 8, { align: 'center' });
    doc.text('Registro CBJJ - nº 41369', W / 2, sigY + 11, { align: 'center' });

    return doc;
  };

  // CONFIRMAÇÃO INDIVIDUAL DE GRADUAÇÃO
  const handleConfirmSingleGraduation = async (student: Aluno) => {
    const config = getStudentConfig(student);
    const faixaAntiga = student.faixa_atual || student.faixa;
    const grausAntigos = student.graus_atuais ?? student.graus;

    // 1. Validar regras de faixa por idade
    const age = getBjjAge(student.dataNascimento);
    const allowed = getBeltsByAge(student.dataNascimento);
    if (!allowed.includes(config.faixa)) {
      setStudentError((prev) => ({
        ...prev,
        [student.id]: `A faixa "${config.faixa}" não é permitida para a idade de ${age} anos.`
      }));
      return;
    }

    // 2. Validar rebaixamento de faixa ou graus
    if (BELT_RANKS[config.faixa] < BELT_RANKS[faixaAntiga]) {
      setStudentError((prev) => ({
        ...prev,
        [student.id]: `Não é permitido rebaixar a faixa de ${faixaAntiga} para ${config.faixa}.`
      }));
      setTimeout(() => {
        setStudentError((prev) => ({ ...prev, [student.id]: null }));
      }, 4000);
      return;
    }
    if (config.faixa === faixaAntiga && config.graus < grausAntigos) {
      setStudentError((prev) => ({
        ...prev,
        [student.id]: `Não é permitido diminuir a quantidade de graus.`
      }));
      setTimeout(() => {
        setStudentError((prev) => ({ ...prev, [student.id]: null }));
      }, 4000);
      return;
    }

    setStudentProcessing((prev) => ({ ...prev, [student.id]: true }));
    setStudentSuccess((prev) => ({ ...prev, [student.id]: null }));
    setStudentError((prev) => ({ ...prev, [student.id]: null }));

    try {
      // 1. Inserir registro na tabela graduacoes
      const { error: insertError } = await supabase.from('graduacoes').insert({
        aluno_id: student.id,
        faixa_antiga: faixaAntiga,
        nova_faixa: config.faixa,
        quantidade_graus: config.graus,
        data_graduacao: config.data,
        professor_id: loggedUser?.professorId || null
      });

      if (insertError) {
        throw new Error(`Erro ao salvar histórico: ${insertError.message}`);
      }

      // 2. Atualizar tabela alunos (mantendo status 'Ativo')
      const { error: updateError } = await supabase
        .from('alunos')
        .update({
          faixa: config.faixa,
          graus: config.graus,
          faixa_atual: config.faixa,
          graus_atuais: config.graus,
          dataUltimaGraduacao: config.data,
          status: 'Ativo'
        })
        .eq('id', student.id);

      if (updateError) {
        throw new Error(`Erro ao atualizar faixa: ${updateError.message}`);
      }

      // 3. Atualizar registro local de alunos
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === student.id) {
            return {
              ...s,
              faixa: config.faixa,
              graus: config.graus,
              faixa_atual: config.faixa,
              graus_atuais: config.graus,
              dataUltimaGraduacao: config.data,
              status: 'Ativo',
              historicoGraduacoes: [
                ...(s.historicoGraduacoes || []),
                {
                  id: Date.now() + Math.random(),
                  data: config.data,
                  faixa: config.faixa,
                  graus: config.graus,
                  avaliador: loggedUser?.nome || 'Professor'
                }
              ]
            };
          }
          return s;
        })
      );

      // Marca como confirmado
      setConfirmedStudentIds((prev) => [...prev, student.id]);

      setStudentSuccess((prev) => ({
        ...prev,
        [student.id]: `Graduação salva no histórico!`
      }));
      setTimeout(() => {
        setStudentSuccess((prev) => ({ ...prev, [student.id]: null }));
      }, 4000);
    } catch (err: any) {
      console.error(err);
      setStudentError((prev) => ({
        ...prev,
        [student.id]: err.message || 'Erro ao graduar.'
      }));
      setTimeout(() => {
        setStudentError((prev) => ({ ...prev, [student.id]: null }));
      }, 4000);
    } finally {
      setStudentProcessing((prev) => ({ ...prev, [student.id]: false }));
    }
  };

  // Impressão individual de diploma (Baixa o PDF direto)
  const handlePrintIndividual = (student: Aluno) => {
    const config = getStudentConfig(student);
    const pdfDoc = generateDiplomaPDF(student.nome, config.faixa, config.graus, config.data);
    pdfDoc.save(`diploma_${student.nome.toLowerCase().replace(/\s+/g, '_')}.pdf`);
  };

  // Geração de PDF consolidado (Lote único) com todos os certificados selecionados
  const handleDownloadConsolidatedPDF = () => {
    const selectedStudents = activeStudents.filter((s) => selectedStudentIds.includes(s.id));
    if (selectedStudents.length === 0) {
      alert('Nenhum aluno selecionado.');
      return;
    }

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();

    selectedStudents.forEach((student, index) => {
      if (index > 0) {
        doc.addPage();
      }

      const config = getStudentConfig(student);

      // --- Desenha o Diploma ---
      // Fundo Branco
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, W, H, 'F');

      // Listras Decorativas nos Cantos (Laranja e Preto)
      // Canto Superior Esquerdo
      doc.setFillColor(30, 30, 30);
      doc.triangle(0, 0, 45, 0, 0, 45, 'F');
      doc.setFillColor(230, 80, 40);
      doc.triangle(49, 0, 58, 0, 0, 58, 'F');
      doc.triangle(49, 0, 0, 58, 0, 49, 'F');
      doc.triangle(63, 0, 66, 0, 0, 66, 'F');
      doc.triangle(63, 0, 0, 66, 0, 63, 'F');

      // Canto Inferior Direito
      doc.setFillColor(30, 30, 30);
      doc.triangle(W, H, W - 45, H, W, H - 45, 'F');
      doc.setFillColor(230, 80, 40);
      doc.triangle(W - 49, H, W - 58, H, W, H - 58, 'F');
      doc.triangle(W - 49, H, W, H - 58, W, H - 49, 'F');
      doc.triangle(W - 63, H, W - 66, H, W, H - 66, 'F');
      doc.triangle(W - 63, H, W, H - 66, W, H - 63, 'F');

      // Marca D'água sutil
      doc.setDrawColor(245, 245, 245);
      doc.setFillColor(252, 252, 252);
      doc.setLineWidth(1);
      doc.circle(W / 2, H / 2, 70, 'D');
      doc.circle(W / 2, H / 2, 60, 'D');

      // Título
      doc.setTextColor(30, 30, 30);
      doc.setFont('times', 'bold');
      doc.setFontSize(32);
      doc.text('SAGRADA FAMÍLIA', W / 2, 36, { align: 'center' });

      doc.setTextColor(230, 80, 40);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('— JIU-JITSU —', W / 2, 45, { align: 'center' });

      // Emblema Central
      const badgeX = W / 2;
      const badgeY = 74;
      const badgeR = 15;
      doc.setFillColor(30, 30, 30);
      doc.circle(badgeX, badgeY, badgeR, 'F');
      doc.setDrawColor(230, 80, 40);
      doc.setLineWidth(0.8);
      doc.circle(badgeX, badgeY, badgeR - 1.5, 'D');
      doc.setTextColor(255, 255, 255);
      doc.setFont('times', 'bold');
      doc.setFontSize(14);
      doc.text('SF', badgeX, badgeY + 2.5, { align: 'center' });
      doc.setFontSize(5);
      doc.text('LUCAS DOS ANJOS', badgeX, badgeY - 8, { align: 'center' });
      doc.text('BJJ BRASÍLIA', badgeX, badgeY + 9, { align: 'center' });

      // Textos
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text('A SAGRADA FAMÍLIA BRASÍLIA JIU-JITSU CONFERE A GRADUAÇÃO DE', W / 2, 106, { align: 'center' });

      doc.setTextColor(30, 30, 30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      const beltText = `FAIXA ${config.faixa.toUpperCase()} ${getRomanDegrees(config.graus)}`;
      doc.text(`${beltText}   AO ALUNO`, W / 2, 115, { align: 'center' });

      doc.setTextColor(15, 17, 23);
      doc.setFont('times', 'bold');
      doc.setFontSize(30);
      doc.text(student.nome.toUpperCase(), W / 2, 132, { align: 'center' });

      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.4);
      doc.line(W / 2 - 60, 138, W / 2 + 60, 138);

      doc.setFillColor(230, 80, 40);
      doc.triangle(W / 2, 136, W / 2 + 2, 138, W / 2, 140, 'F');
      doc.triangle(W / 2, 136, W / 2, 140, W / 2 - 2, 138, 'F');

      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(`em graduação presencial realizada em ${formatDateLong(config.data)}`, W / 2, 148, { align: 'center' });

      // Assinatura
      const sigY = 175;
      doc.setDrawColor(160, 160, 160);
      doc.setLineWidth(0.3);
      doc.line(W / 2 - 40, sigY, W / 2 + 40, sigY);
      doc.setTextColor(80, 80, 100);
      doc.setFont('times', 'italic');
      doc.setFontSize(14);
      doc.text('L. dos Anjos', W / 2, sigY - 2, { align: 'center' });

      doc.setTextColor(30, 30, 30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('LUCAS SANTIAGO GONÇALVES DOS ANJOS', W / 2, sigY + 4, { align: 'center' });

      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('PROFESSOR', W / 2, sigY + 8, { align: 'center' });
      doc.text('Registro CBJJ - nº 41369', W / 2, sigY + 11, { align: 'center' });
    });

    doc.save(`diplomas_lote_sfbjj_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
          <span className="text-gold-500">
            <Award className="w-8 h-8" />
          </span>{' '}
          Graduação & Diplomas
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Gerencie a promoção de faixas de forma individualizada para cada aluno e emita diplomas oficiais da SFBJJ.
        </p>
      </div>

      {/* Busca e Filtros Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-obsidian-900/40 p-4 rounded-xl border border-obsidian-850/60 backdrop-blur-md">
        <div className="relative md:col-span-2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por nome do aluno..."
            className="input-premium w-full pl-10"
          />
        </div>

        <div>
          <select
            value={filterBelt}
            onChange={(e) => {
              setFilterBelt(e.target.value);
              setCurrentPage(1);
            }}
            className="input-premium w-full bg-obsidian-950 text-slate-200"
          >
            <option value="Todos">Todas as Faixas Atuais</option>
            {getBeltsByAge().map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterTurma}
            onChange={(e) => {
              setFilterTurma(e.target.value);
              setCurrentPage(1);
            }}
            className="input-premium w-full bg-obsidian-950 text-slate-200"
          >
            <option value="Todos">Todas as Turmas</option>
            <option value="Adulto">Adulto</option>
            <option value="Kids">Kids</option>
          </select>
        </div>

        <div>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="input-premium w-full bg-obsidian-950 text-slate-200"
          >
            <option value={10}>10 por página</option>
            <option value={20}>20 por página</option>
            <option value={30}>30 por página</option>
            <option value={40}>40 por página</option>
            <option value={50}>50 por página</option>
            <option value={9999}>Todos</option>
          </select>
        </div>
      </div>

      {/* Tabela de Listagem Interativa */}
      <div className="bg-obsidian-900/20 border border-obsidian-900/60 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="border-b border-obsidian-850/80 text-[10px] font-bold uppercase tracking-widest text-slate-450 bg-obsidian-950/40">
                <th className="px-6 py-4 w-12 text-center">
                  <button
                    onClick={handleToggleSelectAllPage}
                    className="text-slate-450 hover:text-slate-200 transition-colors"
                  >
                    {isAllPageSelected ? (
                      <CheckSquare className="w-4 h-4 text-gold-500" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4">Membro</th>
                <th className="px-6 py-4">Faixa / Graus Atuais</th>
                <th className="px-6 py-4">Nova Faixa Alvo</th>
                <th className="px-6 py-4">Graus Alvo</th>
                <th className="px-6 py-4">Data da Graduação</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-900/40 text-xs text-slate-300">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500 font-semibold uppercase tracking-wider">
                    Nenhum aluno encontrado correspondente aos filtros.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => {
                  const isSelected = selectedStudentIds.includes(student.id);
                  const currentBelt = student.faixa_atual || student.faixa;
                  const currentDegrees = student.graus_atuais ?? student.graus;
                  const config = getStudentConfig(student);
                  const isProcessing = studentProcessing[student.id] || false;
                  const successMsg = studentSuccess[student.id];
                  const errorMsg = studentError[student.id];
                  const isConfirmed = confirmedStudentIds.includes(student.id);

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-obsidian-800/10 transition-colors ${
                        isSelected ? 'bg-gold-500/5' : ''
                      }`}
                    >
                      {/* Seleção */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleSelectStudent(student.id)}
                          className="text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-gold-500" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Membro */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden border border-obsidian-750/80 bg-obsidian-950 flex items-center justify-center text-lg shadow-inner select-none shrink-0">
                            {student.fotoPerfil ? (
                              student.fotoPerfil.length <= 2 ? (
                                <span>{student.fotoPerfil}</span>
                              ) : (
                                <img
                                  src={student.fotoPerfil}
                                  alt={student.nome}
                                  className="w-full h-full object-cover"
                                />
                              )
                            ) : (
                              <span className="text-slate-500 text-xs">🥋</span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-200">{student.nome}</div>
                            <span className="text-[9px] text-slate-500 uppercase font-semibold">
                              {student.turma || 'Adulto'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Faixa Atual */}
                      <td className="px-6 py-4">
                        {renderBeltBadge(currentBelt, currentDegrees)}
                      </td>

                      {/* Nova Faixa Alvo (Selecionável 1-a-1) */}
                      <td className="px-6 py-4">
                        <select
                          value={config.faixa}
                          onChange={(e) =>
                            handleUpdateConfig(student.id, 'faixa', e.target.value as Belt)
                          }
                          className="bg-obsidian-950 border border-obsidian-800 rounded px-2.5 py-1 text-slate-200 text-xs w-32 focus:border-gold-500/50 outline-none"
                        >
                          {getBeltsByAge(student.dataNascimento).map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </td>

                      {/* Novo Grau Alvo (Selecionável 1-a-1) */}
                      <td className="px-6 py-4">
                        <select
                          value={config.graus}
                          onChange={(e) =>
                            handleUpdateConfig(student.id, 'graus', Number(e.target.value) as Degree)
                          }
                          className="bg-obsidian-950 border border-obsidian-800 rounded px-2 py-1 text-slate-200 text-xs w-20 focus:border-gold-500/50 outline-none"
                        >
                          <option value={0}>0 Grau</option>
                          <option value={1}>1 Grau</option>
                          <option value={2}>2 Graus</option>
                          <option value={3}>3 Graus</option>
                          <option value={4}>4 Graus</option>
                        </select>
                      </td>

                      {/* Data de Graduação (Selecionável 1-a-1) */}
                      <td className="px-6 py-4">
                        <input
                          type="date"
                          value={config.data}
                          onChange={(e) => handleUpdateConfig(student.id, 'data', e.target.value)}
                          className="bg-obsidian-950 border border-obsidian-800 rounded px-2 py-1 text-slate-200 text-xs focus:border-gold-500/50 outline-none"
                        />
                      </td>

                      {/* Ações Individuais (Botão Confirmar Graduação e Emitir) */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleConfirmSingleGraduation(student)}
                            disabled={isProcessing}
                            title="Confirmar Graduação"
                            className={`p-2 rounded transition-all duration-200 flex items-center justify-center ${
                              isConfirmed
                                ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-gold-500 text-obsidian-950 hover:bg-gold-400 border border-gold-500/10'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {isProcessing ? (
                              <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full" />
                            ) : isConfirmed ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <Award className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handlePrintIndividual(student)}
                            title="Emitir Diploma"
                            className="p-2 rounded bg-obsidian-850 hover:bg-obsidian-800 text-gold-500 hover:text-gold-400 border border-gold-500/20 hover:border-gold-500/40 transition-colors flex items-center justify-center"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {successMsg && (
                          <span className="text-[9px] text-emerald-400 font-bold flex items-center justify-center gap-0.5 mt-1">
                            <Check className="w-3 h-3" /> {successMsg}
                          </span>
                        )}
                        {errorMsg && (
                          <span className="text-[9px] text-red-400 font-semibold mt-1 block">
                            {errorMsg}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-obsidian-850/80 bg-obsidian-950/20 text-slate-400">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Página {currentPage} de {totalPages} ({totalItems} alunos)
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-obsidian-800 bg-obsidian-950 hover:bg-obsidian-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-obsidian-800 bg-obsidian-950 hover:bg-obsidian-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Painel Fixo de Downloads e Impressão (Disponível quando há alunos selecionados) */}
      {selectedStudentIds.length > 0 && (
        <div className="fixed bottom-6 left-6 right-6 md:left-72 bg-obsidian-900 border border-gold-500/30 rounded-2xl shadow-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 z-30 animate-slide-up backdrop-blur-xl">
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest">
              Exportação em Lote de Diplomas
            </h3>
            <p className="text-slate-400 text-[10px] mt-0.5">
              Você selecionou <span className="font-bold text-gold-450">{selectedStudentIds.length}</span> aluno(s). Baixe os certificados confirmados abaixo.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleClearSelection}
              className="px-4 py-2 text-[10px] uppercase font-bold tracking-wider text-slate-400 hover:text-slate-200 bg-obsidian-850 hover:bg-obsidian-800 border border-obsidian-750 transition-colors rounded"
            >
              Limpar Seleção
            </button>
            <button
              onClick={handleDownloadConsolidatedPDF}
              className="bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-bold text-[10px] uppercase tracking-wider py-2 px-4 rounded flex items-center gap-1.5 transition-colors shadow-lg shadow-gold-500/20"
            >
              <Printer className="w-3.5 h-3.5" /> Gerar PDF Consolidado
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
