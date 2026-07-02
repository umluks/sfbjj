import React from 'react';
import { FileText, Download } from 'lucide-react';

interface GraduationRulesProps {
  handleDownloadRulebook: () => void;
}

export const GraduationRules: React.FC<GraduationRulesProps> = ({ handleDownloadRulebook }) => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-obsidian-900 border border-obsidian-800 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-obsidian-800 pb-4">
          <div>
            <h3 className="text-sm font-black tracking-widest text-zinc-200 uppercase flex items-center gap-2">
              <FileText className="w-4 h-4 text-gold-500" /> Livro de Regras Oficiais IBJJF
            </h3>
            <p className="text-[11px] text-zinc-500 mt-1">
              Última atualização consolidada do Livro de Regras Técnicas de Jiu-Jitsu.
            </p>
          </div>
          <button
            onClick={handleDownloadRulebook}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gold-500/10 hover:bg-gold-500/20 text-gold-450 hover:text-gold-400 border border-gold-500/20 font-bold text-[9px] uppercase tracking-wider transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" /> Baixar Livro de Regras (PDF)
          </button>
        </div>

        {/* Pontuação Oficial */}
        <div className="space-y-4">
          <h4 className="text-xs font-black tracking-widest text-zinc-300 uppercase">
            Sistema de Pontuação de Luta (Pontos por Posição)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-obsidian-950 border border-obsidian-850">
              <span className="text-2xl font-black text-slate-100 block">4</span>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1 block">Montada / Costas</span>
            </div>
            <div className="p-4 bg-obsidian-950 border border-obsidian-850">
              <span className="text-2xl font-black text-slate-100 block">3</span>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1 block">Passagem de Guarda</span>
            </div>
            <div className="p-4 bg-obsidian-950 border border-obsidian-850">
              <span className="text-2xl font-black text-slate-100 block">2</span>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1 block">Queda / Raspagem / Joelho Barriga</span>
            </div>
            <div className="p-4 bg-obsidian-950 border border-obsidian-850">
              <span className="text-2xl font-black text-slate-100 block">Vantagens</span>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1 block">Quase Pontuações / Ataque Perigoso</span>
            </div>
          </div>
        </div>

        {/* Tempos de Luta */}
        <div className="space-y-4">
          <h4 className="text-xs font-black tracking-widest text-zinc-300 uppercase">
            Duração das Lutas (Categoria Adulto por Faixa)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs text-center">
            <div className="p-3 bg-obsidian-950 border border-obsidian-850">
              <span className="font-extrabold text-slate-200 block">Branca</span>
              <span className="text-zinc-500 font-semibold block mt-1">5 minutos</span>
            </div>
            <div className="p-3 bg-obsidian-950 border border-obsidian-850">
              <span className="font-extrabold text-slate-200 block">Azul</span>
              <span className="text-zinc-500 font-semibold block mt-1">6 minutos</span>
            </div>
            <div className="p-3 bg-obsidian-950 border border-obsidian-850">
              <span className="font-extrabold text-slate-200 block">Roxa</span>
              <span className="text-zinc-500 font-semibold block mt-1">7 minutos</span>
            </div>
            <div className="p-3 bg-obsidian-950 border border-obsidian-850">
              <span className="font-extrabold text-slate-200 block">Marrom</span>
              <span className="text-zinc-500 font-semibold block mt-1">8 minutos</span>
            </div>
            <div className="p-3 bg-obsidian-950 border border-obsidian-850">
              <span className="font-extrabold text-slate-200 block">Preta</span>
              <span className="text-zinc-500 font-semibold block mt-1">10 minutos</span>
            </div>
          </div>
        </div>

        {/* Punições e Faltas Disciplinares */}
        <div className="p-4 bg-obsidian-950 border border-obsidian-850 text-xs text-slate-400 space-y-2">
          <span className="font-bold text-slate-350 block uppercase tracking-wider">
            Progressão de Faltas por Falta de Combatividade (Amarrar a Luta)
          </span>
          <ul className="list-decimal pl-5 space-y-1.5">
            <li><strong>1ª Falta:</strong> Advertência Verbal do Árbitro.</li>
            <li><strong>2ª Falta:</strong> Punição (1 ponto concedido ao oponente).</li>
            <li><strong>3ª Falta:</strong> Punição Gravíssima (2 pontos concedidos ao oponente).</li>
            <li><strong>4ª Falta:</strong> Desclassificação imediata do atleta infrator.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
export default GraduationRules;
