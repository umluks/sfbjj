import React, { useState } from 'react';
import { Clock, Plus, Trash2, Edit2, X, Check, AlertCircle, Calendar, Filter } from 'lucide-react';
import type { Aula, Turma } from '@/domain/models/class';
import type { Professor } from '@/domain/models/teacher';

interface TimeSlotManagerProps {
  schedule: Aula[];
  setSchedule: React.Dispatch<React.SetStateAction<Aula[]>>;
  turmas: Turma[];
  professores: Professor[];
  onCreate: (classData: Omit<Aula, 'id'>) => Promise<Aula>;
  onUpdate: (id: number, classData: Partial<Aula>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const DAYS = [
  { id: 1, name: 'Segunda', short: 'Seg' },
  { id: 2, name: 'Terça', short: 'Ter' },
  { id: 3, name: 'Quarta', short: 'Qua' },
  { id: 4, name: 'Quinta', short: 'Qui' },
  { id: 5, name: 'Sexta', short: 'Sex' },
  { id: 6, name: 'Sábado', short: 'Sáb' }
];

export const TimeSlotManager: React.FC<TimeSlotManagerProps> = ({ 
  schedule, 
  turmas, 
  professores, 
  onCreate, 
  onUpdate, 
  onDelete 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [horaIncio, setHoraInicio] = useState('18:00');
  const [horaFim, setHoraFim] = useState('19:00');
  const [diasSemana, setDiasSemana] = useState<number[]>([]);
  const [turmaId, setTurmaId] = useState<number | ''>('');
  const [professorId, setProfessorId] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Filtro de dia selecionado na listagem
  const [selectedDayFilter, setSelectedDayFilter] = useState<number | 'all'>('all');

  const openModal = (aula?: Aula) => {
    setError(null);
    if (aula) {
      setEditingId(aula.id);
      const [hIni, hFim] = aula.hora.split(' - ');
      setHoraInicio(hIni || '18:00');
      setHoraFim(hFim || '19:00');
      setDiasSemana(Array.isArray(aula.diasSemana) ? aula.diasSemana.map(Number) : []);
      setTurmaId(aula.turmaId || '');
      setProfessorId(aula.professorId || '');
    } else {
      setEditingId(null);
      setHoraInicio('18:00');
      setHoraFim('19:00');
      setDiasSemana([]);
      setTurmaId('');
      setProfessorId('');
    }
    setShowModal(true);
  };

  const checkConflict = () => {
    if (!turmaId || !professorId) return false;
    
    const [hIniHours, hIniMins] = horaIncio.split(':').map(Number);
    const [hFimHours, hFimMins] = horaFim.split(':').map(Number);
    const startMins = hIniHours * 60 + hIniMins;
    const endMins = hFimHours * 60 + hFimMins;

    for (const aula of schedule) {
      if (aula.id === editingId) continue;

      const aulaDias = Array.isArray(aula.diasSemana) ? aula.diasSemana : [];
      const hasCommonDay = diasSemana.some(d => aulaDias.includes(d));

      if (hasCommonDay) {
        const [aIni, aFim] = aula.hora.split(' - ');
        if (!aIni || !aFim) continue;
        
        const [aIniH, aIniM] = aIni.split(':').map(Number);
        const [aFimH, aFimM] = aFim.split(':').map(Number);
        const aStartMins = aIniH * 60 + aIniM;
        const aEndMins = aFimH * 60 + aFimM;

        const timeOverlap = startMins < aEndMins && endMins > aStartMins;

        if (timeOverlap) {
          if (aula.professorId === professorId) {
            return `O professor já possui aula neste horário (${aula.hora}) no dia selecionado.`;
          }
          if (aula.turmaId === turmaId) {
            return `A turma já possui aula neste horário (${aula.hora}) no dia selecionado.`;
          }
        }
      }
    }
    return null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedDias = diasSemana.map(Number);
    if (normalizedDias.length === 0) {
      setError('Selecione pelo menos um dia da semana.');
      return;
    }
    if (!turmaId) {
      setError('Selecione uma turma.');
      return;
    }
    if (!professorId) {
      setError('Selecione um professor.');
      return;
    }
    if (horaIncio >= horaFim) {
      setError('A hora de início deve ser menor que a hora de término.');
      return;
    }

    const conflictError = checkConflict();
    if (conflictError) {
      setError(conflictError);
      return;
    }

    const turma = turmas.find(t => t.id === turmaId);
    const prof = professores.find(p => p.id === professorId);

    setSubmitting(true);
    try {
      const payload = {
        hora: `${horaIncio} - ${horaFim}`,
        categoria: turma ? turma.categoria : 'Sem Categoria',
        professor: prof ? prof.nome : 'Sem Professor',
        professorId: Number(professorId),
        turmaId: Number(turmaId),
        diasSemana: normalizedDias
      };

      if (editingId) {
        await onUpdate(editingId, payload);
      } else {
        await onCreate(payload);
      }
      setShowModal(false);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar horário.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja remover este horário?')) {
      try {
        await onDelete(id);
      } catch (err) {
        console.error('Erro ao deletar horário:', err);
      }
    }
  };

  const toggleDay = (d: number) => {
    setDiasSemana(prev => {
      const current = Array.isArray(prev) ? prev.map(Number) : [];
      return current.includes(d) ? current.filter(day => day !== d) : [...current, d];
    });
  };

  // Filtrar os horários
  const filteredSchedule = schedule.filter(aula => {
    if (selectedDayFilter === 'all') return true;
    return Array.isArray(aula.diasSemana) && aula.diasSemana.includes(Number(selectedDayFilter));
  });

  // Ordenar horários por hora de início
  const sortedSchedule = [...filteredSchedule].sort((a, b) => {
    const aStart = a.hora.split(' - ')[0] || '00:00';
    const bStart = b.hora.split(' - ')[0] || '00:00';
    return aStart.localeCompare(bStart);
  });

  return (
    <div className="space-y-6">
      {/* Header e Ação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-obsidian-850 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <span className="p-2 bg-gold-500/10 rounded-xl text-gold-500">
              <Clock className="w-5 h-5" />
            </span>
            Gerenciar Horários
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Vincule Turmas, Professores e Dias da Semana para a grade de treinos.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-gold flex items-center gap-2.5 py-2.5 px-4 shadow-lg shadow-gold-500/10 active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          Novo Horário
        </button>
      </div>

      {/* Barra de Filtro de Dias */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1.5 scrollbar-thin">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5 shrink-0 pl-1">
          <Filter className="w-3.5 h-3.5" /> Filtrar Dia:
        </span>
        <button
          onClick={() => setSelectedDayFilter('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all border shrink-0 ${
            selectedDayFilter === 'all'
              ? 'bg-slate-100 text-obsidian-950 border-slate-150 font-extrabold'
              : 'bg-obsidian-900/50 text-slate-400 border-obsidian-800 hover:text-slate-200'
          }`}
        >
          Todos
        </button>
        {DAYS.map(day => (
          <button
            key={day.id}
            onClick={() => setSelectedDayFilter(day.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all border shrink-0 ${
              selectedDayFilter === day.id
                ? 'bg-gold-500 text-obsidian-950 border-gold-400 font-extrabold shadow-md shadow-gold-500/10'
                : 'bg-obsidian-900/50 text-slate-400 border-obsidian-800 hover:text-slate-200'
            }`}
          >
            {day.name}
          </button>
        ))}
      </div>

      {/* Grid de Listagem de Horários */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedSchedule.map(aula => {
          const prof = professores.find(p => p.id === aula.professorId) || { nome: aula.professor };
          const turma = turmas.find(t => t.id === aula.turmaId) || { nome: 'Turma Legada', categoria: aula.categoria };
          const aulaDias = Array.isArray(aula.diasSemana) ? aula.diasSemana : [];

          return (
            <div 
              key={aula.id} 
              className="card-premium p-5 flex flex-col justify-between gap-4 border border-obsidian-850 hover:border-obsidian-750 transition-all duration-300 relative group overflow-hidden"
            >
              {/* Indicador sutil de Categoria por cor lateral */}
              <div className={`absolute top-0 left-0 bottom-0 w-1 ${
                turma.categoria === 'Kids' ? 'bg-sky-500' : turma.categoria === 'Open Match' ? 'bg-emerald-500' : 'bg-gold-500'
              }`} />

              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-gold-500 font-black bg-gold-500/10 px-2.5 py-1 rounded-lg text-xs border border-gold-500/10">
                      {aula.hora}
                    </span>
                    <span className="text-sm font-black text-slate-200">{turma.nome}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                    turma.categoria === 'Kids' 
                      ? 'bg-sky-500/10 text-sky-400 border-sky-500/10' 
                      : turma.categoria === 'Open Match' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' 
                        : 'bg-gold-500/10 text-gold-500 border-gold-500/10'
                  }`}>
                    {turma.categoria}
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1.5 pt-1">
                  <p className="flex items-center gap-1.5">
                    <span className="text-slate-500">👨‍🏫 Professor:</span> 
                    <span className="font-semibold text-slate-300">{prof.nome}</span>
                  </p>
                  
                  {/* Grid de dias da semana visual */}
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {DAYS.map(d => {
                      const isActive = aulaDias.includes(d.id);
                      return (
                        <span 
                          key={d.id} 
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-all ${
                            isActive 
                              ? 'bg-slate-200 text-obsidian-950 font-black' 
                              : 'bg-obsidian-900 text-slate-600 border border-obsidian-850'
                          }`}
                        >
                          {d.short}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-obsidian-900 pt-3">
                <button 
                  onClick={() => openModal(aula)} 
                  className="p-2 bg-obsidian-850 hover:bg-obsidian-800 text-slate-300 hover:text-gold-500 rounded-lg transition-colors border border-obsidian-800"
                  title="Editar Horário"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => handleDelete(aula.id)} 
                  className="p-2 bg-red-500/5 hover:bg-red-500/15 text-red-400 hover:text-red-300 rounded-lg transition-colors border border-red-500/10"
                  title="Excluir Horário"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {sortedSchedule.length === 0 && (
          <div className="col-span-full card-premium py-16 text-center text-slate-500 border border-dashed border-obsidian-800">
            <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-xs font-semibold">Nenhum horário cadastrado para este filtro.</p>
          </div>
        )}
      </div>

      {/* Modal do Writer (Criar / Editar Horário) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-obsidian-850 border border-obsidian-750 rounded-2xl w-full max-w-lg shadow-2xl animate-scale-up overflow-hidden">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-obsidian-750 bg-obsidian-900">
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold-500 animate-pulse" />
                {editingId ? 'Editar Slot de Horário' : 'Novo Slot de Horário'}
              </h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-slate-400 hover:text-gold-500 p-1.5 transition-colors rounded-lg hover:bg-obsidian-800" 
                disabled={submitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Modal */}
            <form onSubmit={handleSave} className="p-6 space-y-5">
              
              {error && (
                <div className="flex items-start gap-2.5 p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-xs animate-shake font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Hora Início e Hora Fim */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Hora Início *</label>
                  <input
                    type="time"
                    value={horaIncio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="input-premium w-full bg-obsidian-950 font-mono text-center text-slate-200"
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Hora Fim *</label>
                  <input
                    type="time"
                    value={horaFim}
                    onChange={(e) => setHoraFim(e.target.value)}
                    className="input-premium w-full bg-obsidian-950 font-mono text-center text-slate-200"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Seletor Moderno de Dias da Semana */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Dias da Semana *</label>
                <div className="grid grid-cols-3 gap-2">
                  {DAYS.map(day => {
                    const isSelected = Array.isArray(diasSemana) && diasSemana.map(Number).includes(day.id);
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleDay(day.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border flex items-center justify-between ${
                          isSelected
                            ? 'bg-gold-500 text-obsidian-950 border-gold-400 font-extrabold shadow-md shadow-gold-500/10'
                            : 'bg-obsidian-950 text-slate-400 border-obsidian-800 hover:bg-obsidian-900 hover:text-slate-200'
                        }`}
                        disabled={submitting}
                      >
                        <span>{day.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dropdown Seleção de Turma */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Turma Relacionada *</label>
                <select
                  value={turmaId}
                  onChange={(e) => setTurmaId(Number(e.target.value))}
                  className="input-premium w-full bg-obsidian-950 text-slate-250 cursor-pointer"
                  required
                  disabled={submitting}
                >
                  <option value="" disabled>Selecione uma turma...</option>
                  {turmas.map(t => (
                    <option key={t.id} value={t.id}>{t.nome} ({t.categoria})</option>
                  ))}
                </select>
              </div>

              {/* Dropdown Seleção de Professor */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Professor *</label>
                <select
                  value={professorId}
                  onChange={(e) => setProfessorId(Number(e.target.value))}
                  className="input-premium w-full bg-obsidian-950 text-slate-250 cursor-pointer"
                  required
                  disabled={submitting}
                >
                  <option value="" disabled>Selecione um professor...</option>
                  {professores.map(p => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>

              {/* Ações do Modal */}
              <div className="mt-6 pt-4 border-t border-obsidian-750 flex justify-end gap-2 bg-obsidian-850">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="btn-obsidian px-5 py-2.5 text-xs font-black uppercase tracking-wider" 
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-gold px-5 py-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-gold-500/10 active:scale-[0.98] transition-all" 
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-obsidian-950 border-t-transparent rounded-full animate-spin"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Salvar Horário
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlotManager;
