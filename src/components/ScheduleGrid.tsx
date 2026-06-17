import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Aula, Turma, Professor, LoggedUser } from '../types';
import { CalendarDays, Layers, Clock } from 'lucide-react';

import { ScheduleView } from './schedule/ScheduleView';
import { ClassManager } from './schedule/ClassManager';
import { TimeSlotManager } from './schedule/TimeSlotManager';

interface ScheduleGridProps {
  loggedUser?: LoggedUser | null;
}

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({ loggedUser }) => {
  const [activeTab, setActiveTab] = useState<'grade' | 'professores' | 'turmas' | 'horarios'>('grade');
  
  const [schedule, setSchedule] = useState<Aula[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>(() => {
    const saved = localStorage.getItem('sfbjj_turmas');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    async function fetchClasses() {
      const { data, error } = await supabase.from('aulas').select('*');
      if (!error && data) {
        setSchedule(data.map(d => ({
          ...d,
          diasSemana: typeof d.diasSemana === 'string' ? JSON.parse(d.diasSemana) : d.diasSemana
        })));
      } else {
        // Fallback para o local storage se o supabase falhar ou a tabela estiver vazia
        const saved = localStorage.getItem('sfbjj_aulas_fallback');
        if (saved) setSchedule(JSON.parse(saved));
      }
    }
    fetchClasses();
  }, []);

  useEffect(() => {
    async function fetchProfessores() {
      const { data, error } = await supabase.from('professores').select('*').order('nome');
      if (!error && data) {
        setProfessores(data);
      }
    }
    fetchProfessores();
  }, []);

  useEffect(() => {
    localStorage.setItem('sfbjj_turmas', JSON.stringify(turmas));
  }, [turmas]);

  useEffect(() => {
    localStorage.setItem('sfbjj_aulas_fallback', JSON.stringify(schedule));
  }, [schedule]);

  const isAdmin = loggedUser?.role === 'admin';

  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="flex bg-obsidian-900/40 p-1 rounded-xl border border-obsidian-850/60 w-full max-w-2xl overflow-x-auto backdrop-blur-md">
          <button
            onClick={() => setActiveTab('grade')}
            className={`flex-1 flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg text-[10px] uppercase tracking-wider font-black transition-all whitespace-nowrap ${
              activeTab === 'grade'
                ? 'bg-slate-100 text-obsidian-950 shadow-lg shadow-black/25'
                : 'text-slate-450 hover:text-slate-200 hover:bg-obsidian-800/40'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Visualizar Grade
          </button>

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
            Horários
          </button>
        </div>
      )}

      <div className="mt-6">
        {activeTab === 'grade' && (
          <ScheduleView schedule={schedule} turmas={turmas} professores={professores} />
        )}

        {activeTab === 'turmas' && isAdmin && (
          <ClassManager turmas={turmas} setTurmas={setTurmas} />
        )}
        {activeTab === 'horarios' && isAdmin && (
          <TimeSlotManager schedule={schedule} setSchedule={setSchedule} turmas={turmas} professores={professores} />
        )}
      </div>
    </div>
  );
};
