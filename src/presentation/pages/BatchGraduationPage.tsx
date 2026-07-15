import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { Aluno, Belt, Degree } from '@/domain/models/student';
import type { Professor } from '@/domain/models/teacher';
import { BELT_RANKS } from '@/constants';
import { useAuth } from '@/application/hooks/useAuth';
import { useStudents } from '@/application/contexts/StudentsContext';
import { diplomaService } from '@/application/services/diplomaService';
import { studentService } from '@/application/services/studentService';
import { teacherService } from '@/application/services/teacherService';
import { diplomaConfigService } from '@/application/services/diplomaConfigService';
import { BeltBadge } from '@/presentation/components/shared/BeltBadge';
import { getBeltsByAge, getBjjAge } from '@/application/services/diplomaService';
import {
  Award,
  Search,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  Check,
  Upload,
  Settings,
  Filter,
  Image as ImageIcon,
  PenTool
} from 'lucide-react';

export const BatchGraduationPage: React.FC = () => {
  const { loggedUser } = useAuth();
  const { students, loadStudents } = useStudents();

  if (loggedUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center bg-obsidian-900/60 p-8 rounded-2xl border border-obsidian-850 max-w-md backdrop-blur-md">
          <h2 className="text-xl font-bold text-red-400">Acesso Restrito</h2>
          <p className="text-slate-400 text-xs mt-2 leading-relaxed">
            Apenas administradores do sistema têm permissão para acessar a área de Graduação & Diplomas e emitir certificados.
          </p>
        </div>
      </div>
    );
  }

  // Controle da visualização das configurações
  const [showConfig, setShowConfig] = useState<boolean>(false);

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

  // Refs para gerenciar timeouts e evitar memory leaks
  const successTimeoutsRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const errorTimeoutsRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    return () => {
      // Limpa os timeouts no unmount
      Object.values(successTimeoutsRef.current).forEach(clearTimeout);
      Object.values(errorTimeoutsRef.current).forEach(clearTimeout);
    };
  }, []);

  // Alunos que foram confirmados nesta sessão
  const [confirmedStudentIds, setConfirmedStudentIds] = useState<number[]>([]);

  // Configurações de Template do Diploma
  const [bgTemplate, setBgTemplate] = useState<string | null>(null);
  const [keepDefaultTitles, setKeepDefaultTitles] = useState<boolean>(true);
  const [keepDefaultDecoration, setKeepDefaultDecoration] = useState<boolean>(false);
  const [textoLinha1, setTextoLinha1] = useState<string>('A SAGRADA FAMILIA BRASÍLIA JIU-JITSU CONFERE A GRADUAÇÃO DE');
  const [textoLinha3, setTextoLinha3] = useState<string>('AO ALUNO');
  const [textoDataPrefix, setTextoDataPrefix] = useState<string>('em graduação presencial realizada em');

  // Professores para Assinatura
  const [teachers, setTeachers] = useState<Professor[]>([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);
  const [globalDate, setGlobalDate] = useState<string>('');

  useEffect(() => {
    const loadDiplomaData = async () => {
      try {
        // Carrega configurações de template do Supabase
        const config = await diplomaConfigService.getConfig();
        setBgTemplate(config.backgroundTemplate || null);
        setKeepDefaultTitles(config.keepDefaultTitles);
        setKeepDefaultDecoration(config.keepDefaultDecor);
        setTextoLinha1(config.textoLinha1 || 'A SAGRADA FAMILIA BRASÍLIA JIU-JITSU CONFERE A GRADUAÇÃO DE');
        setTextoLinha3(config.textoLinha3 || 'AO ALUNO');
        setTextoDataPrefix(config.textoDataPrefix || 'em graduação presencial realizada em');

        // Carrega lista de professores cadastrados
        const list = await teacherService.getTeachers();
        setTeachers(list);
      } catch (err) {
        console.error('Erro ao carregar configurações do diploma ou professores:', err);
      }
    };
    loadDiplomaData();
  }, []);

  const handleUpdateTextoLinha1 = async (val: string) => {
    setTextoLinha1(val);
    try {
      await diplomaConfigService.updateConfig({ textoLinha1: val });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTextoLinha3 = async (val: string) => {
    setTextoLinha3(val);
    try {
      await diplomaConfigService.updateConfig({ textoLinha3: val });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTextoDataPrefix = async (val: string) => {
    setTextoDataPrefix(val);
    try {
      await diplomaConfigService.updateConfig({ textoDataPrefix: val });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadTemplate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Por favor, selecione uma imagem menor que 2MB para garantir o bom funcionamento do banco de dados.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        try {
          setBgTemplate(base64);
          await diplomaConfigService.updateConfig({ backgroundTemplate: base64 });
        } catch (err) {
          alert('Erro ao salvar o template de fundo no banco de dados.');
          console.error(err);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearTemplate = async () => {
    try {
      setBgTemplate(null);
      await diplomaConfigService.updateConfig({ backgroundTemplate: null });
    } catch (err) {
      alert('Erro ao remover o template de fundo.');
      console.error(err);
    }
  };

  const handleToggleTitles = async (val: boolean) => {
    try {
      setKeepDefaultTitles(val);
      await diplomaConfigService.updateConfig({ keepDefaultTitles: val });
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleDecor = async (val: boolean) => {
    try {
      setKeepDefaultDecoration(val);
      await diplomaConfigService.updateConfig({ keepDefaultDecor: val });
    } catch (err) {
      console.error(err);
    }
  };

  const getSignatoryData = (teacherId: string) => {
    if (!teacherId) return null;
    const t = teachers.find(teacher => String(teacher.id) === teacherId);
    if (!t) return null;
    return {
      nome: t.nome,
      cbjj: t.cbjj,
      role: 'Professor',
      assinatura: t.assinatura
    };
  };

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

  const handleToggleSelectAllPage = useCallback(() => {
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
  }, [paginatedStudents, selectedStudentIds]);

  const isAllPageSelected = useMemo(() => {
    if (paginatedStudents.length === 0) return false;
    return paginatedStudents.every((s) => selectedStudentIds.includes(s.id));
  }, [paginatedStudents, selectedStudentIds]);

  // CONFIRMAÇÃO INDIVIDUAL DE GRADUAÇÃO
  const handleConfirmSingleGraduation = async (student: Aluno) => {
    const config = getStudentConfig(student);
    const faixaAntiga = student.faixa;
    const grausAntigos = student.graus;

    // Limpa timeouts anteriores para este aluno
    if (errorTimeoutsRef.current[student.id]) clearTimeout(errorTimeoutsRef.current[student.id]);
    if (successTimeoutsRef.current[student.id]) clearTimeout(successTimeoutsRef.current[student.id]);

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
      errorTimeoutsRef.current[student.id] = setTimeout(() => {
        setStudentError((prev) => ({ ...prev, [student.id]: null }));
      }, 4000);
      return;
    }
    if (config.faixa === faixaAntiga && config.graus < grausAntigos) {
      setStudentError((prev) => ({
        ...prev,
        [student.id]: `Não é permitido diminuir a quantidade de graus.`
      }));
      errorTimeoutsRef.current[student.id] = setTimeout(() => {
        setStudentError((prev) => ({ ...prev, [student.id]: null }));
      }, 4000);
      return;
    }

    setStudentProcessing((prev) => ({ ...prev, [student.id]: true }));
    setStudentError((prev) => ({ ...prev, [student.id]: null }));
    setStudentSuccess((prev) => ({ ...prev, [student.id]: null }));

    try {
      // 1. Inserir no histórico de graduações e atualizar o registro de alunos
      const avaliador = loggedUser?.nome || 'Professor';
      await studentService.addGraduation(student.id, {
        faixa: config.faixa,
        graus: config.graus,
        data_graduacao: config.data,
        avaliador
      });

      // 2. Atualiza ficha do aluno
      await studentService.updateStudent(student.id, {
        faixa: config.faixa,
        graus: config.graus,
        dataUltimaGraduacao: config.data,
        status: 'Ativo'
      });

      // 3. Atualizar contexto geral de alunos
      await loadStudents();

      setConfirmedStudentIds((prev) => [...prev, student.id]);
      setStudentSuccess((prev) => ({
        ...prev,
        [student.id]: `Graduação salva!`
      }));
      successTimeoutsRef.current[student.id] = setTimeout(() => {
        setStudentSuccess((prev) => ({ ...prev, [student.id]: null }));
      }, 4000);
    } catch (err: any) {
      console.error(err);
      setStudentError((prev) => ({
        ...prev,
        [student.id]: err.message || 'Erro ao graduar.'
      }));
    } finally {
      setStudentProcessing((prev) => ({ ...prev, [student.id]: false }));
    }
  };

  const handlePrintIndividual = (student: Aluno) => {
    const config = getStudentConfig(student);
    const signatories = selectedTeacherIds.map(id => getSignatoryData(id)).filter(Boolean) as any[];

    const pdfDoc = diplomaService.generateDiplomaPDF(
      student.nome,
      config.faixa,
      config.graus,
      globalDate || config.data,
      {
        backgroundTemplate: bgTemplate,
        keepDefaultTitles,
        keepDefaultDecoration,
        textoLinha1,
        textoLinha3,
        textoDataPrefix,
        signatories
      }
    );
    pdfDoc.save(`diploma_${student.nome.toLowerCase().replace(/\s+/g, '_')}.pdf`);
  };

  const handleDownloadConsolidatedPDF = () => {
    const selectedStudents = activeStudents.filter((s) => selectedStudentIds.includes(s.id));
    if (selectedStudents.length === 0) {
      alert('Nenhum aluno selecionado.');
      return;
    }

    const payload = selectedStudents.map(student => {
      const config = getStudentConfig(student);
      return {
        nome: student.nome,
        faixa: config.faixa,
        graus: config.graus,
        data: globalDate || config.data
      };
    });

    const signatories = selectedTeacherIds.map(id => getSignatoryData(id)).filter(Boolean) as any[];

    const doc = diplomaService.generateConsolidatedDiplomaPDF(payload, {
      backgroundTemplate: bgTemplate,
      keepDefaultTitles,
      keepDefaultDecoration,
      textoLinha1,
      textoLinha3,
      textoDataPrefix,
      signatories
    });
    doc.save(`diplomas_lote_sfbjj_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-gold-500/20 to-gold-700/10 rounded-xl border border-gold-500/20 shadow-lg shadow-gold-500/5">
              <Award className="w-7 h-7 text-gold-450" />
            </div>
            Graduação & Diplomas
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-2xl leading-relaxed">
            Gerencie a promoção de faixas de forma individualizada para cada aluno e emita diplomas oficiais da SFBJJ com templates personalizados e assinaturas digitais.
          </p>
        </div>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg border ${
            showConfig 
              ? 'bg-gold-500 text-obsidian-950 border-gold-400 shadow-gold-500/20' 
              : 'bg-obsidian-900 text-slate-300 border-obsidian-800 hover:bg-obsidian-800 hover:text-white shadow-black/40'
          }`}
          type="button"
        >
          <Settings className={`w-4 h-4 ${showConfig ? 'animate-spin-slow' : ''}`} />
          {showConfig ? 'Ocultar Configurações' : 'Configurar Diplomas'}
        </button>
      </div>

      {/* Configurações do Diploma (Collapsible) */}
      <div 
        className={`transition-all duration-500 ease-in-out overflow-hidden origin-top ${
          showConfig ? 'max-h-[2000px] opacity-100 scale-y-100 mb-6' : 'max-h-0 opacity-0 scale-y-95 mb-0'
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pb-2">
          {/* Signatário / Professor Assinante */}
          <div className="bg-gradient-to-b from-obsidian-900/80 to-obsidian-900/40 border border-obsidian-800/80 p-5 rounded-2xl backdrop-blur-xl shadow-xl flex flex-col justify-between group hover:border-gold-500/30 transition-colors duration-300">
            <div>
              <h2 className="text-sm font-black text-slate-100 flex items-center gap-2.5 uppercase tracking-wide">
                <PenTool className="w-4 h-4 text-gold-500" />
                Assinatura do Diploma
              </h2>
              <p className="text-slate-400 text-[11px] mt-1.5 leading-relaxed">
                Selecione os professores cujos registros e assinaturas digitais serão impressos no rodapé dos diplomas emitidos.
              </p>
            </div>
            <div className="mt-4 space-y-3 flex-1">
              <div className="bg-obsidian-950/50 p-3 rounded-xl border border-obsidian-850/50 h-full max-h-48 overflow-y-auto custom-scrollbar space-y-1">
                {teachers.map((t) => {
                  const isSelected = selectedTeacherIds.includes(String(t.id));
                  return (
                    <label key={t.id} className={`flex items-center gap-3 text-xs p-2.5 rounded-lg cursor-pointer transition-all duration-200 border ${isSelected ? 'bg-gold-500/10 border-gold-500/20 text-gold-400 font-bold' : 'bg-transparent border-transparent text-slate-300 hover:bg-obsidian-800/50 hover:border-obsidian-700 hover:text-slate-100'}`}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTeacherIds(prev => [...prev, String(t.id)]);
                          } else {
                            setSelectedTeacherIds(prev => prev.filter(id => id !== String(t.id)));
                          }
                        }}
                        className="rounded border-obsidian-700 text-gold-500 focus:ring-0 focus:ring-offset-0 bg-obsidian-900 w-4 h-4 transition-all"
                      />
                      <span className="flex-1">{t.nome} {t.cbjj ? <span className="text-slate-500 text-[10px] ml-1 font-normal">(CBJJ: {t.cbjj})</span> : ''}</span>
                      {t.assinatura ? <span title="Assinatura Cadastrada"><Check className="w-4 h-4 text-emerald-500" /></span> : <span className="text-amber-500 text-[10px] font-bold" title="Sem Assinatura">⚠</span>}
                    </label>
                  );
                })}
                {teachers.length === 0 && <div className="text-xs text-slate-500 text-center py-4 italic">Nenhum professor cadastrado</div>}
              </div>
            </div>
          </div>

          {/* Template de Fundo */}
          <div className="lg:col-span-2 bg-gradient-to-b from-obsidian-900/80 to-obsidian-900/40 border border-obsidian-800/80 p-5 rounded-2xl backdrop-blur-xl shadow-xl flex flex-col gap-5 group hover:border-gold-500/30 transition-colors duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-sm font-black text-slate-100 flex items-center gap-2.5 uppercase tracking-wide">
                  <ImageIcon className="w-4 h-4 text-gold-500" />
                  Template e Design
                </h2>
                <p className="text-slate-400 text-[11px] mt-1.5 leading-relaxed">
                  {loggedUser?.role === 'admin' 
                    ? 'Personalize o fundo (A4 Paisagem) e os textos que serão impressos no certificado.'
                    : 'O template de fundo ativo é gerenciado pelo administrador da equipe.'}
                </p>
              </div>

              {bgTemplate ? (
                <div className="flex items-center gap-4 shrink-0 bg-obsidian-950/60 p-2.5 rounded-xl border border-obsidian-800/60">
                  <div className="relative group/img w-28 h-20 rounded-lg border border-obsidian-700 overflow-hidden shadow-md bg-white">
                    <img src={bgTemplate} alt="Preview do Template" className="w-full h-full object-cover" />
                    {loggedUser?.role === 'admin' && (
                      <div className="absolute inset-0 bg-red-950/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={handleClearTemplate}
                          className="text-red-400 text-[10px] uppercase font-black tracking-wider hover:text-white transition-colors"
                          type="button"
                        >
                          Remover
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="text-left pr-3">
                    <div className="text-[11px] font-black text-emerald-400 flex items-center gap-1.5 uppercase tracking-widest mb-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
                      Ativo
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">Design Customizado</div>
                  </div>
                </div>
              ) : (
                loggedUser?.role === 'admin' ? (
                  <label className="flex items-center gap-2 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-obsidian-950 text-xs font-black uppercase tracking-wider py-3 px-5 rounded-xl cursor-pointer transition-all duration-300 shadow-lg shadow-gold-500/20 active:scale-95 shrink-0">
                    <Upload className="w-4 h-4" />
                    Upload Imagem
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleUploadTemplate}
                    />
                  </label>
                ) : (
                  <div className="text-xs text-slate-400 font-medium italic bg-obsidian-950 px-4 py-2 rounded-xl border border-obsidian-850">Design Padrão SFBJJ</div>
                )
              )}
            </div>

            {bgTemplate && (
              <div className="pt-4 border-t border-obsidian-800/50 flex flex-col sm:flex-row gap-6">
                <label className="flex items-center gap-3 text-xs font-medium text-slate-300 cursor-pointer select-none hover:text-white transition-colors group/check">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={keepDefaultTitles}
                      disabled={loggedUser?.role !== 'admin'}
                      onChange={(e) => handleToggleTitles(e.target.checked)}
                      className="peer appearance-none w-5 h-5 border-2 border-obsidian-600 rounded bg-obsidian-950 checked:bg-gold-500 checked:border-gold-500 focus:outline-none transition-all disabled:opacity-50 cursor-pointer"
                    />
                    <Check className="w-3.5 h-3.5 text-obsidian-950 absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={3} />
                  </div>
                  Títulos Originais (SFBJJ)
                </label>
                <label className="flex items-center gap-3 text-xs font-medium text-slate-300 cursor-pointer select-none hover:text-white transition-colors group/check">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={keepDefaultDecoration}
                      disabled={loggedUser?.role !== 'admin'}
                      onChange={(e) => handleToggleDecor(e.target.checked)}
                      className="peer appearance-none w-5 h-5 border-2 border-obsidian-600 rounded bg-obsidian-950 checked:bg-gold-500 checked:border-gold-500 focus:outline-none transition-all disabled:opacity-50 cursor-pointer"
                    />
                    <Check className="w-3.5 h-3.5 text-obsidian-950 absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={3} />
                  </div>
                  Decorações e Marcas d'água
                </label>
              </div>
            )}

            {loggedUser?.role === 'admin' && (
              <div className="pt-5 border-t border-obsidian-800/50 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    Texto Linha 1 <span className="text-slate-500 font-normal normal-case">(Topo)</span>
                  </label>
                  <input
                    type="text"
                    value={textoLinha1}
                    onChange={(e) => handleUpdateTextoLinha1(e.target.value)}
                    className="w-full bg-obsidian-950/80 border border-obsidian-800 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-200 placeholder-obsidian-600 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/30 transition-all shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    Texto Linha 3 <span className="text-slate-500 font-normal normal-case">(Abaixo da Faixa)</span>
                  </label>
                  <input
                    type="text"
                    value={textoLinha3}
                    onChange={(e) => handleUpdateTextoLinha3(e.target.value)}
                    className="w-full bg-obsidian-950/80 border border-obsidian-800 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-200 placeholder-obsidian-600 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/30 transition-all shadow-inner"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <div className="flex flex-col sm:flex-row gap-5">
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Prefixo da Data
                      </label>
                      <input
                        type="text"
                        value={textoDataPrefix}
                        onChange={(e) => handleUpdateTextoDataPrefix(e.target.value)}
                        className="w-full bg-obsidian-950/80 border border-obsidian-800 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-200 placeholder-obsidian-600 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/30 transition-all shadow-inner"
                      />
                    </div>
                    <div className="sm:w-1/3 space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gold-400 flex items-center gap-1.5">
                        Data Unificada Lote
                      </label>
                      <input
                        type="date"
                        value={globalDate}
                        onChange={(e) => setGlobalDate(e.target.value)}
                        className="w-full bg-gold-500/10 border border-gold-500/30 rounded-xl px-4 py-2.5 text-xs font-bold text-gold-300 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-500/50 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabela Interativa de Alunos */}
      <div className="bg-gradient-to-b from-obsidian-900/60 to-obsidian-900/30 border border-obsidian-800/80 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col">
        {/* Toolbar Superior (Busca e Filtros) */}
        <div className="p-4 border-b border-obsidian-800/50 bg-obsidian-950/40 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500 group-focus-within:text-gold-500 transition-colors">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar aluno por nome..."
              aria-label="Buscar aluno por nome"
              className="w-full bg-obsidian-900 border border-obsidian-700 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium text-slate-200 placeholder-slate-500 focus-visible:outline-none focus-visible:border-gold-500/50 focus-visible:ring-1 focus-visible:ring-gold-500/50 transition-all shadow-inner"
            />
          </div>

          <div className="flex flex-wrap md:flex-nowrap gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-44">
              <select
                value={filterBelt}
                aria-label="Filtrar por Faixa"
                onChange={(e) => {
                  setFilterBelt(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none bg-obsidian-900 border border-obsidian-700 rounded-xl pl-4 pr-9 py-2.5 text-xs font-semibold text-slate-200 focus-visible:outline-none focus-visible:border-gold-500/50 focus-visible:ring-1 focus-visible:ring-gold-500/50 transition-all shadow-inner cursor-pointer"
              >
                <option value="Todos">Todas as Faixas</option>
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
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative flex-1 md:w-36">
              <select
                value={filterTurma}
                aria-label="Filtrar por Turma"
                onChange={(e) => {
                  setFilterTurma(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none bg-obsidian-900 border border-obsidian-700 rounded-xl pl-4 pr-9 py-2.5 text-xs font-semibold text-slate-200 focus-visible:outline-none focus-visible:border-gold-500/50 focus-visible:ring-1 focus-visible:ring-gold-500/50 transition-all shadow-inner cursor-pointer"
              >
                <option value="Todos">Todas Turmas</option>
                <option value="Adulto">Adulto</option>
                <option value="Kids">Kids</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            
            <div className="relative w-28">
              <select
                value={itemsPerPage}
                aria-label="Itens por página"
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full appearance-none bg-obsidian-900 border border-obsidian-700 rounded-xl pl-4 pr-9 py-2.5 text-xs font-semibold text-slate-200 focus-visible:outline-none focus-visible:border-gold-500/50 focus-visible:ring-1 focus-visible:ring-gold-500/50 transition-all shadow-inner cursor-pointer"
              >
                <option value={10}>10 / pág</option>
                <option value={20}>20 / pág</option>
                <option value={50}>50 / pág</option>
                <option value={9999}>Todos</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Tabela de Dados */}
        <div className="w-full min-h-[400px]">
          <table className="w-full text-left border-collapse block lg:table">
            <thead className="hidden lg:table-header-group">
              <tr className="border-b border-obsidian-800/80 text-[11px] font-black uppercase tracking-widest text-slate-400 bg-obsidian-950/60">
                <th className="px-6 py-5 w-14 text-center">
                  <button
                    onClick={handleToggleSelectAllPage}
                    className="text-slate-450 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded"
                    type="button"
                    aria-label="Selecionar Todos da Página"
                    title="Selecionar Todos da Página"
                  >
                    {isAllPageSelected ? (
                      <CheckSquare className="w-4 h-4 text-gold-500" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-5">Membro</th>
                <th className="px-6 py-5">Faixa Atual</th>
                <th className="px-6 py-5 text-center">Nova Faixa Promovida</th>
                <th className="px-6 py-5 text-center">Graus (Pontas)</th>
                <th className="px-6 py-5 text-center">Data Outorga</th>
                <th className="px-6 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="block lg:table-row-group divide-y lg:divide-y-0 divide-obsidian-800/40 text-xs text-slate-300">
              {paginatedStudents.length === 0 ? (
                <tr className="block lg:table-row">
                  <td colSpan={7} className="block lg:table-cell text-center py-16">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <Award className="w-12 h-12 mb-3 opacity-20" />
                      <span className="font-semibold uppercase tracking-wider text-sm">Nenhum aluno ativo encontrado</span>
                      <span className="text-xs mt-1">Tente ajustar os filtros de busca.</span>
                    </div>
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
                      className="flex flex-col lg:table-row hover:bg-obsidian-800/20 transition-colors group p-4 lg:p-0 border-b border-obsidian-800/40 lg:border-none relative"
                    >
                      {/* Mobile Header (Membro + Checkbox) */}
                      <td className="flex items-center justify-between lg:hidden pb-3 border-b border-obsidian-800/40 mb-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleSelectStudent(student.id)}
                            className="text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded"
                            type="button"
                            aria-label={`Selecionar ${student.nome}`}
                          >
                            {selectedStudentIds.includes(student.id) ? (
                              <CheckSquare className="w-5 h-5 text-gold-500" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>
                          <div>
                            <div className="font-bold text-slate-200 text-sm">
                              {student.nome}
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                              <span>Idade: <span className="text-slate-300">{getBjjAge(student.dataNascimento)} anos</span></span>
                              <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                              <span>Turma: <span className="text-slate-300">{student.turma}</span></span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Desktop cells start here */}
                      <td className="hidden lg:table-cell px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleSelectStudent(student.id)}
                          className="text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded"
                          type="button"
                          aria-label={`Selecionar ${student.nome}`}
                        >
                          {selectedStudentIds.includes(student.id) ? (
                            <CheckSquare className="w-4 h-4 text-gold-500" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4">
                        <div className="font-bold text-slate-200 group-hover:text-white transition-colors text-sm">
                          {student.nome}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium mt-1 flex items-center gap-1.5">
                          <span>Idade: <span className="text-slate-300">{getBjjAge(student.dataNascimento)} anos</span></span>
                          <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                          <span>Turma: <span className="text-slate-300">{student.turma}</span></span>
                        </div>
                      </td>

                      <td className="flex justify-between items-center lg:table-cell px-2 lg:px-6 py-2 lg:py-4">
                        <span className="lg:hidden text-[11px] font-black uppercase text-slate-500">Faixa Atual</span>
                        <div className="flex justify-start">
                          <BeltBadge faixa={student.faixa} graus={student.graus} />
                        </div>
                      </td>
                      <td className="flex justify-between items-center lg:table-cell px-2 lg:px-6 py-2 lg:py-4 text-center">
                        <span className="lg:hidden text-[11px] font-black uppercase text-slate-500">Nova Faixa</span>
                        <div className="flex justify-center">
                          <select
                            value={config.faixa}
                            aria-label={`Nova Faixa para ${student.nome}`}
                            onChange={(e) => handleUpdateConfig(student.id, 'faixa', e.target.value as Belt)}
                            className="bg-obsidian-950 border border-obsidian-700 rounded-lg px-3 py-2 text-slate-200 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50 w-36 shadow-inner cursor-pointer"
                          >
                            {getBeltsByAge(student.dataNascimento).map((b: Belt) => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="flex justify-between items-center lg:table-cell px-2 lg:px-6 py-2 lg:py-4 text-center">
                        <span className="lg:hidden text-[11px] font-black uppercase text-slate-500">Graus</span>
                        <div className="flex justify-center">
                          <select
                            value={config.graus}
                            aria-label={`Graus para ${student.nome}`}
                            onChange={(e) => handleUpdateConfig(student.id, 'graus', Number(e.target.value) as Degree)}
                            className="bg-obsidian-950 border border-obsidian-700 rounded-lg px-3 py-2 text-slate-200 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50 w-28 shadow-inner cursor-pointer"
                          >
                            <option value={0}>0 Grau</option>
                            <option value={1}>1 Grau</option>
                            <option value={2}>2 Graus</option>
                            <option value={3}>3 Graus</option>
                            <option value={4}>4 Graus</option>
                          </select>
                        </div>
                      </td>
                      <td className="flex justify-between items-center lg:table-cell px-2 lg:px-6 py-2 lg:py-4 text-center">
                        <span className="lg:hidden text-[11px] font-black uppercase text-slate-500">Data</span>
                        <div className="flex justify-center">
                          <input
                            type="date"
                            aria-label={`Data da graduação de ${student.nome}`}
                            value={config.data}
                            onChange={(e) => handleUpdateConfig(student.id, 'data', e.target.value)}
                            className="bg-obsidian-950 border border-obsidian-700 rounded-lg px-3 py-2 text-slate-200 text-xs font-mono font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50 shadow-inner cursor-text"
                          />
                        </div>
                      </td>
                      <td className="flex lg:table-cell px-2 lg:px-6 py-4 mt-2 lg:mt-0 lg:text-right border-t border-obsidian-800/40 lg:border-none">
                        <div className="flex flex-1 lg:flex-none items-center justify-between lg:justify-end gap-2.5">
                          <div className="flex-1 lg:flex-none text-left lg:text-right">
                            {success && (
                              <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-widest animate-pulse mr-1">
                                {success}
                              </span>
                            )}
                            {error && (
                              <span className="text-[11px] text-red-400 font-bold uppercase tracking-widest animate-shake mr-1 max-w-[120px] truncate block lg:inline" title={error}>
                                {error}
                              </span>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleConfirmSingleGraduation(student)}
                              disabled={isProcessing}
                              className={`flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-widest font-black px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gold-500 focus-visible:ring-offset-obsidian-900 ${
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
                                <><Check className="w-3.5 h-3.5" /> Salvo</>
                              ) : (
                                'Outorgar'
                              )}
                            </button>

                            <button
                              onClick={() => handlePrintIndividual(student)}
                              className="p-2.5 rounded-xl bg-obsidian-950 hover:bg-obsidian-900 border border-obsidian-800 hover:border-slate-600 text-slate-300 hover:text-white transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                              title="Gerar e Baixar Diploma PDF"
                              aria-label={`Gerar diploma para ${student.nome}`}
                              type="button"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé da Tabela (Ações em Lote e Paginação) */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-obsidian-800/80 bg-obsidian-950/60 gap-4">
          <div className="flex items-center gap-3">
            {selectedStudentIds.length > 0 ? (
              <button
                onClick={handleDownloadConsolidatedPDF}
                className="flex items-center gap-2 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-obsidian-950 font-black text-[10px] uppercase tracking-widest py-2.5 px-5 rounded-xl transition-all shadow-lg shadow-gold-500/20 active:scale-95"
                type="button"
              >
                <Award className="w-4 h-4" />
                Imprimir {selectedStudentIds.length} {selectedStudentIds.length === 1 ? 'Diploma' : 'Diplomas'}
              </button>
            ) : (
              <span className="text-[11px] text-slate-500 font-medium italic flex items-center gap-2">
                <Square className="w-3.5 h-3.5 opacity-50" />
                Selecione alunos para emitir diplomas em lote
              </span>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2 bg-obsidian-900 p-1.5 rounded-xl border border-obsidian-800">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-obsidian-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                type="button"
                title="Página Anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="text-[11px] font-bold text-slate-300 px-3">
                Pág <span className="text-white">{currentPage}</span> de {totalPages}
              </span>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-obsidian-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                type="button"
                title="Próxima Página"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default BatchGraduationPage;
