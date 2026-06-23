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
  Mail,
  Shield,
  Award,
  BookOpen
} from 'lucide-react';
import type { LoggedUser } from '../types';
import logoSFBJJ from '../assets/logo-sfbjj.jpg';

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
    // Retorna Primeiro Nome + Sobrenome
    return `${parts[0]} ${parts[parts.length - 1]}`;
  }
  return fullName;
};

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, loggedUser, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Itens de menu de navegação baseados em função (role)
  let menuItems: any[] = [];
  if (loggedUser.role === 'admin') {
    menuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'profile', label: 'Meu Perfil', icon: User },
      { id: 'students', label: 'Gestão de Alunos', icon: Users },
      { id: 'batch-graduation', label: 'Graduação & Diplomas', icon: Award },
      { id: 'teachers', label: 'Gestão de Professores', icon: Shield },
      { id: 'financial', label: 'Controle Financeiro', icon: DollarSign },
      { id: 'schedule', label: 'Grade de Horários', icon: Calendar },
      { id: 'graduation-system', label: 'Regras de Graduação', icon: BookOpen },
      { id: 'contact', label: 'Contato', icon: Mail },
    ];
  } else if (loggedUser.role === 'teacher') {
    menuItems = [
      { id: 'profile', label: 'Meu Perfil', icon: User },
      { id: 'schedule', label: 'Grade de Horários', icon: Calendar },
      { id: 'students', label: 'Consultar Alunos', icon: Users },
      { id: 'batch-graduation', label: 'Graduação & Diplomas', icon: Award },
      { id: 'graduation-system', label: 'Regras de Graduação', icon: BookOpen },
      { id: 'contact', label: 'Contato', icon: Mail },
    ];
  } else {
    menuItems = [
      { id: 'profile', label: 'Meu Perfil', icon: User },
      { id: 'schedule', label: 'Grade de Horários', icon: Calendar },
      { id: 'graduation-system', label: 'Regras de Graduação', icon: BookOpen },
      { id: 'contact', label: 'Contato', icon: Mail },
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
        fixed inset-y-0 left-0 z-50 w-64 bg-obsidian-950 border-r border-obsidian-900
        flex flex-col transform transition-transform duration-300 ease-in-out h-full
        md:translate-x-0 md:static md:h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand/Logo Section */}
        <div className="flex flex-col items-center justify-center text-center p-8 border-b border-obsidian-900">
          <div className="relative mb-4">
            <div className="absolute -inset-2 bg-gradient-to-r from-zinc-200/5 to-zinc-400/5 blur-md opacity-25" />
            <div className="relative p-0.5 bg-obsidian-900 border border-obsidian-800 rounded-none shadow-lg">
              <img 
                src={logoSFBJJ} 
                alt="Logo SFBJJ" 
                className="w-28 h-28 rounded-none object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-black tracking-widest text-[13px] text-zinc-100 uppercase leading-none">
              Sagrada Família
            </span>
            <span className="text-zinc-500 font-bold tracking-widest text-[8px] uppercase mt-2.5">
              Brasília - Jiu-Jitsu
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`
                  w-full flex items-center gap-3.5 px-4 py-3 rounded-none font-bold text-[10px] uppercase tracking-wider transition-all duration-200 border-l-2
                  ${isActive
                    ? 'bg-zinc-100/5 text-zinc-105 border-zinc-400'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-obsidian-900 border-transparent'
                  }
                `}
              >
                <Icon className={`
                  w-4 h-4 transition-transform duration-200
                  ${isActive ? 'text-zinc-200' : 'text-zinc-500'}
                `} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Session Info & Logout */}
        <div className="px-4 py-5 border-t border-obsidian-900 flex flex-col gap-3 bg-obsidian-950">
          <div className="flex items-center gap-3 px-1.5 py-1">
            <div className="w-8.5 h-8.5 rounded-none bg-zinc-100/5 border border-zinc-200/10 flex items-center justify-center text-xs font-black text-zinc-350 shrink-0">
              {loggedUser.nome.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-zinc-200 truncate leading-tight" title={loggedUser.nome}>
                {shortName}
              </p>
              <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mt-1">
                {loggedUser.role === 'admin' ? 'Administrador' : loggedUser.role === 'teacher' ? 'Professor' : 'Aluno'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              onLogout();
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-none text-zinc-400 hover:text-red-400 hover:bg-red-950/10 transition-all duration-200 font-bold text-[9px] uppercase tracking-widest border border-obsidian-900 hover:border-red-950/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair da Conta</span>
          </button>
        </div>

        {/* Footer Brand Info */}
        <div className="p-3 border-t border-obsidian-900 text-center bg-obsidian-950">
          <span className="text-[9px] text-zinc-600 tracking-wider block font-medium">
            © 2026 Sagrada Família BJJ
          </span>
          <span className="text-[9px] text-zinc-500 block mt-0.5 font-bold">
            Lucas dos Anjos
          </span>
        </div>
      </aside >
    </>
  );
};

