import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { StudentManager } from './components/StudentManager';
import { FinancialManager } from './components/FinancialManager';
import { ScheduleGrid } from './components/ScheduleGrid';
import { Login } from './components/Login';
import { TeacherManager } from './components/TeacherManager';
import { StudentProfile } from './components/StudentProfile';
import { Contact } from './components/Contact';
import { LandingPage } from './components/LandingPage';
import { BatchGraduation } from './components/BatchGraduation';
import { GraduationSystem } from './components/GraduationSystem';
import type { Aviso, LoggedUser } from './types';
import { supabase } from './lib/supabase';
import { StudentsProvider, useStudents } from './contexts/StudentsContext';

function AppContent() {
  const [loggedUser, setLoggedUser] = useState<LoggedUser | null>(() => {
    const saved = sessionStorage.getItem('sfbjj_logged_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [showLogin, setShowLogin] = useState(false);

  const [currentTab, setCurrentTab] = useState<string>(() => {
    const saved = sessionStorage.getItem('sfbjj_logged_user');
    if (saved) {
      const user = JSON.parse(saved) as LoggedUser;
      if (user.role === 'admin') return 'dashboard';
      if (user.role === 'teacher') return 'schedule';
      return 'profile';
    }
    return 'dashboard';
  });

  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [announcements, setAnnouncements] = useState<Aviso[]>([]);
  const { loadStudents, clearStudents } = useStudents();

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
      const { data, error } = await supabase.from('avisos').select('*');
      if (!error && data && data.length > 0) {
        setAnnouncements(data);
      }
    }
    fetchAnnouncements();
  }, []);

  // Roteamento condicional baseado nas permissões de cada role
  useEffect(() => {
    if (loggedUser) {
      if (loggedUser.role === 'student' && currentTab !== 'profile' && currentTab !== 'schedule' && currentTab !== 'contact' && currentTab !== 'graduation-system') {
        setCurrentTab('profile');
      } else if (loggedUser.role === 'teacher' && currentTab !== 'profile' && currentTab !== 'schedule' && currentTab !== 'students' && currentTab !== 'batch-graduation' && currentTab !== 'contact' && currentTab !== 'graduation-system') {
        setCurrentTab('schedule');
      }
    }
  }, [loggedUser, currentTab]);

  const handleLoginSuccess = (user: LoggedUser) => {
    sessionStorage.setItem('sfbjj_logged_user', JSON.stringify(user));
    setLoggedUser(user);
    if (user.role === 'admin') {
      setCurrentTab('dashboard');
    } else if (user.role === 'teacher') {
      setCurrentTab('schedule');
    } else {
      setCurrentTab('profile');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('sfbjj_logged_user');
    setLoggedUser(null);
  };

  // Renderização baseada na aba ativa
  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard 
            announcements={announcements} 
            setAnnouncements={setAnnouncements} 
            loggedUser={loggedUser}
          />
        );
      case 'students':
        return (
          <StudentManager 
            loggedUser={loggedUser}
          />
        );
      case 'batch-graduation':
        return (
          <BatchGraduation 
            loggedUser={loggedUser}
          />
        );
      case 'teachers':
        return <TeacherManager />;
      case 'financial':
        return <FinancialManager />;
      case 'graduation-system':
        return <GraduationSystem />;
      case 'contact':
        return <Contact loggedUser={loggedUser} />;
      case 'schedule':
        return <ScheduleGrid loggedUser={loggedUser} />;
      case 'profile':
        return (
          <StudentProfile 
            alunoId={loggedUser?.role === 'student' ? loggedUser.alunoId : undefined}
            loggedUser={loggedUser}
            setLoggedUser={setLoggedUser}
          />
        );
      default:
        return (
          <div className="text-center py-20 text-slate-500">
            Página em desenvolvimento.
          </div>
        );
    }
  };

  if (!loggedUser) {
    if (showLogin) {
      return (
        <div className="min-h-screen flex flex-col bg-obsidian-950">
          {isOffline && (
            <div className="bg-red-950/90 text-red-200 border-b border-red-800 text-center py-2 px-4 text-xs font-black tracking-widest uppercase sticky top-0 z-[9999] flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Você está no Modo Offline. O login requer conexão com a internet.
            </div>
          )}
          <div className="flex-1 flex flex-col justify-center">
            <Login 
              onLoginSuccess={handleLoginSuccess} 
              onBackToLanding={() => setShowLogin(false)} 
            />
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex flex-col bg-obsidian-950">
        {isOffline && (
          <div className="bg-red-950/90 text-red-200 border-b border-red-800 text-center py-2 px-4 text-xs font-black tracking-widest uppercase fixed top-0 w-full z-[9999] flex items-center justify-center gap-2">
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
    <div className="flex flex-col min-h-screen bg-obsidian-950 text-slate-100 font-sans">
      {isOffline && (
        <div className="bg-red-950/90 text-red-200 border-b border-red-800 text-center py-2 px-4 text-xs font-black tracking-widest uppercase z-[9999] flex items-center justify-center gap-2 w-full">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          Você está no Modo Offline. Alterações não serão salvas no servidor.
        </div>
      )}
      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        {/* Sidebar Navigation */}
        <Sidebar 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab} 
          loggedUser={loggedUser}
          onLogout={handleLogout}
        />

        {/* Main Workspace Container */}
        <main className="flex-1 overflow-y-auto h-screen relative bg-obsidian-950">
          <div className="max-w-[1600px] mx-auto p-4 sm:p-6 md:p-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <StudentsProvider>
      <AppContent />
    </StudentsProvider>
  );
}

export default App;
