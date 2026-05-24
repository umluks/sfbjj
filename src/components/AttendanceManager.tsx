import React, { useState, useEffect } from 'react';
import type { Student, Attendance, Belt } from '../types';
import { 
  Calendar, 
  Clock, 
  User, 
  Save, 
  Award, 
  Check, 
  ListChecks,
  Sparkles,
  X
} from 'lucide-react';
import { INITIAL_SCHEDULE } from '../mockData';

interface AttendanceManagerProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  attendances: Attendance[];
  setAttendances: React.Dispatch<React.SetStateAction<Attendance[]>>;
}

export const AttendanceManager: React.FC<AttendanceManagerProps> = ({ 
  students, 
  setStudents, 
  attendances, 
  setAttendances 
}) => {
  // Input fields
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClassId, setSelectedClassId] = useState(INITIAL_SCHEDULE[2].id); // default to 18:30 Adulto
  
  // Present students list state for the active class editor
  const [presentStudentIds, setPresentStudentIds] = useState<string[]>([]);
  
  // Keep track of original presents to compute diff in workouts count
  const [originalPresentIds, setOriginalPresentIds] = useState<string[]>([]);
  
  // Banner notifications
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load existing attendance sheet if it exists, otherwise start clean
  useEffect(() => {
    const existing = attendances.find(
      a => a.data === selectedDate && a.aulaId === selectedClassId
    );
    if (existing) {
      setPresentStudentIds(existing.alunosPresentes);
      setOriginalPresentIds(existing.alunosPresentes);
    } else {
      setPresentStudentIds([]);
      setOriginalPresentIds([]);
    }
  }, [selectedDate, selectedClassId, attendances]);

  // Find class details
  const currentClass = INITIAL_SCHEDULE.find(s => s.id === selectedClassId) || INITIAL_SCHEDULE[0];

  // Filter active students and sort alphabetically
  const activeStudents = students
    .filter(s => s.status === 'Ativo')
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  const toggleStudentPresence = (studentId: string) => {
    setPresentStudentIds(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId) 
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    setPresentStudentIds(activeStudents.map(s => s.id));
  };

  const handleClearAll = () => {
    setPresentStudentIds([]);
  };

  // Promotion recommendation logic
  const getPromotionRecommendation = (faixa: Belt, totalTreinos: number) => {
    // Basic heuristics:
    // White Belt (Branca) -> Stripe promo recommended every 25 workouts. If 100+ workouts, recommend Blue Belt (Azul) promotion!
    // Blue Belt (Azul) -> stripe every 50 workouts. 200+ workouts -> Purple Belt (Roxa)
    // Purple Belt (Roxa) -> stripe every 75 workouts. 300+ workouts -> Brown Belt (Marrom)
    // Brown Belt (Marrom) -> stripe every 100 workouts. 400+ workouts -> Black Belt (Preta)
    if (faixa === 'Branca') {
      if (totalTreinos >= 100) return 'Exame de Faixa Azul 🔵';
      if (totalTreinos >= 25) return 'Próximo Grau 🎖️';
    } else if (faixa === 'Azul') {
      if (totalTreinos >= 200) return 'Exame de Faixa Roxa 🟣';
      if (totalTreinos >= 50) return 'Próximo Grau 🎖️';
    } else if (faixa === 'Roxa') {
      if (totalTreinos >= 300) return 'Exame de Faixa Marrom 🟤';
      if (totalTreinos >= 75) return 'Próximo Grau 🎖️';
    } else if (faixa === 'Marrom') {
      if (totalTreinos >= 400) return 'Exame de Faixa Preta ⚫';
      if (totalTreinos >= 100) return 'Próximo Grau 🎖️';
    }
    return null;
  };

  // Save the attendance list and update workout counters
  const handleSaveAttendance = () => {
    const existingIndex = attendances.findIndex(
      a => a.data === selectedDate && a.aulaId === selectedClassId
    );

    let newAttendanceList = [...attendances];
    const attendanceId = existingIndex >= 0 ? attendances[existingIndex].id : `att_${Date.now()}`;

    const newAttendanceObj: Attendance = {
      id: attendanceId,
      data: selectedDate,
      aulaId: selectedClassId,
      alunosPresentes: presentStudentIds
    };

    if (existingIndex >= 0) {
      newAttendanceList[existingIndex] = newAttendanceObj;
    } else {
      newAttendanceList.push(newAttendanceObj);
    }

    setAttendances(newAttendanceList);

    // Compute diff to update student workout counters:
    // 1. Added students: present now, but not originally -> counter +1
    const addedIds = presentStudentIds.filter(id => !originalPresentIds.includes(id));
    // 2. Removed students: was originally present, but not now -> counter -1
    const removedIds = originalPresentIds.filter(id => !presentStudentIds.includes(id));

    if (addedIds.length > 0 || removedIds.length > 0) {
      setStudents(prev => prev.map(student => {
        let diff = 0;
        if (addedIds.includes(student.id)) diff = 1;
        if (removedIds.includes(student.id)) diff = -1;

        if (diff !== 0) {
          return {
            ...student,
            totalTreinos: Math.max(0, student.totalTreinos + diff)
          };
        }
        return student;
      }));
    }

    // Set updated original presents
    setOriginalPresentIds(presentStudentIds);

    // Success Banner
    setSuccessMessage(`Chamada de presença salva! ${presentStudentIds.length} alunos marcados.`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Historical class list helpers
  const getRecentSheets = () => {
    return [...attendances]
      .sort((a, b) => b.data.localeCompare(a.data)) // Newest dates first
      .slice(0, 5); // show latest 5
  };

  const loadPastSheet = (sheet: Attendance) => {
    setSelectedDate(sheet.data);
    setSelectedClassId(sheet.aulaId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          Controle de Frequência (Presença)
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Selecione a aula do dia e registre a presença dos alunos para atualizar a contagem de treinos.
        </p>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-lg flex items-center justify-between shadow-md shadow-emerald-950/20 animate-fade-in">
          <span className="text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" />
            {successMessage}
          </span>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400/70 hover:text-emerald-350 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Check-in list sheet (Left side/Middle) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Controls bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-obsidian-850 p-4 rounded-xl border border-obsidian-800/80">
            {/* Date Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Data do Treino</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                  <Calendar className="w-4 h-4" />
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input-premium w-full pl-9 text-xs"
                />
              </div>
            </div>

            {/* Class/Schedule Select */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Horário / Aula</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                  <Clock className="w-4 h-4" />
                </span>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="input-premium w-full pl-9 bg-obsidian-950 text-xs"
                >
                  {INITIAL_SCHEDULE.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.hora} - {s.categoria} ({s.professor})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Active sheet card */}
          <div className="bg-obsidian-800/50 border border-obsidian-800/90 rounded-xl overflow-hidden shadow-xl backdrop-blur-md">
            
            {/* Sheet Sub-Header */}
            <div className="px-6 py-4 bg-obsidian-850/40 border-b border-obsidian-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-gold-500 uppercase tracking-widest block">Tatame Aberto</span>
                <h2 className="text-sm font-semibold text-slate-200 mt-0.5">
                  Lista de Chamada: {currentClass.categoria} ({currentClass.professor})
                </h2>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={handleSelectAll}
                  className="bg-obsidian-700/60 border border-obsidian-650 hover:bg-obsidian-700 text-slate-300 text-[10px] px-2.5 py-1.5 rounded transition-all active:scale-[0.98]"
                >
                  Marcar Todos
                </button>
                <button 
                  onClick={handleClearAll}
                  className="bg-obsidian-700/60 border border-obsidian-650 hover:bg-obsidian-700 text-slate-300 text-[10px] px-2.5 py-1.5 rounded transition-all active:scale-[0.98]"
                >
                  Limpar Todos
                </button>
              </div>
            </div>

            {/* Checkboxes List */}
            <div className="divide-y divide-obsidian-750 max-h-[50vh] overflow-y-auto">
              {activeStudents.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">
                  Nenhum aluno ativo matriculado no momento.
                </div>
              ) : (
                activeStudents.map((student) => {
                  const isPresent = presentStudentIds.includes(student.id);
                  const promo = getPromotionRecommendation(student.faixa, student.totalTreinos);

                  return (
                    <div 
                      key={student.id}
                      onClick={() => toggleStudentPresence(student.id)}
                      className={`flex items-center justify-between px-6 py-3.5 cursor-pointer transition-all duration-300 select-none ${
                        isPresent 
                          ? 'bg-gold-500/5 hover:bg-gold-500/10 border-l-4 border-gold-500' 
                          : 'hover:bg-obsidian-700/25 border-l-4 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                          isPresent 
                            ? 'bg-gold-500 border-gold-500 text-obsidian-950' 
                            : 'bg-obsidian-950 border-obsidian-700 hover:border-slate-500'
                        }`}>
                          {isPresent && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <div>
                          <span className="font-semibold text-sm text-slate-200 block">
                            {student.nome}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Faixa {student.faixa} • {student.totalTreinos} treinos
                          </span>
                        </div>
                      </div>

                      {/* Right column promo badge / checks info */}
                      <div className="flex items-center gap-2">
                        {promo && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-gold-400 bg-gold-500/10 border border-gold-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                            <Sparkles className="w-2.5 h-2.5" />
                            {promo}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Sheet Footer Saver */}
            <div className="px-6 py-4 border-t border-obsidian-750 bg-obsidian-850/40 flex justify-between items-center">
              <span className="text-xs text-slate-400 font-medium">
                Presents: <span className="text-gold-500 font-bold">{presentStudentIds.length}</span> / {activeStudents.length} alunos ativos
              </span>
              <button 
                onClick={handleSaveAttendance}
                className="btn-gold text-xs px-5 py-2"
              >
                <Save className="w-3.5 h-3.5" />
                Salvar Presenças
              </button>
            </div>

          </div>
        </div>

        {/* History / Recent Classes sheet list (Right side) */}
        <div className="space-y-4">
          <div className="card-premium bg-gradient-to-b from-obsidian-800 to-obsidian-850">
            <h2 className="text-md font-bold text-slate-100 flex items-center gap-2 border-b border-obsidian-750 pb-3 mb-4">
              <ListChecks className="w-4 h-4 text-gold-500" />
              Treinos Recentes
            </h2>

            <div className="space-y-3">
              {getRecentSheets().length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">
                  Nenhum treino registrado ainda.
                </p>
              ) : (
                getRecentSheets().map((sheet) => {
                  const cInfo = INITIAL_SCHEDULE.find(s => s.id === sheet.aulaId) || INITIAL_SCHEDULE[0];
                  const formattedDate = sheet.data.split('-').reverse().join('/');
                  const isCurrent = selectedDate === sheet.data && selectedClassId === sheet.aulaId;

                  return (
                    <div 
                      key={sheet.id}
                      onClick={() => loadPastSheet(sheet)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-gold-500/10 border-gold-500/60 shadow-md shadow-gold-950/5'
                          : 'bg-obsidian-900 border-obsidian-750 hover:border-gold-500/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">
                          {cInfo.categoria}
                        </span>
                        <span className="text-[10px] text-gold-500 font-semibold font-mono">
                          {formattedDate}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-obsidian-800/80">
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <User className="w-3 h-3" /> Prof. {cInfo.professor}
                        </span>
                        <span className="text-[10px] font-bold text-slate-350 bg-obsidian-950 px-2 py-0.5 rounded border border-obsidian-850">
                          {sheet.alunosPresentes.length} Alunos
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick promotion tracker explanation */}
          <div className="card-premium bg-obsidian-800/40 border border-obsidian-750 text-xs text-slate-400 space-y-3 leading-relaxed">
            <h3 className="font-bold text-slate-100 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-gold-500" /> Sistema de Promoção
            </h3>
            <p>
              O sistema monitora a frequência total dos treinos para sugerir graduações:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>Faixa Branca: 25 treinos / grau.</li>
              <li>Faixa Azul: 50 treinos / grau.</li>
              <li>Faixa Roxa: 75 treinos / grau.</li>
              <li>Faixa Marrom: 100 treinos / grau.</li>
            </ul>
            <p className="text-[10px] text-slate-500 pt-1 border-t border-obsidian-750/50">
              *As promoções reais dependem da avaliação técnica e ética do professor.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
