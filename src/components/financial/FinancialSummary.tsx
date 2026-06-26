import React from 'react';
import { CreditCard } from 'lucide-react';

interface FinancialSummaryProps {
  monthFilter: string;
  yearFilter: string;
  totalRecebidoMes: number;
  totalRecebidoMesAdulto: number;
  totalRecebidoMesKids: number;
  totalAnoRecebido: number;
  totalAnoRecebidoAdulto: number;
  totalAnoRecebidoKids: number;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  monthFilter,
  yearFilter,
  totalRecebidoMes,
  totalRecebidoMesAdulto,
  totalRecebidoMesKids,
  totalAnoRecebido,
  totalAnoRecebidoAdulto,
  totalAnoRecebidoKids
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Resumo do Mês Selecionado */}
      <div className="card-premium flex flex-col justify-between border-l-2 border-l-emerald-500/80 bg-obsidian-900/40 p-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Total Recebido em {monthFilter}</span>
            <span className="text-3xl font-black text-slate-100 mt-2 block tracking-tight">R$ {totalRecebidoMes.toFixed(2).replace('.', ',')}</span>
          </div>
          <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-emerald-400 hidden sm:block">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 pt-3.5 border-t border-obsidian-850/80 flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-450">
          <span>Adulto: <strong className="text-slate-200">R$ {totalRecebidoMesAdulto.toFixed(2).replace('.', ',')}</strong></span>
          <span>Kids: <strong className="text-slate-200">R$ {totalRecebidoMesKids.toFixed(2).replace('.', ',')}</strong></span>
        </div>
      </div>

      {/* Resumo Consolidado do Ano */}
      <div className="card-premium flex flex-col justify-between border-l-2 border-l-slate-400 bg-obsidian-900/40 p-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Total Recebido ({yearFilter})</span>
            <span className="text-3xl font-black text-slate-100 mt-2 block tracking-tight">R$ {totalAnoRecebido.toFixed(2).replace('.', ',')}</span>
          </div>
          <div className="p-3 bg-slate-100/5 border border-slate-200/10 rounded-xl text-slate-350 hidden sm:block">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 pt-3.5 border-t border-obsidian-850/80 flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-450">
          <span>Adulto: <strong className="text-slate-200">R$ {totalAnoRecebidoAdulto.toFixed(2).replace('.', ',')}</strong></span>
          <span>Kids: <strong className="text-slate-200">R$ {totalAnoRecebidoKids.toFixed(2).replace('.', ',')}</strong></span>
        </div>
      </div>
    </div>
  );
};
