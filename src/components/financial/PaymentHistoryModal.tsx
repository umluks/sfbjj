import React, { useState } from 'react';
import type { Aluno, PaymentStatus } from '../../types';
import { History, X, Check, Clock, AlertCircle } from 'lucide-react';

interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Aluno | null;
  selectedHistoryMonth: string;
  setSelectedHistoryMonth: (month: string) => void;
  VALOR_MENSALIDADE: number;
}

export const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({
  isOpen,
  onClose,
  student,
  selectedHistoryMonth,
  setSelectedHistoryMonth,
  VALOR_MENSALIDADE
}) => {
  const [historyViewTab, setHistoryViewTab] = useState<'all' | 'by_month'>('all');

  if (!isOpen || !student) return null;

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

  const MONTH_ORDER: { [key: string]: number } = {
    'Janeiro': 0, 'Fevereiro': 1, 'Março': 2, 'Abril': 3, 'Maio': 4, 'Junho': 5,
    'Julho': 6, 'Agosto': 7, 'Setembro': 8, 'Outubro': 9, 'Novembro': 10, 'Dezembro': 11
  };

  const parseMesRef = (ref: string) => {
    const [m, y] = ref.split('/');
    return {
      year: parseInt(y, 10) || 0,
      monthIdx: MONTH_ORDER[m] ?? 0
    };
  };

  const filteredPays = [...student.pagamentos]
    .filter(p => historyViewTab === 'all' || p.mesRef === selectedHistoryMonth)
    .sort((a, b) => {
      const valA = parseMesRef(a.mesRef);
      const valB = parseMesRef(b.mesRef);
      if (valA.year !== valB.year) {
        return valA.year - valB.year;
      }
      return valA.monthIdx - valB.monthIdx;
    });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-obsidian-900/90 border border-obsidian-850 rounded-2xl w-full max-w-lg shadow-2xl animate-scale-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-obsidian-850 bg-obsidian-950 rounded-t-2xl">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" />
              Histórico de Faturas: {student.nome}
            </h2>
            <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">
              Lista completa de faturas registradas no sistema.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 transition-colors"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas de Filtro */}
        <div className="px-6 py-2 border-b border-obsidian-850 bg-obsidian-950/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setHistoryViewTab('all')}
              className={`text-[10px] uppercase font-black tracking-wider px-3 py-1.5 rounded transition-all ${historyViewTab === 'all' ? 'bg-slate-100/5 text-slate-200 border border-slate-200/10' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Todos os pagamentos
            </button>
            <button
              type="button"
              onClick={() => setHistoryViewTab('by_month')}
              className={`text-[10px] uppercase font-black tracking-wider px-3 py-1.5 rounded transition-all ${historyViewTab === 'by_month' ? 'bg-slate-100/5 text-slate-200 border border-slate-200/10' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Ver por mês
            </button>
          </div>

          {historyViewTab === 'by_month' && (
            <select
              value={selectedHistoryMonth}
              onChange={(e) => setSelectedHistoryMonth(e.target.value)}
              className="input-premium py-1 px-2 text-xs bg-obsidian-950 text-slate-200 font-semibold w-36"
            >
              {Array.from(new Set(student.pagamentos.map(p => p.mesRef))).map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          )}
        </div>

        {/* Lista de Faturas */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-3 text-left">
          {filteredPays.length === 0 ? (
            <div className="text-center py-6 text-slate-550 text-xs font-semibold uppercase tracking-wider">
              Nenhum registro de faturamento encontrado.
            </div>
          ) : (
            filteredPays.map((pay) => (
              <div
                key={pay.id}
                className={`flex flex-col gap-2 p-3.5 rounded-xl border transition-all ${pay.status === 'Pago'
                    ? 'bg-emerald-500/5 border-emerald-500/15 hover:border-emerald-500/30'
                    : pay.status === 'Atrasado'
                      ? 'bg-red-500/5 border-red-500/15 hover:border-red-500/30'
                      : 'bg-obsidian-950 border-obsidian-900 hover:border-slate-800'
                  }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-bold text-xs text-slate-200 font-mono">
                    {pay.mesRef}
                  </span>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold font-mono text-slate-300">
                      R$ {VALOR_MENSALIDADE.toFixed(2).replace('.', ',')}
                    </span>
                    <div className="min-w-24 flex justify-end">
                      {renderStatusBadge(pay.status)}
                    </div>
                  </div>
                </div>

                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 pt-2 border-t border-obsidian-900/60">
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
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-obsidian-850 bg-obsidian-950 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="btn-obsidian text-[10px] uppercase font-black tracking-widest px-4 py-2"
            type="button"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
