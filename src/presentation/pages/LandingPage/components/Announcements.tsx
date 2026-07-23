import React from 'react';
import { Megaphone } from 'lucide-react';
import type { Aviso } from '@/domain/models/announcement';

interface AnnouncementsProps {
  announcements: Aviso[];
}

export const Announcements: React.FC<AnnouncementsProps> = ({ announcements }) => {
  if (!announcements || announcements.length === 0) return null;

  return (
    <section id="avisos" className="py-24 px-4 bg-obsidian-950/40 border-t border-b border-obsidian-900/60 scroll-mt-20 relative">
      {/* Background glow sutil */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-zinc-800/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-obsidian-900 border border-obsidian-800 flex items-center justify-center mx-auto shadow-lg">
            <Megaphone className="w-5 h-5 text-slate-300" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-100 uppercase tracking-wider">
            Mural de Comunicados
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Acompanhe os avisos oficiais, eventos futuros e informativos importantes do nosso tatame.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.slice(0, 6).map((ann) => {
            const isPinned = ann.fixado;
            return (
              <div
                key={ann.id}
                className={`group relative overflow-hidden p-6 border transition-all duration-300 ${
                  isPinned
                    ? 'border-zinc-500/25 bg-gradient-to-br from-obsidian-900 to-obsidian-850 hover:border-zinc-400/40'
                    : 'border-obsidian-800/80 bg-obsidian-900/40 hover:border-obsidian-700 hover:bg-obsidian-900/60'
                }`}
              >
                {isPinned && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-zinc-200 text-obsidian-950 text-[8px] font-black uppercase tracking-widest">
                    Fixado
                  </div>
                )}
                
                {/* Linha decorativa no topo para os fixados */}
                {isPinned && <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-zinc-400 via-zinc-100 to-zinc-500" />}

                <span className="text-[9px] font-mono text-slate-500 block mb-3 uppercase tracking-wider font-semibold">
                  {ann.data}
                </span>
                
                <h3 className="text-sm font-black text-slate-200 uppercase tracking-wide mb-3 leading-snug group-hover:text-white transition-colors">
                  {ann.titulo}
                </h3>
                
                <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap font-medium">
                  {ann.conteudo}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default Announcements;
