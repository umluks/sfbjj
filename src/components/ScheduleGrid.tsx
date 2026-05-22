import React, { useState } from 'react';
import { INITIAL_SCHEDULE } from '../mockData';
import {
  Calendar,
  Clock,
  User,
  Info,
  Layers
} from 'lucide-react';

export const ScheduleGrid: React.FC = () => {
  const [categoryFilter, setCategoryFilter] = useState<string>('Todos');

  const daysOfWeek = [
    { id: 1, name: 'Segunda-feira' },
    { id: 2, name: 'Terça-feira' },
    { id: 3, name: 'Quarta-feira' },
    { id: 4, name: 'Quinta-feira' },
    { id: 5, name: 'Sexta-feira' },
    { id: 6, name: 'Sabado' }
  ];

  // Colors mapping for BJJ categories
  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'Infantil':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/25';
      case 'Adulto':
        return 'bg-blue-650/15 text-blue-400 border border-blue-500/25';
      case 'Open Match':
        return 'bg-gold-500/10 text-gold-400 border border-gold-500/25';
      case 'No-Gi':
        return 'bg-red-500/10 text-red-400 border border-red-500/25';
      default:
        return 'bg-slate-700/10 text-slate-400 border border-slate-750';
    }
  };

  // Get classes for a specific day, filtered by category
  const getClassesForDay = (dayId: number) => {
    return INITIAL_SCHEDULE.filter(c => {
      const matchesDay = c.diasSemana.includes(dayId);
      const matchesCategory = categoryFilter === 'Todos' || c.categoria === categoryFilter;
      return matchesDay && matchesCategory;
    }).sort((a, b) => a.hora.localeCompare(b.hora));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            Grade de Horários
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Grade completa de treinos e turmas da Sagrada Família BJJ de Segunda a Sábado.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 bg-obsidian-850 p-2 rounded-xl border border-obsidian-800/80 self-start sm:self-auto">
          <Layers className="w-4 h-4 text-slate-400 ml-1.5" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-transparent text-xs text-slate-300 font-semibold focus:outline-none pr-6 cursor-pointer"
          >
            <option value="Todos" className="bg-obsidian-950">Todas as Categorias</option>
            <option value="Infantil" className="bg-obsidian-950">Infantil</option>
            <option value="Adulto Iniciante" className="bg-obsidian-950">Adulto Iniciante</option>
            <option value="Avançado" className="bg-obsidian-950">Avançado</option>
            <option value="No-Gi" className="bg-obsidian-950">No-Gi</option>
          </select>
        </div>
      </div>

      {/* Info Warning Card */}
      <div className="bg-obsidian-850/60 border border-obsidian-750/80 p-4 rounded-xl flex gap-3 text-slate-400 text-xs leading-relaxed max-w-2xl">
        <Info className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-350 block mb-0.5">Observações da Grade:</span>
          Aulas de Kimono tradicional acontecem nas turmas Infantil, Adulto Iniciante e Avançado.
          As turmas de No-Gi exigem bermuda de Lycra/Boardshorts e Rashguard oficial.
        </div>
      </div>

      {/* Timeline/Timetable Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {daysOfWeek.map((day) => {
          const dayClasses = getClassesForDay(day.id);

          return (
            <div
              key={day.id}
              className="card-premium flex flex-col bg-obsidian-800/50 hover:bg-obsidian-800/80 transition-all border border-obsidian-800/90 shadow-xl"
            >
              {/* Day Header */}
              <div className="flex items-center gap-2 border-b border-obsidian-750 pb-3 mb-4">
                <Calendar className="w-4 h-4 text-gold-500" />
                <span className="font-extrabold text-sm uppercase tracking-wider text-slate-200">
                  {day.name}
                </span>
                <span className="text-[10px] text-slate-500 font-medium ml-auto">
                  {dayClasses.length} aula(s)
                </span>
              </div>

              {/* Classes List */}
              <div className="flex-1 space-y-3.5">
                {dayClasses.length === 0 ? (
                  <div className="text-center py-8 text-slate-600 text-xs italic">
                    Sem aulas agendadas
                  </div>
                ) : (
                  dayClasses.map((c) => (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-xl bg-obsidian-900 border border-obsidian-800 flex flex-col gap-2 hover:border-gold-500/10 transition-colors"
                    >
                      {/* Class Category Badge & Time */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${getCategoryStyles(c.categoria)}`}>
                          {c.categoria}
                        </span>

                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {c.hora}
                        </span>
                      </div>

                      {/* Instructor details */}
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-350">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>Prof: {c.professor}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
