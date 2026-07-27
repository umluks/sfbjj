import React from 'react';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Calendar,
  User,
  Award,
  BookOpen,
  ClipboardCheck,
  Trophy,
  MoreHorizontal,
} from 'lucide-react';
import type { LoggedUser } from '@/domain/models/auth';

export interface BottomNavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface BottomNavigationProps {
  currentTab: string;
  setCurrentTab: (tabId: string) => void;
  loggedUser: LoggedUser;
  onOpenMore: () => void;
  isMoreOpen: boolean;
}

export const getPrimaryNavItems = (role: string): BottomNavItem[] => {
  if (role === 'admin') {
    return [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'students', label: 'Alunos', icon: Users },
      { id: 'attendance-report', label: 'Frequência', icon: ClipboardCheck },
      { id: 'financial', label: 'Financeiro', icon: DollarSign },
    ];
  }
  if (role === 'teacher') {
    return [
      { id: 'schedule', label: 'Horários', icon: Calendar },
      { id: 'students', label: 'Alunos', icon: Users },
      { id: 'attendance-report', label: 'Frequência', icon: ClipboardCheck },
      { id: 'techniques', label: 'Posições', icon: BookOpen },
    ];
  }
  // Aluno
  return [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'my-journey', label: 'Jornada', icon: Trophy },
    { id: 'my-attendance', label: 'Frequência', icon: ClipboardCheck },
    { id: 'my-graduations', label: 'Graduações', icon: Award },
  ];
};

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  setCurrentTab,
  loggedUser,
  onOpenMore,
  isMoreOpen,
}) => {
  const primaryItems = getPrimaryNavItems(loggedUser.role);

  // Verifica se a aba atual está entre as 4 principais ou se é uma secundária (que faz o 'Mais' ficar ativo)
  const isPrimaryActive = primaryItems.some((item) => item.id === currentTab);
  const isMoreActive = isMoreOpen || !isPrimaryActive;

  return (
    <nav
      aria-label="Navegação Inferior"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-obsidian-950/95 backdrop-blur-xl border-t border-obsidian-850 shadow-2xl transition-all duration-300"
      style={{
        paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-1">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id && !isMoreOpen;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`
                relative flex-1 flex flex-col items-center justify-center h-full py-1 px-1
                transition-all duration-200 active:scale-95 touch-manipulation select-none
                ${
                  isActive
                    ? 'text-zinc-100 font-extrabold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }
              `}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Barra superior de destaque para a aba ativa */}
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-zinc-200 rounded-full animate-fade-in-up" />
              )}
              
              <Icon
                className={`
                  w-5 h-5 transition-transform duration-200 mb-0.5
                  ${isActive ? 'scale-110 text-zinc-100' : 'text-zinc-500'}
                `}
              />
              <span className="text-[10px] tracking-wider uppercase font-bold truncate max-w-full leading-tight">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Botão de menu "Mais" */}
        <button
          onClick={onOpenMore}
          className={`
            relative flex-1 flex flex-col items-center justify-center h-full py-1 px-1
            transition-all duration-200 active:scale-95 touch-manipulation select-none
            ${
              isMoreActive
                ? 'text-zinc-100 font-extrabold'
                : 'text-zinc-500 hover:text-zinc-300'
            }
          `}
          aria-label="Abrir mais opções do menu"
          aria-expanded={isMoreOpen}
        >
          {isMoreActive && (
            <span className="absolute top-0 w-8 h-0.5 bg-zinc-200 rounded-full animate-fade-in-up" />
          )}
          <MoreHorizontal
            className={`
              w-5 h-5 transition-transform duration-200 mb-0.5
              ${isMoreActive ? 'scale-110 text-zinc-100' : 'text-zinc-500'}
            `}
          />
          <span className="text-[10px] tracking-wider uppercase font-bold truncate max-w-full leading-tight">
            Mais
          </span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNavigation;
