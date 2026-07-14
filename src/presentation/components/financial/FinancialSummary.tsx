import React from 'react';
import { CreditCard, Landmark } from 'lucide-react';

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
      <div className="card-premium flex flex-col justify-between border-l-4 border-l-emerald-500/80 bg-obsidian-900/40 p-6 rounded-2xl shadow-xl hover:border-l-emerald-500 transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Faturamento em {monthFilter}</span>
            <span className="text-3xl font-black text-slate-100 block tracking-tight font-mono">
              R$ {totalRecebidoMes.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 hidden sm:block shadow-inner">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-5 pt-4 border-t border-obsidian-850/60 flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-450">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500/60" />
            Adulto: <strong className="text-slate-205 font-mono">R$ {totalRecebidoMesAdulto.toFixed(2).replace('.', ',')}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500/60" />
            Kids: <strong className="text-slate-205 font-mono">R$ {totalRecebidoMesKids.toFixed(2).replace('.', ',')}</strong>
          </span>
        </div>
      </div>

      {/* Resumo Consolidado do Ano */}
      <div className="card-premium flex flex-col justify-between border-l-4 border-l-gold-550/80 bg-obsidian-900/40 p-6 rounded-2xl shadow-xl hover:border-l-gold-500 transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Faturamento Anual ({yearFilter})</span>
            <span className="text-3xl font-black text-slate-100 block tracking-tight font-mono">
              R$ {totalAnoRecebido.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <div className="p-3 bg-gold-500/10 border border-gold-500/20 rounded-2xl text-gold-450 hidden sm:block shadow-inner">
            <Landmark className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-5 pt-4 border-t border-obsidian-850/60 flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-450">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500/60" />
            Adulto: <strong className="text-slate-205 font-mono">R$ {totalAnoRecebidoAdulto.toFixed(2).replace('.', ',')}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500/60" />
            Kids: <strong className="text-slate-205 font-mono">R$ {totalAnoRecebidoKids.toFixed(2).replace('.', ',')}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummary;
