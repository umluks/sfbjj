import React from 'react';
import type { Belt, Degree } from '../../types';

interface BeltBadgeProps {
  faixa: Belt;
  graus: Degree;
  className?: string; // Permite customizar dimensões e estilos de borda
}

export const BeltBadge: React.FC<BeltBadgeProps> = ({ faixa, graus, className = '' }) => {
  let beltClass = '';
  let barColor = 'bg-black'; // Padrão ponteira preta
  let stripeStyle: React.CSSProperties | undefined;

  const lowerFaixa = faixa.toLowerCase();

  if (lowerFaixa.includes('cinza')) {
    beltClass = 'bg-slate-400 text-slate-950 border border-slate-500';
    barColor = 'bg-neutral-950';
  } else if (lowerFaixa.includes('amarela')) {
    beltClass = 'bg-yellow-400 text-slate-950 border border-yellow-500';
    barColor = 'bg-neutral-950';
  } else if (lowerFaixa.includes('laranja')) {
    beltClass = 'bg-orange-500 text-white';
    barColor = 'bg-neutral-950';
  } else if (lowerFaixa.includes('verde')) {
    beltClass = 'bg-emerald-600 text-white';
    barColor = 'bg-neutral-950';
  } else if (lowerFaixa === 'azul') {
    beltClass = 'bg-blue-600 text-white border border-blue-700';
    barColor = 'bg-neutral-950';
  } else if (lowerFaixa === 'roxa') {
    beltClass = 'bg-purple-700 text-white border border-purple-800';
    barColor = 'bg-neutral-950';
  } else if (lowerFaixa === 'marrom') {
    beltClass = 'bg-amber-900 text-white border border-amber-950';
    barColor = 'bg-neutral-950';
  } else if (lowerFaixa === 'preta') {
    beltClass = 'bg-neutral-950 border border-gold-500/75 text-gold-450';
    barColor = 'bg-red-650';
  } else if (lowerFaixa === 'vermelha e preta') {
    stripeStyle = {
      background: 'repeating-linear-gradient(90deg, #b91c1c, #b91c1c 12px, #171717 12px, #171717 24px)'
    };
    beltClass = 'text-white border border-red-700';
    barColor = 'bg-neutral-950';
  } else if (lowerFaixa === 'vermelha e branca') {
    stripeStyle = {
      background: 'repeating-linear-gradient(90deg, #b91c1c, #b91c1c 12px, #f8fafc 12px, #f8fafc 24px)'
    };
    beltClass = 'text-neutral-950 border border-red-700';
    barColor = 'bg-neutral-950';
  } else if (lowerFaixa === 'vermelha') {
    beltClass = 'bg-red-750 text-white border border-red-850';
    barColor = 'bg-neutral-950';
  } else {
    // Branca
    beltClass = 'bg-white text-slate-900 border border-slate-300';
    barColor = 'bg-neutral-900';
  }

  const hasWhiteStripe = lowerFaixa.includes('e branca') && !lowerFaixa.includes('vermelha');
  const hasBlackStripe = lowerFaixa.includes('e preta') && !lowerFaixa.includes('vermelha');

  // Ajusta a classe de layout padrão caso nenhuma dimensão seja passada via className
  const layoutClass = className.includes('w-') ? className : `w-28 h-6 text-[10px] ${className}`;

  return (
    <div
      className={`rounded flex items-center relative overflow-hidden font-extrabold tracking-wider shadow-sm select-none ${beltClass} ${layoutClass}`}
      style={stripeStyle}
    >
      {/* Nome da Faixa */}
      <span className={`pl-2 uppercase z-10 truncate ${lowerFaixa === 'vermelha e branca' ? 'text-black bg-white/60 px-1 rounded-sm' : ''}`}>
        {faixa}
      </span>

      {/* Listra horizontal centralizada para faixas infantis mescladas */}
      {hasWhiteStripe && (
        <div className="absolute inset-x-0 top-[38%] bottom-[38%] bg-white border-y border-neutral-300/30 z-0 pointer-events-none" />
      )}
      {hasBlackStripe && (
        <div className="absolute inset-x-0 top-[38%] bottom-[38%] bg-neutral-950 border-y border-neutral-800/30 z-0 pointer-events-none" />
      )}

      {/* Ponteira (Sleeve) para os Graus */}
      <div className={`absolute right-0 top-0 bottom-0 w-8 ${barColor} flex items-center justify-around px-0.5 border-l border-obsidian-950/45`}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className={`w-0.5 h-3 rounded-sm transition-all ${idx < graus
              ? 'bg-white shadow-[0_0_3px_rgba(255,255,255,0.7)]'
              : 'bg-neutral-800/40'
            }`}
            title={`${graus} Grau(s)`}
          />
        ))}
      </div>
    </div>
  );
};
