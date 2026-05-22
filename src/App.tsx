import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { StudentManager } from './components/StudentManager';
import { FinancialManager } from './components/FinancialManager';
import { AttendanceManager } from './components/AttendanceManager';
import { ScheduleGrid } from './components/ScheduleGrid';
import type { Student, Announcement, Attendance } from './types';
import { 
  INITIAL_STUDENTS, 
  INITIAL_ANNOUNCEMENTS, 
  INITIAL_ATTENDANCES 
} from './mockData';

function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

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
      default:
        return (
          <div className="text-center py-20 text-slate-500">
            Página em desenvolvimento.
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-obsidian-900 text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

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
