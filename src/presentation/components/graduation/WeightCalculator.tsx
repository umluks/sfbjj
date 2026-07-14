import React, { useState } from 'react';
import { 
  weightsMascGi, 
  weightsMascNoGi, 
  weightsFemGi, 
  weightsFemNoGi, 
  type WeightDivision 
} from '@/constants/ibjjfRules';

export const WeightCalculator: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [birthYear, setBirthYear] = useState<number>(currentYear - 25);
  const [gender, setGender] = useState<'masculino' | 'feminino'>('masculino');
  const [modality, setModality] = useState<'gi' | 'nogi'>('gi');
  const [weightKg, setWeightKg] = useState<number>(75);
  const [beltColor, setBeltColor] = useState<string>('Branca');

  const calculatedAge = currentYear - birthYear;

  const getCategoryAndFightTime = (age: number, belt: string) => {
    let category = '';
    let fightTime = '';

    if (age === 4) {
      category = 'PRÉ-MIRIM I';
      fightTime = '02 minutos';
    } else if (age === 5) {
      category = 'PRÉ-MIRIM II';
      fightTime = '02 minutos';
    } else if (age === 6) {
      category = 'PRÉ-MIRIM III';
      fightTime = '02 minutos';
    } else if (age === 7) {
      category = 'MIRIM I';
      fightTime = '03 minutos';
    } else if (age === 8) {
      category = 'MIRIM II';
      fightTime = '03 minutos';
    } else if (age === 9) {
      category = 'MIRIM III';
      fightTime = '03 minutos';
    } else if (age === 10) {
      category = 'INFANTIL I';
      fightTime = '04 minutos';
    } else if (age === 11) {
      category = 'INFANTIL II';
      fightTime = '04 minutos';
    } else if (age === 12) {
      category = 'INFANTIL III';
      fightTime = '04 minutos';
    } else if (age === 13) {
      category = 'INFANTO-JUVENIL I';
      fightTime = '04 minutos';
    } else if (age === 14) {
      category = 'INFANTO-JUVENIL II';
      fightTime = '04 minutos';
    } else if (age === 15) {
      category = 'INFANTO-JUVENIL III';
      fightTime = '04 minutos';
    } else if (age === 16) {
      category = 'JUVENIL I';
      fightTime = '05 minutos';
    } else if (age === 17) {
      category = 'JUVENIL II';
      fightTime = '05 minutos';
    } else if (age >= 18 && age < 30) {
      category = 'ADULTO';
      if (belt === 'Branca') fightTime = '05 minutos';
      else if (belt === 'Azul') fightTime = '06 minutos';
      else if (belt === 'Roxa') fightTime = '07 minutos';
      else if (belt === 'Marrom') fightTime = '08 minutos';
      else fightTime = '10 minutos'; // Preta
    } else if (age >= 30 && age < 36) {
      category = 'MASTER 1';
      if (belt === 'Branca' || belt === 'Azul') fightTime = '05 minutos';
      else fightTime = '06 minutos'; // Roxa, Marrom, Preta
    } else if (age >= 36 && age < 41) {
      category = 'MASTER 2';
      fightTime = '05 minutos';
    } else if (age >= 41 && age < 46) {
      category = 'MASTER 3';
      fightTime = '05 minutos';
    } else if (age >= 46 && age < 51) {
      category = 'MASTER 4';
      fightTime = '05 minutos';
    } else if (age >= 51 && age < 56) {
      category = 'MASTER 5';
      fightTime = '05 minutos';
    } else if (age >= 56 && age < 61) {
      category = 'MASTER 6';
      fightTime = '05 minutos';
    } else if (age >= 61) {
      category = 'MASTER 7';
      fightTime = '05 minutos';
    } else {
      category = 'Não elegível (Idade inferior a 4 anos)';
      fightTime = '0 minutos';
    }

    return { category, fightTime };
  };

  const { category: finalCategory, fightTime: finalFightTime } = getCategoryAndFightTime(calculatedAge, beltColor);

  const getWeightClass = () => {
    let activeList: WeightDivision[] = [];
    if (gender === 'masculino') {
      activeList = modality === 'gi' ? weightsMascGi : weightsMascNoGi;
    } else {
      activeList = modality === 'gi' ? weightsFemGi : weightsFemNoGi;
    }

    const parseLimit = (limitStr: string): number => {
      if (limitStr.includes('Sem limite') || limitStr.includes('Sem limite de peso')) return 999;
      const match = limitStr.match(/[\d.]+/);
      return match ? parseFloat(match[0]) : 999;
    };

    let divisionFound = activeList[activeList.length - 1]; // Padrão: Pesadíssimo/Ultra-pesado
    
    for (const div of activeList) {
      let limitStr = div.adultLimit;
      if (calculatedAge >= 30) {
        limitStr = div.masterLimit;
      } else if (calculatedAge === 16 || calculatedAge === 17) {
        limitStr = div.juvenilLimit || div.adultLimit;
      }
      
      const limitVal = parseLimit(limitStr);
      if (weightKg <= limitVal) {
        divisionFound = div;
        break;
      }
    }

    let limitText = divisionFound.adultLimit;
    if (calculatedAge >= 30) {
      limitText = divisionFound.masterLimit;
    } else if (calculatedAge === 16 || calculatedAge === 17) {
      limitText = divisionFound.juvenilLimit || divisionFound.adultLimit;
    }

    return {
      name: divisionFound.class,
      limit: limitText
    };
  };

  const weightClass = getWeightClass();

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
                value={birthYear}
                onChange={(e) => setBirthYear(parseInt(e.target.value) || currentYear)}
                className="w-full bg-obsidian-900 border border-obsidian-800 text-slate-100 px-3 py-2 text-xs font-bold focus:border-zinc-500 focus:outline-none"
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
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value) || 70)}
                className="w-full bg-obsidian-900 border border-obsidian-800 text-slate-100 px-3 py-2 text-xs font-bold focus:border-zinc-500 focus:outline-none"
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
