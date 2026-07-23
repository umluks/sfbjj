import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import logoSFBJJ from '@/assets/logo-sfbjj.png';
import logoLucas from '@/assets/logo-lucas.png';
import type { Aviso } from '@/domain/models/announcement';
import { ContactPage } from './ContactPage';
import { GraduationSystemPage } from './GraduationSystemPage';
import { classService } from '@/application/services/classService';
import { usePWAInstall } from '@/application/hooks/usePWAInstall';
import { PWAInstallPrompt } from '@/presentation/components/shared/PWAInstallPrompt';
import { useAuthContext } from '@/application/contexts/AuthContext';

// Novos componentes modulares refinados
import { Header } from './LandingPage/components/Header';
import { Hero } from './LandingPage/components/Hero';
import { Announcements } from './LandingPage/components/Announcements';
import { Pilares } from './LandingPage/components/Pilares';
import { TatameRules } from './LandingPage/components/TatameRules';
import { TrainingSchedule } from './LandingPage/components/TrainingSchedule';
import { Footer } from './LandingPage/components/Footer';

interface LandingPageProps {
  announcements?: Aviso[];
  onAccessLogin: () => void;
}

const getDiasSemanaString = (diasSemana: number[]): string => {
  const nomesDias: Record<number, string> = {
    1: 'Segunda',
    2: 'Terça',
    3: 'Quarta',
    4: 'Quinta',
    5: 'Sexta',
    6: 'Sábado',
    7: 'Domingo'
  };
  if (!diasSemana || diasSemana.length === 0) return '';
  const dias = diasSemana.map(d => nomesDias[d]).filter(Boolean);
  if (dias.length === 1) return dias[0];
  if (dias.length === 2) return `${dias[0]} & ${dias[1]}`;
  return dias.join(', ');
};

export const LandingPage: React.FC<LandingPageProps> = ({ announcements = [], onAccessLogin }) => {
  const { loggedUser } = useAuthContext();
  const [showGraduationModal, setShowGraduationModal] = useState(false);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hook do PWA
  const { isInstallable, isInstalled, showIOSPrompt, handleInstallClick, closeIOSPrompt } = usePWAInstall();
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const showInstallButton = isInstallable || (isIOS && !isInstalled);

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const data = await classService.getClasses();
        if (data) {
          const mapped = data.map((d: any) => {
            let dias = d.diasSemana;
            if (typeof dias === 'string') {
              try {
                dias = JSON.parse(dias);
              } catch {
                dias = [];
              }
            }
            return {
              hora: d.hora,
              categoria: d.categoria,
              dias: getDiasSemanaString(dias),
              professor: d.professor
            };
          });
          setSchedule(mapped);
        }
      } catch (err) {
        console.error('Erro ao carregar horários na Landing Page:', err);
      }
    }
    fetchSchedule();
  }, []);

  return (
    <div className="bg-obsidian-950 text-slate-100 min-h-screen font-sans selection:bg-slate-200/25 selection:text-white overflow-x-hidden">
      {/* 1. Header & Navigation */}
      <Header
        announcements={announcements}
        showInstallButton={showInstallButton}
        handleInstallClick={handleInstallClick}
        onAccessLogin={onAccessLogin}
        loggedUser={loggedUser}
        setShowGraduationModal={setShowGraduationModal}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        logoSFBJJ={logoSFBJJ}
      />

      <main>
        {/* 2. Hero Section */}
        <Hero
          onAccessLogin={onAccessLogin}
          loggedUser={loggedUser}
          logoSFBJJ={logoSFBJJ}
        />

        {/* 3. Mural de Comunicados */}
        <Announcements announcements={announcements} />

        {/* 4. Seção Nossos Pilares / Valores */}
        <Pilares />

        {/* 5. Regras do Tatame */}
        <TatameRules />

        {/* 7. Grade de Treinos / Horários */}
        <TrainingSchedule schedule={schedule} />


        {/* 9. Seção de Contato */}
        <section id="contato" className="py-24 px-4 max-w-7xl mx-auto border-t border-obsidian-900 scroll-mt-20">
          <ContactPage />
        </section>
      </main>

      {/* 10. Footer / Rodapé */}
      <Footer
        logoSFBJJ={logoSFBJJ}
        logoLucas={logoLucas}
        announcements={announcements}
        setShowGraduationModal={setShowGraduationModal}
        onAccessLogin={onAccessLogin}
      />

      {/* MODAL SISTEMA DE GRADUAÇÃO IBJJF */}
      {showGraduationModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-obsidian-950/95 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-7xl bg-obsidian-900 border border-obsidian-800 p-6 md:p-8 shadow-2xl my-8">
            <button
              onClick={() => setShowGraduationModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors p-2 bg-obsidian-950 border border-obsidian-800 rounded-none z-10"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="max-h-[80vh] overflow-y-auto pr-2 mt-4">
              <GraduationSystemPage />
            </div>
          </div>
        </div>
      )}

      {/* Modal PWA para iOS */}
      <PWAInstallPrompt isOpen={showIOSPrompt} onClose={closeIOSPrompt} />
    </div>
  );
};

export default LandingPage;
