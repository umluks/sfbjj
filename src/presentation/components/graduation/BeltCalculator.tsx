import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { belts, type BeltInfo } from '@/constants/ibjjfRules';

export const BeltCalculator: React.FC = () => {
  const [calcAge, setCalcAge] = useState<number>(20);

  const getBeltBackground = (belt: BeltInfo) => {
    if (belt.name === 'Vermelha e Preta (Coral)') {
      return 'linear-gradient(45deg, #FF1A1A 25%, #151518 25%, #151518 50%, #FF1A1A 50%, #FF1A1A 75%, #151518 75%, #151518 100%)';
    }
    if (belt.name === 'Vermelha e Branca (Coral)') {
      return 'linear-gradient(45deg, #FF1A1A 25%, #FFFFFF 25%, #FFFFFF 50%, #FF1A1A 50%, #FF1A1A 75%, #FFFFFF 75%, #FFFFFF 100%)';
    }
    return belt.color;
  };

  const getEligibleBelts = (age: number) => {
    return belts.filter(belt => {
      if (age < belt.minAge) return false;
      if (belt.maxAge && age > belt.maxAge) return false;
      return true;
    });
  };

  const eligibleBelts = getEligibleBelts(calcAge);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-obsidian-900 border border-obsidian-800 p-6 md:p-8 space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h3 className="text-md font-black tracking-widest text-zinc-200 uppercase">
            Calculadora de Elegibilidade de Faixas
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Insira a idade para visualizar quais faixas e grupos da IBJJF são permitidos.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 bg-obsidian-950 p-6 border border-obsidian-850">
          <label htmlFor="calc-age-input" className="text-xs font-bold text-zinc-550 uppercase tracking-widest">
            Idade do Praticante: <span className="text-slate-100 text-lg font-black ml-1">{calcAge} anos</span>
          </label>
          <div className="w-full flex items-center gap-4">
            <span className="text-[10px] text-zinc-650 font-bold">4 anos</span>
            <input
              id="calc-age-input"
              type="range"
              min="4"
              max="80"
              value={calcAge}
              onChange={(e) => setCalcAge(parseInt(e.target.value))}
              className="flex-1 accent-zinc-350 cursor-pointer bg-obsidian-800 h-1.5 rounded-none"
            />
            <span className="text-[10px] text-zinc-650 font-bold">80 anos</span>
          </div>
          <div className="flex gap-2">
            {[8, 12, 16, 18, 30, 50].map((quickAge) => (
              <button
                key={quickAge}
                onClick={() => setCalcAge(quickAge)}
                className="px-2.5 py-1 bg-obsidian-900 hover:bg-obsidian-850 border border-obsidian-800 text-[10px] font-bold text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                {quickAge} anos
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-black tracking-widest text-zinc-300 uppercase flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" /> Faixas Elegíveis para {calcAge} anos:
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {eligibleBelts.map((belt) => (
              <div key={belt.name} className="p-4 bg-obsidian-950 border border-obsidian-850 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-4 border border-black/20 shrink-0 relative overflow-hidden" style={{ background: getBeltBackground(belt) }}>
                    <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-black/40" />
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-slate-200 block">{belt.name}</span>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-wider block mt-0.5">
                      Min: {belt.minAge} anos {belt.maxAge ? `| Max: ${belt.maxAge} anos` : ''}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-zinc-500 block uppercase tracking-widest">Carência</span>
                  <span className="text-[10px] font-bold text-slate-350">{belt.minTime === 'Nenhuma carência' ? 'Livre' : belt.minTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default BeltCalculator;
