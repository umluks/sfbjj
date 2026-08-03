import React from 'react';
import type { Aluno } from '@/domain/models/student';
import { BeltBadge } from '@/presentation/components/shared/BeltBadge';
import { Sparkles, Plus, Clock, TrendingUp } from 'lucide-react';
import { getDurationFriendly } from '@/utils/formatters';

interface GraduationSummaryHeaderProps {
  student: Aluno;
  totalEvents: number;
  currentBeltDate: string;
  canEdit: boolean;
  onOpenRegister: () => void;
}

export const GraduationSummaryHeader: React.FC<GraduationSummaryHeaderProps> = ({
  student,
  totalEvents,
  currentBeltDate,
  canEdit,
  onOpenRegister
}) => {
  const tempoFaixaAtual = getDurationFriendly(currentBeltDate, new Date().toISOString().substring(0, 10));

  return (
    <div className="space-y-4 border-b border-obsidian-800/80 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-gold-500" /> Histórico de Evolução & Faixas
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Registro simplificado de faixas, graus e datas com permissão para edição e exclusão.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={onOpenRegister}
            className="btn-gold flex items-center justify-center gap-2 text-xs py-2.5 px-4 rounded-xl font-black uppercase tracking-wider shadow-lg touch-manipulation min-h-[44px] shrink-0"
          >
            <Plus className="w-4 h-4" /> Registrar Faixa/Grau
          </button>
        )}
      </div>

      {/* Painel de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="bg-obsidian-950/70 border border-obsidian-800/80 rounded-2xl p-3.5 flex items-center gap-3.5">
          <div className="p-2.5 bg-obsidian-900 border border-obsidian-800 rounded-xl">
            <BeltBadge faixa={student.faixa || 'Branca'} graus={student.graus || 0} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Graduação Atual</span>
            <span className="text-xs font-black text-slate-100 uppercase tracking-wide">
              {student.faixa || 'Branca'} ({student.graus || 0}º Grau)
            </span>
          </div>
        </div>

        <div className="bg-obsidian-950/70 border border-obsidian-800/80 rounded-2xl p-3.5 flex items-center gap-3.5">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Tempo na Graduação</span>
            <span className="text-xs font-bold text-amber-300 font-mono">
              {tempoFaixaAtual}
            </span>
          </div>
        </div>

        <div className="bg-obsidian-950/70 border border-obsidian-800/80 rounded-2xl p-3.5 flex items-center gap-3.5">
          <div className="p-2.5 bg-gold-500/10 border border-gold-500/20 text-gold-400 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total de Registros</span>
            <span className="text-xs font-bold text-slate-200">
              {totalEvents} {totalEvents === 1 ? 'registro' : 'registros'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
