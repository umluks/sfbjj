import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { AuthProvider, useAuthContext } from '@/application/contexts/AuthContext';
import { StudentsProvider, useStudents } from '@/application/contexts/StudentsContext';
import { MainLayout } from '@/presentation/layouts/MainLayout';

// Componente de fallback durante o carregamento de cada chunk
const PageFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center">
    <div className="w-10 h-10 border-4 border-obsidian-800 border-t-zinc-200 rounded-full animate-spin" />
    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest animate-pulse">
      Carregando SFBJJ...
    </span>
  </div>
);

// Páginas carregadas dinamicamente via Code Splitting (React.lazy)
const LoginPage = lazy(() => import('@/presentation/pages/LoginPage'));
const LandingPage = lazy(() => import('@/presentation/pages/LandingPage'));
const DashboardPage = lazy(() => import('@/presentation/pages/DashboardPage'));
const StudentsPage = lazy(() => import('@/presentation/pages/StudentsPage'));
const BatchGraduationPage = lazy(() => import('@/presentation/pages/BatchGraduationPage'));
const StaffPage = lazy(() => import('@/presentation/pages/StaffPage'));
const FinancialPage = lazy(() => import('@/presentation/pages/FinancialPage'));
const GraduationSystemPage = lazy(() => import('@/presentation/pages/GraduationSystemPage'));
const ContactPage = lazy(() => import('@/presentation/pages/ContactPage'));
const SchedulePage = lazy(() => import('@/presentation/pages/SchedulePage'));
const StudentProfilePage = lazy(() => import('@/presentation/pages/StudentProfilePage'));
const MyAttendancePage = lazy(() => import('@/presentation/pages/MyAttendancePage'));
const AttendanceReportPage = lazy(() => import('@/presentation/pages/AttendanceReportPage'));
const MyJourneyPage = lazy(() => import('@/presentation/pages/MyJourneyPage'));
const TechniquesPage = lazy(() => import('@/presentation/pages/TechniquesPage'));

import type { Aviso } from '@/domain/models/announcement';
import { announcementService } from '@/application/services/announcementService';

function AppContent() {
  const { loggedUser, logout, isInitializing } = useAuthContext();
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

  // Se estiver restaurando a sessão inicial (Refresh Token), exibe a tela de carregamento suave
  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-obsidian-950 gap-4 p-8 text-center">
        <div className="w-12 h-12 border-4 border-obsidian-800 border-t-amber-500 rounded-full animate-spin" />
        <span className="text-xs text-amber-500 font-bold uppercase tracking-widest animate-pulse">
          Restaurando Sessão SFBJJ...
        </span>
      </div>
    );
  }

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

  // Renderização quando o usuário está logado mas decide visualizar o Site Principal (Landing Page)
  if (loggedUser && currentTab === 'landing') {
    const returnTab = loggedUser.role === 'admin' ? 'dashboard' : loggedUser.role === 'teacher' ? 'schedule' : 'profile';
    return (
      <div className="min-h-screen flex flex-col bg-obsidian-950">
        {isOffline && (
          <div className="bg-red-955/90 text-red-200 border-b border-red-800 text-center py-2 px-4 text-xs font-black tracking-widest uppercase fixed top-0 w-full z-[9999] flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Você está no Modo Offline. Algumas informações podem estar desatualizadas.
          </div>
        )}
        {/* Banner no topo informando sobre a sessão e facilitando o retorno à Área do Aluno */}
        <div className="bg-obsidian-900 border-b border-obsidian-800 text-slate-300 py-2 px-4 text-xs flex items-center justify-between fixed top-0 left-0 right-0 z-[60] backdrop-blur-md bg-obsidian-900/90 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-[11px] font-medium hidden sm:inline">
              Sessão Ativa: <strong className="text-white font-bold">{loggedUser.nome}</strong> ({loggedUser.role === 'admin' ? 'Administrador' : loggedUser.role === 'teacher' ? 'Professor' : 'Aluno'})
            </span>
            <span className="text-[11px] font-bold text-white sm:hidden">
              {loggedUser.nome.split(' ')[0]}
            </span>
          </div>
          <button
            onClick={() => setCurrentTab(returnTab)}
            className="btn-gold text-[10px] font-black uppercase tracking-wider px-4 py-1 hover:scale-105 transition-all shadow-md"
          >
            Voltar para Área do Aluno
          </button>
        </div>
        <div className="pt-8">
          <Suspense fallback={<PageFallback />}>
            <LandingPage
              announcements={announcements}
              onAccessLogin={() => setCurrentTab(returnTab)}
            />
          </Suspense>
        </div>
      </div>
    );
  }

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
            <Suspense fallback={<PageFallback />}>
              <LoginPage 
                onLoginSuccess={() => setShowLogin(false)}
                onBackToLanding={() => setShowLogin(false)} 
              />
            </Suspense>
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
          <Suspense fallback={<PageFallback />}>
            <LandingPage announcements={announcements} onAccessLogin={() => setShowLogin(true)} />
          </Suspense>
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
      <Suspense fallback={<PageFallback />}>
        {renderContent()}
      </Suspense>
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
