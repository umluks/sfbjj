import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Calendar,
  Menu,
  X,
  Flame,
  User,
  LogOut,
  Shield,
  Award,
  BookOpen,
  Download,
  Mail,
  ClipboardCheck,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Globe
} from 'lucide-react';
import type { LoggedUser } from '@/domain/models/auth';
import logoSFBJJ from '@/assets/logo-sfbjj.png';
import { usePWAInstall } from '@/application/hooks/usePWAInstall';
import { PWAInstallPrompt } from './shared/PWAInstallPrompt';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  loggedUser: LoggedUser;
  onLogout: () => void;
}

const getShortName = (fullName: string) => {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length > 2) {
    return `${parts[0]} ${parts[parts.length - 1]}`;
  }
  return fullName;
};

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, loggedUser, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('sfbjj_sidebar_collapsed');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev: boolean) => {
      const next = !prev;
      localStorage.setItem('sfbjj_sidebar_collapsed', JSON.stringify(next));
      return next;
    });
  };

  // Hook do PWA
  const { isInstallable, isInstalled, showIOSPrompt, handleInstallClick, closeIOSPrompt } = usePWAInstall();
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const showInstallButton = isInstallable || (isIOS && !isInstalled);

  // Itens de menu de navegação baseados em função (role)
  let menuItems: any[] = [];
  if (loggedUser.role === 'admin') {
    menuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'profile', label: 'Meu Perfil', icon: User },
      { id: 'students', label: 'Gestão de Alunos', icon: Users },
      { id: 'attendance-report', label: 'Frequência Alunos', icon: ClipboardCheck },
      { id: 'batch-graduation', label: 'Graduação & Diplomas', icon: Award },
      { id: 'teachers', label: 'Gestão de Equipe', icon: Shield },
      { id: 'financial', label: 'Controle Financeiro', icon: DollarSign },
      { id: 'schedule', label: 'Horários & Localização', icon: Calendar },
      { id: 'techniques', label: 'Biblioteca de Posições', icon: BookOpen },
      { id: 'graduation-system', label: 'Regras IBJJF', icon: BookOpen },
      { id: 'contact', label: 'Contato', icon: Mail },
      { id: 'landing', label: 'Site Principal', icon: Globe },
    ];
  } else if (loggedUser.role === 'teacher') {
    menuItems = [
      { id: 'profile', label: 'Meu Perfil', icon: User },
      { id: 'schedule', label: 'Horários & Localização', icon: Calendar },
      { id: 'students', label: 'Consultar Alunos', icon: Users },
      { id: 'attendance-report', label: 'Frequência Alunos', icon: ClipboardCheck },
      { id: 'teachers', label: 'Gestão de Equipe', icon: Shield },
      { id: 'techniques', label: 'Biblioteca de Posições', icon: BookOpen },
      { id: 'graduation-system', label: 'Regras IBJJF', icon: BookOpen },
      { id: 'contact', label: 'Contato', icon: Mail },
      { id: 'landing', label: 'Site Principal', icon: Globe },
    ];
  } else {
    menuItems = [
      { id: 'profile', label: 'Meu Perfil', icon: User },
      { id: 'my-journey', label: 'Minha Jornada', icon: Trophy },
      { id: 'my-attendance', label: 'Minha Frequência', icon: ClipboardCheck },
      { id: 'my-graduations', label: 'Histórico de Graduações', icon: Award },
      { id: 'techniques', label: 'Biblioteca de Posições', icon: BookOpen },
      { id: 'schedule', label: 'Horários & Localização', icon: Calendar },
      { id: 'graduation-system', label: 'Regras IBJJF', icon: BookOpen },
      { id: 'contact', label: 'Contato', icon: Mail },
      { id: 'landing', label: 'Site Principal', icon: Globe },
    ];
  }

  const handleTabChange = (tabId: string) => {
    setCurrentTab(tabId);
    setIsOpen(false);
  };

  const shortName = getShortName(loggedUser.nome);

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between bg-obsidian-950 border-b border-obsidian-900 px-4 py-3.5 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="p-1 bg-gradient-to-br from-zinc-200 to-zinc-400 rounded-none text-obsidian-950 font-bold">
            <Flame className="w-4.5 h-4.5 text-obsidian-950" />
          </div>
          <span className="font-extrabold text-sm tracking-wider text-zinc-100 uppercase">
            Sagrada Família <span className="text-zinc-400 font-black">BJJ</span>
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-zinc-400 hover:text-zinc-100 transition-colors p-1"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container (Desktop & Mobile Drawer) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-obsidian-950 border-r border-obsidian-900
        flex flex-col transform transition-transform duration-300 ease-in-out h-full
        md:translate-x-0 md:static md:h-screen md:relative
        ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        w-64
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Botão de colapsar (apenas desktop) */}
        <button
          onClick={toggleCollapse}
          className="hidden md:flex absolute top-6 -right-3 w-6 h-6 bg-obsidian-900 border border-obsidian-850 hover:bg-obsidian-800 hover:border-obsidian-750 text-zinc-400 hover:text-zinc-200 rounded-full items-center justify-center cursor-pointer shadow-md z-[60] transition-colors"
          aria-label={isCollapsed ? "Expandir menu" : "Minimizar menu"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Brand/Logo Section */}
        <button
          onClick={() => handleTabChange(loggedUser.role === 'admin' ? 'dashboard' : 'profile')}
          className={`flex flex-col items-center justify-center text-center border-b border-obsidian-900 w-full focus:outline-none group transition-all duration-300 ${isCollapsed ? 'p-4 py-6' : 'p-8'}`}
        >
          <div className="relative mb-4">
            <div className="absolute -inset-2 bg-gradient-to-r from-zinc-200/5 to-zinc-400/5 blur-md opacity-25 group-hover:opacity-40 transition-opacity duration-300" />
            <div className="relative p-0.5 bg-obsidian-900 border border-obsidian-800 rounded-none shadow-lg group-hover:scale-105 transition-transform duration-300">
              <img
                src={logoSFBJJ}
                alt="Logo SFBJJ"
                className={`rounded-none object-cover transition-all duration-300 ${isCollapsed ? 'w-10 h-10' : 'w-28 h-28'}`}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
          <div className={`flex flex-col items-center transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0 overflow-hidden mt-0' : 'opacity-100 mt-2.5'}`}>
            <span className="font-black tracking-widest text-[13px] text-zinc-100 uppercase leading-none group-hover:text-white transition-colors duration-300">
              Sagrada Família
            </span>
            <span className="text-zinc-500 font-bold tracking-widest text-[8px] uppercase mt-2.5 group-hover:text-zinc-400 transition-colors duration-300">
              Brasília - Jiu-Jitsu
            </span>
          </div>
        </button>

        {/* Navigation Items */}
        <nav className={`flex-1 space-y-1 overflow-y-auto transition-all duration-300 ${isCollapsed ? 'px-2 py-6' : 'px-3 py-6'}`}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`
                  w-full flex items-center transition-all duration-200 border-l-2
                  ${isCollapsed
                    ? 'justify-center px-2 py-3 rounded-none'
                    : 'gap-3.5 px-4 py-3 rounded-none'
                  }
                  ${isActive
                    ? 'bg-zinc-100/5 text-zinc-100 border-zinc-400'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-obsidian-900 border-transparent'
                  }
                `}
              >
                <Icon className={`
                  w-4 h-4 transition-transform duration-200 shrink-0
                  ${isActive ? 'text-zinc-200' : 'text-zinc-500'}
                `} />
                <span className={`font-bold text-[10px] uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${isCollapsed ? 'opacity-0 w-0 overflow-hidden hidden' : 'opacity-100'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* User Session Info & Logout */}
        <div className={`border-t border-obsidian-900 flex flex-col bg-obsidian-950 transition-all duration-300 ${isCollapsed ? 'px-2 py-5 gap-3' : 'px-4 py-5 gap-3'}`}>
          <div className={`flex items-center transition-all duration-300 ${isCollapsed ? 'justify-center px-0 py-1' : 'gap-3 px-1.5 py-1'}`}>
            <div className="w-8.5 h-8.5 rounded-none bg-zinc-100/5 border border-zinc-200/10 flex items-center justify-center text-xs font-black text-zinc-350 shrink-0">
              {loggedUser.nome.charAt(0).toUpperCase()}
            </div>
            <div className={`flex-1 min-w-0 transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden hidden' : 'opacity-100'}`}>
              <p className="text-xs font-black text-zinc-200 truncate leading-tight" title={loggedUser.nome}>
                {shortName}
              </p>
              <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mt-1">
                {loggedUser.role === 'admin' ? 'Administrador' : loggedUser.role === 'teacher' ? 'Professor' : 'Aluno'}
              </p>
            </div>
          </div>

          {/* Botão de Instalação PWA */}
          {showInstallButton && (
            <button
              onClick={handleInstallClick}
              title={isCollapsed ? "Instalar Aplicativo" : undefined}
              className={`flex items-center justify-center text-zinc-200 hover:text-white bg-zinc-900/50 hover:bg-zinc-800/60 transition-all duration-200 font-bold uppercase border border-zinc-800/40 ${isCollapsed ? 'p-2.5 rounded-none' : 'w-full gap-2 px-4 py-2.5 rounded-none text-[9px] tracking-widest'}`}
              aria-label="Instalar aplicativo PWA"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden hidden' : 'opacity-100'}`}>Instalar Aplicativo</span>
            </button>
          )}

          <button
            onClick={() => {
              onLogout();
              setIsOpen(false);
            }}
            title={isCollapsed ? "Sair da Conta" : undefined}
            className={`flex items-center justify-center text-zinc-400 hover:text-red-400 hover:bg-red-950/10 transition-all duration-200 font-bold uppercase border border-obsidian-900 hover:border-red-950/20 ${isCollapsed ? 'p-2.5 rounded-none' : 'w-full gap-2 px-4 py-2.5 rounded-none text-[9px] tracking-widest'}`}
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden hidden' : 'opacity-100'}`}>Sair da Conta</span>
          </button>
        </div>

        {/* Footer Brand Info */}
        <div className="p-3 border-t border-obsidian-900 text-center bg-obsidian-950">
          <span className="text-[9px] text-zinc-600 tracking-wider block font-medium">
            {isCollapsed ? "SFBJJ" : "© 2026 Sagrada Família BJJ"}
          </span>
        </div>
      </aside >

      {/* Modal PWA para iOS */}
      <PWAInstallPrompt isOpen={showIOSPrompt} onClose={closeIOSPrompt} />
    </>
  );
};
export default Sidebar;
