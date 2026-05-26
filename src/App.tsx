import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { StudentManager } from './components/StudentManager';
import { FinancialManager } from './components/FinancialManager';
import { ScheduleGrid } from './components/ScheduleGrid';
import { Login } from './components/Login';
import { StudentProfile } from './components/StudentProfile';
import { Contact } from './components/Contact';
import { LandingPage } from './components/LandingPage';
import type { Student, Announcement, LoggedUser } from './types';
import { 
  INITIAL_STUDENTS, 
  INITIAL_ANNOUNCEMENTS 
} from './mockData';

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
      return user.role === 'admin' ? 'dashboard' : 'profile';
    }
    return 'dashboard';
  });

  // Unified State with LocalStorage Persistence
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('sfbjj_students_v3');
    let loadedStudents = INITIAL_STUDENTS;
    if (saved) {
      try {
        const savedStudents: Student[] = JSON.parse(saved);
        
        // Map and update existing students with fields from INITIAL_STUDENTS if they exist
        const merged = savedStudents.map(savedStudent => {
          const initial = INITIAL_STUDENTS.find(i => 
            i.id === savedStudent.id || 
            i.nome.toLowerCase().trim() === savedStudent.nome.toLowerCase().trim()
          );
          if (initial) {
            const updatedPagamentos = (savedStudent.pagamentos || []).map(savedPay => {
              const initialPay = initial.pagamentos.find(p => p.mesRef === savedPay.mesRef);
              if (initialPay && savedPay.mesRef === 'Abril/2026') {
                return {
                  ...savedPay,
                  status: initialPay.status,
                  dataPagamento: initialPay.dataPagamento,
                  valor: initialPay.valor
                };
              }
              return savedPay;
            });
            // If any initial payments are missing in saved student, append them
            initial.pagamentos.forEach(initPay => {
              if (!updatedPagamentos.some(p => p.mesRef === initPay.mesRef)) {
                updatedPagamentos.push(initPay);
              }
            });
            return {
              ...savedStudent,
              ...initial,
              pagamentos: updatedPagamentos
            };
          }
          return savedStudent;
        });

        // Merge missing initial mock students by ID and Nome
        INITIAL_STUDENTS.forEach(initial => {
          const exists = merged.some(s => 
            s.id === initial.id || 
            s.nome.toLowerCase().trim() === initial.nome.toLowerCase().trim()
          );
          if (!exists) {
            merged.push(initial);
          }
        });
        loadedStudents = merged;
      } catch (e) {
        loadedStudents = INITIAL_STUDENTS;
      }
    }

    // Ensure all students have the 'turma' field set (based on birth year if missing)
    const finalizedStudents = loadedStudents.map(s => {
      if (!s.turma) {
        let isKids = false;
        if (s.dataNascimento) {
          const birthParts = s.dataNascimento.split('-');
          const year = parseInt(birthParts[0], 10);
          if (year >= 2010) {
            isKids = true;
          }
        }
        return { ...s, turma: (isKids ? 'Kids' : 'Adulto') as 'Kids' | 'Adulto' };
      }
      return s;
    });

    // Remove empty/blank students and duplicate entries by name
    const uniqueStudentsMap = new Map<string, Student>();
    finalizedStudents.forEach(s => {
      if (s && s.nome && s.nome.trim() !== "") {
        const key = s.nome.toLowerCase().trim();
        if (!uniqueStudentsMap.has(key)) {
          uniqueStudentsMap.set(key, s);
        }
      }
    });
    return Array.from(uniqueStudentsMap.values());
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('sfbjj_announcements');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });


  // Sync state changes to localStorage
  useEffect(() => {
    localStorage.setItem('sfbjj_students_v3', JSON.stringify(students));
  }, [students]);

  // Adjust routing tab if role permissions mismatch
  useEffect(() => {
    if (loggedUser) {
      if (loggedUser.role === 'student' && currentTab !== 'profile' && currentTab !== 'schedule' && currentTab !== 'contact') {
        setCurrentTab('profile');
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
          />
        );
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
        return <ScheduleGrid />;
      case 'profile':
        return (
          <StudentProfile 
            studentId={loggedUser?.role === 'student' ? loggedUser.studentId : undefined}
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
