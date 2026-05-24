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
  const [statusFilter, setStatusFilter] = useState<string>('Todos');

  // Modal for payment history
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Registered payment animation indicator
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);

  // Register payment in one-click
  const handleRegisterPayment = (studentId: string, paymentId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];

    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const updatedPagamentos = s.pagamentos.map(p => {
          if (p.id === paymentId) {
            return {
              ...p,
              status: 'Pago' as PaymentStatus,
              dataPagamento: todayStr
            };
          }
          return p;
        });

        // Trigger success message
        setPaymentSuccessMsg(`Pagamento de R$ 100,00 registrado com sucesso para ${s.nome}!`);
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
              return { ...p, status: 'Pago', dataPagamento: todayStr };
            }
            return p;
          })
        };
      });
    }
  };

  // Get current payment record (e.g. Maio/2026 or latest billing cycle)
  const getCurrentPayment = (student: Student) => {
    // Return the payment corresponding to Maio/2026 (current month context) or the first one
    const currentPayment = student.pagamentos.find(p => p.mesRef === 'Maio/2026')
      || student.pagamentos[0];
    return currentPayment;
  };

  // Filter and sort students alphabetically based on current payment status & search
  const filteredStudents = students
    .filter(student => {
      const currentPayment = getCurrentPayment(student);
      const matchesSearch = student.nome.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'Todos' ||
        (currentPayment && currentPayment.status === statusFilter);

      return matchesSearch && matchesStatus;
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
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="input-premium w-full bg-obsidian-950"
          >
            <option value="Todos">Filtrar Status: Todos</option>
            <option value="Pago">Pago</option>
            <option value="Pendente">Pendente</option>
            <option value="Atrasado">Atrasado</option>
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
                <th className="px-6 py-4 text-center">Status</th>
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
                      <td className="px-6 py-4 text-center font-bold text-slate-200">
                        R$ {bill?.valor.toFixed(2).replace('.', ',') || '0,00'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {bill ? renderStatusBadge(bill.status) : '-'}
                      </td>
                      <td className="px-6 py-4 text-center text-xs text-slate-400 font-mono">
                        {bill ? bill.dataVencimento.split('-').reverse().join('/') : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {bill && bill.status !== 'Pago' ? (
                            <button
                              onClick={() => handleRegisterPayment(student.id, bill.id)}
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

            {/* Modal History Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-3">
                {selectedStudent.pagamentos.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    Nenhum registro de faturamento encontrado.
                  </div>
                ) : (
                  [...selectedStudent.pagamentos]
                    .sort((a, b) => b.mesRef.localeCompare(a.mesRef)) // Newest first
                    .map((pay) => (
                      <div
                        key={pay.id}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-obsidian-900 border border-obsidian-750/80 hover:border-gold-500/10 transition-all"
                      >
                        <div className="space-y-1">
                          <span className="font-bold text-xs text-slate-200 block">
                            Ciclo {pay.mesRef}
                          </span>
                          <div className="flex gap-4 text-[10px] text-slate-400 font-mono">
                            <span>Vencimento: {pay.dataVencimento.split('-').reverse().join('/')}</span>
                            {pay.dataPagamento && (
                              <span className="text-emerald-500">Pago em: {pay.dataPagamento.split('-').reverse().join('/')}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-slate-100">
                            R$ {pay.valor.toFixed(2).replace('.', ',')}
                          </span>
                          <div className="min-w-24 flex justify-end">
                            {pay.status === 'Pago' ? (
                              renderStatusBadge(pay.status)
                            ) : (
                              <button
                                onClick={() => handleRegisterPayment(selectedStudent.id, pay.id)}
                                className="btn-gold text-[10px] py-1 px-2.5 shadow-none"
                              >
                                Receber
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                )}
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
