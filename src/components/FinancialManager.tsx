import React, { useState, useRef } from 'react';
import type { Aluno, PaymentStatus } from '../types';
import { useStudents } from '../contexts/StudentsContext';
import { paymentService } from '../services/paymentService';
import { FinancialSummary } from './financial/FinancialSummary';
import { PaymentHistoryModal } from './financial/PaymentHistoryModal';
import { supabase } from '../lib/supabase';
import {
  Search,
  History,
  Check,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const FinancialManager: React.FC = () => {
  const { students, setStudents } = useStudents();
  const [searchQuery, setSearchQuery] = useState('');

  // Modais e Estados de histórico
  const [selectedStudent, setSelectedStudent] = useState<Aluno | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const ALL_MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const currentYear = new Date().getFullYear().toString();

  // Anos de histórico disponíveis
  const yearsFromRecords = students.flatMap(s => s.pagamentos.map(p => p.mesRef.split('/')[1]));
  const availableYears = Array.from(new Set([currentYear, ...yearsFromRecords.filter(Boolean)])).sort((a, b) => Number(b) - Number(a));

  const [yearFilter, setYearFilter] = useState<string>(currentYear);
  const availableMonths = ALL_MONTHS.map(m => `${m}/${yearFilter}`);

  const getDefaultMonth = (year: string) => {
    if (year === currentYear) {
      return `${ALL_MONTHS[new Date().getMonth()]}/${year}`;
    }
    return `Janeiro/${year}`;
  };

  const [monthFilter, setMonthFilter] = useState<string>(getDefaultMonth(currentYear));
  const [selectedHistoryMonth, setSelectedHistoryMonth] = useState<string>(getDefaultMonth(currentYear));

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const VALOR_MENSALIDADE = 100;

  // Totalizadores Financeiros
  const getFaturamento = (refFilter: string, targetYearVal: string, filterByMonth = true) => {
    return students.reduce((acc, student) => {
      const paid = student.pagamentos.filter(p => {
        const isPaid = p.status === 'Pago';
        if (filterByMonth) {
          return p.mesRef === refFilter && isPaid;
        } else {
          return p.mesRef.endsWith(`/${targetYearVal}`) && isPaid;
        }
      });
      return acc + paid.length * VALOR_MENSALIDADE;
    }, 0);
  };

  const getFaturamentoPorTurma = (refFilter: string, targetYearVal: string, filterByMonth: boolean, targetTurma: 'Adulto' | 'Kids') => {
    return students.reduce((acc, student) => {
      if (student.turma !== targetTurma) return acc;
      const paid = student.pagamentos.filter(p => {
        const isPaid = p.status === 'Pago';
        if (filterByMonth) {
          return p.mesRef === refFilter && isPaid;
        } else {
          return p.mesRef.endsWith(`/${targetYearVal}`) && isPaid;
        }
      });
      return acc + paid.length * VALOR_MENSALIDADE;
    }, 0);
  };

  const totalRecebidoMes = getFaturamento(monthFilter, yearFilter, true);
  const totalRecebidoMesAdulto = getFaturamentoPorTurma(monthFilter, yearFilter, true, 'Adulto');
  const totalRecebidoMesKids = getFaturamentoPorTurma(monthFilter, yearFilter, true, 'Kids');

  const totalAnoRecebido = getFaturamento(monthFilter, yearFilter, false);
  const totalAnoRecebidoAdulto = getFaturamentoPorTurma(monthFilter, yearFilter, false, 'Adulto');
  const totalAnoRecebidoKids = getFaturamentoPorTurma(monthFilter, yearFilter, false, 'Kids');

  // Alertas e Uploader
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MONTH_SLUGS = [
    'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];

  // Exportação CSV (formato anual pivô)
  const handleExportCSV = () => {
    const header = [
      'id_aluno', 'nome_aluno', 'turma', 'ano_ref',
      ...MONTH_SLUGS.map(m => `mes_ref_${m}`)
    ];

    const rows: string[][] = filteredStudents.map(student => {
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

  // Importação CSV (formato anual pivô)
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (fileInputRef.current) fileInputRef.current.value = '';

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = (event.target?.result as string).replace(/^\uFEFF/, '');
        const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');

        if (lines.length < 2) {
          setImportError('Arquivo CSV vazio ou sem dados.');
          return;
        }

        const headerLine = lines[0].split(';').map(h => h.replace(/"/g, '').trim());
        const requiredCols = ['id_aluno', 'ano_ref', ...MONTH_SLUGS.map(m => `mes_ref_${m}`)];
        const missingCols = requiredCols.filter(c => !headerLine.includes(c));
        if (missingCols.length > 0) {
          setImportError(`Colunas ausentes no CSV: ${missingCols.join(', ')}`);
          return;
        }

        const colIndex = (name: string) => headerLine.indexOf(name);
        const rowMap = new Map<number, string[]>();

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(';').map(c => c.replace(/^"|"$/g, '').replace(/""/g, '"').trim());
          const alunoId = Number(cols[colIndex('id_aluno')]);
          if (alunoId) rowMap.set(alunoId, cols);
        }

        let targetYear = yearFilter;
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(';').map(c => c.replace(/^"|"$/g, '').replace(/""/g, '"').trim());
          const yearVal = cols[colIndex('ano_ref')];
          if (yearVal) {
            targetYear = yearVal;
            break;
          }
        }

        // Limpa faturas antigas do mesmo ano de referência no Supabase
        await paymentService.clearPaymentsByYear(targetYear);

        let updatedCount = 0;
        const paymentsToUpsert: any[] = [];
        const studentUpdates: { [alunoId: number]: any[] } = {};
        const todayStr = new Date().toISOString().split('T')[0];

        students.forEach(student => {
          const cols = rowMap.get(student.id);
          if (!cols) return;

          const anoRef = cols[colIndex('ano_ref')];
          let pagamentos = student.pagamentos.filter(p => !p.mesRef.endsWith(`/${anoRef}`));
          let modified = false;

          MONTH_SLUGS.forEach((slug, idx) => {
            const rawVal = (cols[colIndex(`mes_ref_${slug}`)] ?? '').toUpperCase().trim();
            const temFatura = rawVal !== '' && rawVal !== 'NÃO' && rawVal !== 'NAO' && rawVal !== '0' && rawVal !== 'FALSE';
            if (!temFatura) return;

            const mesRef = `${ALL_MONTHS[idx]}/${anoRef}`;
            const newPay = {
              alunoId: student.id,
              mesRef,
              valor: VALOR_MENSALIDADE,
              status: 'Pago',
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
          await paymentService.savePaymentsBatch(paymentsToUpsert);
        }

        // Recarrega todos os alunos e pagamentos pós-atualização
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
          // Fallback para estado local em caso de falha de conexão
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

  const handleRegisterPaymentWithDate = async (alunoId: number, paymentId: number, dateStr: string) => {
    try {
      await paymentService.registerPaymentWithDate(paymentId, dateStr, VALOR_MENSALIDADE);

      setStudents(prev => prev.map(s => {
        if (s.id === alunoId) {
          const updated = s.pagamentos.map(p => {
            if (p.id === paymentId) {
              return { ...p, valor: VALOR_MENSALIDADE, status: 'Pago' as PaymentStatus, dataPagamento: dateStr };
            }
            return p;
          });
          return { ...s, pagamentos: updated };
        }
        return s;
      }));

      setPaymentSuccessMsg(`Pagamento registrado com sucesso!`);
      setTimeout(() => setPaymentSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Erro ao registrar pagamento.');
    }
  };

  const handleRegisterPaidDirectly = async (alunoId: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    try {
      const inserted = await paymentService.registerPaidDirectly(alunoId, monthFilter, VALOR_MENSALIDADE, todayStr);

      if (inserted) {
        setStudents(prev => prev.map(s => {
          if (s.id === alunoId) {
            return {
              ...s,
              pagamentos: [...s.pagamentos, inserted]
            };
          }
          return s;
        }));
      }

      setPaymentSuccessMsg(`Pagamento registrado com sucesso para o mês ${monthFilter}.`);
      setTimeout(() => setPaymentSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Erro ao registrar pagamento direto.');
    }
  };

  const handleRemovePayment = async (alunoId: number, paymentId: number) => {
    const confirmRemove = window.confirm("Deseja realmente retirar/remover este pagamento?");
    if (!confirmRemove) return;

    try {
      await paymentService.removePayment(paymentId);

      setStudents(prev => prev.map(s => {
        if (s.id === alunoId) {
          return {
            ...s,
            pagamentos: s.pagamentos.filter(p => p.id !== paymentId)
          };
        }
        return s;
      }));

      setPaymentSuccessMsg("Pagamento removido com sucesso.");
      setTimeout(() => setPaymentSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Erro ao remover pagamento.');
    }
  };

  // Filtragem e paginação
  const filteredStudents = students
    .filter(student => student.status === 'Ativo')
    .filter(student => student.nome.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  const totalItems = filteredStudents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const getCurrentPayment = (student: Aluno) => {
    return student.pagamentos.find(p => p.mesRef === monthFilter);
  };

  const handleOpenHistory = (student: Aluno) => {
    setSelectedStudent(student);
    setShowHistoryModal(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <span className="text-slate-400">💵</span> Controle Financeiro e Mensalidades
          </h1>
          <p className="text-slate-450 text-xs mt-1">
            Acompanhe faturas, mensalidades e registre pagamentos dos alunos ativos.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleExportCSV}
            className="btn-obsidian text-[10px] uppercase font-black tracking-widest px-4 py-2"
            title={`Exportar registros de ${monthFilter} para CSV`}
            type="button"
          >
            Exportar CSV
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleImportCSV}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-obsidian text-[10px] uppercase font-black tracking-widest px-4 py-2"
            title="Importar pagamentos de um arquivo CSV"
            type="button"
          >
            Importar CSV
          </button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <FinancialSummary
        monthFilter={monthFilter}
        yearFilter={yearFilter}
        totalRecebidoMes={totalRecebidoMes}
        totalRecebidoMesAdulto={totalRecebidoMesAdulto}
        totalRecebidoMesKids={totalRecebidoMesKids}
        totalAnoRecebido={totalAnoRecebido}
        totalAnoRecebidoAdulto={totalAnoRecebidoAdulto}
        totalAnoRecebidoKids={totalAnoRecebidoKids}
      />

      {/* Banners */}
      {importError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center justify-between shadow-2xl animate-fade-in text-xs font-semibold">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {importError}
          </span>
          <button onClick={() => setImportError(null)} className="text-red-400/70 hover:text-red-300 p-1" type="button">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {paymentSuccessMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg flex items-center justify-between shadow-2xl animate-fade-in text-xs font-semibold">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            {paymentSuccessMsg}
          </span>
          <button onClick={() => setPaymentSuccessMsg(null)} className="text-emerald-400/70 hover:text-emerald-350 p-1" type="button">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-obsidian-900/40 p-4 rounded-xl border border-obsidian-850/60 backdrop-blur-md">
        <div className="relative">
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
            placeholder="Buscar por nome..."
            className="input-premium w-full pl-10"
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

      {/* Tabela de Faturamento */}
      <div className="bg-obsidian-900/20 border border-obsidian-900/60 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-obsidian-850/80 text-[10px] font-bold uppercase tracking-widest text-slate-450 bg-obsidian-950/40">
                <th className="px-6 py-4">Aluno</th>
                <th className="px-6 py-4 text-center">Turma</th>
                <th className="px-6 py-4 text-center">Ref. Ciclo</th>
                <th className="px-6 py-4 text-center">Valor</th>
                <th className="px-6 py-4 text-center">Vencimento</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-900/40 text-xs text-slate-305">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500 font-semibold uppercase tracking-wider">
                    Sem faturas encontradas com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => {
                  const bill = getCurrentPayment(student);
                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-obsidian-800/15 transition-colors group"
                    >
                      <td className="px-6 py-4 text-left">
                        <div className="font-bold text-slate-200 group-hover:text-slate-100 transition-colors">
                          {student.nome}
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold mt-1">
                          Faixa {student.faixa} • Status: {student.status}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          student.turma === 'Kids'
                            ? 'bg-sky-500/5 text-sky-400 border border-sky-500/10'
                            : 'bg-indigo-500/5 text-indigo-400 border border-indigo-500/10'
                        }`}>
                          {student.turma}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-slate-400 font-mono">
                          {bill ? bill.mesRef : monthFilter}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {bill ? (
                          <div className="flex items-center justify-center gap-1 font-mono font-bold text-slate-300">
                            <span className="text-[10px] text-slate-500 font-sans">R$</span>
                            <span>100,00</span>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-400 font-mono">
                        {bill ? bill.dataVencimento.split('-').reverse().join('/') : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!bill ? (
                            <button
                              onClick={() => handleRegisterPaidDirectly(student.id)}
                              className="text-[9px] uppercase tracking-wider text-emerald-450 hover:text-emerald-400 font-black bg-emerald-500/5 border border-emerald-500/10 px-3 py-1.5 rounded h-8 flex items-center justify-center gap-1 w-24 hover:bg-emerald-500/15 transition-all"
                              title={`Registrar Pagamento para ${monthFilter}`}
                              type="button"
                            >
                              Marcar Pago
                            </button>
                          ) : bill.status !== 'Pago' ? (
                            <button
                              onClick={() => handleRegisterPaymentWithDate(student.id, bill.id, new Date().toISOString().split('T')[0])}
                              className="p-1.5 rounded bg-emerald-500/5 hover:bg-emerald-500/15 border border-emerald-500/15 text-emerald-400 hover:text-emerald-350 transition-all h-8 w-8 flex items-center justify-center"
                              title={`Registrar Pagamento de ${student.nome}`}
                              type="button"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          ) : (
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold bg-emerald-500/5 border border-emerald-500/15 px-3 py-1.5 rounded h-8 flex items-center justify-center gap-1 w-20">
                                <Check className="w-3 h-3" /> Pago
                              </span>
                              <button
                                onClick={() => handleRemovePayment(student.id, bill.id)}
                                className="p-1.5 rounded bg-red-500/5 hover:bg-red-500/15 border border-red-500/15 text-red-400 hover:text-red-300 transition-all h-8 w-8 flex items-center justify-center"
                                title="Retirar Pagamento"
                                type="button"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          <button
                            onClick={() => handleOpenHistory(student)}
                            className="p-1.5 rounded bg-obsidian-950/80 hover:bg-obsidian-900 border border-obsidian-900 text-slate-400 hover:text-slate-200 transition-all h-8 w-8 flex items-center justify-center"
                            title="Histórico de Mensalidades"
                            type="button"
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

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-obsidian-850/80 bg-obsidian-950/20">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Mostrando <span className="text-slate-300">{startIndex + 1}</span> a <span className="text-slate-300">{Math.min(startIndex + itemsPerPage, totalItems)}</span> de <span className="text-slate-300">{totalItems}</span> faturas
            </span>
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
          </div>
        )}
      </div>

      {/* Modal Histórico Mensalidades */}
      <PaymentHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        student={selectedStudent}
        selectedHistoryMonth={selectedHistoryMonth}
        setSelectedHistoryMonth={setSelectedHistoryMonth}
        VALOR_MENSALIDADE={VALOR_MENSALIDADE}
      />
    </div>
  );
};
