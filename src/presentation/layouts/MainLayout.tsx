import React, { useState } from 'react';
import { Sidebar } from '@/presentation/components/Sidebar';
import { MobileHeader } from '@/presentation/components/navigation/MobileHeader';
import { BottomNavigation } from '@/presentation/components/navigation/BottomNavigation';
import { MoreMenuSheet } from '@/presentation/components/navigation/MoreMenuSheet';
import type { LoggedUser } from '@/domain/models/auth';

interface MainLayoutProps {
  children: React.ReactNode;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  loggedUser: LoggedUser;
  onLogout: () => void;
  isOffline: boolean;
}

const TAB_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  students: 'Gestão de Alunos',
  'attendance-report': 'Frequência de Alunos',
  'batch-graduation': 'Graduações & Diplomas',
  teachers: 'Gestão de Equipe',
  financial: 'Controle Financeiro',
  schedule: 'Horários & Localização',
  techniques: 'Biblioteca de Posições',
  'graduation-system': 'Regras IBJJF',
  contact: 'Contato',
  landing: 'Site Principal',
  profile: 'Meu Perfil',
  'my-journey': 'Minha Jornada',
  'my-attendance': 'Minha Frequência',
  'my-graduations': 'Histórico de Graduações',
};

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  currentTab,
  setCurrentTab,
  loggedUser,
  onLogout,
  isOffline,
}) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const currentTabLabel = TAB_LABELS[currentTab] || 'SFBJJ';

  const handleTabChange = (tabId: string) => {
    setCurrentTab(tabId);
    setIsMoreOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen max-w-full overflow-x-hidden bg-obsidian-950 text-slate-100 font-sans">
      {isOffline && (
        <div className="bg-red-950/90 text-red-200 border-b border-red-800 text-center py-2 px-4 text-xs font-black tracking-widest uppercase z-[9999] flex items-center justify-center gap-2 w-full shrink-0">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          Você está no Modo Offline. Alterações não serão salvas no servidor.
        </div>
      )}

      {/* Topo Mobile */}
      <MobileHeader
        currentTabLabel={currentTabLabel}
        loggedUser={loggedUser}
        onProfileClick={() => handleTabChange('profile')}
      />

      <div className="flex flex-col md:flex-row flex-1 min-h-0 min-w-0 w-full max-w-full">
        {/* Sidebar Navigation (Apenas Desktop) */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={handleTabChange}
          loggedUser={loggedUser}
          onLogout={onLogout}
        />

        {/* Main Workspace Container */}
        <main className="flex-1 md:h-screen md:overflow-y-auto relative bg-obsidian-950 min-w-0 w-full max-w-full overflow-x-hidden">
          <div className="max-w-[1600px] w-full mx-auto p-3 sm:p-6 md:p-8 pb-24 md:pb-8 max-w-full min-w-0 overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>

      {/* Navegação Inferior Fixa Mobile (Bottom Navigation) */}
      <BottomNavigation
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        loggedUser={loggedUser}
        onOpenMore={() => setIsMoreOpen(true)}
        isMoreOpen={isMoreOpen}
      />

      {/* Drawer / Sheet de Opções Secundárias */}
      <MoreMenuSheet
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        loggedUser={loggedUser}
        onLogout={onLogout}
      />
    </div>
  );
};

export default MainLayout;

