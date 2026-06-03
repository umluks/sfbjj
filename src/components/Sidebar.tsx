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

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, loggedUser, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Role based navigation menu items
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

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between bg-obsidian-800 border-b border-obsidian-700 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-gold-500 to-gold-600 rounded-lg text-obsidian-950 font-bold">
            <Flame className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-sm tracking-wider text-slate-100 uppercase">
            Sagrada Família <span className="text-gold-500">BJJ</span>
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-slate-300 hover:text-gold-500 transition-colors p-1"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container (Desktop & Mobile Drawer) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-obsidian-850 md:bg-obsidian-800 border-r border-obsidian-750 md:border-obsidian-700/80
        flex flex-col transform transition-transform duration-300 ease-in-out h-full
        md:translate-x-0 md:static md:h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand/Logo Section */}
        <div className="flex flex-col items-center justify-center text-center p-2">
          <div className="mb-2">
            <img src={logoSFBJJ} alt="Logo SFBJJ" width={150} height={150} />
            {/* <Flame className="w-6 h-6 animate-pulse" /> */}
          </div>
          <div className="flex flex-col items-center">
            <span className="font-extrabold tracking-wider text-slate-100 uppercase leading-none" style={{ fontSize: '20px' }}>
              Sagrada Família
            </span>
            <span className="text-gold-500 font-bold tracking-widest text-xs uppercase mt-0.5" style={{ fontSize: '12px' }}>
              Brasília - Jiu-Jitsu
            </span>
          </div>
        </div>


        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`
                  w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 group
                  ${isActive
                    ? 'bg-gradient-to-r from-gold-500/15 to-gold-500/5 border-l-4 border-gold-500 text-gold-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-700/40 border-l-4 border-transparent'
                  }
                `}
              >
                <Icon className={`
                  w-5 h-5 transition-transform duration-300 group-hover:scale-110
                  ${isActive ? 'text-gold-500' : 'text-slate-400 group-hover:text-slate-300'}
                `} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Session Info & Logout */}
        <div className="px-4 py-3 border-t border-obsidian-750/60 flex flex-col gap-2">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="w-8 h-8 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-xs font-bold text-gold-400">
              {loggedUser.nome.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate leading-tight border-b border-transparent">
                {loggedUser.nome}
              </p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-0.5">
                {loggedUser.role === 'admin' ? 'Administrador' : loggedUser.role === 'teacher' ? 'Professor' : 'Aluno'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              onLogout();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-300 font-semibold text-xs border border-transparent hover:border-red-500/15"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da Conta</span>
          </button>
        </div>

        {/* Footer Brand Info */}
        <div className="p-4 border-t border-obsidian-700/30 text-center bg-obsidian-900/10">
          <span className="text-[10px] text-slate-500 tracking-wider block">
            © 2026 Sagrada Família BJJ
          </span>
          <span className="text-[9px] text-gold-500/60 block mt-0.5">
            Lucas dos Anjos
          </span>
        </div>
      </aside >
    </>
  );
};

