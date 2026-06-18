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

  // Estado Unificado
  const [students, setStudents] = useState<Aluno[]>([]);

  useEffect(() => {
    async function fetchStudents() {
      const { data, error } = await supabase.from('alunos').select('*, pagamentos!pagamentos_alunoId_fkey(*), graduacoes_historico!graduacoes_historico_aluno_id_fkey(*)');
      if (!error && data) {
        // Mapeia a resposta do banco de dados para os tipos Aluno
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
        // Ordena os alunos alfabeticamente
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
  // Sincroniza as alterações de estado com o localStorage
  useEffect(() => {
    localStorage.setItem('sfbjj_students_v3', JSON.stringify(students));
  }, [students]);

  // Ajusta a aba de roteamento se as permissões de função não corresponderem
  useEffect(() => {
    if (loggedUser) {
      if (loggedUser.role === 'student' && currentTab !== 'profile' && currentTab !== 'schedule' && currentTab !== 'contact' && currentTab !== 'graduation-system') {
        setCurrentTab('profile');
      } else if (loggedUser.role === 'teacher' && currentTab !== 'schedule' && currentTab !== 'students' && currentTab !== 'batch-graduation' && currentTab !== 'contact' && currentTab !== 'graduation-system') {
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



  // Renderiza a visão da aba ativa
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
      case 'batch-graduation':
        return (
          <BatchGraduation 
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
    return <LandingPage announcements={announcements} onAccessLogin={() => setShowLogin(true)} />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-obsidian-950 text-slate-100 font-sans">
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
  );
}


export default App;
