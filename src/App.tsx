import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { StudentManager } from './components/StudentManager';
import { FinancialManager } from './components/FinancialManager';
import { AttendanceManager } from './components/AttendanceManager';
import { ScheduleGrid } from './components/ScheduleGrid';
import { Login } from './components/Login';
import { StudentProfile } from './components/StudentProfile';
import type { Student, Announcement, Attendance, LoggedUser } from './types';
import { 
  INITIAL_STUDENTS, 
  INITIAL_ANNOUNCEMENTS, 
  INITIAL_ATTENDANCES 
} from './mockData';

function App() {
  const [loggedUser, setLoggedUser] = useState<LoggedUser | null>(() => {
    const saved = localStorage.getItem('sfbjj_logged_user');
    return saved ? JSON.parse(saved) : null;
  });

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
    const saved = localStorage.getItem('sfbjj_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('sfbjj_announcements');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [attendances, setAttendances] = useState<Attendance[]>(() => {
    const saved = localStorage.getItem('sfbjj_attendances');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCES;
  });

  // Sync state changes to localStorage
  useEffect(() => {
    localStorage.setItem('sfbjj_students', JSON.stringify(students));
  }, [students]);

  // Adjust routing tab if role permissions mismatch
  useEffect(() => {
    if (loggedUser) {
      if (loggedUser.role === 'student' && currentTab !== 'profile' && currentTab !== 'schedule') {
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

  useEffect(() => {
    localStorage.setItem('sfbjj_attendances', JSON.stringify(attendances));
  }, [attendances]);

  // Render active tab view
  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard 
            students={students} 
            announcements={announcements} 
            setAnnouncements={setAnnouncements} 
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
      case 'attendance':
        return (
          <AttendanceManager 
            students={students} 
            setStudents={setStudents} 
            attendances={attendances} 
            setAttendances={setAttendances} 
          />
        );
      case 'schedule':
        return <ScheduleGrid />;
      case 'profile':
        if (loggedUser?.role === 'student' && loggedUser.studentId) {
          return (
            <StudentProfile 
              studentId={loggedUser.studentId}
              students={students}
              setStudents={setStudents}
            />
          );
        }
        return (
          <div className="text-center py-20 text-slate-500">
            Acesso não autorizado.
          </div>
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
    return <Login students={students} onLoginSuccess={handleLoginSuccess} />;
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
