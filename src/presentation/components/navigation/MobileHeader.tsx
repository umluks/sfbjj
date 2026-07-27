import React from 'react';
import { Flame, User } from 'lucide-react';
import type { LoggedUser } from '@/domain/models/auth';

interface MobileHeaderProps {
  currentTabLabel: string;
  loggedUser: LoggedUser;
  onProfileClick: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  currentTabLabel,
  loggedUser,
  onProfileClick,
}) => {
  const initial = loggedUser.nome ? loggedUser.nome.charAt(0).toUpperCase() : 'U';

  return (
    <header className="md:hidden flex items-center justify-between bg-obsidian-950/95 border-b border-obsidian-900 px-4 py-3 sticky top-0 z-30 backdrop-blur-md">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="p-1 bg-gradient-to-br from-zinc-200 to-zinc-400 text-obsidian-950 font-bold shrink-0">
          <Flame className="w-4 h-4 text-obsidian-950" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-extrabold text-xs tracking-wider text-zinc-100 uppercase truncate">
            SF<span className="text-zinc-400">BJJ</span>
          </span>
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider truncate">
            {currentTabLabel}
          </span>
        </div>
      </div>

      <button
        onClick={onProfileClick}
        className="flex items-center gap-2 px-2.5 py-1.5 bg-obsidian-900/80 hover:bg-obsidian-800 border border-obsidian-800 rounded-none transition-colors active:scale-95 touch-manipulation"
        aria-label="Ver meu perfil"
      >
        <div className="w-6 h-6 bg-zinc-100/10 border border-zinc-200/20 text-zinc-200 text-xs font-black flex items-center justify-center shrink-0">
          {initial}
        </div>
        <User className="w-3.5 h-3.5 text-zinc-400" />
      </button>
    </header>
  );
};

export default MobileHeader;
