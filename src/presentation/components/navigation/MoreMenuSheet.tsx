import React, { useEffect } from 'react';
import {
  X,
  User,
  Shield,
  Award,
  BookOpen,
  Mail,
  Globe,
  LogOut,
  Download,
  Calendar,
} from 'lucide-react';
import type { LoggedUser } from '@/domain/models/auth';
import { usePWAInstall } from '@/application/hooks/usePWAInstall';
import { PWAInstallPrompt } from '../shared/PWAInstallPrompt';

interface MoreMenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: string;
  setCurrentTab: (tabId: string) => void;
  loggedUser: LoggedUser;
  onLogout: () => void;
}

export const MoreMenuSheet: React.FC<MoreMenuSheetProps> = ({
  isOpen,
  onClose,
  currentTab,
  setCurrentTab,
  loggedUser,
  onLogout,
}) => {
  const { isInstallable, isInstalled, showIOSPrompt, handleInstallClick, closeIOSPrompt } = usePWAInstall();
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const showInstallButton = isInstallable || (isIOS && !isInstalled);

  // Trancar scroll de fundo quando o bottom sheet estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Define todos os itens secundários por perfil
  let secondaryItems: { id: string; label: string; icon: React.ElementType }[] = [];

  if (loggedUser.role === 'admin') {
    secondaryItems = [
      { id: 'profile', label: 'Meu Perfil', icon: User },
      { id: 'batch-graduation', label: 'Graduação & Diplomas', icon: Award },
      { id: 'teachers', label: 'Gestão de Equipe', icon: Shield },
      { id: 'schedule', label: 'Horários & Localização', icon: Calendar },
      { id: 'techniques', label: 'Biblioteca de Posições', icon: BookOpen },
      { id: 'graduation-system', label: 'Regras IBJJF', icon: BookOpen },
      { id: 'contact', label: 'Contato', icon: Mail },
      { id: 'landing', label: 'Site Principal', icon: Globe },
    ];
  } else if (loggedUser.role === 'teacher') {
    secondaryItems = [
      { id: 'profile', label: 'Meu Perfil', icon: User },
      { id: 'teachers', label: 'Gestão de Equipe', icon: Shield },
      { id: 'graduation-system', label: 'Regras IBJJF', icon: BookOpen },
      { id: 'contact', label: 'Contato', icon: Mail },
      { id: 'landing', label: 'Site Principal', icon: Globe },
    ];
  } else {
    // Aluno
    secondaryItems = [
      { id: 'techniques', label: 'Biblioteca de Posições', icon: BookOpen },
      { id: 'schedule', label: 'Horários & Localização', icon: Calendar },
      { id: 'graduation-system', label: 'Regras IBJJF', icon: BookOpen },
      { id: 'contact', label: 'Contato', icon: Mail },
      { id: 'landing', label: 'Site Principal', icon: Globe },
    ];
  }

  const handleSelectTab = (tabId: string) => {
    setCurrentTab(tabId);
    onClose();
  };

  const shortName = loggedUser.nome
    ? loggedUser.nome.split(' ').slice(0, 2).join(' ')
    : 'Usuário';

  return (
    <>
      {/* Backdrop */}
      <div
        className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity duration-300 animate-fade-in-up"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sliding Bottom Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu de opções secundárias"
        className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-obsidian-900 border-t border-obsidian-800 rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-fade-in-up"
        style={{
          paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* Handle visual de drag & Fechar */}
        <div className="relative pt-3 pb-2 px-4 border-b border-obsidian-850 flex items-center justify-between shrink-0 bg-obsidian-950/60">
          <div className="w-12 h-1 bg-obsidian-700 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2.5" />
          <div className="flex items-center gap-2 pt-2">
            <span className="font-extrabold text-xs tracking-wider uppercase text-zinc-200">
              Menu Principal
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white transition-colors active:scale-95 touch-manipulation pt-2"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informações da Conta do Usuário Logado */}
        <div className="p-4 border-b border-obsidian-850 bg-obsidian-950/40 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-none bg-zinc-100/10 border border-zinc-200/20 flex items-center justify-center text-sm font-black text-zinc-100 shrink-0">
            {loggedUser.nome ? loggedUser.nome.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-zinc-100 truncate leading-tight">
              {shortName}
            </p>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
              {loggedUser.role === 'admin'
                ? 'Administrador'
                : loggedUser.role === 'teacher'
                ? 'Professor'
                : 'Aluno'}
            </p>
          </div>
        </div>

        {/* Lista de Opções Secundárias em Scroll */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 px-2">
            Outras Funcionalidades
          </div>
          {secondaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`
                  w-full flex items-center gap-3.5 px-4 py-3 rounded-none border-l-2
                  transition-all duration-200 active:scale-[0.98] touch-manipulation min-h-[44px]
                  ${
                    isActive
                      ? 'bg-zinc-100/10 text-zinc-100 border-zinc-200 font-bold'
                      : 'text-zinc-300 hover:bg-obsidian-850 border-transparent hover:text-white'
                  }
                `}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-zinc-100' : 'text-zinc-400'
                  }`}
                />
                <span className="text-xs uppercase tracking-wider font-bold truncate">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Rodapé com Ações de Instalação PWA & Encerramento de Sessão */}
        <div className="p-4 border-t border-obsidian-850 bg-obsidian-950/60 space-y-2 shrink-0">
          {showInstallButton && (
            <button
              onClick={() => {
                handleInstallClick();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-200 text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-[0.98] touch-manipulation min-h-[44px]"
            >
              <Download className="w-4 h-4 text-zinc-400" />
              <span>Instalar Aplicativo PWA</span>
            </button>
          )}

          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-950/20 hover:bg-red-950/40 border border-red-950/40 text-red-300 text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-[0.98] touch-manipulation min-h-[44px]"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Sair da Conta</span>
          </button>
        </div>
      </div>

      <PWAInstallPrompt isOpen={showIOSPrompt} onClose={closeIOSPrompt} />
    </>
  );
};

export default MoreMenuSheet;
