import React from 'react';
import type { GraduationHistoryEvent } from '@/domain/models/graduation';
import { BeltBadge } from '@/presentation/components/shared/BeltBadge';
import { Calendar, Edit, Trash2, Clock } from 'lucide-react';
import { formatDate } from '@/utils/formatters';

interface GraduationTimelineItemProps {
  event: GraduationHistoryEvent;
  isCurrentBelt?: boolean;
  tempoFaixa?: string;
  canEdit: boolean;
  onEdit: (event: GraduationHistoryEvent) => void;
  onDelete: (event: GraduationHistoryEvent) => void;
}

export const GraduationTimelineItem: React.FC<GraduationTimelineItemProps> = ({
  event,
  isCurrentBelt,
  tempoFaixa,
  canEdit,
  onEdit,
  onDelete
}) => {
  return (
    <div className="bg-obsidian-900/70 border border-obsidian-800 hover:border-obsidian-750 rounded-2xl p-4 sm:p-5 shadow-lg transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Informações da Faixa, Grau e Data */}
      <div className="flex items-center gap-4">
        <BeltBadge faixa={event.faixa} graus={event.graus} />

        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-black text-slate-100 uppercase tracking-wide">
              {event.faixa}
            </span>
            <span className="text-xs font-bold text-gold-400 bg-gold-500/10 border border-gold-500/20 px-2.5 py-0.5 rounded-lg">
              {event.graus} {event.graus === 1 ? 'Grau' : 'Graus'}
            </span>
            {isCurrentBelt && (
              <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                Faixa Atual
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono flex-wrap">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gold-500 shrink-0" />
              <span>Data: {formatDate(event.dataGraduacao)}</span>
            </div>
            {tempoFaixa && (
              <div className="flex items-center gap-1.5 text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md font-sans font-bold text-[11px]">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Tempo de faixa: {tempoFaixa}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botões de Ação: Editar e Excluir */}
      {canEdit && (
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-obsidian-800/60 w-full sm:w-auto justify-end">
          <button
            onClick={() => onEdit(event)}
            className="px-3.5 py-2 rounded-xl bg-obsidian-950 text-slate-300 hover:text-gold-400 hover:bg-obsidian-800 border border-obsidian-800 transition-all text-xs font-bold flex items-center gap-1.5 min-h-[40px] touch-manipulation"
            title="Editar registro"
          >
            <Edit className="w-3.5 h-3.5 text-gold-500" />
            <span>Editar</span>
          </button>

          {event.id !== -999 && (
            <button
              onClick={() => onDelete(event)}
              className="px-3.5 py-2 rounded-xl bg-red-950/20 text-red-400 hover:bg-red-950/40 border border-red-950/40 transition-all text-xs font-bold flex items-center gap-1.5 min-h-[40px] touch-manipulation"
              title="Excluir registro"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
