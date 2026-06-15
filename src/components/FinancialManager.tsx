import React, { useState, useRef } from 'react';
import type { Aluno, PaymentStatus } from '../types';
import { supabase } from '../lib/supabase';
import {
  Search,
  History,
  Check,
  AlertCircle,
  Clock,
  X,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload
} from 'lucide-react';

interface FinancialManagerProps {
  students: Aluno[];
  setStudents: React.Dispatch<React.SetStateAction<Aluno[]>>;
}

export const FinancialManager: React.FC<FinancialManagerProps> = ({ students, setStudents }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Modal para histórico de pagamentos
  const [selectedStudent, setSelectedStudent] = useState<Aluno | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyViewTab, setHistoryViewTab] = useState<'all' | 'by_month'>('all');
  const ALL_MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const currentYear = new Date().getFullYear().toString();
  
  // Extrai anos únicos do histórico de pagamentos dos alunos, mais o ano atual
  const yearsFromRecords = students.flatMap(s => s.pagamentos.map(p => p.mesRef.split('/')[1]));
  const availableYears = Array.from(new Set([currentYear, ...yearsFromRecords.filter(Boolean)])).sort((a, b) => Number(b) - Number(a));

  const [yearFilter, setYearFilter] = useState<string>(currentYear);

  // Gera os meses com base no ano selecionado
  const availableMonths = ALL_MONTHS.map(m => `${m}/${yearFilter}`);

  const getDefaultMonth = (year: string) => {
    if (year === currentYear) {
      return `${ALL_MONTHS[new Date().getMonth()]}/${year}`;
    }
    return `Janeiro/${year}`;
  };

  const [monthFilter, setMonthFilter] = useState<string>(getDefaultMonth(currentYear));

  // Também precisa da lógica selectedHistoryMonth para o modal de Histórico
  const [selectedHistoryMonth, setSelectedHistoryMonth] = useState<string>(getDefaultMonth(currentYear));

  // Estado de paginação
  const [currentPage, setCurrentPage] = useState(1);



  const VALOR_MENSALIDADE = 100; // Valor fixo da mensalidade em R$

  // Total recebido no MÊS de referência selecionado (mesRef === monthFilter e status Pago)
  const totalRecebidoMes = students.reduce((acc, student) => {
    const paid = student.pagamentos.filter(p =>
      p.mesRef === monthFilter && p.status === 'Pago'
    );
    return acc + paid.length * VALOR_MENSALIDADE;
  }, 0);

  // Total recebido no ANO selecionado (mesRef termina com /yearFilter e status Pago)
  const totalAnoRecebido = students.reduce((acc, student) => {
    const paid = student.pagamentos.filter(p =>
      p.status === 'Pago' && p.mesRef.endsWith(`/${yearFilter}`)
    );
    return acc + paid.length * VALOR_MENSALIDADE;
  }, 0);

  const itemsPerPage = 10;

  // Indicador de animação de pagamento registrado
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Slugs de meses para colunas do CSV (sem acento para compatibilidade)
  const MONTH_SLUGS = [
    'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];

  // ─── Exportação CSV (formato anual pivô) ──────────────────────────────────────
  const handleExportCSV = () => {
    const header = [
      'id_aluno', 'nome_aluno', 'turma', 'ano_ref',
      ...MONTH_SLUGS.map(m => `mes_ref_${m}`)
    ];

    const rows: string[][] = filteredStudents.map(student => {
      // Cada mês: "SIM" se há fatura (= R$100), "NÃO" se não há
      const monthValues = ALL_MONTHS.map(monthName => {
        const mesRef = `${monthName}/${yearFilter}`;
        const hasFatura = student.pagamentos.some(p => p.mesRef === mesRef);
        return hasFatura ? 'SIM' : 'NÃO';
      });

      return [
        String(student.id),
        student.nome,
        student.turma,
        yearFilter,
        ...monthValues
      ];
    });

    const csvContent = [
      header.join(';'),
      ...rows.map(r => r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(';'))
    ].join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financeiro_${yearFilter}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    setPaymentSuccessMsg(`Exportação concluída: ${rows.length} aluno(s) exportado(s) — ano ${yearFilter}.`);
    setTimeout(() => setPaymentSuccessMsg(null), 4000);
  };

  // ─── Importação CSV (formato anual pivô) ──────────────────────────────────────
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (fileInputRef.current) fileInputRef.current.value = '';

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = (event.target?.result as string).replace(/^\uFEFF/, ''); // remove BOM
        const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');

        if (lines.length < 2) {
          setImportError('Arquivo CSV vazio ou sem dados.');
          return;
        }

        const headerLine = lines[0].split(';').map(h => h.replace(/"/g, '').trim());

        // Valida colunas obrigatórias do formato pivô
        const requiredCols = ['id_aluno', 'ano_ref', ...MONTH_SLUGS.map(m => `mes_ref_${m}`)];
        const missingCols = requiredCols.filter(c => !headerLine.includes(c));
        if (missingCols.length > 0) {
          setImportError(`Colunas ausentes no CSV: ${missingCols.join(', ')}`);
          return;
        }

        const colIndex = (name: string) => headerLine.indexOf(name);

        // Pré-processa todas as linhas em um mapa id_aluno → cols
        const rowMap = new Map<number, string[]>();
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(';').map(c => c.replace(/^"|"$/g, '').replace(/""/g, '"').trim());
          const alunoId = Number(cols[colIndex('id_aluno')]);
          if (alunoId) rowMap.set(alunoId, cols);
        }

        // Identificar o ano de referência a partir da primeira linha válida para limpar os registros do mesmo ano
        let targetYear = yearFilter;
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(';').map(c => c.replace(/^"|"$/g, '').replace(/""/g, '"').trim());
          const yearVal = cols[colIndex('ano_ref')];
          if (yearVal) {
            targetYear = yearVal;
            break;
          }
        }

        // Zera/deleta no Supabase todos os pagamentos dos alunos no ano de referência antes de salvar os novos do CSV
        const { error: deleteError } = await supabase
          .from('pagamentos')
          .delete()
          .like('mesRef', `%/${targetYear}`);

        if (deleteError) {
          console.error('Error clearing old payments:', deleteError);
        }

        let updatedCount = 0;
        const paymentsToUpsert: any[] = [];
        const studentUpdates: { [alunoId: number]: any[] } = {};
        const todayStr = new Date().toISOString().split('T')[0];

        students.forEach(student => {
          const cols = rowMap.get(student.id);
          if (!cols) return;

          const anoRef = cols[colIndex('ano_ref')];
          // Limpa todos os pagamentos daquele ano do array local do estudante
          let pagamentos = student.pagamentos.filter(p => !p.mesRef.endsWith(`/${anoRef}`));
          let modified = false;

          MONTH_SLUGS.forEach((slug, idx) => {
            const rawVal = (cols[colIndex(`mes_ref_${slug}`)] ?? '').toUpperCase().trim();
            const temFatura = rawVal !== '' && rawVal !== 'NÃO' && rawVal !== 'NAO' && rawVal !== '0' && rawVal !== 'FALSE';
            if (!temFatura) return;

            const mesRef = `${ALL_MONTHS[idx]}/${anoRef}`;

            // Cria novo registro como PAGO com valor fixo diretamente da importação do CSV
            const newPay = {
              alunoId: student.id,
              mesRef,
              valor: VALOR_MENSALIDADE,
              status: 'Pago' as any,
              dataVencimento: `${anoRef}-${String(idx + 1).padStart(2, '0')}-10`,
              dataPagamento: todayStr
            };
            paymentsToUpsert.push(newPay);
            pagamentos.push(newPay as any);
            modified = true;
          });

          if (modified) {
            updatedCount++;
            studentUpdates[student.id] = pagamentos;
          }
        });

        if (paymentsToUpsert.length > 0) {
          const { error: upsertError } = await supabase
            .from('pagamentos')
            .upsert(paymentsToUpsert);

          if (upsertError) {
            console.error('Error persisting payments to Supabase:', upsertError);
            setImportError('Erro ao salvar os pagamentos no banco de dados.');
            return;
          }
        }

        // Buscar alunos atualizados do banco de dados para recarregar com os novos registros (incluindo IDs criados pelo DB se houver)
        const { data: refreshedData, error: refreshError } = await supabase
          .from('alunos')
          .select('*, pagamentos!pagamentos_alunoId_fkey(*), graduacoes_historico!graduacoes_historico_aluno_id_fkey(*)');

        if (!refreshError && refreshedData) {
          const mapped = refreshedData.map((student: any) => ({
            ...student,
            historicoGraduacoes: (student.graduacoes_historico || []).map((g: any) => ({
              id: g.id,
              data: g.data_graduacao,
              faixa: g.faixa,
              graus: g.graus,
              avaliador: g.avaliador
            })).sort((a: any, b: any) => new Date(a.data).getTime() - new Date(b.data).getTime())
          }));
          const sorted = mapped.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
          setStudents(sorted as any);
        } else {
          // Fallback para estado local caso ocorra um erro ao recarregar
          setStudents(prev => prev.map(student => {
            if (studentUpdates[student.id]) {
              return { ...student, pagamentos: studentUpdates[student.id] };
            }
            return student;
          }));
        }

        setPaymentSuccessMsg(`Importação concluída: ${updatedCount} aluno(s) atualizado(s).`);
        setTimeout(() => setPaymentSuccessMsg(null), 5000);
      } catch (err) {
        setImportError('Erro ao processar o arquivo CSV. Verifique o formato.');
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  // Registra o pagamento com a data selecionada
  const handleRegisterPaymentWithDate = async (alunoId: number, paymentId: number, dateStr: string) => {
    if (!dateStr) {
      alert("A data de pagamento é obrigatória.");
      return;
    }

    const { error: updateError } = await supabase
      .from('pagamentos')
      .update({
        valor: VALOR_MENSALIDADE,
        status: 'Pago',
        dataPagamento: dateStr
      })
      .eq('id', paymentId);

    if (updateError) {
      console.error('Error updating payment in Supabase:', updateError);
      alert('Erro ao registrar pagamento no banco de dados.');
      return;
    }

    setStudents(prev => prev.map(s => {
      if (s.id === alunoId) {
        const updatedPagamentos = s.pagamentos.map(p => {
          if (p.id === paymentId) {
            return {
              ...p,
              valor: VALOR_MENSALIDADE,
              status: 'Pago' as PaymentStatus,
              dataPagamento: dateStr
            };
          }
          return p;
        });

        setPaymentSuccessMsg(`Pagamento de R$ ${VALOR_MENSALIDADE.toFixed(2).replace('.', ',')} registrado com sucesso para ${s.nome}!`);
        setTimeout(() => setPaymentSuccessMsg(null), 4000);

        return {
          ...s,
          pagamentos: updatedPagamentos
        };
      }
      return s;
    }));

    // Se o modal estiver aberto para histórico, atualize a referência selectedStudent para refletir a alteração
    if (selectedStudent && selectedStudent.id === alunoId) {
      setSelectedStudent(prev => {
        if (!prev) return null;
        return {
          ...prev,
          pagamentos: prev.pagamentos.map(p => {
            if (p.id === paymentId) {
              return { ...p, status: 'Pago', dataPagamento: dateStr };
            }
            return p;
          })
        };
      });
    }
  };




  // Obtém o registro de pagamento atual com base no filtro de mês selecionado
  const getCurrentPayment = (student: Aluno) => {
    return student.pagamentos.find(p => p.mesRef === monthFilter);
  };

  const handleGeneratePayment = async (alunoId: number) => {
    const defaultVencimento = new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0];
    const newPayment = {
      alunoId,
      mesRef: monthFilter,
      valor: VALOR_MENSALIDADE,
      status: 'Pendente',
      dataVencimento: defaultVencimento,
      dataPagamento: null
    };

    const { data: insertedPayment, error: insertError } = await supabase
      .from('pagamentos')
      .insert(newPayment)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating payment in Supabase:', insertError);
      alert('Erro ao gerar fatura no banco de dados.');
      return;
    }

    if (insertedPayment) {
      setStudents(prev => prev.map(s => {
        if (s.id === alunoId) {
          return {
            ...s,
            pagamentos: [...s.pagamentos, insertedPayment]
          };
        }
        return s;
      }));
    }
    
    setPaymentSuccessMsg(`Fatura gerada para o mês ${monthFilter}.`);
    setTimeout(() => setPaymentSuccessMsg(null), 3000);
  };

  // Filtra e ordena os alunos alfabeticamente com base no status (apenas Ativo), status de pagamento atual e busca
  const filteredStudents = students
    .filter(student => student.status === 'Ativo')
    .filter(student => {
      const matchesSearch = student.nome.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  // Cálculos de paginação
  const totalItems = filteredStudents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Abre o modal de histórico
  const handleOpenHistory = (student: Aluno) => {
    setSelectedStudent(student);
    setShowHistoryModal(true);
  };

  const renderStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'Pago':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Check className="w-3.5 h-3.5" />
            Pago
          </span>
        );
      case 'Pendente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            Pendente
          </span>
        );
      case 'Atrasado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            Atrasado
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            Controle Financeiro e Mensalidades
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Acompanhe faturas, mensalidades e registre pagamentos dos alunos ativos e inativos.
          </p>
        </div>

        {/* Botões Exportar / Importar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 text-blue-400 hover:text-blue-300 transition-all"
            title={`Exportar registros de ${monthFilter} para CSV`}
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>

          {/* Input oculto para importação */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleImportCSV}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-400 hover:text-amber-300 transition-all"
            title="Importar pagamentos de um arquivo CSV"
          >
            <Upload className="w-3.5 h-3.5" />
            Importar CSV
          </button>
        </div>
      </div>

      {/* Resumos Financeiros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Selected Month Summary */}
        <div className="card-premium bg-gradient-to-br from-obsidian-800 to-obsidian-850 flex items-center justify-between border-l-4 border-l-emerald-500 p-5">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Recebido em {monthFilter}</span>
            <span className="text-2xl font-black text-slate-100 mt-1 block">R$ {totalRecebidoMes.toFixed(2).replace('.', ',')}</span>
            <span className="text-[10px] text-slate-500 mt-1 block">Recebimentos no mês corrente</span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 hidden sm:block">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        {/* Consolidated Year Summary */}
        <div className="card-premium bg-gradient-to-br from-obsidian-800 to-obsidian-850 flex items-center justify-between border-l-4 border-l-blue-500 p-5">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Recebido ({yearFilter})</span>
            <span className="text-2xl font-black text-slate-100 mt-1 block">R$ {totalAnoRecebido.toFixed(2).replace('.', ',')}</span>
            <span className="text-[10px] text-slate-500 mt-1 block">Soma de recebimentos no ano selecionado</span>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 hidden sm:block">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Import error banner */}
      {importError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg flex items-center justify-between shadow-md shadow-red-950/20 animate-fade-in">
          <span className="text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {importError}
          </span>
          <button onClick={() => setImportError(null)} className="text-red-400/70 hover:text-red-300 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Payment registered banner */}
      {paymentSuccessMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-lg flex items-center justify-between shadow-md shadow-emerald-950/20 animate-fade-in">
          <span className="text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" />
            {paymentSuccessMsg}
          </span>
          <button onClick={() => setPaymentSuccessMsg(null)} className="text-emerald-400/70 hover:text-emerald-350 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-obsidian-850 p-4 rounded-xl border border-obsidian-800/80">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por nome..."
            className="input-premium w-full pl-9"
          />
        </div>

        <div>
          <select
            value={yearFilter}
            onChange={(e) => {
              const newYear = e.target.value;
              setYearFilter(newYear);
              setMonthFilter(getDefaultMonth(newYear));
              setCurrentPage(1);
            }}
            className="input-premium w-full bg-obsidian-950 text-slate-200"
          >
            {availableYears.map(y => (
              <option key={y} value={y}>Ano: {y}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={monthFilter}
            onChange={(e) => {
              setMonthFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="input-premium w-full bg-obsidian-950 text-slate-200"
          >
            {availableMonths.map(m => (
              <option key={m} value={m}>Mês Ref: {m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Billing Table */}
      <div className="bg-obsidian-800/50 border border-obsidian-800/90 rounded-xl overflow-hidden shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-obsidian-750 text-xs font-bold uppercase tracking-wider text-slate-400 bg-obsidian-850/40">
                <th className="px-6 py-4">Aluno</th>
                <th className="px-6 py-4 text-center">Ref. Ciclo</th>
                <th className="px-6 py-4 text-center">Valor</th>
                <th className="px-6 py-4 text-center">Vencimento</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-750 text-sm text-slate-300">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500 font-medium">
                    Sem faturas encontradas com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => {
                  const bill = getCurrentPayment(student);
                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-obsidian-700/20 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-100 group-hover:text-gold-400 transition-colors">
                          {student.nome}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Faixa {student.faixa} • Status: {student.status}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs font-semibold text-slate-400">
                          {bill ? bill.mesRef : monthFilter}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {bill ? (
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-xs text-slate-400">R$</span>
                            <span className="font-bold text-slate-200 text-sm">100,00</span>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-center text-xs text-slate-400 font-mono">
                        {bill ? bill.dataVencimento.split('-').reverse().join('/') : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!bill ? (
                            <button
                              onClick={() => handleGeneratePayment(student.id)}
                              className="text-[10px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded h-8 flex items-center justify-center gap-1 w-24 hover:bg-amber-500/20 transition-colors"
                              title={`Gerar Fatura para ${monthFilter}`}
                            >
                              + Gerar Fatura
                            </button>
                          ) : bill.status !== 'Pago' ? (
                            <button
                              onClick={() => handleRegisterPaymentWithDate(student.id, bill.id, new Date().toISOString().split('T')[0])}
                              className="p-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition-all h-8 w-8 flex items-center justify-center"
                              title={`Registrar Pagamento de ${student.nome}`}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded h-8 flex items-center justify-center gap-1 w-24">
                              <Check className="w-3 h-3" /> Pago
                            </span>
                          )}
                          <button
                            onClick={() => handleOpenHistory(student)}
                            className="p-1.5 rounded bg-obsidian-850 hover:bg-obsidian-700 border border-obsidian-700 text-slate-400 hover:text-gold-500 transition-all h-8 w-8 flex items-center justify-center"
                            title="Histórico de Mensalidades"
                          >
                            <History className="w-4 h-4" />
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-obsidian-750 bg-obsidian-850/20">
            <span className="text-xs text-slate-400">
              Mostrando <span className="text-slate-200">{startIndex + 1}</span> a <span className="text-slate-200">{Math.min(startIndex + itemsPerPage, totalItems)}</span> de <span className="text-slate-200">{totalItems}</span> faturas
            </span>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="btn-obsidian py-1.5 px-2.5 text-xs disabled:opacity-50 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Anterior
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="btn-obsidian py-1.5 px-2.5 text-xs disabled:opacity-50 disabled:pointer-events-none"
              >
                Próximo
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* History Modal */}
      {showHistoryModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-obsidian-850 border border-obsidian-700 rounded-2xl w-full max-w-lg shadow-2xl animate-scale-up">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-obsidian-750 bg-obsidian-850 rounded-t-2xl">
              <div>
                <h2 className="text-md font-bold text-slate-100 flex items-center gap-2">
                  <History className="w-4 h-4 text-gold-500" />
                  Histórico de Faturas: {selectedStudent.nome}
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Lista completa de faturas registradas no sistema.
                </p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-gold-500 p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Tabs/Abas */}
            <div className="px-6 py-2 border-b border-obsidian-750 bg-obsidian-850/40 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setHistoryViewTab('all')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${historyViewTab === 'all' ? 'bg-gold-500/15 text-gold-450 border border-gold-500/25' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Todos os pagamentos
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryViewTab('by_month')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${historyViewTab === 'by_month' ? 'bg-gold-500/15 text-gold-450 border border-gold-500/25' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Ver os pagamentos por mês
                </button>
              </div>

              {historyViewTab === 'by_month' && (
                <select
                  value={selectedHistoryMonth}
                  onChange={(e) => setSelectedHistoryMonth(e.target.value)}
                  className="input-premium py-1 px-2 text-xs bg-obsidian-950 text-slate-200 font-semibold w-36"
                >
                  {Array.from(new Set(selectedStudent.pagamentos.map(p => p.mesRef))).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Modal History Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-3">
                {(() => {
                  const filteredPays = [...selectedStudent.pagamentos]
                    .filter(p => historyViewTab === 'all' || p.mesRef === selectedHistoryMonth)
                    .sort((a, b) => b.mesRef.localeCompare(a.mesRef));

                  if (filteredPays.length === 0) {
                    return (
                      <div className="text-center py-6 text-slate-500 text-xs">
                        Nenhum registro de faturamento encontrado.
                      </div>
                    );
                  }

                  return filteredPays.map((pay) => (
                    <div
                      key={pay.id}
                      className={`flex flex-col gap-2 p-3 rounded-xl border transition-all ${
                        pay.status === 'Pago'
                          ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
                          : pay.status === 'Atrasado'
                          ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                          : 'bg-obsidian-900 border-obsidian-750/80 hover:border-amber-500/20'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-bold text-xs text-slate-200">
                          Ciclo {pay.mesRef}
                        </span>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-slate-100">
                            R$ {VALOR_MENSALIDADE.toFixed(2).replace('.', ',')}
                          </span>
                          <div className="min-w-24 flex justify-end">
                            {renderStatusBadge(pay.status as any)}
                          </div>
                        </div>
                      </div>

                      {/* Linha de detalhe de data */}
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 pt-0.5 border-t border-obsidian-750/50">
                        {pay.status === 'Pago' && pay.dataPagamento ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            Pago em {pay.dataPagamento.split('-').reverse().join('/')}
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-500" />
                            Vence em {pay.dataVencimento ? pay.dataVencimento.split('-').reverse().join('/') : '—'}
                          </>
                        )}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-obsidian-750 bg-obsidian-850 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="btn-obsidian text-xs px-4 py-2"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}



    </div>
  );
};
