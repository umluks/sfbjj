import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle, RefreshCw, BarChart2, CalendarDays, Trash2 } from 'lucide-react';
import { useClasses } from '@/application/hooks/useClasses';
import { attendanceService } from '@/application/services/attendanceService';
import { studentService } from '@/application/services/studentService';
import type { Aula } from '@/domain/models/class';
import type { Aluno } from '@/domain/models/student';
import type { Frequencia } from '@/domain/models/attendance';
import { formatDate } from '@/utils/formatters';

interface MyAttendancePageProps {
  alunoId?: number;
}

export const MyAttendancePage: React.FC<MyAttendancePageProps> = ({ alunoId }) => {
  const [student, setStudent] = useState<Aluno | null>(null);
  const [attendances, setAttendances] = useState<Frequencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());

  const { classes, turmas } = useClasses();

  // Opções de datas para check-in (Próximos 7 dias incluindo hoje)
  const dateOptions = useMemo(() => {
    const list = [];
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      
      const dayName = i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : weekdays[d.getDay()];
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      list.push({
        dateStr,
        label: dayName,
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        dayOfWeek: d.getDay() === 0 ? 7 : d.getDay()
      });
    }
    return list;
  }, []);

  const [selectedDate, setSelectedDate] = useState(dateOptions[0].dateStr);

  // Atualiza relógio local a cada 15 segundos para atualizar os status das janelas
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  const loadData = useCallback(async () => {
    if (!alunoId) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      // 1. Carregar perfil do aluno para obter categoria/turma
      const studentData = await studentService.getStudentById(alunoId);
      setStudent(studentData);

      // 2. Carregar histórico de presença
      const attendanceData = await attendanceService.getAttendanceByStudent(alunoId);
      setAttendances(attendanceData);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao carregar dados de presença.');
    } finally {
      setLoading(false);
    }
  }, [alunoId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Verifica se uma aula está no dia e na janela de horário permitida (entre 24h antes e 2h após a aula)
  const getAulaStatus = (aula: Aula, dateStr: string) => {
    const [startStr, endStr] = aula.hora.split(' - ');
    if (!startStr || !endStr) {
      return { isOpen: false, badgeClass: 'bg-red-955/20 text-red-400 border-red-900/30', label: 'Horário inválido' };
    }

    const classStart = new Date(`${dateStr}T${startStr.trim()}:00`);
    const classEnd = new Date(`${dateStr}T${endStr.trim()}:00`);

    if (isNaN(classStart.getTime()) || isNaN(classEnd.getTime())) {
      return { isOpen: false, badgeClass: 'bg-red-955/20 text-red-400 border-red-900/30', label: 'Horário inválido' };
    }

    // Janela de abertura: 24 horas antes do início da aula
    const windowOpenTime = classStart.getTime() - (24 * 60 * 60 * 1000);
    // Janela de encerramento: 2 horas após o término da aula
    const windowCloseTime = classEnd.getTime() + (2 * 60 * 60 * 1000);
    const currentTime = now.getTime();

    if (currentTime < windowOpenTime) {
      return { 
        isOpen: false, 
        badgeClass: 'bg-zinc-850 text-zinc-500 border-zinc-800', 
        label: 'Abre 24h antes' 
      };
    }

    if (currentTime > windowCloseTime) {
      return { 
        isOpen: false, 
        badgeClass: 'bg-zinc-900/80 text-zinc-650 border-zinc-850', 
        label: 'Encerrada' 
      };
    }

    return { 
      isOpen: true, 
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 animate-pulse', 
      label: 'Disponível para Check-in' 
    };
  };

  // Trata a execução do Check-in
  const handleCheckIn = async (aula: Aula) => {
    if (!alunoId) return;
    setCheckingIn(aula.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const status = getAulaStatus(aula, selectedDate);
      if (!status.isOpen) {
        throw new Error('O check-in só pode ser feito entre 24h antes do treino e até 2h após seu encerramento.');
      }

      // Validação de redundância local antes de enviar baseada na data selecionada
      const alreadyCheckedIn = attendances.some(
        att => att.aulaId === aula.id && att.data === selectedDate
      );

      if (alreadyCheckedIn) {
        throw new Error('Você já realizou check-in nesta aula para esta data!');
      }

      await attendanceService.checkIn(alunoId, aula.id, aula.turmaId, selectedDate);
      
      setSuccessMessage(`Check-in confirmado com sucesso para o dia ${formatDate(selectedDate)}! 🥋`);
      
      // Recarregar os dados
      await loadData();

      // Limpar mensagem de sucesso após 5 segundos
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao confirmar presença. Tente novamente.');
    } finally {
      setCheckingIn(null);
    }
  };

  // Trata a remoção do Check-in
  const handleCancelCheckIn = async (attendanceId: number) => {
    if (!alunoId) return;
    if (!window.confirm('Deseja realmente desmarcar sua presença nesta aula?')) return;

    setCheckingIn(attendanceId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await attendanceService.deleteAttendance(attendanceId);
      setSuccessMessage('Presença desmarcada com sucesso!');
      
      // Recarregar os dados
      await loadData();

      // Limpar mensagem de sucesso após 5 segundos
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao desmarcar presença. Tente novamente.');
    } finally {
      setCheckingIn(null);
    }
  };

  // Resolve o dia da semana correspondente à data selecionada para filtrar aulas
  const selectedDayOption = dateOptions.find(o => o.dateStr === selectedDate);
  const selectedDayOfWeek = selectedDayOption ? selectedDayOption.dayOfWeek : (now.getDay() === 0 ? 7 : now.getDay());

  // Filtra as aulas do dia da semana selecionado
  const filteredClasses = classes.filter(aula => 
    Array.isArray(aula.diasSemana) && aula.diasSemana.includes(selectedDayOfWeek)
  );

  // Calcula estatísticas
  const totalPresences = attendances.length;
  const lastCheckIn = attendances[0] ? `${formatDate(attendances[0].data)} às ${attendances[0].horario.substring(0, 5)}` : 'Nenhum';
  
  // Filtra presenças do mês atual
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const presencesThisMonth = attendances.filter(att => {
    const attDate = new Date(att.data + 'T00:00:00');
    return attDate.getMonth() === currentMonth && attDate.getFullYear() === currentYear;
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            Minha Frequência
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Faça check-in nas aulas e acompanhe seu histórico de presenças.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-obsidian-900 border border-obsidian-800 text-slate-300 hover:text-white transition-all text-xs font-black uppercase tracking-wider self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Atualizar dados
        </button>
      </div>

      {/* Mensagens de Feedback */}
      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="font-semibold">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-semibold">{errorMessage}</p>
        </div>
      )}

      {/* Painel de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-obsidian-900/40 border border-obsidian-850 p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="p-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-zinc-500 text-[10px] uppercase font-black tracking-widest block">Total de Treinos</span>
            <span className="text-2xl font-black text-slate-200 block mt-0.5">{totalPresences}</span>
          </div>
        </div>

        <div className="bg-obsidian-900/40 border border-obsidian-850 p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <span className="text-zinc-500 text-[10px] uppercase font-black tracking-widest block">Presenças no Mês</span>
            <span className="text-2xl font-black text-slate-200 block mt-0.5">{presencesThisMonth}</span>
          </div>
        </div>

        <div className="bg-obsidian-900/40 border border-obsidian-850 p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-zinc-500 text-[10px] uppercase font-black tracking-widest block">Último Check-in</span>
            <span className="text-sm font-black text-slate-200 block mt-1.5 truncate max-w-[180px]">{lastCheckIn}</span>
          </div>
        </div>
      </div>

      {/* Seção de Check-in em Tempo Real */}
      <div className="bg-obsidian-900/20 border border-obsidian-850 rounded-2xl p-6">
        {/* Seletor de Datas */}
        <div className="mb-6">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-3">
            Selecione a data para check-in:
          </label>
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
            {dateOptions.map(option => {
              const isActive = selectedDate === option.dateStr;
              return (
                <button
                  key={option.dateStr}
                  onClick={() => {
                    setSelectedDate(option.dateStr);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex flex-col items-center justify-center p-3 min-w-[75px] border transition-all rounded-xl ${
                    isActive 
                      ? 'bg-slate-100 border-transparent text-obsidian-950 shadow-lg shadow-black/25 scale-[1.02]' 
                      : 'bg-obsidian-900/60 border-obsidian-850/60 text-zinc-400 hover:text-zinc-200 hover:border-obsidian-750'
                  }`}
                >
                  <span className="text-[9px] uppercase font-black tracking-wider block leading-none">{option.label}</span>
                  <span className="text-lg font-black block mt-2 leading-none">{option.dayNum}</span>
                  <span className="text-[9px] font-bold block mt-1.5 leading-none uppercase text-zinc-500">{option.monthName}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-5 border-t border-obsidian-850/50 pt-5">
          <Clock className="w-5 h-5 text-zinc-450" />
          <h2 className="text-lg font-black text-slate-200 uppercase tracking-wider text-[13px]">
            Aulas de {selectedDate === dateOptions[0].dateStr ? 'Hoje' : selectedDate === dateOptions[1].dateStr ? 'Amanhã' : formatDate(selectedDate)}
          </h2>
        </div>

        {filteredClasses.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-obsidian-800 rounded-xl bg-obsidian-900/10">
            <Calendar className="w-10 h-10 text-zinc-650 mx-auto mb-3" />
            <p className="text-sm text-zinc-500 font-bold">Nenhuma aula programada para esta data.</p>
            <p className="text-xs text-zinc-650 mt-1">Selecione outro dia no calendário para realizar o check-in.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClasses.map(aula => {
              const status = getAulaStatus(aula, selectedDate);
              
              // Verifica se o aluno já fez check-in nesta aula na data selecionada
              const confirmedAttendance = attendances.find(
                att => att.aulaId === aula.id && att.data === selectedDate
              );
              const isConfirmed = !!confirmedAttendance;

              let buttonText = 'Realizar Check-in';
              if (isConfirmed) {
                buttonText = 'Presença Confirmada';
              } else if (checkingIn === aula.id) {
                buttonText = 'Confirmando...';
              }

              // Destaca a turma recomendada do aluno
              const isStudentTurma = student?.turma === aula.categoria || (aula.turmaId && turmas.find(t => t.id === aula.turmaId)?.categoria === student?.turma);

              return (
                <div 
                  key={aula.id} 
                  className={`p-4 rounded-xl border flex flex-col justify-between gap-4 transition-all relative ${
                    isConfirmed 
                      ? 'bg-emerald-950/5 border-emerald-900/30' 
                      : isStudentTurma 
                        ? 'bg-obsidian-900/50 border-obsidian-800 hover:border-zinc-700/40' 
                        : 'bg-obsidian-900/30 border-obsidian-850/60 opacity-75'
                  }`}
                >
                  {isStudentTurma && !isConfirmed && (
                    <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-blue-500" title="Sua turma recomendada" />
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-300 uppercase tracking-widest bg-obsidian-850 px-2 py-0.5 border border-obsidian-800">
                        {aula.categoria || 'Treino'}
                      </span>

                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border rounded-full ${status.badgeClass}`}>
                        {isConfirmed ? 'Confirmado' : status.label}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-slate-100 flex items-center gap-1.5 mt-1">
                      <Clock className="w-4 h-4 text-zinc-500" />
                      {aula.hora}
                    </h3>

                    <p className="text-xs text-zinc-450 font-semibold">
                      Professor: <span className="text-zinc-300">{aula.professor}</span>
                    </p>
                  </div>

                  <button
                    disabled={!status.isOpen || checkingIn !== null}
                    onClick={() => {
                      if (isConfirmed) {
                        if (confirmedAttendance) handleCancelCheckIn(confirmedAttendance.id);
                      } else {
                        handleCheckIn(aula);
                      }
                    }}
                    className={`w-full py-2.5 px-4 rounded-lg font-black text-[10px] uppercase tracking-widest border transition-all ${
                      isConfirmed
                        ? status.isOpen
                          ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 cursor-pointer group/btn'
                          : 'bg-emerald-900/25 border-emerald-800/40 text-emerald-400 cursor-default'
                        : status.isOpen
                          ? 'bg-slate-100 border-transparent text-obsidian-950 hover:bg-white hover:scale-[1.01] active:scale-95'
                          : 'bg-obsidian-900 border-obsidian-850 text-zinc-650 cursor-not-allowed'
                    }`}
                  >
                    {isConfirmed ? (
                      status.isOpen ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5 group-hover/btn:hidden" />
                          <span className="group-hover/btn:hidden">Presença Confirmada</span>
                          <span className="hidden group-hover/btn:inline">Desmarcar Presença</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                          Presença Confirmada
                        </>
                      )
                    ) : (
                      buttonText
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Histórico Geral de Presenças */}
      <div className="bg-obsidian-900/20 border border-obsidian-850 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Calendar className="w-5 h-5 text-zinc-450" />
          <h2 className="text-lg font-black text-slate-200 uppercase tracking-wider text-[13px]">
            Histórico de Presenças
          </h2>
        </div>

        {attendances.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 border border-dashed border-obsidian-800 rounded-xl bg-obsidian-900/10">
            <BarChart2 className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm font-bold">Nenhum check-in registrado.</p>
            <p className="text-xs text-zinc-650 mt-1">Suas presenças confirmadas aparecerão nesta lista.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-obsidian-850 text-[9px] text-zinc-500 font-black uppercase tracking-wider">
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Horário Check-in</th>
                  <th className="py-3 px-4">Aula / Professor</th>
                  <th className="py-3 px-4">Turma / Categoria</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-obsidian-900 text-xs text-slate-300">
                {attendances.map(att => (
                  <tr key={att.id} className="hover:bg-obsidian-900/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-200">
                      {formatDate(att.data)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-zinc-400">
                      {att.horario.substring(0, 5)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      <div>{att.aulaHora}</div>
                      <div className="text-[10px] text-zinc-500 font-medium mt-0.5">
                        Prof. {att.professorNome}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5">
                        {att.aulaCategoria || att.turmaNome || 'Geral'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleCancelCheckIn(att.id)}
                        disabled={checkingIn !== null}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 hover:border-red-500/30 text-red-400 hover:text-red-300 transition-all rounded-lg disabled:opacity-50"
                        title="Desmarcar Presença"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAttendancePage;
