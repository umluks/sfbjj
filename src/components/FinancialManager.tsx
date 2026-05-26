import React, { useState } from 'react';
import type { Student, PaymentStatus } from '../types';
import {
  Search,
  History,
  Check,
  AlertCircle,
  Clock,
  X,
  CreditCard,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface FinancialManagerProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
}

export const FinancialManager: React.FC<FinancialManagerProps> = ({ students, setStudents }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Modal for payment history
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyViewTab, setHistoryViewTab] = useState<'all' | 'by_month'>('all');
  const [selectedHistoryMonth, setSelectedHistoryMonth] = useState<string>('Maio/2026');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Summaries
  const [monthFilter, setMonthFilter] = useState<string>('Maio/2026');

  const totalRecebidoMes = students.reduce((acc, student) => {
    const monthlyPaid = student.pagamentos.filter(p => 
      p.mesRef === monthFilter && p.status === 'Pago'
    );
    return acc + monthlyPaid.reduce((sum, p) => sum + p.valor, 0);
  }, 0);

  const totalGeralRecebido = students.reduce((acc, student) => {
    const allPaid = student.pagamentos.filter(p => p.status === 'Pago');
    return acc + allPaid.reduce((sum, p) => sum + p.valor, 0);
  }, 0);

  const itemsPerPage = 10;

  // Registered payment animation indicator
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);

  // Register payment with selected date
  const handleRegisterPaymentWithDate = (studentId: string, paymentId: string, dateStr: string) => {
    // Rigid validation preventing future payment dates beyond today's date in 2026 (2026-05-25)
    if (!dateStr) {
      alert("A data de pagamento é obrigatória.");
      return;
    }
    const selectedDate = new Date(dateStr + "T12:00:00");
    const maxDate = new Date("2026-05-25T12:00:00");
    if (selectedDate > maxDate) {
      alert("Data inválida. O pagamento não pode ser registrado com data futura após 25/05/2026.");
      return;
    }

    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        let paymentVal = 100;
        const updatedPagamentos = s.pagamentos.map(p => {
          if (p.id === paymentId) {
            paymentVal = p.valor;
            return {
              ...p,
              status: 'Pago' as PaymentStatus,
              dataPagamento: dateStr
            };
          }
          return p;
        });

        // Trigger success message
        setPaymentSuccessMsg(`Pagamento de R$ ${paymentVal.toFixed(2).replace('.', ',')} registrado com sucesso para ${s.nome}!`);
        setTimeout(() => setPaymentSuccessMsg(null), 4000);

        return {
          ...s,
          pagamentos: updatedPagamentos
        };
      }
      return s;
    }));

    // If modal is open for history, update selectedStudent reference to reflect change
    if (selectedStudent && selectedStudent.id === studentId) {
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



  // Get current payment record based on the selected month filter
  const getCurrentPayment = (student: Student) => {
    const currentPayment = student.pagamentos.find(p => p.mesRef === monthFilter)
      || student.pagamentos[0];
    return currentPayment;
  };

  // Filter and sort students alphabetically based on status (only Ativo), current payment status & search
  const filteredStudents = students
    .filter(student => student.status === 'Ativo')
    .filter(student => {
      const matchesSearch = student.nome.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  // Pagination calculations
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

  // Open history modal
  const handleOpenHistory = (student: Student) => {
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
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          Controle Financeiro e Mensalidades
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Acompanhe faturas, mensalidades e registre pagamentos dos alunos ativos e inativos.
        </p>
      </div>

      {/* Resumos Financeiros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Selected Month Summary */}
        <div className="card-premium bg-gradient-to-br from-obsidian-800 to-obsidian-850 flex items-center justify-between border-l-4 border-l-emerald-500 p-5">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Recebido em {monthFilter}</span>
            <span className="text-2xl font-black text-slate-100 mt-1 block">R$ {totalRecebidoMes.toFixed(2).replace('.', ',')}</span>
            <span className="text-[10px] text-slate-500 mt-1 block">Mensalidades quitadas no ciclo de {monthFilter}</span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 hidden sm:block">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        {/* Consolidated Total Summary */}
        <div className="card-premium bg-gradient-to-br from-obsidian-800 to-obsidian-850 flex items-center justify-between border-l-4 border-l-gold-500 p-5">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Recebido Consolidado (Geral)</span>
            <span className="text-2xl font-black text-slate-100 mt-1 block">R$ {totalGeralRecebido.toFixed(2).replace('.', ',')}</span>
            <span className="text-[10px] text-slate-500 mt-1 block">Soma total de todas as mensalidades quitadas no sistema</span>
          </div>
          <div className="p-3 bg-gold-500/10 rounded-xl text-gold-500 hidden sm:block">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

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
        <div className="sm:col-span-2 relative">
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
            placeholder="Buscar por nome do aluno..."
            className="input-premium w-full pl-9"
          />
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
            <option value="Maio/2026">Mês Ref: Maio/2026</option>
            <option value="Abril/2026">Mês Ref: Abril/2026</option>
            <option value="Março/2026">Mês Ref: Março/2026</option>
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
                          {bill?.mesRef || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {bill ? (
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-xs text-slate-400">R$</span>
                            <input
                              type="number"
                              value={bill.valor}
                              onChange={(e) => {
                                const newVal = parseFloat(e.target.value) || 0;
                                setStudents(prev => prev.map(s => {
                                  if (s.id === student.id) {
                                    return {
                                      ...s,
                                      pagamentos: s.pagamentos.map(p => 
                                        p.id === bill.id ? { ...p, valor: newVal } : p
                                      )
                                    };
                                  }
                                  return s;
                                }));
                              }}
                              className="input-premium w-20 text-center py-1 px-1 font-bold text-slate-200 text-sm h-8 inline-block"
                            />
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-center text-xs text-slate-400 font-mono">
                        {bill ? bill.dataVencimento.split('-').reverse().join('/') : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {bill && bill.status !== 'Pago' ? (
                            <button
                              onClick={() => handleOpenHistory(student)}
                              className="btn-gold text-[11px] py-1 px-3 shadow-none h-8"
                              title="Registrar Pagamento"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              Receber
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
                      className="flex flex-col gap-2 p-3 rounded-xl bg-obsidian-900 border border-obsidian-750/80 hover:border-gold-500/10 transition-all"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-bold text-xs text-slate-200">
                          Ciclo {pay.mesRef}
                        </span>

                        <div className="flex items-center gap-4">
                          <span className="text-xs font-black text-slate-100">
                            R$ {pay.valor.toFixed(2).replace('.', ',')}
                          </span>
                          <div className="min-w-24 flex justify-end">
                            {pay.status === 'Pago' ? (
                              renderStatusBadge(pay.status)
                            ) : (
                              <span className="text-xs text-amber-500 font-semibold uppercase tracking-wider">Pendente</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {pay.status !== 'Pago' && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-obsidian-800">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Data de Pagamento:</span>
                          <input
                            type="date"
                            id={`date-pay-${pay.id}`}
                            max="2026-05-25"
                            defaultValue="2026-05-25"
                            className="input-premium py-0.5 px-2 text-xs h-7 w-32 bg-obsidian-950 font-mono text-slate-200"
                          />
                          <button
                            onClick={() => {
                              const inputEl = document.getElementById(`date-pay-${pay.id}`) as HTMLInputElement;
                              const selectedDate = inputEl?.value || '';
                              if (!selectedDate) {
                                alert('Por favor, selecione uma data de pagamento.');
                                return;
                              }
                              if (new Date(selectedDate + "T12:00:00") > new Date("2026-05-25T12:00:00")) {
                                alert('A data de pagamento não pode ser posterior a 25/05/2026.');
                                return;
                              }
                              handleRegisterPaymentWithDate(selectedStudent.id, pay.id, selectedDate);
                            }}
                            className="btn-gold text-[10px] py-1 px-2.5 h-7 shadow-none"
                          >
                            Confirmar Recebimento
                          </button>
                        </div>
                      )}
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
