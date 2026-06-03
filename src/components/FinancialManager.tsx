import React, { useState } from 'react';
import type { Aluno, PaymentStatus } from '../types';
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
  students: Aluno[];
  setStudents: React.Dispatch<React.SetStateAction<Aluno[]>>;
}

export const FinancialManager: React.FC<FinancialManagerProps> = ({ students, setStudents }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Modal for payment history
  const [selectedStudent, setSelectedStudent] = useState<Aluno | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyViewTab, setHistoryViewTab] = useState<'all' | 'by_month'>('all');
  const ALL_MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const currentYear = new Date().getFullYear().toString();
  
  // Extract unique years from students' payment history, plus current year
  const yearsFromRecords = students.flatMap(s => s.pagamentos.map(p => p.mesRef.split('/')[1]));
  const availableYears = Array.from(new Set([currentYear, ...yearsFromRecords.filter(Boolean)])).sort((a, b) => Number(b) - Number(a));

  const [yearFilter, setYearFilter] = useState<string>(currentYear);

  // Generate months based on selected year
  const availableMonths = ALL_MONTHS.map(m => `${m}/${yearFilter}`);

  const getDefaultMonth = (year: string) => {
    if (year === currentYear) {
      return `${ALL_MONTHS[new Date().getMonth()]}/${year}`;
    }
    return `Janeiro/${year}`;
  };

  const [monthFilter, setMonthFilter] = useState<string>(getDefaultMonth(currentYear));

  // Also need selectedHistoryMonth logic for History modal
  const [selectedHistoryMonth, setSelectedHistoryMonth] = useState<string>(getDefaultMonth(currentYear));

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  const getMonthAndYear = (filter: string) => {
    const parts = filter.split('/');
    if (parts.length !== 2) return null;
    const monthIndex = ALL_MONTHS.indexOf(parts[0]);
    if (monthIndex === -1) return null;
    const monthNum = (monthIndex + 1).toString().padStart(2, '0');
    return { month: monthNum, year: parts[1] };
  };

  const filterDate = getMonthAndYear(monthFilter);

  const totalRecebidoMes = students.reduce((acc, student) => {
    const monthlyPaid = student.pagamentos.filter(p => {
      if (p.status !== 'Pago' || !p.dataPagamento || !filterDate) return false;
      const payParts = p.dataPagamento.split('-');
      return payParts.length >= 2 && payParts[0] === filterDate.year && payParts[1] === filterDate.month;
    });
    return acc + monthlyPaid.reduce((sum, p) => sum + p.valor, 0);
  }, 0);

  const totalAnoRecebido = students.reduce((acc, student) => {
    const anoPaid = student.pagamentos.filter(p => {
      if (p.status !== 'Pago' || !p.dataPagamento) return false;
      const payParts = p.dataPagamento.split('-');
      return payParts.length >= 1 && payParts[0] === yearFilter;
    });
    return acc + anoPaid.reduce((sum, p) => sum + p.valor, 0);
  }, 0);

  const itemsPerPage = 10;

  // Registered payment animation indicator
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);

  // Register payment with selected date
  const handleRegisterPaymentWithDate = (alunoId: number, paymentId: number, dateStr: string) => {
    if (!dateStr) {
      alert("A data de pagamento é obrigatória.");
      return;
    }

    setStudents(prev => prev.map(s => {
      if (s.id === alunoId) {
        let paymentVal = 100;
        const updatedPagamentos = s.pagamentos.map(p => {
          if (p.id === paymentId) {
            paymentVal = 100;
            return {
              ...p,
              valor: 100,
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




  // Get current payment record based on the selected month filter
  const getCurrentPayment = (student: Aluno) => {
    return student.pagamentos.find(p => p.mesRef === monthFilter);
  };

  const handleGeneratePayment = async (alunoId: number) => {
    const defaultVencimento = new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0];
    const newPayment = {
      alunoId,
      mesRef: monthFilter,
      valor: 100,
      status: 'Pendente',
      dataVencimento: defaultVencimento,
      dataPagamento: null
    };

    // Note: If using real Supabase, this would insert into 'pagamentos'. 
    // Here we update state to reflect the UI change.
    const paymentWithId = { ...newPayment, id: Date.now() } as any;

    setStudents(prev => prev.map(s => {
      if (s.id === alunoId) {
        return {
          ...s,
          pagamentos: [...s.pagamentos, paymentWithId]
        };
      }
      return s;
    }));
    
    setPaymentSuccessMsg(`Fatura gerada para o mês ${monthFilter}.`);
    setTimeout(() => setPaymentSuccessMsg(null), 3000);
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
