import React, { useState, useEffect } from 'react';
import type { LoggedUser } from '@/domain/models/auth';
import type { Professor } from '@/domain/models/teacher';
import { teacherService } from '@/application/services/teacherService';
import { useClasses } from '@/application/hooks/useClasses';
import { CalendarDays, Layers, Clock, MapPin } from 'lucide-react';

import { ScheduleView } from '@/presentation/components/schedule/ScheduleView';
import { ClassManager } from '@/presentation/components/schedule/ClassManager';
import { TimeSlotManager } from '@/presentation/components/schedule/TimeSlotManager';
import { LocationManager } from '@/presentation/components/schedule/LocationManager';

interface SchedulePageProps {
  loggedUser?: LoggedUser | null;
}

export const SchedulePage: React.FC<SchedulePageProps> = ({ loggedUser }) => {
  const [activeTab, setActiveTab] = useState<'grade' | 'turmas' | 'horarios' | 'localizacao'>('grade');
  const [professores, setProfessores] = useState<Professor[]>([]);
  const { 
    classes, 
    turmas, 
    createClass, 
    updateClass, 
    deleteClass, 
    createTurma, 
    updateTurma, 
    deleteTurma,
    setTurmas,
    setClasses 
  } = useClasses();

  useEffect(() => {
    async function fetchProfessores() {
      try {
        const data = await teacherService.getTeachers();
        setProfessores(data);
      } catch (err) {
        console.error('Erro ao buscar professores:', err);
      }
    }
    fetchProfessores();
  }, []);

  const isAdmin = loggedUser?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Menu de Abas Dinâmico (Todos os perfis acessam pelo menos Grade e Localização) */}
      <div className="flex bg-obsidian-900/40 p-1 rounded-xl border border-obsidian-850/60 w-full max-w-4xl overflow-x-auto backdrop-blur-md">
        <button
          onClick={() => setActiveTab('grade')}
          className={`flex-1 flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg text-[10px] uppercase tracking-wider font-black transition-all whitespace-nowrap ${
            activeTab === 'grade'
              ? 'bg-slate-100 text-obsidian-950 shadow-lg shadow-black/25'
              : 'text-slate-455 hover:text-slate-200 hover:bg-obsidian-800/40'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          Grade de Treinos
        </button>

        <button
          onClick={() => setActiveTab('localizacao')}
          className={`flex-1 flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg text-[10px] uppercase tracking-wider font-black transition-all whitespace-nowrap ${
            activeTab === 'localizacao'
              ? 'bg-slate-100 text-obsidian-950 shadow-lg shadow-black/25'
              : 'text-slate-455 hover:text-slate-200 hover:bg-obsidian-800/40'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Localização
        </button>

        {isAdmin && (
          <>
            <button
              onClick={() => setActiveTab('turmas')}
              className={`flex-1 flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg text-[10px] uppercase tracking-wider font-black transition-all whitespace-nowrap ${
                activeTab === 'turmas'
                  ? 'bg-slate-100 text-obsidian-950 shadow-lg shadow-black/25'
                  : 'text-slate-455 hover:text-slate-200 hover:bg-obsidian-800/40'
              }`}
            >
              <Layers className="w-4 h-4" />
              Turmas
            </button>
            
            <button
              onClick={() => setActiveTab('horarios')}
              className={`flex-1 flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg text-[10px] uppercase tracking-wider font-black transition-all whitespace-nowrap ${
                activeTab === 'horarios'
                  ? 'bg-slate-100 text-obsidian-950 shadow-lg shadow-black/25'
                  : 'text-slate-455 hover:text-slate-200 hover:bg-obsidian-800/40'
              }`}
            >
              <Clock className="w-4 h-4" />
              Horários (Slots)
            </button>
          </>
        )}
      </div>

      {/* Conteúdo das Abas */}
      <div className="mt-6">
        {activeTab === 'grade' && (
          <ScheduleView schedule={classes} turmas={turmas} professores={professores} />
        )}

        {activeTab === 'localizacao' && (
          <LocationManager isAdmin={isAdmin} />
        )}

        {activeTab === 'turmas' && isAdmin && (
          <ClassManager 
            turmas={turmas} 
            setTurmas={setTurmas} 
            onCreate={createTurma} 
            onUpdate={updateTurma} 
            onDelete={deleteTurma} 
          />
        )}
        
        {activeTab === 'horarios' && isAdmin && (
          <TimeSlotManager 
            schedule={classes} 
            setSchedule={setClasses} 
            turmas={turmas} 
            professores={professores} 
            onCreate={createClass} 
            onUpdate={updateClass} 
            onDelete={deleteClass} 
          />
        )}
      </div>
    </div>
  );
};

export default SchedulePage;
