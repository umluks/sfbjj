import { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuthContext } from '@/application/contexts/AuthContext';
import { StudentsProvider, useStudents } from '@/application/contexts/StudentsContext';
import { MainLayout } from '@/presentation/layouts/MainLayout';

// Páginas refatoradas sob Clean Architecture
import { LoginPage } from '@/presentation/pages/LoginPage';
import { LandingPage } from '@/presentation/pages/LandingPage';
import { DashboardPage } from '@/presentation/pages/DashboardPage';
import { StudentsPage } from '@/presentation/pages/StudentsPage';
import { BatchGraduationPage } from '@/presentation/pages/BatchGraduationPage';
import { StaffPage } from '@/presentation/pages/StaffPage';
import { FinancialPage } from '@/presentation/pages/FinancialPage';
import { GraduationSystemPage } from '@/presentation/pages/GraduationSystemPage';
import { ContactPage } from '@/presentation/pages/ContactPage';
import { SchedulePage } from '@/presentation/pages/SchedulePage';
import { StudentProfilePage } from '@/presentation/pages/StudentProfilePage';
import { MyAttendancePage } from '@/presentation/pages/MyAttendancePage';
import { AttendanceReportPage } from '@/presentation/pages/AttendanceReportPage';
import { MyJourneyPage } from '@/presentation/pages/MyJourneyPage';
import { TechniquesPage } from '@/presentation/pages/TechniquesPage';

import type { Aviso } from '@/domain/models/announcement';
import { announcementService } from '@/application/services/announcementService';

