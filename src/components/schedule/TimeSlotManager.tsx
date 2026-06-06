import React, { useState } from 'react';
import { Clock, Plus, Trash2, Edit2, X, Check, AlertCircle } from 'lucide-react';
import type { Aula, Turma, Professor } from '../../types';
import { supabase } from '../../lib/supabase';

interface TimeSlotManagerProps {
  schedule: Aula[];
  setSchedule: React.Dispatch<React.SetStateAction<Aula[]>>;
  turmas: Turma[];
  professores: Professor[];
}

const DAYS = [
  { id: 1, name: 'Segunda' },
  { id: 2, name: 'Terça' },
  { id: 3, name: 'Quarta' },
  { id: 4, name: 'Quinta' },
  { id: 5, name: 'Sexta' },
  { id: 6, name: 'Sábado' }
];

export const TimeSlotManager: React.FC<TimeSlotManagerProps> = ({ schedule, setSchedule, turmas, professores }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [horaIncio, setHoraInicio] = useState('18:00');
  const [horaFim, setHoraFim] = useState('19:00');
  const [diasSemana, setDiasSemana] = useState<number[]>([]);
  const [turmaId, setTurmaId] = useState<number | ''>('');
  const [professorId, setProfessorId] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);

  const openModal = (aula?: Aula) => {
    setError(null);
    if (aula) {
      setEditingId(aula.id);
      const [hIni, hFim] = aula.hora.split(' - ');
      setHoraInicio(hIni || '18:00');
      setHoraFim(hFim || '19:00');
      setDiasSemana(Array.isArray(aula.diasSemana) ? aula.diasSemana : []);
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
    
    // Converte horas para minutos para checar intersecção
    const [hIniHours, hIniMins] = horaIncio.split(':').map(Number);
    const [hFimHours, hFimMins] = horaFim.split(':').map(Number);
    const startMins = hIniHours * 60 + hIniMins;
    const endMins = hFimHours * 60 + hFimMins;

    for (const aula of schedule) {
      if (aula.id === editingId) continue; // Ignora ela mesma na edição

      // Checa se os dias se cruzam
      const aulaDias = Array.isArray(aula.diasSemana) ? aula.diasSemana : [];
      const hasCommonDay = diasSemana.some(d => aulaDias.includes(d));

      if (hasCommonDay) {
        const [aIni, aFim] = aula.hora.split(' - ');
        if (!aIni || !aFim) continue;
        
        const [aIniH, aIniM] = aIni.split(':').map(Number);
        const [aFimH, aFimM] = aFim.split(':').map(Number);
        const aStartMins = aIniH * 60 + aIniM;
        const aEndMins = aFimH * 60 + aFimM;

        // Se há sobreposição de horário
        const timeOverlap = startMins < aEndMins && endMins > aStartMins;

        if (timeOverlap) {
          if (aula.professorId === professorId) {
            return 'O professor selecionado já possui uma aula neste horário e dia(s).';
          }
          if (aula.turmaId === turmaId) {
            return 'A turma selecionada já possui uma aula neste horário e dia(s).';
          }
        }
      }
    }
    return null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (diasSemana.length === 0) {
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

    const novaAula: Aula = {
      id: editingId || Date.now(),
      hora: `${horaIncio} - ${horaFim}`,
      categoria: turma ? turma.categoria : 'Sem Categoria',
      professor: prof ? prof.nome : 'Sem Professor',
      professorId: Number(professorId),
      turmaId: Number(turmaId),
      diasSemana
    };

    if (editingId) {
      // Atualiza no Supabase
      const { error: updateError } = await supabase
        .from('aulas')
        .update({
          hora: `${horaIncio} - ${horaFim}`,
          categoria: turma ? turma.categoria : 'Sem Categoria',
          professor: prof ? prof.nome : 'Sem Professor',
          professorId: Number(professorId),
          turmaId: Number(turmaId),
          diasSemana
        })
        .eq('id', editingId);

      if (updateError) {
        console.error('Error updating class slot:', updateError);
        setError('Erro ao salvar no banco de dados.');
        return;
      }

      setSchedule(prev => prev.map(a => a.id === editingId ? novaAula : a));
    } else {
      // Cria no Supabase (deixa o BD gerenciar a geração de ID)
      const { data: newSlotData, error: insertError } = await supabase
        .from('aulas')
        .insert({
          hora: `${horaIncio} - ${horaFim}`,
          categoria: turma ? turma.categoria : 'Sem Categoria',
          professor: prof ? prof.nome : 'Sem Professor',
          professorId: Number(professorId),
          turmaId: Number(turmaId),
          diasSemana
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting class slot:', insertError);
        setError('Erro ao salvar no banco de dados.');
        return;
      }

      if (newSlotData) {
        const addedAula: Aula = {
          ...novaAula,
          id: newSlotData.id
        };
        setSchedule(prev => [...prev, addedAula]);
      }
    }
    setShowModal(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja remover este horário?')) {
      const { error: deleteError } = await supabase
        .from('aulas')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting class slot:', deleteError);
        alert('Erro ao remover horário do banco de dados.');
        return;
      }

      setSchedule(prev => prev.filter(a => a.id !== id));
    }
  };

  const toggleDay = (d: number) => {
    setDiasSemana(prev => 
      prev.includes(d) ? prev.filter(day => day !== d) : [...prev, d]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Gerenciar Horários
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Vincule Turmas, Professores e Dias da Semana.
          </p>
        </div>
        <button onClick={() => openModal()} className="btn-gold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Horário
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {schedule.map(aula => {
          const prof = professores.find(p => p.id === aula.professorId) || { nome: aula.professor };
          const turma = turmas.find(t => t.id === aula.turmaId) || { nome: 'Turma Legada', categoria: aula.categoria };
          const diasNames = DAYS.filter(d => Array.isArray(aula.diasSemana) && aula.diasSemana.includes(d.id)).map(d => d.name).join(', ');

          return (
            <div key={aula.id} className="card-premium p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-gold-500 font-bold bg-gold-500/10 px-2 py-1 rounded text-xs">
                    {aula.hora}
                  </span>
                  <span className="text-sm font-extrabold text-slate-200">{turma.nome}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-obsidian-800 text-slate-400">
                    {turma.categoria}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-2 flex gap-4">
                  <span>👨‍🏫 Prof: {prof.nome}</span>
                  <span>📅 Dias: {diasNames || 'Nenhum'}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openModal(aula)} className="p-2 bg-obsidian-850 hover:bg-obsidian-800 text-slate-300 rounded transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(aula.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
        {schedule.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            Nenhum horário configurado ainda.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-obsidian-850 border border-obsidian-700 rounded-2xl w-full max-w-lg shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-obsidian-750 bg-obsidian-850 rounded-t-2xl">
              <h2 className="text-md font-bold text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold-500" />
                {editingId ? 'Editar Horário' : 'Novo Horário'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-gold-500 p-1 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              
              {error && (
                <div className="flex items-start gap-2.5 p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-xs animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Hora Início</label>
                  <input
                    type="time"
                    value={horaIncio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="input-premium w-full bg-obsidian-950 font-mono"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Hora Fim</label>
                  <input
                    type="time"
                    value={horaFim}
                    onChange={(e) => setHoraFim(e.target.value)}
                    className="input-premium w-full bg-obsidian-950 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Dias da Semana</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggleDay(day.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        diasSemana.includes(day.id)
                          ? 'bg-gold-500 text-obsidian-950'
                          : 'bg-obsidian-800 text-slate-400 hover:bg-obsidian-750'
                      }`}
                    >
                      {day.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Turma</label>
                <select
                  value={turmaId}
                  onChange={(e) => setTurmaId(Number(e.target.value))}
                  className="input-premium w-full bg-obsidian-950"
                  required
                >
                  <option value="" disabled>Selecione uma turma...</option>
                  {turmas.map(t => (
                    <option key={t.id} value={t.id}>{t.nome} ({t.categoria})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Professor</label>
                <select
                  value={professorId}
                  onChange={(e) => setProfessorId(Number(e.target.value))}
                  className="input-premium w-full bg-obsidian-950"
                  required
                >
                  <option value="" disabled>Selecione um professor...</option>
                  {professores.map(p => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>

              <div className="mt-6 pt-4 border-t border-obsidian-750 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-obsidian px-4 py-2 text-xs">Cancelar</button>
                <button type="submit" className="btn-gold px-4 py-2 text-xs flex items-center gap-2">
                  <Check className="w-3.5 h-3.5" />
                  Salvar Horário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
