import React, { useState } from 'react';
import { Scale } from 'lucide-react';
import { weightsMascGi, weightsMascNoGi, weightsFemGi, weightsFemNoGi } from '@/constants/ibjjfRules';

type WeightTabType = 'masc-gi' | 'masc-nogi' | 'fem-gi' | 'fem-nogi';

export const WeightTables: React.FC = () => {
  const [weightTab, setWeightTab] = useState<WeightTabType>('masc-gi');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-obsidian-900 border border-obsidian-800 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-obsidian-850 pb-4">
          <div>
            <h3 className="text-sm font-black tracking-widest text-zinc-200 uppercase flex items-center gap-2">
              <Scale className="w-4 h-4 text-gold-500" /> Tabela de Pesos IBJJF
            </h3>
            <p className="text-[11px] text-zinc-500 mt-1">
              Verifique os pesos limites oficiais para competições com Kimono (Gi) ou sem Kimono (No-Gi).
            </p>
          </div>

          {/* Sub-abas de peso */}
          <div className="flex flex-wrap gap-1 bg-obsidian-950 border border-obsidian-850 p-1 shrink-0">
            <button
              onClick={() => setWeightTab('masc-gi')}
              className={`px-2.5 py-1 text-[9px] uppercase tracking-wider font-bold transition-all ${
                weightTab === 'masc-gi' ? 'bg-zinc-200 text-obsidian-950' : 'text-zinc-550 hover:text-zinc-300'
              }`}
            >
              Masc. (Gi)
            </button>
            <button
              onClick={() => setWeightTab('masc-nogi')}
              className={`px-2.5 py-1 text-[9px] uppercase tracking-wider font-bold transition-all ${
                weightTab === 'masc-nogi' ? 'bg-zinc-200 text-obsidian-950' : 'text-zinc-550 hover:text-zinc-300'
              }`}
            >
              Masc. (No-Gi)
            </button>
            <button
              onClick={() => setWeightTab('fem-gi')}
              className={`px-2.5 py-1 text-[9px] uppercase tracking-wider font-bold transition-all ${
                weightTab === 'fem-gi' ? 'bg-zinc-200 text-obsidian-950' : 'text-zinc-550 hover:text-zinc-300'
              }`}
            >
              Fem. (Gi)
            </button>
            <button
              onClick={() => setWeightTab('fem-nogi')}
              className={`px-2.5 py-1 text-[9px] uppercase tracking-wider font-bold transition-all ${
                weightTab === 'fem-nogi' ? 'bg-zinc-200 text-obsidian-950' : 'text-zinc-550 hover:text-zinc-300'
              }`}
            >
              Fem. (No-Gi)
            </button>
          </div>
        </div>

        {/* Renderizar Tabela Correspondente */}
        <div className="overflow-x-auto border border-obsidian-850">
          <table className="w-full text-left text-xs text-slate-350 border-collapse">
            <thead>
              <tr className="border-b border-obsidian-800 bg-obsidian-950 text-zinc-450 uppercase tracking-widest text-[9px]">
                <th className="py-3.5 px-4">Categoria de Peso</th>
                <th className="py-3.5 px-4">Adulto (18-29)</th>
                <th className="py-3.5 px-4">Master 1 (30-35)</th>
                <th className="py-3.5 px-4">Master 2+ (36+)</th>
                <th className="py-3.5 px-4 text-right">Juvenil (16-17)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-850">
              {/* Masculino Com Kimono */}
              {weightTab === 'masc-gi' && weightsMascGi.map((row, idx) => (
                <tr key={idx} className="hover:bg-obsidian-850/30">
                  <td className="py-3.5 px-4 font-bold text-slate-200">{row.class}</td>
                  <td className="py-3.5 px-4 text-zinc-350">{row.adultLimit}</td>
                  <td className="py-3.5 px-4 text-zinc-400">{row.masterLimit}</td>
                  <td className="py-3.5 px-4 text-zinc-450">{row.masterLimit}</td>
                  <td className="py-3.5 px-4 text-right text-zinc-455">{row.juvenilLimit || 'N/A'}</td>
                </tr>
              ))}
              
              {/* Masculino Sem Kimono */}
              {weightTab === 'masc-nogi' && weightsMascNoGi.map((row, idx) => (
                <tr key={idx} className="hover:bg-obsidian-850/30">
                  <td className="py-3.5 px-4 font-bold text-slate-200">{row.class}</td>
                  <td className="py-3.5 px-4 text-zinc-350">{row.adultLimit}</td>
                  <td className="py-3.5 px-4 text-zinc-400">{row.masterLimit}</td>
                  <td className="py-3.5 px-4 text-zinc-450">{row.masterLimit}</td>
                  <td className="py-3.5 px-4 text-right text-zinc-455">{row.juvenilLimit || 'N/A'}</td>
                </tr>
              ))}

              {/* Feminino Com Kimono */}
              {weightTab === 'fem-gi' && weightsFemGi.map((row, idx) => (
                <tr key={idx} className="hover:bg-obsidian-850/30">
                  <td className="py-3.5 px-4 font-bold text-slate-200">{row.class}</td>
                  <td className="py-3.5 px-4 text-zinc-350">{row.adultLimit}</td>
                  <td className="py-3.5 px-4 text-zinc-400">{row.masterLimit}</td>
                  <td className="py-3.5 px-4 text-zinc-450">{row.masterLimit}</td>
                  <td className="py-3.5 px-4 text-right text-zinc-455">{row.juvenilLimit || 'N/A'}</td>
                </tr>
              ))}

              {/* Feminino Sem Kimono */}
              {weightTab === 'fem-nogi' && weightsFemNoGi.map((row, idx) => (
                <tr key={idx} className="hover:bg-obsidian-850/30">
                  <td className="py-3.5 px-4 font-bold text-slate-200">{row.class}</td>
                  <td className="py-3.5 px-4 text-zinc-350">{row.adultLimit}</td>
                  <td className="py-3.5 px-4 text-zinc-400">{row.masterLimit}</td>
                  <td className="py-3.5 px-4 text-zinc-450">{row.masterLimit}</td>
                  <td className="py-3.5 px-4 text-right text-zinc-455">{row.juvenilLimit || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-obsidian-950 border border-obsidian-850 text-xs text-zinc-500 leading-relaxed space-y-1">
          <span className="font-bold text-zinc-400 block">Dica de Competição (Pesagem):</span>
          <p>Nas lutas <strong>Com Kimono (Gi)</strong>, a pesagem ocorre imediatamente antes da primeira luta do atleta, já usando o Kimono. Nas competições <strong>Sem Kimono (No-Gi)</strong>, o atleta deve estar vestindo a bermuda e rashguard oficial de competição no momento de subir na balança.</p>
        </div>
      </div>
    </div>
  );
};
export default WeightTables;
