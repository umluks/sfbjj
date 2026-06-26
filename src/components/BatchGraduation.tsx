import React, { useState, useMemo } from 'react';
import type { Aluno, Belt, Degree, LoggedUser } from '../types';
import { BELT_RANKS } from '../types';
import { useStudents } from '../contexts/StudentsContext';
import { diplomaService } from '../services/diplomaService';
import { BeltBadge } from './shared/BeltBadge';
import { getBeltsByAge, getBjjAge } from '../utils/bjj';
import { supabase } from '../lib/supabase';
import { jsPDF } from 'jspdf';
import {
  Award,
  Search,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react';

interface BatchGraduationProps {
  loggedUser: LoggedUser | null;
}

export const BatchGraduation: React.FC<BatchGraduationProps> = ({ loggedUser }) => {
  const { students, setStudents } = useStudents();

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
      const currentBelt = student.faixa;
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
    return {
      faixa: student.faixa,
      graus: student.graus,
      data: new Date().toISOString().split('T')[0]
    };
  };

  const handleUpdateConfig = (
    studentId: number,
    field: 'faixa' | 'graus' | 'data',
    value: any
  ) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const currentConf = individualConfigs[studentId] || {
      faixa: student.faixa,
      graus: student.graus,
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

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

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

  // CONFIRMAÇÃO INDIVIDUAL DE GRADUAÇÃO
  const handleConfirmSingleGraduation = async (student: Aluno) => {
    const config = getStudentConfig(student);
    const faixaAntiga = student.faixa;
    const grausAntigos = student.graus;

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
    const pdfDoc = diplomaService.generateDiplomaPDF(student.nome, config.faixa, config.graus, config.data);
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

      // --- Desenha o Diploma consolidado usando a mesma estrutura de marca d'água ---
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, W, H, 'F');

      // Listras Decorativas nos Cantos
      doc.setFillColor(30, 30, 30);
      doc.triangle(0, 0, 45, 0, 0, 45, 'F');
      doc.setFillColor(230, 80, 40);
      doc.triangle(49, 0, 58, 0, 0, 58, 'F');
      doc.triangle(49, 0, 0, 58, 0, 49, 'F');
      doc.triangle(63, 0, 66, 0, 0, 66, 'F');
      doc.triangle(63, 0, 0, 66, 0, 63, 'F');

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
      const romanDeg = diplomaService.generateDiplomaPDF('', '', config.graus, '').internal.pages.length ? config.graus : 0; 
      // Usando helper do diplomaService para algarismo romano
      const getRomanStr = (g: number) => {
        if (g === 1) return 'I GRAU';
        if (g === 2) return 'II GRAUS';
        if (g === 3) return 'III GRAUS';
        if (g === 4) return 'IV GRAUS';
        return 'GRAU INICIAL';
      };
      const beltText = `FAIXA ${config.faixa.toUpperCase()} ${getRomanStr(romanDeg)}`;
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

      // Data de Outorga
      const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
      const pData = config.data.split('-');
      const dateLongStr = pData.length === 3 ? `${pData[2].padStart(2, '0')} de ${months[parseInt(pData[1], 10) - 1]} de ${pData[0]}` : config.data;

      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(`em graduação presencial realizada em ${dateLongStr}`, W / 2, 148, { align: 'center' });

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
            <option value="Branca">Branca</option>
            <option value="Cinza">Cinza</option>
            <option value="Amarela">Amarela</option>
            <option value="Laranja">Laranja</option>
            <option value="Verde">Verde</option>
            <option value="Azul">Azul</option>
            <option value="Roxa">Roxa</option>
            <option value="Marrom">Marrom</option>
            <option value="Preta">Preta</option>
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
                    type="button"
                  >
                    {isAllPageSelected ? (
                      <CheckSquare className="w-4 h-4 text-gold-500" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4">Membro</th>
                <th className="px-6 py-4 text-center">Faixa Atual</th>
                <th className="px-6 py-4 text-center">Nova Faixa Promovida</th>
                <th className="px-6 py-4 text-center">Graus (Pontas)</th>
                <th className="px-6 py-4 text-center">Data Outorga</th>
                <th className="px-6 py-4 text-right">Ações de Outorga</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-900/40 text-xs text-slate-305">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500 font-semibold uppercase tracking-wider">
                    Nenhum aluno ativo encontrado para graduação.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => {
                  const config = getStudentConfig(student);
                  const isProcessing = studentProcessing[student.id];
                  const success = studentSuccess[student.id];
                  const error = studentError[student.id];
                  const isConfirmed = confirmedStudentIds.includes(student.id);

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-obsidian-800/15 transition-colors group"
                    >
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleSelectStudent(student.id)}
                          className="text-slate-400 hover:text-slate-200 transition-colors"
                          type="button"
                        >
                          {selectedStudentIds.includes(student.id) ? (
                            <CheckSquare className="w-4 h-4 text-gold-500" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-200 group-hover:text-slate-100 transition-colors">
                          {student.nome}
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold mt-1">
                          Idade Esportiva: {getBjjAge(student.dataNascimento)} anos • Turma: {student.turma}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <BeltBadge faixa={student.faixa} graus={student.graus} />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <select
                            value={config.faixa}
                            onChange={(e) => handleUpdateConfig(student.id, 'faixa', e.target.value as Belt)}
                            className="bg-obsidian-950 border border-obsidian-800 rounded px-2.5 py-1.5 text-slate-200 text-xs focus:border-gold-500/50 outline-none w-32 font-bold"
                          >
                            {getBeltsByAge(student.dataNascimento).map((b) => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <select
                            value={config.graus}
                            onChange={(e) => handleUpdateConfig(student.id, 'graus', Number(e.target.value) as Degree)}
                            className="bg-obsidian-950 border border-obsidian-800 rounded px-2 py-1.5 text-slate-200 text-xs focus:border-gold-500/50 outline-none font-bold"
                          >
                            <option value={0}>0 Grau</option>
                            <option value={1}>1 Grau</option>
                            <option value={2}>2 Graus</option>
                            <option value={3}>3 Graus</option>
                            <option value={4}>4 Graus</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <input
                            type="date"
                            value={config.data}
                            onChange={(e) => handleUpdateConfig(student.id, 'data', e.target.value)}
                            className="bg-obsidian-950 border border-obsidian-800 rounded px-2 py-1 text-slate-200 text-xs focus:border-gold-500/50 outline-none font-mono font-semibold"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Feedbacks de Operações */}
                          {success && (
                            <span className="text-[10px] text-emerald-450 font-bold uppercase tracking-wider animate-pulse mr-2">
                              {success}
                            </span>
                          )}
                          {error && (
                            <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider animate-shake mr-2">
                              {error}
                            </span>
                          )}

                          <button
                            onClick={() => handleConfirmSingleGraduation(student)}
                            disabled={isProcessing}
                            className={`text-[9px] uppercase tracking-wider font-black px-3.5 py-2 rounded transition-all active:scale-[0.98] ${
                              isConfirmed
                                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                : 'bg-gold-500/10 border border-gold-500/20 text-gold-450 hover:bg-gold-500/20'
                            }`}
                            title="Confirmar Outorga no Banco"
                            type="button"
                          >
                            {isProcessing ? (
                              <svg className="animate-spin h-3.5 w-3.5 text-gold-450" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            ) : isConfirmed ? (
                              <span className="flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Salvo!
                              </span>
                            ) : (
                              'Outorgar'
                            )}
                          </button>

                          <button
                            onClick={() => handlePrintIndividual(student)}
                            className="p-2 rounded bg-obsidian-950 hover:bg-obsidian-900 border border-obsidian-900 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all"
                            title="Gerar e Baixar Diploma PDF"
                            type="button"
                          >
                            PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Sub-bar de Ações em Lote e Paginação */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-obsidian-850/80 bg-obsidian-950/20 gap-4">
          <div className="flex items-center gap-2">
            {selectedStudentIds.length > 0 ? (
              <button
                onClick={handleDownloadConsolidatedPDF}
                className="flex items-center gap-1.5 bg-gold-500/10 hover:bg-gold-500/20 text-gold-450 hover:text-gold-400 border border-gold-500/20 font-bold text-[9px] uppercase tracking-wider py-2 px-4 transition-colors"
                type="button"
              >
                Imprimir {selectedStudentIds.length} Diplomas em Lote (PDF)
              </button>
            ) : (
              <span className="text-[10px] text-slate-500 italic">Selecione alunos na tabela para habilitar a geração de diplomas em lote</span>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="btn-obsidian py-1.5 px-3 text-[10px] uppercase font-black tracking-widest disabled:opacity-50 disabled:pointer-events-none"
                type="button"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Anterior
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="btn-obsidian py-1.5 px-3 text-[10px] uppercase font-black tracking-widest disabled:opacity-50 disabled:pointer-events-none"
                type="button"
              >
                Próximo
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
