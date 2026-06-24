import React, { useEffect } from 'react';
import { X, Share, PlusSquare } from 'lucide-react';

interface PWAInstallPromptProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ isOpen, onClose }) => {
  // Acessibilidade: fechar ao pressionar a tecla Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ios-prompt-title"
    >
      {/* Container do Modal */}
      <div className="relative w-full max-w-md bg-obsidian-900 border border-obsidian-800 p-6 md:p-8 shadow-2xl rounded-none text-left">
        {/* Botão de Fechar */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-450 hover:text-zinc-200 transition-colors p-2 bg-obsidian-950 border border-obsidian-800"
          aria-label="Fechar diálogo de instalação"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Cabeçalho */}
        <div className="mb-6">
          <span className="text-[9px] font-black tracking-widest text-zinc-500 uppercase">
            Instalação no iOS
          </span>
          <h2 id="ios-prompt-title" className="text-lg font-black text-slate-100 uppercase tracking-wider mt-1">
            Instalar SFBJJ no iPhone
          </h2>
        </div>

        {/* Instruções */}
        <div className="space-y-5 text-sm text-slate-350">
          <p className="leading-relaxed">
            Para instalar o aplicativo no seu dispositivo iOS, siga estes dois passos simples usando o navegador **Safari**:
          </p>

          <div className="flex items-start gap-4 p-3 bg-obsidian-950 border border-obsidian-850">
            <div className="p-2.5 bg-zinc-100/5 border border-zinc-200/10 text-slate-200 shrink-0">
              <Share className="w-5 h-5 text-zinc-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                Passo 1
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Toque no botão de <strong>Compartilhar</strong> na barra de ferramentas inferior do Safari.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3 bg-obsidian-950 border border-obsidian-850">
            <div className="p-2.5 bg-zinc-100/5 border border-zinc-200/10 text-slate-200 shrink-0">
              <PlusSquare className="w-5 h-5 text-zinc-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                Passo 2
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Role o menu de compartilhamento para baixo e selecione a opção <strong>Adicionar à Tela de Início</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="mt-8 pt-4 border-t border-obsidian-850 flex justify-end">
          <button
            onClick={onClose}
            className="btn-gold text-[10px] font-black uppercase tracking-wider px-6 py-2.5"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};
