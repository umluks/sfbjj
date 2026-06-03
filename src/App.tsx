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
import type { Aluno, Aviso, LoggedUser } from './types';
import { INITIAL_ANNOUNCEMENTS } from './mockData';
import { supabase } from './lib/supabase';

function App() {
  const [loggedUser, setLoggedUser] = useState<LoggedUser | null>(() => {
    const saved = localStorage.getItem('sfbjj_logged_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [showLogin, setShowLogin] = useState(false);

  const [currentTab, setCurrentTab] = useState<string>(() => {
    const saved = localStorage.getItem('sfbjj_logged_user');
    if (saved) {
      const user = JSON.parse(saved) as LoggedUser;
      if (user.role === 'admin') return 'dashboard';
      if (user.role === 'teacher') return 'schedule';
      return 'profile';
    }
    return 'dashboard';
  });

  // Unified State
  const [students, setStudents] = useState<Aluno[]>([]);

  useEffect(() => {
    async function fetchStudents() {
      const { data, error } = await supabase.from('alunos').select('*, pagamentos(*), graduacoes_historico(*)');
      if (!error && data) {
        // Map database response to Aluno types
        const mapped = data.map((student: any) => ({
          ...student,
          historicoGraduacoes: (student.graduacoes_historico || []).map((g: any) => ({
            id: g.id,
            data: g.data_graduacao,
            faixa: g.faixa,
            graus: g.graus,
            avaliador: g.avaliador
          })).sort((a: any, b: any) => new Date(a.data).getTime() - new Date(b.data).getTime()) // sort oldest to newest
        }));
        // Sort students alphabetically
        const sorted = mapped.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
        setStudents(sorted as any);
      }
    }
    fetchStudents();
  }, []);

  const [announcements, setAnnouncements] = useState<Aviso[]>(() => {
    const saved = localStorage.getItem('sfbjj_announcements');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  useEffect(() => {
    async function fetchAnnouncements() {
      const { data, error } = await supabase.from('avisos').select('*');
      if (!error && data && data.length > 0) {
        setAnnouncements(data);
      }
    }
    fetchAnnouncements();
  }, []);
  // Sync state changes to localStorage
  useEffect(() => {
    localStorage.setItem('sfbjj_students_v3', JSON.stringify(students));
  }, [students]);

  // Adjust routing tab if role permissions mismatch
  useEffect(() => {
    if (loggedUser) {
      if (loggedUser.role === 'student' && currentTab !== 'profile' && currentTab !== 'schedule' && currentTab !== 'contact') {
        setCurrentTab('profile');
      } else if (loggedUser.role === 'teacher' && currentTab !== 'schedule' && currentTab !== 'students' && currentTab !== 'contact') {
        setCurrentTab('schedule');
      } else if (loggedUser.role === 'admin' && currentTab === 'profile') {
        setCurrentTab('dashboard');
      }
    }
  }, [loggedUser, currentTab]);

  const handleLoginSuccess = (user: LoggedUser) => {
    localStorage.setItem('sfbjj_logged_user', JSON.stringify(user));
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
    localStorage.removeItem('sfbjj_logged_user');
    setLoggedUser(null);
  };

  useEffect(() => {
    localStorage.setItem('sfbjj_announcements', JSON.stringify(announcements));
  }, [announcements]);



  // Render active tab view
  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard 
            students={students} 
            announcements={announcements} 
            setAnnouncements={setAnnouncements} 
            loggedUser={loggedUser}
          />
        );
      case 'students':
        return (
          <StudentManager 
            students={students} 
            setStudents={setStudents} 
            loggedUser={loggedUser}
          />
        );
      case 'teachers':
        return <TeacherManager />;
      case 'financial':
        return (
          <FinancialManager 
            students={students} 
            setStudents={setStudents} 
          />
        );

      case 'contact':
        return <Contact loggedUser={loggedUser} />;
      case 'schedule':
        return <ScheduleGrid loggedUser={loggedUser} />;
      case 'profile':
        return (
          <StudentProfile 
            alunoId={loggedUser?.role === 'student' ? loggedUser.alunoId : undefined}
            students={students}
            setStudents={setStudents}
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
        <Login 
          students={students} 
          onLoginSuccess={handleLoginSuccess} 
          onBackToLanding={() => setShowLogin(false)} 
        />
      );
    }
    return <LandingPage onAccessLogin={() => setShowLogin(true)} />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-obsidian-900 text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        loggedUser={loggedUser}
        onLogout={handleLogout}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto h-screen relative">
        {/* Decorative ambient background glows */}
        <div className="absolute top-[-10%] left-[20%] w-[350px] h-[350px] rounded-full bg-gold-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[10%] w-[250px] h-[250px] rounded-full bg-gold-500/3 blur-[100px] pointer-events-none" />

        {/* Dynamic page content */}
        <div className="max-w-6xl mx-auto pb-12">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}


export default App;
