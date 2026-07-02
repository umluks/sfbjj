import React, { useState } from 'react';
import { Printer, Download, Award } from 'lucide-react';
import { belts, type BeltInfo } from '@/constants/ibjjfRules';

interface GraduationPosterProps {
  handlePrint: () => void;
  handleDownloadPDF: () => void;
}

export const GraduationPoster: React.FC<GraduationPosterProps> = ({
  handlePrint,
  handleDownloadPDF
}) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | 'infantil' | 'adulto'>('all');
  const [selectedBelt, setSelectedBelt] = useState<BeltInfo | null>(null);

  const getBeltBackground = (belt: BeltInfo) => {
    if (belt.name === 'Vermelha e Preta (Coral)') {
      return 'linear-gradient(45deg, #FF1A1A 25%, #151518 25%, #151518 50%, #FF1A1A 50%, #FF1A1A 75%, #151518 75%, #151518 100%)';
    }
    if (belt.name === 'Vermelha e Branca (Coral)') {
      return 'linear-gradient(45deg, #FF1A1A 25%, #FFFFFF 25%, #FFFFFF 50%, #FF1A1A 50%, #FF1A1A 75%, #FFFFFF 75%, #FFFFFF 100%)';
    }
    return belt.color;
  };

  const filteredBelts = belts.filter(belt => {
    const matchesCategory = selectedCategoryFilter === 'all' || 
                            (selectedCategoryFilter === 'infantil' && belt.category === 'infantil') ||
                            (selectedCategoryFilter === 'adulto' && (belt.category === 'adulto' || belt.category === 'coral_vermelha'));
    return matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Ações de Impressão e Download */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-obsidian-900 p-4 border border-obsidian-800 print:hidden">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mr-2 shrink-0">Visualização:</span>
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1.5 font-bold text-[9px] uppercase tracking-wider border transition-all ${
              selectedCategoryFilter === 'all'
                ? 'border-zinc-350 bg-zinc-350 text-obsidian-950'
                : 'border-obsidian-750 text-zinc-400 hover:text-zinc-205'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setSelectedCategoryFilter('infantil')}
            className={`px-3 py-1.5 font-bold text-[9px] uppercase tracking-wider border transition-all ${
              selectedCategoryFilter === 'infantil'
                ? 'border-zinc-350 bg-zinc-350 text-obsidian-950'
                : 'border-obsidian-750 text-zinc-400 hover:text-zinc-205'
            }`}
          >
            Infantil
          </button>
          <button
            onClick={() => setSelectedCategoryFilter('adulto')}
            className={`px-3 py-1.5 font-bold text-[9px] uppercase tracking-wider border transition-all ${
              selectedCategoryFilter === 'adulto'
                ? 'border-zinc-350 bg-zinc-350 text-obsidian-950'
                : 'border-obsidian-750 text-zinc-400 hover:text-zinc-205'
            }`}
          >
            Adulto
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-obsidian-850 hover:bg-obsidian-800 text-zinc-300 hover:text-slate-100 border border-obsidian-750 font-bold text-[9px] uppercase tracking-wider transition-colors"
            title="Imprimir Poster Local"
          >
            <Printer className="w-3.5 h-3.5" /> Imprensa
          </button>
          
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gold-500/10 hover:bg-gold-500/20 text-gold-450 hover:text-gold-400 border border-gold-500/20 font-bold text-[9px] uppercase tracking-wider transition-colors"
            title="Baixar Poster Oficial IBJJF PDF"
          >
            <Download className="w-3.5 h-3.5" /> Baixar Poster Oficial PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Grid Visual do Poster */}
        <div className="lg:col-span-8 space-y-8 print:w-full print:col-span-12">
          
          {/* Categoria: Infantil */}
          {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'infantil') && (
            <div className="space-y-4">
              <div className="border-l-2 border-zinc-500 pl-3 print:border-black">
                <h3 className="text-sm font-black tracking-widest text-zinc-300 uppercase print:text-black">
                  Graduação Infantil (4 a 15 anos)
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredBelts.filter(b => b.category === 'infantil').map((belt) => (
                  <button
                    key={belt.name}
                    onClick={() => setSelectedBelt(belt)}
                    className={`group p-4 bg-obsidian-900 border transition-all duration-300 text-left flex flex-col justify-between h-40 hover:-translate-y-1 print:border-black print:bg-white print:text-black ${
                      selectedBelt?.name === belt.name
                        ? 'border-zinc-300 shadow-gold-glow bg-obsidian-850'
                        : 'border-obsidian-800 hover:border-obsidian-750'
                    }`}
                  >
                    <div 
                      className="w-full h-7 border border-black/20 flex items-center justify-end relative shadow-inner overflow-hidden mb-3"
                      style={{ background: getBeltBackground(belt) }}
                    >
                      {belt.barColor && (
                        <div className="w-1/3 h-full absolute right-0 flex items-center justify-around px-1" style={{ backgroundColor: belt.barColor }}>
                          <div className="w-[2px] h-3/4 bg-white/70 opacity-30" />
                          <div className="w-[2px] h-3/4 bg-white/70 opacity-30" />
                          <div className="w-[2px] h-3/4 bg-white/70 opacity-30" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-100 truncate print:text-black">
                        {belt.name}
                      </h4>
                      <span className="text-[10px] text-zinc-500 block mt-1">
                        Idade: {belt.minAge} a 15 anos
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Categoria: Adulto & Master */}
          {(selectedCategoryFilter === 'all' || selectedCategoryFilter === 'adulto') && (
            <div className="space-y-4">
              <div className="border-l-2 border-zinc-450 pl-3 print:border-black">
                <h3 className="text-sm font-black tracking-widest text-zinc-300 uppercase print:text-black">
                  Graduação Adulto e Master (16+ anos)
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredBelts.filter(b => b.category === 'adulto' || b.category === 'coral_vermelha').map((belt) => (
                  <button
                    key={belt.name}
                    onClick={() => setSelectedBelt(belt)}
                    className={`group p-4 bg-obsidian-900 border transition-all duration-300 text-left flex flex-col justify-between h-40 hover:-translate-y-1 print:border-black print:bg-white print:text-black ${
                      selectedBelt?.name === belt.name
                        ? 'border-zinc-300 shadow-gold-glow bg-obsidian-850'
                        : 'border-obsidian-800 hover:border-obsidian-750'
                    }`}
                  >
                    <div 
                      className="w-full h-7 border border-black/20 flex items-center justify-end relative shadow-inner overflow-hidden mb-3"
                      style={{ background: getBeltBackground(belt) }}
                    >
                      {belt.barColor && (
                        <div className="w-1/3 h-full absolute right-2 flex items-center justify-center gap-[2px] px-1 border-y border-black" style={{ backgroundColor: belt.barColor }}>
                          <div className="w-[3px] h-[80%] bg-white" />
                          <div className="w-[3px] h-[80%] bg-white" />
                        </div>
                      )}
                      <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-black/40" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-100 print:text-black">
                        {belt.name}
                      </h4>
                      <span className="text-[10px] text-zinc-500 block mt-1">
                        Idade Mínima: {belt.minAge} anos
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Painel de Detalhes Lateral */}
        <div className="lg:col-span-4 bg-obsidian-900 border border-obsidian-800 p-6 sticky top-24 print:hidden">
          {selectedBelt ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[9px] uppercase tracking-widest font-black text-zinc-500">Faixa Selecionada</span>
                <h3 className="text-xl font-black text-slate-100">{selectedBelt.name}</h3>
                
                <div 
                  className="w-full h-12 border border-black/30 flex items-center justify-end relative overflow-hidden shadow-lg"
                  style={{ background: getBeltBackground(selectedBelt) }}
                >
                  {selectedBelt.barColor && (
                    <div className="w-1/4 h-full absolute right-6 flex items-center justify-center gap-1 px-1.5" style={{ backgroundColor: selectedBelt.barColor }}>
                      {Array.from({ length: Math.min(4, selectedBelt.stripes || 0) }).map((_, i) => (
                        <div key={i} className="w-[4px] h-[85%] bg-white" />
                      ))}
                    </div>
                  )}
                  <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-black/40" />
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-obsidian-950 border border-obsidian-850">
                    <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider block mb-1">Idade Mínima</span>
                    <span className="font-extrabold text-slate-250 text-sm">{selectedBelt.minAge} anos</span>
                  </div>
                  <div className="p-3 bg-obsidian-950 border border-obsidian-850">
                    <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider block mb-1">Carência Mínima</span>
                    <span className="font-extrabold text-slate-250 text-[11.5px] leading-tight block">{selectedBelt.minTime}</span>
                  </div>
                </div>

                <div className="p-4 bg-obsidian-950 border border-obsidian-850">
                  <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider block mb-1">Graus (Pontas)</span>
                  <p className="text-slate-300 leading-relaxed">
                    Pode receber até <strong className="text-slate-100">{selectedBelt.stripes} graus</strong> antes de progredir de faixa.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-wider block">Descrição & Foco Técnico</span>
                  <p className="text-slate-400 leading-relaxed text-justify whitespace-pre-line">
                    {selectedBelt.description}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-obsidian-850">
              <Award className="w-12 h-12 text-zinc-700 animate-pulse mb-3" />
              <h4 className="font-bold text-slate-250 text-sm">Selecione uma faixa</h4>
              <p className="text-xs text-zinc-500 mt-1 max-w-[200px]">
                Clique em qualquer faixa à esquerda para visualizar seus detalhes de graduação.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
