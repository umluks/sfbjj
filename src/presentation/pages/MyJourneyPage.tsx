import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Flame, 
  Award, 
  Trophy, 
  Activity, 
  TrendingUp, 
  History, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';

import { studentService } from '@/application/services/studentService';
import { attendanceService } from '@/application/services/attendanceService';
import type { Aluno } from '@/domain/models/student';
import type { Frequencia } from '@/domain/models/attendance';
import { formatDate, getDurationFriendly, parseSafeDate } from '@/utils/formatters';
import { BeltBadge } from '@/presentation/components/shared/BeltBadge';
import { AchievementsList } from '@/presentation/components/profile/AchievementsList';

interface MyJourneyPageProps {
  alunoId?: number;
}

export const MyJourneyPage: React.FC<MyJourneyPageProps> = ({ alunoId }) => {
  const [student, setStudent] = useState<Aluno | null>(null);
  const [attendances, setAttendances] = useState<Frequencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // Carrega todos os dados necessários
  const loadData = useCallback(async () => {
    if (!alunoId) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Carrega dados do aluno
      const studentData = await studentService.getStudentById(alunoId);
      setStudent(studentData);

      // 2. Carrega frequências
      const attendanceData = await attendanceService.getAttendanceByStudent(alunoId);
      setAttendances(attendanceData);
    } catch (err: any) {
      console.error('Erro ao carregar dados da jornada:', err);
      setError(err.message || 'Falha ao carregar informações da sua jornada.');
    } finally {
      setLoading(false);
    }
  }, [alunoId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 1. Data inicial de prática (data mais antiga entre matrícula e histórico de graduações)
  const practiceStartDate = useMemo(() => {
    if (!student) return null;
    const dates: string[] = [];
    if (student.dataMatricula) dates.push(student.dataMatricula);
    if (student.historicoGraduacoes && student.historicoGraduacoes.length > 0) {
      student.historicoGraduacoes.forEach(g => {
        if (g.data) dates.push(g.data);
      });
    }
    if (dates.length === 0) return null;

    // Ordena por timestamp para obter a data da primeira faixa / início de treino
    dates.sort((a, b) => parseSafeDate(a).getTime() - parseSafeDate(b).getTime());
    return dates[0];
  }, [student]);

  // 2. Calcular tempo de prática total (da primeira faixa até a data atual)
  const practiceTime = useMemo(() => {
    if (!practiceStartDate) return 'Não informado';
    
    const start = parseSafeDate(practiceStartDate);
    const now = new Date();
    
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    const days = now.getDate() - start.getDate();

    if (days < 0) {
      months--;
    }
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    if (years < 0) return 'Recém-iniciado';
    
    const yearsText = years === 1 ? '1 ano' : `${years} anos`;
    const monthsText = months === 1 ? '1 mês' : `${months} meses`;
    
    if (years === 0) {
      return months === 0 ? 'Menos de 1 mês' : monthsText;
    }
    
    return months === 0 ? yearsText : `${yearsText} e ${monthsText}`;
  }, [practiceStartDate]);



  // 3. Informações do último treino
  const lastTrainingSession = useMemo(() => {
    if (!attendances || attendances.length === 0) return null;
    return attendances[0];
  }, [attendances]);

  // 4. Frequência no mês corrente
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyCount = attendances.filter(att => {
      const attDate = new Date(att.data + 'T00:00:00');
      return attDate.getMonth() === currentMonth && attDate.getFullYear() === currentYear;
    }).length;

    // Meta sugerida de treinos por mês: 12 (aprox. 3 vezes por semana)
    const target = 12;
    const percentage = Math.min(Math.round((monthlyCount / target) * 100), 100);

    return {
      count: monthlyCount,
      percentage,
      target
    };
  }, [attendances]);

  // 5. Cálculo do Streak Atual (Treinos consecutivos baseados em dias)
  const currentStreak = useMemo(() => {
    if (!attendances || attendances.length === 0) return 0;

    const uniqueDates = new Set(attendances.map(a => a.data));
    const today = new Date();
    
    const formatDateLocal = (date: Date) => {
      return date.toLocaleDateString('en-CA'); // en-CA retorna YYYY-MM-DD
    };

    const todayStr = formatDateLocal(today);
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDateLocal(yesterday);

    // Se não treinou hoje nem ontem, o streak atual é 0
    if (!uniqueDates.has(todayStr) && !uniqueDates.has(yesterdayStr)) {
      return 0;
    }

    let streak = 0;
    // Começa a verificação a partir do dia em que treinou (hoje ou ontem)
    const checkDate = uniqueDates.has(todayStr) ? new Date(today) : new Date(yesterday);

    while (true) {
      const checkDateStr = formatDateLocal(checkDate);
      if (uniqueDates.has(checkDateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }, [attendances]);

  // 6. Cálculo total de horas treinadas
  const totalHoursTrained = useMemo(() => {
    if (!attendances || attendances.length === 0) return '0h';

    let totalMinutes = 0;
    attendances.forEach(att => {
      if (att.aulaHora) {
        const parts = att.aulaHora.split(' - ');
        if (parts.length === 2) {
          const [startH, startM] = parts[0].split(':').map(Number);
          const [endH, endM] = parts[1].split(':').map(Number);
          
          if (!isNaN(startH) && !isNaN(startM) && !isNaN(endH) && !isNaN(endM)) {
            const duration = (endH * 60 + endM) - (startH * 60 + startM);
            if (duration > 0) {
              totalMinutes += duration;
              return;
            }
          }
        }
      }
      // Fallback padrão: 75 minutos
      totalMinutes += 75;
    });

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }, [attendances]);

  // Prepara histórico para exibição
  const displayHistory = useMemo(() => {
    if (!student) return [];
    
    const hasCurrentInHistory = (student.historicoGraduacoes || []).some(
      g => g.faixa === student.faixa && g.graus === student.graus
    );
    const history = [...(student.historicoGraduacoes || [])];
    if (!hasCurrentInHistory && student.faixa) {
      history.push({
        id: -999,
        data: student.dataUltimaGraduacao || student.dataMatricula || new Date().toISOString().substring(0, 10),
        faixa: student.faixa,
        graus: student.graus,
        avaliador: 'Sistema'
      });
    }
    return history.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [student]);

  // Renderização visual da faixa
  const renderBeltVisual = (faixa: string, graus: number) => {
    const norm = faixa.toLowerCase();
    let beltBgClass = 'bg-slate-100 border border-slate-350 text-slate-900'; 
    let barClass = 'bg-zinc-950';

    if (norm.includes('azul')) {
      beltBgClass = 'bg-blue-700 shadow-blue-900/20';
    } else if (norm.includes('roxa')) {
      beltBgClass = 'bg-purple-700 shadow-purple-900/20';
    } else if (norm.includes('marrom')) {
      beltBgClass = 'bg-amber-900 shadow-amber-950/20';
    } else if (norm.includes('preta')) {
      beltBgClass = 'bg-zinc-950 border border-zinc-800 shadow-zinc-950/40';
      barClass = 'bg-red-650'; 
    } else if (norm.includes('cinza')) {
      if (norm.includes('branca')) {
        beltBgClass = 'bg-gradient-to-r from-zinc-400 via-white to-zinc-400 border border-zinc-300';
      } else if (norm.includes('preta')) {
        beltBgClass = 'bg-gradient-to-r from-zinc-400 via-zinc-800 to-zinc-400';
      } else {
        beltBgClass = 'bg-zinc-400';
      }
    } else if (norm.includes('amarela')) {
      if (norm.includes('branca')) {
        beltBgClass = 'bg-gradient-to-r from-yellow-400 via-white to-yellow-400 border border-zinc-200';
      } else if (norm.includes('preta')) {
        beltBgClass = 'bg-gradient-to-r from-yellow-400 via-zinc-800 to-yellow-400';
      } else {
        beltBgClass = 'bg-yellow-400';
      }
    } else if (norm.includes('laranja')) {
      if (norm.includes('branca')) {
        beltBgClass = 'bg-gradient-to-r from-orange-500 via-white to-orange-500 border border-zinc-200';
      } else if (norm.includes('preta')) {
        beltBgClass = 'bg-gradient-to-r from-orange-500 via-zinc-800 to-orange-500';
      } else {
        beltBgClass = 'bg-orange-500';
      }
    } else if (norm.includes('verde')) {
      if (norm.includes('branca')) {
        beltBgClass = 'bg-gradient-to-r from-emerald-600 via-white to-emerald-600 border border-zinc-200';
      } else if (norm.includes('preta')) {
        beltBgClass = 'bg-gradient-to-r from-emerald-600 via-zinc-800 to-emerald-600';
      } else {
        beltBgClass = 'bg-emerald-600';
      }
    } else if (norm.includes('vermelha')) {
      if (norm.includes('preta')) {
        beltBgClass = 'bg-gradient-to-r from-red-600 via-zinc-950 to-red-600';
      } else if (norm.includes('branca')) {
        beltBgClass = 'bg-gradient-to-r from-red-600 via-white to-red-600';
      } else {
        beltBgClass = 'bg-red-600';
        barClass = 'bg-white';
      }
    }

    return (
      <div className="relative w-full max-w-[280px] sm:max-w-[320px] h-12 flex items-center shadow-lg border border-black/10 overflow-hidden rounded-md group">
        <div className={`absolute inset-0 w-full h-full ${beltBgClass}`} />
        <div className="absolute inset-y-1/2 left-0 right-0 h-[2px] bg-black/15 w-full pointer-events-none" />
        <div className={`absolute right-4 top-0 bottom-0 w-16 sm:w-20 ${barClass} flex items-center justify-around px-2 border-l border-r border-black/35 shadow-inner`}>
          {Array.from({ length: 4 }).map((_, idx) => {
            const isEarned = idx < graus;
            return (
              <div
                key={idx}
                className={`w-1.5 sm:w-2 h-8 sm:h-9 transition-all duration-500 ${
                  isEarned ? 'bg-white shadow-sm shadow-black/20' : 'bg-transparent'
                }`}
              />
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <RefreshCw className="w-8 h-8 text-zinc-400 animate-spin" />
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
          Carregando sua jornada...
        </p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3 max-w-xl mx-auto my-12">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <div className="flex-1">
          <p className="font-bold text-sm">Erro ao carregar</p>
          <p className="text-xs text-red-400/85 mt-0.5">{error || 'Aluno não encontrado no sistema.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header da Jornada */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-zinc-350" />
            Minha Jornada
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Acompanhe sua evolução técnica, estatísticas de treinos e graduações.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-obsidian-900 border border-obsidian-800 text-slate-300 hover:text-white transition-all text-xs font-black uppercase tracking-wider self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Atualizar dados
        </button>
      </div>

      {/* Hero Card da Evolução */}
      <div className="card-premium p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-zinc-200/5 to-transparent blur-3xl rounded-full pointer-events-none" />
        
        {/* Lado Esquerdo: Info da Graduação */}
        <div className="flex flex-col sm:flex-row items-center gap-5 z-10 text-center sm:text-left">
          <div className="w-16 h-16 rounded-full bg-zinc-100/5 border border-zinc-200/10 flex items-center justify-center text-xl font-black text-zinc-350 shrink-0">
            {student.nome.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
              Graduação Atual
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-wide">
              {student.faixa} • {student.graus} {student.graus === 1 ? 'Grau' : 'Graus'}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              A evolução técnica reflete sua dedicação diária nos tatames e a tutoria de seus professores.
            </p>
          </div>
        </div>

        {/* Lado Direito: Representação Gráfica da Faixa */}
        <div className="flex flex-col items-center gap-2 z-10 select-none">
          {renderBeltVisual(student.faixa, student.graus)}
          <span className="text-[9.5px] font-black uppercase text-zinc-500 tracking-wider">
            Exibição Digital da sua Faixa
          </span>
        </div>
      </div>

      {/* Grid de Estatísticas / Cards Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Card 1: Frequência Mensal (Destaque - Ocupa 2 Colunas) */}
        <div className="card-premium p-5 flex items-center justify-between relative overflow-hidden group sm:col-span-2 lg:col-span-2">
          <div className="flex items-center gap-4.5">
            <div className="p-3 bg-zinc-100/5 border border-zinc-200/10 text-zinc-400 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <span className="text-zinc-500 text-[10px] uppercase font-black tracking-widest block">Frequência no Mês</span>
              <span className="text-xl font-black text-slate-200 block">
                {monthlyStats.count} treinos
              </span>
              <span className="text-[10px] text-zinc-450 font-bold block">
                Meta do mês: {monthlyStats.target} sessões
              </span>
            </div>
          </div>
          
          {/* Anel de Progresso Circular */}
          <div className="relative w-12 h-12 shrink-0 select-none">
            <svg className="w-full h-full transform -rotate-90">
              <circle 
                cx="24" 
                cy="24" 
                r="18" 
                stroke="currentColor" 
                strokeWidth="3.5" 
                fill="transparent" 
                className="text-obsidian-800"
              />
              <circle 
                cx="24" 
                cy="24" 
                r="18" 
                stroke="currentColor" 
                strokeWidth="3.5" 
                fill="transparent" 
                strokeDasharray={2 * Math.PI * 18}
                strokeDashoffset={2 * Math.PI * 18 * (1 - monthlyStats.percentage / 100)}
                className="text-zinc-300 transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-slate-300">
              {monthlyStats.percentage}%
            </span>
          </div>
        </div>

        {/* Card 2: Tempo de Prática */}
        <div className="card-premium p-5 flex items-center gap-4.5 relative overflow-hidden group">
          <div className="p-3 bg-zinc-100/5 border border-zinc-200/10 text-zinc-400 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <span className="text-zinc-500 text-[10px] uppercase font-black tracking-widest block">Tempo de Prática</span>
            <span className="text-xl font-black text-slate-200 block truncate">{practiceTime}</span>
            <span className="text-[10px] text-zinc-450 font-bold block">
              Ingresso: {formatDate(practiceStartDate || student.dataMatricula)}
            </span>
          </div>
        </div>

        {/* Card 3: Sequência Atual (Streak) */}
        <div className="card-premium p-5 flex items-center justify-between relative overflow-hidden group">
          <div className="flex items-center gap-4.5">
            <div className={`p-3 border rounded-xl transition-all duration-300 ${
              currentStreak > 0 
                ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' 
                : 'bg-zinc-100/5 border-zinc-200/10 text-zinc-400'
            }`}>
              <Flame className={`w-6 h-6 ${currentStreak > 0 ? 'animate-pulse' : ''}`} />
            </div>
            <div className="space-y-0.5">
              <span className="text-zinc-500 text-[10px] uppercase font-black tracking-widest block">Sequência Atual (Streak)</span>
              <span className="text-xl font-black text-slate-200 block">
                {currentStreak} {currentStreak === 1 ? 'dia corrido' : 'dias corridos'}
              </span>
              <span className="text-[10px] text-zinc-450 font-bold block">
                {currentStreak > 0 ? 'Fogo ativo nos tatames! 🔥' : 'Treine hoje para ativar!'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Total de Treinos */}
        <div className="card-premium p-5 flex items-center gap-4.5 relative overflow-hidden group">
          <div className="p-3 bg-zinc-100/5 border border-zinc-200/10 text-zinc-400 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <span className="text-zinc-500 text-[10px] uppercase font-black tracking-widest block">Total de Treinos</span>
            <span className="text-xl font-black text-slate-200 block">{attendances.length} treinos</span>
            <span className="text-[10px] text-zinc-450 font-bold block">
              Registrados desde a matrícula
            </span>
          </div>
        </div>

        {/* Card 5: Tempo Acumulado */}
        <div className="card-premium p-5 flex items-center gap-4.5 relative overflow-hidden group">
          <div className="p-3 bg-zinc-100/5 border border-zinc-200/10 text-zinc-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <span className="text-zinc-500 text-[10px] uppercase font-black tracking-widest block">Tempo Acumulado</span>
            <span className="text-xl font-black text-slate-200 block">{totalHoursTrained}</span>
            <span className="text-[10px] text-zinc-450 font-bold block">
              Horas totais dedicadas no tatame
            </span>
          </div>
        </div>
      </div>

      {/* Duas Colunas: Último treino & Timeline cronológico */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna 1: Informações da Última Sessão de Treino (1/3) */}
        <div className="space-y-5">
          <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-obsidian-850 pb-3">
            <Clock className="w-4 h-4 text-zinc-500" />
            Último Treino
          </h3>
          
          <div className="card-premium p-6 space-y-5">
            {lastTrainingSession ? (
              <>
                <div className="flex items-center justify-between border-b border-obsidian-800 pb-3.5">
                  <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider">Status do Check-in</span>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                    Confirmado
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Data e Horário</span>
                    <p className="text-xs font-black text-slate-100 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      {formatDate(lastTrainingSession.data)} às {lastTrainingSession.horario.substring(0, 5)}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Aula / Cronograma</span>
                    <p className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      {lastTrainingSession.isExterno 
                        ? `Treino em ${lastTrainingSession.localExterno || 'Academia Externa'}` 
                        : (lastTrainingSession.aulaHora || 'Horário avulso')}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">
                      {lastTrainingSession.isExterno ? 'Local / Academia' : 'Professor Ministrante'}
                    </span>
                    <p className="text-xs font-semibold text-slate-150 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-zinc-500" />
                      {lastTrainingSession.isExterno 
                        ? (lastTrainingSession.localExterno || 'Academia Externa') 
                        : `Prof. ${lastTrainingSession.professorNome || 'Não informado'}`}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Turma / Categoria</span>
                    {lastTrainingSession.isExterno ? (
                      <span className="inline-block text-[9.5px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 mt-1 rounded">
                        EXTERNO
                      </span>
                    ) : (
                      <span className="inline-block text-[9.5px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 mt-1">
                        {lastTrainingSession.aulaCategoria || lastTrainingSession.turmaNome || 'Geral'}
                      </span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-10 text-slate-500 text-xs italic">
                Nenhum treino realizado ainda.
              </div>
            )}
          </div>
        </div>

        {/* Coluna 2: Histórico Cronológico de Treinos (2/3) */}
        <div className="lg:col-span-2 space-y-5">
          <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-obsidian-850 pb-3">
            <History className="w-4 h-4 text-zinc-500" />
            Histórico Recente de Treinos
          </h3>

          <div className="card-premium p-6">
            {attendances.length === 0 ? (
              <div className="text-center py-14 text-slate-550 text-xs italic">
                Nenhuma sessão registrada em seu histórico.
              </div>
            ) : (
              <div className="table-responsive-wrapper overflow-x-auto min-w-0 max-w-full border border-obsidian-850">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-obsidian-850 text-[9.5px] text-zinc-500 font-black uppercase tracking-wider">
                      <th className="pb-3 px-3">Data</th>
                      <th className="pb-3 px-3">Entrada</th>
                      <th className="pb-3 px-3">Aula / Professor / Local</th>
                      <th className="pb-3 px-3">Turma</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-obsidian-900/60 text-[11.5px] text-slate-350">
                    {attendances.slice(0, 15).map(att => (
                      <tr key={att.id} className="hover:bg-obsidian-900/20 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-200">
                          {formatDate(att.data)}
                        </td>
                        <td className="py-3 px-3 font-semibold text-zinc-450">
                          {att.horario.substring(0, 5)}
                        </td>
                        <td className="py-3 px-3 leading-relaxed">
                          {att.isExterno ? (
                            <>
                              <span className="font-bold text-amber-400 block">
                                Treino em {att.localExterno || 'Academia Externa'}
                              </span>
                              {att.observacao && (
                                <span className="text-[9.5px] text-zinc-500 font-medium block mt-0.5">
                                  {att.observacao}
                                </span>
                              )}
                            </>
                          ) : (
                            <>
                              <span className="font-bold text-slate-200 block">{att.aulaHora}</span>
                              <span className="text-[9.5px] text-zinc-500 font-medium block mt-0.5">
                                Prof. {att.professorNome || 'Desconhecido'}
                              </span>
                            </>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {att.isExterno ? (
                            <span className="text-[8.5px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                              EXTERNO
                            </span>
                          ) : (
                            <span className="text-[8.5px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/15 px-2 py-0.5">
                              {att.aulaCategoria || att.turmaNome || 'Geral'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Histórico de Graduações (Timeline) */}
      <div className="space-y-5">
        <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-obsidian-850 pb-3">
          <Award className="w-4.5 h-4.5 text-zinc-500" />
          Trajetória de Graduações
        </h3>

        <div className="card-premium p-6 md:p-8">
          {displayHistory.length === 0 ? (
            <div className="text-center py-10 text-slate-550 text-xs italic">
              Nenhuma graduação registrada em seu histórico.
            </div>
          ) : (
            <div className="relative pl-6 border-l-2 border-obsidian-850 space-y-8 py-2">
              {displayHistory.map((grad, idx) => {
                const isCurrent = grad.faixa === student.faixa && grad.graus === student.graus;
                
                // Calcula duração na faixa
                const todayStr = new Date().toLocaleDateString('en-CA');
                const nextGradData = idx === 0 ? todayStr : displayHistory[idx - 1].data;
                const tempoNaFaixa = getDurationFriendly(grad.data, nextGradData);
                
                return (
                  <div key={grad.id} className="relative group">
                    {/* Indicador visual na linha da timeline */}
                    <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                      isCurrent 
                        ? 'bg-amber-500 border-amber-400 shadow-md shadow-amber-500/20 scale-110' 
                        : 'bg-obsidian-950 border-obsidian-750 group-hover:border-slate-500'
                    }`} />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <BeltBadge faixa={grad.faixa} graus={grad.graus} />
                          {isCurrent && (
                            <span className="text-[9.5px] uppercase font-black tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full select-none">
                              Graduação Atual
                            </span>
                          )}
                        </div>
                        {grad.avaliador && (
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">
                            Avaliador: {grad.avaliador}
                          </p>
                        )}
                      </div>
                      
                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-[10px] font-bold text-slate-350 font-mono block">
                          Graduado em: {formatDate(grad.data)}
                        </span>
                        <span className="text-[9.5px] text-zinc-500 font-semibold block mt-0.5">
                          Permanência na Faixa: {tempoNaFaixa}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Seção de Conquistas/Badges */}
      {student && (
        <div className="card-premium p-6 md:p-8">
          <AchievementsList
            totalAulas={attendances.length}
            streak={currentStreak}
            dataMatricula={practiceStartDate || student.dataMatricula || ''}
            metaMensalProgresso={monthlyStats.percentage}
          />
        </div>
      )}
    </div>
  );
};

export default MyJourneyPage;
