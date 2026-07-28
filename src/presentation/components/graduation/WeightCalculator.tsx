import React, { useState } from 'react';
import { calculateIbjjfCategory } from '@/utils/ibjjfCalculator';

export const WeightCalculator: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [birthYearStr, setBirthYearStr] = useState<string>(String(currentYear - 25));
  const [gender, setGender] = useState<'masculino' | 'feminino'>('masculino');
  const [modality, setModality] = useState<'gi' | 'nogi'>('gi');
  const [weightKgStr, setWeightKgStr] = useState<string>('75');
  const [beltColor, setBeltColor] = useState<string>('Branca');

  const {
    calculatedAge,
    category: finalCategory,
    fightTime: finalFightTime,
    weightClass
  } = calculateIbjjfCategory({
    birthYear: birthYearStr,
    gender,
    modality,
    weightKg: weightKgStr,
    beltColor
  });

  return (
    <div className="space-y-6">
      <div className="border-l-2 border-gold-500 pl-3">
        <h3 className="text-sm font-black tracking-widest text-zinc-300 uppercase">
          Calculadora Dinâmica de Pesos e Categorias
        </h3>
        <p className="text-[11px] text-zinc-550 mt-1">
          Informe seu ano de nascimento e dados físicos para saber exatamente sua categoria, tempo regulamentar de luta e divisão de peso oficial.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-obsidian-950 p-6 border border-obsidian-850">
        
        {/* Entradas */}
        <div className="md:col-span-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
                Ano de Nascimento
              </label>
              <input
                type="number"
                min={currentYear - 90}
                max={currentYear}
                value={birthYearStr}
                onChange={(e) => setBirthYearStr(e.target.value)}
                onBlur={() => {
                  const parsed = parseInt(birthYearStr, 10);
                  if (isNaN(parsed) || parsed < currentYear - 100 || parsed > currentYear) {
                    setBirthYearStr(String(currentYear - 25));
                  }
                }}
                className="w-full bg-obsidian-900 border border-obsidian-800 text-slate-100 px-3 py-2 text-xs font-bold focus:border-zinc-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
                Peso Atual (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="10"
                max="250"
                value={weightKgStr}
                onChange={(e) => setWeightKgStr(e.target.value)}
                onBlur={() => {
                  const parsed = parseFloat(weightKgStr);
                  if (isNaN(parsed) || parsed <= 0) {
                    setWeightKgStr('70');
                  }
                }}
                className="w-full bg-obsidian-900 border border-obsidian-800 text-slate-100 px-3 py-2 text-xs font-bold focus:border-zinc-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
                Gênero
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-obsidian-900 border border-obsidian-800 text-slate-205 px-2 py-2 text-xs font-bold focus:border-zinc-500 focus:outline-none"
              >
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
                Modalidade
              </label>
              <select
                value={modality}
                onChange={(e) => setModality(e.target.value as any)}
                className="w-full bg-obsidian-900 border border-obsidian-800 text-slate-205 px-2 py-2 text-xs font-bold focus:border-zinc-500 focus:outline-none"
              >
                <option value="gi">De Kimono (Gi)</option>
                <option value="nogi">Sem Kimono (No-Gi)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
                Faixa
              </label>
              <select
                value={beltColor}
                onChange={(e) => setBeltColor(e.target.value)}
                className="w-full bg-obsidian-900 border border-obsidian-800 text-slate-205 px-2 py-2 text-xs font-bold focus:border-zinc-500 focus:outline-none"
              >
                <option value="Branca">Branca</option>
                <option value="Azul">Azul</option>
                <option value="Roxa">Roxa</option>
                <option value="Marrom">Marrom</option>
                <option value="Preta">Preta</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="md:col-span-6 bg-obsidian-900/40 border border-obsidian-800 p-4 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-[9px] font-black text-gold-500 uppercase tracking-widest block">
              Resultado Calculado (Ano de Referência: {currentYear})
            </span>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider block">Categoria de Idade</span>
                <span className="text-sm font-black text-slate-200 block">{finalCategory}</span>
                <span className="text-[10px] text-zinc-650 font-bold block mt-0.5">{calculatedAge} anos de idade</span>
              </div>

              <div>
                <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider block">Tempo Reg. de Luta</span>
                <span className="text-sm font-black text-slate-200 block">{finalFightTime}</span>
                <span className="text-[10px] text-zinc-650 font-semibold block mt-0.5">
                  Final: {finalCategory.startsWith('MASTER') || finalCategory.startsWith('ADULTO') 
                    ? 'Mesmo tempo' 
                    : 'Dobro do tempo regulamentar'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-obsidian-850 pt-3">
              <div>
                <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider block">Categoria de Peso</span>
                <span className="text-sm font-black text-slate-200 block">Peso {weightClass.name}</span>
              </div>

              <div>
                <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider block">Limite de Peso Divisão</span>
                <span className="text-sm font-black text-slate-200 block">{weightClass.limit}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-obsidian-950 border border-obsidian-850/50 text-[10px] text-zinc-500">
            Finais das categorias juvenis/infantis possuem tempo regulamentar estendido ou dobrado nas semifinais/finais conforme a organização oficial do evento.
          </div>
        </div>

      </div>
    </div>
  );
};
export default WeightCalculator;
