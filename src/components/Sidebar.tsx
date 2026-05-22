import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  CheckSquare,
  Calendar,
  Menu,
  X,
  Flame
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Gestão de Alunos', icon: Users },
    { id: 'financial', label: 'Controle Financeiro', icon: DollarSign },
    { id: 'attendance', label: 'Frequência (Presença)', icon: CheckSquare },
    { id: 'schedule', label: 'Grade de Horários', icon: Calendar },
  ];

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
        <div className="hidden md:flex items-center gap-3 px-6 py-8 border-b border-obsidian-700/30">
          <div className="p-2 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl text-obsidian-950 shadow-md shadow-gold-950/20">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-wider text-slate-100 uppercase leading-none">
              Sagrada Família
            </span>
            <span className="text-gold-500 font-bold tracking-widest text-xs uppercase mt-0.5">
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

        {/* Footer Brand Info */}
        <div className="p-4 border-t border-obsidian-700/30 text-center">
          <span className="text-[10px] text-slate-500 tracking-wider block">
            © 2026 Sagrada Família BJJ
          </span>
          <span className="text-[9px] text-gold-500/60 block mt-0.5">
            Admin Portal v1.0
          </span>
        </div>
      </aside>
    </>
  );
};
