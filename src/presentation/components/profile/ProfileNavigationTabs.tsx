import React from 'react';
import { User, Award, Shield } from 'lucide-react';

export type ProfileTabType = 'personal' | 'security' | 'graduacoes';

interface ProfileNavigationTabsProps {
  activeSubTab: ProfileTabType;
  onTabChange: (tab: ProfileTabType) => void;
  showGraduacoesTab: boolean;
}

export const ProfileNavigationTabs: React.FC<ProfileNavigationTabsProps> = ({
  activeSubTab,
  onTabChange,
  showGraduacoesTab
}) => {
  const tabs: { id: ProfileTabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'personal', label: 'Dados Pessoais', icon: User },
    { id: 'security', label: 'Segurança', icon: Shield },
  ];

  if (showGraduacoesTab) {
    tabs.push({ id: 'graduacoes', label: 'Graduações', icon: Award });
  }

  return (
    <nav className="w-full max-w-full overflow-x-auto no-scrollbar py-1" aria-label="Navegação do Perfil">
      <div className="flex items-center gap-1.5 p-1.5 bg-obsidian-950 border border-obsidian-850 rounded-2xl shadow-inner min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 min-h-[44px] text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap rounded-xl focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:outline-none ${
                isActive
                  ? 'bg-gold-550/15 text-gold-400 border border-gold-550/30 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-900 border border-transparent'
              }`}
              aria-selected={isActive}
              role="tab"
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default ProfileNavigationTabs;
