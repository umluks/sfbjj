import React from 'react';
import { Download, Smartphone, CheckCircle, Info } from 'lucide-react';
import { usePWAInstall } from '@/application/hooks/usePWAInstall';
import { PWAInstallPrompt } from './PWAInstallPrompt';

export const PWAInstallSection: React.FC = () => {
  const {
    isInstalled,
    showIOSPrompt,
    feedbackMessage,
    handleInstallClick,
    closeIOSPrompt,
    clearFeedbackMessage,
  } = usePWAInstall();

  // Não exibe a seção se o aplicativo já estiver instalado em modo Standalone
  if (isInstalled) {
    return null;
  }

  return (
    <section
      aria-label="Instalação do Aplicativo"
      className="w-full bg-gradient-to-b from-obsidian-900 via-obsidian-850 to-obsidian-900 border-y border-obsidian-800 py-12 px-4 sm:px-6 relative overflow-hidden"
    >
      {/* Glow de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-zinc-100/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="bg-obsidian-950/80 border border-obsidian-800/80 p-6 sm:p-10 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Lado Esquerdo: Ícone + Textos */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 flex-1 min-w-0">
            <div className="p-4 bg-obsidian-900 border border-obsidian-800 rounded-none shrink-0 shadow-lg text-slate-100">
              <Smartphone className="w-8 h-8 sm:w-10 sm:h-10 text-slate-200 stroke-[1.75]" />
            </div>

            <div className="space-y-2 max-w-2xl min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-obsidian-900 border border-obsidian-800 px-2.5 py-0.5">
                  App PWA SFBJJ
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Acesso Rápido
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-wide">
                Instale o Aplicativo Oficial
              </h3>

              <p className="text-xs sm:text-sm text-slate-350 leading-relaxed font-medium">
                Instale o aplicativo da Sagrada Família BJJ e tenha acesso rápido à plataforma diretamente da tela inicial do seu dispositivo. Compatível com Android, iPhone (iOS) e Desktop quando suportado pelo navegador.
              </p>
            </div>
          </div>

          {/* Lado Direito: Botão de Ação */}
          <div className="flex flex-col items-center sm:items-end w-full md:w-auto shrink-0 gap-3">
            <button
              onClick={handleInstallClick}
              className="btn-gold text-xs sm:text-sm font-black uppercase tracking-wider px-8 py-3.5 w-full sm:w-auto shadow-xl hover:scale-105 transition-all duration-300 group touch-target"
              aria-label="Instalar Aplicativo da Sagrada Família BJJ"
            >
              <Download className="w-5 h-5 text-zinc-950 group-hover:animate-bounce" />
              <span>Instalar Aplicativo</span>
            </button>

            <span className="text-[10px] text-slate-450 font-mono tracking-wider text-center sm:text-right">
              Leve • Sem necessidade de loja • Atualização automática
            </span>
          </div>
        </div>

        {/* Feedback visual amigável quando o navegador requer instrução manual */}
        {feedbackMessage && (
          <div className="mt-4 p-4 bg-obsidian-900/90 border border-obsidian-750 text-slate-300 text-xs flex items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-slate-300 shrink-0" />
              <p>{feedbackMessage}</p>
            </div>
            <button
              onClick={clearFeedbackMessage}
              className="text-slate-400 hover:text-white font-bold text-xs uppercase px-2 py-1"
            >
              Fechar
            </button>
          </div>
        )}
      </div>

      {/* Modal PWA Exclusivo para iOS */}
      <PWAInstallPrompt isOpen={showIOSPrompt} onClose={closeIOSPrompt} />
    </section>
  );
};

export default PWAInstallSection;
