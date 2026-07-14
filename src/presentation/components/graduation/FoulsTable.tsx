import React from 'react';
import { Skull, AlertCircle } from 'lucide-react';
import { illegalMoves } from '@/constants/ibjjfRules';

export const FoulsTable: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-obsidian-900 border border-obsidian-800 p-6 space-y-6">
        <div>
          <h3 className="text-sm font-black tracking-widest text-zinc-200 uppercase flex items-center gap-2">
            <Skull className="w-4 h-4 text-red-500" /> Movimentos Proibidos & Golpes Ilegais
          </h3>
          <p className="text-[11px] text-zinc-500 mt-1">
            Faltas técnicas graves e movimentos que resultam em penalização ou desclassificação instantânea baseada nas faixas e faixas etárias.
          </p>
        </div>

        <div className="overflow-x-auto border border-obsidian-850">
          <table className="w-full text-left text-xs text-slate-350 border-collapse">
            <thead>
              <tr className="border-b border-obsidian-800 bg-obsidian-950 text-zinc-455 uppercase tracking-widest text-[9px]">
                <th className="py-3.5 px-4">Golpe / Movimento</th>
                <th className="py-3.5 px-4">Faixa Banida</th>
                <th className="py-3.5 px-4">Idade Banida</th>
                <th className="py-3.5 px-4 text-right">Punição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-850">
              {illegalMoves.map((foul, index) => (
                <tr key={index} className="hover:bg-obsidian-850/30">
                  <td className="py-3.5 px-4 font-bold text-slate-200">{foul.move}</td>
                  <td className="py-3.5 px-4 font-mono text-[10px] text-zinc-455">{foul.belts}</td>
                  <td className="py-3.5 px-4 text-zinc-400">{foul.ages}</td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-red-400 text-[10px] uppercase">{foul.penalty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 bg-red-950/10 border border-red-900/20 text-xs text-red-400/90 leading-relaxed flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-1">Atenção no Tatame (Bate-Estaca / Slam):</span>
            Elevar o oponente que o está mantendo em triângulo ou chave de braço na guarda e batê-lo intencionalmente contra o tatame é considerado **Bate-Estaca**, resultando em desclassificação imediata do infrator em **todas** as categorias e faixas competitivas sob as regras CBJJ/IBJJF.
          </div>
        </div>
      </div>
    </div>
  );
};
export default FoulsTable;
