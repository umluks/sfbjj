import React, { useState, useRef } from 'react';
import type { Aluno } from '@/domain/models/student';
import type { PaymentStatus } from '@/domain/models/payment';
import { useStudents } from '@/application/contexts/StudentsContext';
import { paymentService } from '@/application/services/paymentService';
import { FinancialSummary } from '@/presentation/components/financial/FinancialSummary';
import { PaymentHistoryModal } from '@/presentation/components/financial/PaymentHistoryModal';
import { FinancialCharts } from '@/presentation/components/financial/FinancialCharts';

import {
  Search,
  History,
  Check,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const FinancialPage: React.FC = () => {
  const { students, setStudents, loadStudents } = useStudents();
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

  // Prepara dados de faturamento mensal para os 12 meses do ano ativo
  const financialChartData = React.useMemo(() => {
    return ALL_MONTHS.map(month => {
      const refFilter = `${month}/${yearFilter}`;
      const total = getFaturamento(refFilter, yearFilter, true);
      const kids = getFaturamentoPorTurma(refFilter, yearFilter, true, 'Kids');
      const adulto = getFaturamentoPorTurma(refFilter, yearFilter, true, 'Adulto');
      return {
        label: month.substring(0, 3),
        total,
        kids,
        adulto
      };
    });
  }, [students, yearFilter]);

  // Alertas e Uploader
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MONTH_SLUGS = [
    'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];

  // Exportação CSV
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

  // Importação CSV
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

        // Recarrega os alunos via contexto
        try {
          await loadStudents();
        } catch (loadErr) {
          console.error('Falha ao recarregar alunos:', loadErr);
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
    <div className="space-y-8 animate-fade-in text-left">
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
            className="btn-gold text-[10px] uppercase font-black tracking-widest px-4 py-2"
            title="Importar registros em lote de faturas"
            type="button"
          >
            Importar CSV
          </button>
        </div>
      </div>

      {paymentSuccessMsg && (
        <div className="flex items-start gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-450 text-xs animate-fade-in">
          <Check className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{paymentSuccessMsg}</span>
        </div>
      )}

      {importError && (
        <div className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-xs animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{importError}</span>
        </div>
      )}

      {/* Seletor de Referência de Mês/Ano */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-obsidian-950 p-4 border border-obsidian-850/80">
        <div>
          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
            Ano de Referência
          </label>
          <select
            value={yearFilter}
            onChange={(e) => {
              const y = e.target.value;
              setYearFilter(y);
              setMonthFilter(getDefaultMonth(y));
              setSelectedHistoryMonth(getDefaultMonth(y));
              setCurrentPage(1);
            }}
            className="input-premium w-full bg-obsidian-900 text-slate-200 cursor-pointer font-bold"
          >
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
            Mês de Referência
          </label>
          <select
            value={monthFilter}
            onChange={(e) => {
              setMonthFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="input-premium w-full bg-obsidian-900 text-slate-200 cursor-pointer font-bold"
          >
            {availableMonths.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="bg-obsidian-900 border border-obsidian-850/70 p-3.5 flex items-center justify-between text-xs text-slate-400">
          <span>Valor Fixo Mensalidade:</span>
          <strong className="text-slate-100 font-mono text-sm">R$ {VALOR_MENSALIDADE.toFixed(2).replace('.', ',')}</strong>
        </div>
      </div>

      {/* Indicadores Consolidados */}
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

      {/* Gráficos Financeiros */}
      <FinancialCharts data={financialChartData} />

      {/* Listagem de Alunos e Ações Financeiras */}
      <div className="bg-obsidian-900/20 border border-obsidian-900/60 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="px-6 py-4 border-b border-obsidian-850/80 bg-obsidian-950/40 flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Buscar aluno ativo..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="input-premium pl-9 w-full"
            />
          </div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Mostrando {filteredStudents.length} aluno(s) ativo(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-obsidian-850/80 text-[10px] font-bold uppercase tracking-widest text-slate-450 bg-obsidian-950/40">
                <th className="px-6 py-4">Nome do Aluno</th>
                <th className="px-6 py-4">Turma</th>
                <th className="px-6 py-4 text-center">Fatura {monthFilter}</th>
                <th className="px-6 py-4 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-900/40 text-xs text-slate-305">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-500 font-semibold uppercase tracking-wider">
                    Nenhum aluno ativo encontrado.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map(student => {
                  const pay = getCurrentPayment(student);
                  return (
                    <tr key={student.id} className="hover:bg-obsidian-800/15 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-200 group-hover:text-slate-105 transition-colors">
                        {student.nome}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider bg-obsidian-800 text-slate-400">
                          {student.turma}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {pay ? (
                          pay.status === 'Pago' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-450 border border-emerald-500/15">
                              PAGO
                            </span>
                          ) : pay.status === 'Atrasado' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500/10 text-red-400 border border-red-500/15">
                              ATRASADO
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-450 border border-amber-500/15">
                              PENDENTE
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider italic">
                            Sem Fatura
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenHistory(student)}
                            className="p-2 rounded bg-obsidian-950 hover:bg-obsidian-900 border border-obsidian-900 text-slate-400 hover:text-slate-200 transition-all flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider"
                            title="Ver histórico completo de faturas"
                          >
                            <History className="w-3.5 h-3.5" /> Histórico
                          </button>

                          {pay ? (
                            pay.status !== 'Pago' ? (
                              <input
                                type="date"
                                className="bg-obsidian-950 border border-obsidian-800 rounded px-2.5 py-1 text-[11px] text-slate-200 font-semibold focus:border-gold-550/50 outline-none cursor-pointer"
                                title="Selecionar data e marcar como Pago"
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleRegisterPaymentWithDate(student.id, pay.id, e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                              />
                            ) : (
                              <button
                                onClick={() => handleRemovePayment(student.id, pay.id)}
                                className="px-3.5 py-1.5 rounded bg-red-500/10 border border-red-500/15 text-red-450 hover:bg-red-500/20 transition-all font-bold text-[9px] uppercase tracking-wider"
                                title="Excluir/Retirar pagamento do banco"
                              >
                                Retirar Pago
                              </button>
                            )
                          ) : (
                            <button
                              onClick={() => handleRegisterPaidDirectly(student.id)}
                              className="px-3.5 py-1.5 rounded bg-gold-500/10 border border-gold-500/20 text-gold-450 hover:bg-gold-500/20 transition-all font-bold text-[9px] uppercase tracking-wider"
                              title="Marcar diretamente como Pago no mês atual"
                            >
                              Registrar Pago
                            </button>
                          )}
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
              Página {currentPage} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="btn-obsidian py-1.5 px-3 text-[10px] uppercase font-black tracking-widest disabled:opacity-50"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Ant
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="btn-obsidian py-1.5 px-3 text-[10px] uppercase font-black tracking-widest disabled:opacity-50"
              >
                Próx <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Histórico Completo de Faturas */}
      {showHistoryModal && selectedStudent && (
        <PaymentHistoryModal
          isOpen={showHistoryModal}
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedStudent(null);
          }}
          student={selectedStudent}
          selectedHistoryMonth={selectedHistoryMonth}
          setSelectedHistoryMonth={setSelectedHistoryMonth}
          VALOR_MENSALIDADE={VALOR_MENSALIDADE}
        />
      )}
    </div>
  );
};
export default FinancialPage;
