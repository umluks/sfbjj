import React, { useState, useMemo } from 'react';
import { Calendar, Clock, User, SlidersHorizontal } from 'lucide-react';

interface ClassItem {
  hora: string;
  categoria: string;
  dias: string;
  professor: string;
}

interface TrainingScheduleProps {
  schedule: ClassItem[];
}

const getTurno = (horaStr: string): 'Manhã' | 'Tarde' | 'Noite' => {
  const horaNum = parseInt(horaStr.split(':')[0], 10);
  if (isNaN(horaNum)) return 'Manhã';
  if (horaNum < 12) return 'Manhã';
  if (horaNum < 18) return 'Tarde';
  return 'Noite';
};

export const TrainingSchedule: React.FC<TrainingScheduleProps> = ({ schedule }) => {
  const [selectedTurno, setSelectedTurno] = useState<string>('Todos');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('Todos');

  // Extrair categorias exclusivas presentes na grade
  const categoriasDisponiveis = useMemo(() => {
    const cats = new Set<string>();
    schedule.forEach(item => {
      if (item.categoria) {
        cats.add(item.categoria);
      }
    });
    return ['Todos', ...Array.from(cats)];
  }, [schedule]);

  // Filtragem dos horários
  const filteredSchedule = useMemo(() => {
    return schedule.filter(item => {
      const matchTurno = selectedTurno === 'Todos' || getTurno(item.hora) === selectedTurno;
      const matchCategoria = selectedCategoria === 'Todos' || item.categoria === selectedCategoria;
      return matchTurno && matchCategoria;
    });
  }, [schedule, selectedTurno, selectedCategoria]);

  return (
    <section id="horarios" className="py-24 px-4 bg-obsidian-950/40 border-t border-b border-obsidian-900/60 scroll-mt-20 relative">
      {/* Glow de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-slate-800/5 blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* Cabeçalho de Seção */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-block text-[9px] font-black uppercase tracking-widest text-slate-500 border border-obsidian-800 px-3 py-1 bg-obsidian-950/40">
            Cronograma Semanal
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-100 uppercase tracking-wider">
            Grade de Treinos
          </h2>
          <p className="text-xs text-slate-400">
            Filtre por turno ou modalidade para planejar a sua rotina de treinos de forma rápida e prática.
          </p>
        </div>

        {/* Filtros de Horários */}
        <div className="bg-obsidian-900/40 border border-obsidian-850 p-6 flex flex-col md:flex-row gap-6 items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-wider text-slate-300">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            Filtros Disponíveis:
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            {/* Filtro de Categoria */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Modalidade:</span>
              <select
                value={selectedCategoria}
                onChange={(e) => setSelectedCategoria(e.target.value)}
                className="bg-obsidian-950 border border-obsidian-800 text-xs px-3 py-2 text-slate-200 outline-none focus:border-slate-500 transition-colors w-full sm:w-auto rounded-none"
              >
                {categoriasDisponiveis.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Filtro de Turno */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Turno:</span>
              <div className="flex border border-obsidian-800 p-0.5 bg-obsidian-950 w-full sm:w-auto">
                {['Todos', 'Manhã', 'Tarde', 'Noite'].map((turno) => (
                  <button
                    key={turno}
                    onClick={() => setSelectedTurno(turno)}
                    className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 transition-all ${
                      selectedTurno === turno
                        ? 'bg-zinc-100 text-obsidian-950'
                        : 'text-slate-450 hover:text-slate-200'
                    }`}
                  >
                    {turno}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Grade de Cards de Horários */}
        {filteredSchedule.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-obsidian-800/80">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-black">Nenhum treino encontrado para estes filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchedule.map((aula, idx) => (
              <div
                key={idx}
                className="group card-premium p-6 border border-obsidian-850 hover:border-zinc-500/20 hover:shadow-gold-glow flex flex-col justify-between gap-5 transition-all duration-300"
              >
                {/* Linha superior */}
                <div className="flex items-center justify-between border-b border-obsidian-800 pb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 bg-obsidian-900 border border-obsidian-800 px-3 py-1">
                    {aula.categoria}
                  </span>
                  
                  {/* Badge de Horário */}
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-xs font-mono font-bold text-slate-200">{aula.hora}</span>
                  </div>
                </div>

                {/* Detalhes do Treino */}
                <div className="space-y-3 text-xs text-slate-400 font-medium">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-slate-500 group-hover:text-slate-350 transition-colors" />
                    <span className="tracking-wide">{aula.dias}</span>
                  </div>
                  
                  {aula.professor && (
                    <div className="flex items-center gap-2.5 pt-1">
                      <User className="w-4 h-4 text-slate-500 group-hover:text-slate-350 transition-colors" />
                      <span className="tracking-wide">Prof. {aula.professor}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
export default TrainingSchedule;
