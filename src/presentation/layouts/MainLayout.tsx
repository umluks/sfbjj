import React from 'react';
import { Sidebar } from '@/presentation/components/Sidebar';
import type { LoggedUser } from '@/domain/models/auth';

interface MainLayoutProps {
  children: React.ReactNode;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  loggedUser: LoggedUser;
  onLogout: () => void;
  isOffline: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  currentTab,
  setCurrentTab,
  loggedUser,
  onLogout,
  isOffline
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-obsidian-950 text-slate-100 font-sans">
      {isOffline && (
        <div className="bg-red-950/90 text-red-200 border-b border-red-800 text-center py-2 px-4 text-xs font-black tracking-widest uppercase z-[9999] flex items-center justify-center gap-2 w-full shrink-0">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          Você está no Modo Offline. Alterações não serão salvas no servidor.
        </div>
      )}
      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        {/* Sidebar Navigation */}
        <Sidebar 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab} 
          loggedUser={loggedUser}
          onLogout={onLogout}
        />

        {/* Main Workspace Container */}
        <main className="flex-1 md:h-screen md:overflow-y-auto relative bg-obsidian-950">
          <div className="max-w-[1600px] mx-auto p-4 sm:p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
export default MainLayout;
