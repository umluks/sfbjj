import { useState, useEffect } from 'react';

/**
 * Hook customizado para gerenciar a instalação da Progressive Web App (PWA).
 * Suporta detecção de navegadores modernos (Android/Desktop) e orientações visuais para iOS.
 */
export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    // 1. Detecta se o aplicativo já está rodando em modo independente (instalado)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');

    setIsInstalled(isStandalone);

    // 2. Escuta o evento beforeinstallprompt (Android, Chrome, Edge, etc)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 3. Escuta o evento de instalação concluída
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
      setShowIOSPrompt(false);
      setFeedbackMessage('Aplicativo instalado com sucesso!');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  /**
   * Dispara o prompt de instalação nativo ou modal do iOS dependendo do dispositivo
   */
  const handleInstallClick = async () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    if (isInstalled) {
      setFeedbackMessage('O aplicativo já está instalado no seu dispositivo.');
      return;
    }

    if (isIOS) {
      setShowIOSPrompt(true);
      return;
    }

    if (installPrompt) {
      try {
        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstallable(false);
          setInstallPrompt(null);
        }
      } catch (err) {
        console.error('Erro ao acionar prompt de instalação PWA:', err);
      }
      return;
    }

    // Caso o navegador não ofereça o evento de instalação automática (ex: Firefox em desktop ou navegador sem suporte a PWA)
    setFeedbackMessage(
      'Para instalar, abra este site no Google Chrome, Microsoft Edge ou Safari (iOS) e selecione "Instalar" ou "Adicionar à Tela de Início".'
    );
  };

  const closeIOSPrompt = () => {
    setShowIOSPrompt(false);
  };

  const clearFeedbackMessage = () => {
    setFeedbackMessage(null);
  };

  return {
    isInstallable,
    isInstalled,
    showIOSPrompt,
    feedbackMessage,
    handleInstallClick,
    closeIOSPrompt,
    clearFeedbackMessage,
  };
}

export default usePWAInstall;