function AppContent() {
  const { loggedUser, logout } = useAuthContext();
  const [showLogin, setShowLogin] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [announcements, setAnnouncements] = useState<Aviso[]>([]);
  const { loadStudents, clearStudents } = useStudents();

  // Define aba inicial baseada na role do usuário
  useEffect(() => {
    if (loggedUser) {
      if (loggedUser.role === 'admin') {
        setCurrentTab('dashboard');
      } else if (loggedUser.role === 'teacher') {
        setCurrentTab('schedule');
      } else {
        setCurrentTab('profile');
      }
    } else {
      setCurrentTab('dashboard');
    }
  }, [loggedUser]);

  // Monitora o estado da rede (online/offline)
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Carrega a listagem global de alunos apenas para perfis autorizados pós-login
  useEffect(() => {
    if (loggedUser && (loggedUser.role === 'admin' || loggedUser.role === 'teacher')) {
      loadStudents();
    } else {
      clearStudents();
    }
  }, [loggedUser, loadStudents, clearStudents]);

  // Carrega avisos públicos da Landing Page
  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const data = await announcementService.getAnnouncements();
        if (data && data.length > 0) {
          setAnnouncements(data);
        }
      } catch (err) {
        console.error('Erro ao carregar comunicados:', err);
      }
    }
    fetchAnnouncements();
  }, []);

  // Solicita permissão para notificações do navegador
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Dispara notificação in-app/sistema operacional ao receber novos comunicados
  const prevAnnouncementsLength = useRef(announcements.length);
  useEffect(() => {
    if (
      announcements.length > prevAnnouncementsLength.current &&
      prevAnnouncementsLength.current > 0
    ) {
      const novoAviso = announcements[0];
      if (Notification.permission === 'granted') {
        new Notification('Novo Comunicado SFBJJ', {
          body: novoAviso.titulo || 'Há um novo comunicado importante no mural da academia.',
          icon: '/pwa-192x192.png'
        });
      }
    }
    prevAnnouncementsLength.current = announcements.length;
  }, [announcements]);

  useEffect(() => {
    if (loggedUser) {
      if (loggedUser.role === 'student' && currentTab !== 'profile' && currentTab !== 'my-journey' && currentTab !== 'my-attendance' && currentTab !== 'my-graduations' && currentTab !== 'techniques' && currentTab !== 'schedule' && currentTab !== 'contact' && currentTab !== 'graduation-system' && currentTab !== 'landing') {
        setCurrentTab('profile');
      } else if (loggedUser.role === 'teacher' && currentTab !== 'profile' && currentTab !== 'schedule' && currentTab !== 'students' && currentTab !== 'attendance-report' && currentTab !== 'teachers' && currentTab !== 'techniques' && currentTab !== 'contact' && currentTab !== 'graduation-system' && currentTab !== 'landing') {
        setCurrentTab('schedule');
      }
    }
  }, [loggedUser, currentTab]);

  const handleLogout = () => {
    logout();
    setShowLogin(false);
  };

  // Renderização baseada na aba ativa
  const renderContent = () => {
    switch (currentTab) {
      case 'landing':
        return (
          <LandingPage 
            announcements={announcements} 
            onAccessLogin={() => setCurrentTab(loggedUser?.role === 'admin' ? 'dashboard' : 'profile')} 
          />
        );
      case 'dashboard':
        return (
          <DashboardPage />
        );
      case 'students':
        return (
          <StudentsPage />
        );
      case 'batch-graduation':
        return (
          <BatchGraduationPage />
        );
      case 'teachers':
        return (
          <StaffPage />
        );
      case 'financial':
        return (
          <FinancialPage />
        );
      case 'graduation-system':
        return (
          <GraduationSystemPage />
        );
      case 'techniques':
        return (
          <TechniquesPage />
        );
      case 'contact':
        return (
          <ContactPage />
        );
      case 'schedule':
        return (
          <SchedulePage loggedUser={loggedUser} />
        );
      case 'profile':
        return (
          <StudentProfilePage 
            alunoId={loggedUser?.role === 'student' ? loggedUser.alunoId : undefined}
          />
        );
      case 'my-graduations':
        return (
          <StudentProfilePage 
            alunoId={loggedUser?.role === 'student' ? loggedUser.alunoId : undefined}
            initialSubTab="graduacoes"
            hideSidebarMenu={true}
          />
        );
      case 'my-attendance':
        return (
          <MyAttendancePage 
            alunoId={loggedUser?.role === 'student' ? loggedUser.alunoId : undefined}
          />
        );
      case 'my-journey':
        return (
          <MyJourneyPage 
            alunoId={loggedUser?.role === 'student' ? loggedUser.alunoId : undefined}
          />
        );
      case 'attendance-report':
        return (
          <AttendanceReportPage />
        );
      default:
        return (
          <div className="text-center py-20 text-slate-500 font-bold uppercase tracking-wider text-xs">
            Página em desenvolvimento.
          </div>
        );
    }
  };

  // Renderização de login se o usuário não estiver logado
  if (!loggedUser) {
    if (showLogin) {
      return (
        <div className="min-h-screen flex flex-col bg-obsidian-950">
          {isOffline && (
            <div className="bg-red-955/90 text-red-200 border-b border-red-800 text-center py-2 px-4 text-xs font-black tracking-widest uppercase sticky top-0 z-[9999] flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Você está no Modo Offline. O login requer conexão com a internet.
            </div>
          )}
          <div className="flex-1 flex flex-col justify-center">
            <LoginPage 
              onLoginSuccess={() => setShowLogin(false)}
              onBackToLanding={() => setShowLogin(false)} 
            />
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex flex-col bg-obsidian-950">
        {isOffline && (
          <div className="bg-red-955/90 text-red-200 border-b border-red-800 text-center py-2 px-4 text-xs font-black tracking-widest uppercase fixed top-0 w-full z-[9999] flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Você está no Modo Offline. Algumas informações podem estar desatualizadas.
          </div>
        )}
        <div className={isOffline ? 'pt-8' : ''}>
          <LandingPage announcements={announcements} onAccessLogin={() => setShowLogin(true)} />
        </div>
      </div>
    );
  }

  return (
    <MainLayout
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      loggedUser={loggedUser}
      onLogout={handleLogout}
      isOffline={isOffline}
    >
      {renderContent()}
    </MainLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <StudentsProvider>
        <AppContent />
      </StudentsProvider>
    </AuthProvider>
  );
}

export default App;
