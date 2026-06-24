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

  useEffect(() => {
    // 1. Detecta se o aplicativo já está rodando em modo independente (instalado)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');
    
    setIsInstalled(isStandalone);

    // 2. Escuta o evento beforeinstallprompt (Android, Chrome, Edge)
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
      console.log('SFBJJ PWA instalado com sucesso!');
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
    // Se for dispositivo iOS e não estiver instalado, exibimos as instruções
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    if (isIOS && !isInstalled) {
      setShowIOSPrompt(true);
      return;
    }

    if (!installPrompt) return;
    
    // Mostra o prompt nativo
    installPrompt.prompt();
    
    // Aguarda a escolha do usuário
    const { outcome } = await installPrompt.userChoice;
    console.log(`PWA install prompt outcome: ${outcome}`);
    
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setInstallPrompt(null);
    }
  };

  const closeIOSPrompt = () => {
    setShowIOSPrompt(false);
  };

  return { 
    isInstallable, 
    isInstalled, 
    showIOSPrompt, 
    handleInstallClick, 
    closeIOSPrompt 
  };
}
