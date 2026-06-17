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
  Shield
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
      { id: 'students', label: 'Gestão de Alunos', icon: Users },
      { id: 'teachers', label: 'Gestão de Professores', icon: Shield },
      { id: 'financial', label: 'Controle Financeiro', icon: DollarSign },
      { id: 'schedule', label: 'Grade de Horários', icon: Calendar },
      { id: 'contact', label: 'Contato', icon: Mail },
    ];
  } else if (loggedUser.role === 'teacher') {
    menuItems = [
      { id: 'schedule', label: 'Grade de Horários', icon: Calendar },
      { id: 'students', label: 'Consultar Alunos', icon: Users },
      { id: 'contact', label: 'Contato', icon: Mail },
    ];
  } else {
    menuItems = [
      { id: 'profile', label: 'Meu Perfil', icon: User },
      { id: 'schedule', label: 'Grade de Horários', icon: Calendar },
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
      <header className="md:hidden flex items-center justify-between bg-obsidian-900 border-b border-obsidian-850 px-4 py-3.5 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="p-1 bg-gradient-to-br from-slate-200 to-slate-400 rounded-lg text-obsidian-950 font-bold">
            <Flame className="w-4.5 h-4.5" />
          </div>
          <span className="font-extrabold text-sm tracking-wider text-slate-100 uppercase">
            Sagrada Família <span className="text-slate-400 font-black">BJJ</span>
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-slate-400 hover:text-slate-100 transition-colors p-1"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-md z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container (Desktop & Mobile Drawer) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-obsidian-950 border-r border-obsidian-900
        flex flex-col transform transition-transform duration-300 ease-in-out h-full shadow-2xl
        md:translate-x-0 md:static md:h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand/Logo Section */}
        <div className="flex flex-col items-center justify-center text-center p-8 border-b border-obsidian-900/80">
          <div className="relative mb-4">
            <div className="absolute -inset-2 bg-gradient-to-r from-slate-200/10 to-slate-400/5 rounded-full blur-md opacity-25" />
            <div className="relative p-0.5 bg-obsidian-900 border border-obsidian-800 rounded-full shadow-lg">
              <img 
                src={logoSFBJJ} 
                alt="Logo SFBJJ" 
                className="w-14 h-14 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-black tracking-widest text-[13px] text-slate-100 uppercase leading-none">
              Sagrada Família
            </span>
            <span className="text-slate-500 font-bold tracking-widest text-[8px] uppercase mt-1.5">
              Brasília - Jiu-Jitsu
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`
                  w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-extrabold text-[10px] uppercase tracking-wider transition-all duration-300 group
                  ${isActive
                    ? 'bg-slate-100/5 text-slate-100 shadow-sm border-l-2 border-slate-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-900/40 border-l-2 border-transparent'
                  }
                `}
              >
                <Icon className={`
                  w-4 h-4 transition-transform duration-300 group-hover:scale-105
                  ${isActive ? 'text-slate-200' : 'text-slate-450 group-hover:text-slate-350'}
                `} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Session Info & Logout */}
        <div className="px-4 py-5 border-t border-obsidian-900 flex flex-col gap-3.5 bg-obsidian-950/40">
          <div className="flex items-center gap-3 px-1.5 py-1">
            <div className="w-8.5 h-8.5 rounded-full bg-slate-100/5 border border-slate-200/10 flex items-center justify-center text-xs font-black text-slate-300 shrink-0">
              {loggedUser.nome.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-slate-200 truncate leading-tight" title={loggedUser.nome}>
                {shortName}
              </p>
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">
                {loggedUser.role === 'admin' ? 'Administrador' : loggedUser.role === 'teacher' ? 'Professor' : 'Aluno'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              onLogout();
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-300 font-black text-[9px] uppercase tracking-widest border border-obsidian-900 hover:border-red-500/10"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair da Conta</span>
          </button>
        </div>

        {/* Footer Brand Info */}
        <div className="p-3 border-t border-obsidian-900 text-center bg-obsidian-950/20">
          <span className="text-[9px] text-slate-650 tracking-wider block font-medium">
            © 2026 Sagrada Família BJJ
          </span>
          <span className="text-[9px] text-slate-500 block mt-0.5 font-bold">
            Lucas dos Anjos
          </span>
        </div>
      </aside >
    </>
  );
};

