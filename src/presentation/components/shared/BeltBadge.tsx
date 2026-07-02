import React from 'react';
import type { Belt, Degree } from '@/domain/models/student';

interface BeltBadgeProps {
  faixa: Belt | string;
  graus?: Degree | number;
}

export const BeltBadge: React.FC<BeltBadgeProps> = ({ faixa, graus = 0 }) => {
  const getBeltStyles = (b: string) => {
    const norm = b.toLowerCase();
    switch (norm) {
      case 'branca':
        return { bg: 'bg-slate-100 text-slate-900 border-slate-300', label: 'Branca' };
      case 'cinza':
        return { bg: 'bg-slate-400 text-slate-950 border-slate-500', label: 'Cinza' };
      case 'amarela':
        return { bg: 'bg-amber-400 text-amber-950 border-amber-500', label: 'Amarela' };
      case 'laranja':
        return { bg: 'bg-orange-500 text-orange-950 border-orange-600', label: 'Laranja' };
      case 'verde':
        return { bg: 'bg-emerald-600 text-emerald-50 border-emerald-700', label: 'Verde' };
      case 'azul':
        return { bg: 'bg-blue-600 text-blue-50 border-blue-700', label: 'Azul' };
      case 'roxa':
        return { bg: 'bg-purple-600 text-purple-50 border-purple-700', label: 'Roxa' };
      case 'marrom':
        return { bg: 'bg-amber-800 text-amber-50 border-amber-900', label: 'Marrom' };
      case 'preta':
        return { bg: 'bg-slate-950 text-slate-50 border-slate-800', label: 'Preta' };
      default:
        return { bg: 'bg-slate-800 text-slate-300 border-slate-700', label: b };
    }
  };

  const styles = getBeltStyles(faixa);

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${styles.bg}`}>
        {styles.label}
      </span>
      {graus > 0 && (
        <span className="text-[10px] font-black text-slate-400 bg-obsidian-950/60 px-1.5 py-0.5 rounded border border-obsidian-850 select-none">
          {graus} {graus === 1 ? 'Grau' : 'Graus'}
        </span>
      )}
    </div>
  );
};

export default BeltBadge;
