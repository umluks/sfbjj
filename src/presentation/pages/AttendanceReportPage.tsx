import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, Search, Users, Award, BarChart2, Filter, Download, RefreshCw } from 'lucide-react';
import { useStudents } from '@/application/contexts/StudentsContext';
import { attendanceService } from '@/application/services/attendanceService';
import type { Frequencia } from '@/domain/models/attendance';
import { formatDate } from '@/utils/formatters';

export const AttendanceReportPage: React.FC = () => {
  const { students } = useStudents();

  // Define datas padrões (início do mês atual até hoje)
  const defaultDates = useMemo(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Ajusta strings sem offset de fuso
    const formatYMD = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      startDate: formatYMD(firstDay),
      endDate: formatYMD(today)
    };
  }, []);

  const [startDate, setStartDate] = useState(defaultDates.startDate);
  const [endDate, setEndDate] = useState(defaultDates.endDate);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedAlunoId, setSelectedAlunoId] = useState<string>('');
  const [attendances, setAttendances] = useState<Frequencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: any = {};
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      if (selectedCategory) filters.categoria = selectedCategory;
      if (selectedAlunoId) filters.alunoId = Number(selectedAlunoId);

      const data = await attendanceService.searchAttendance(filters);
      setAttendances(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar relatório.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selectedCategory, selectedAlunoId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Estatísticas computadas
  const stats = useMemo(() => {
    const total = attendances.length;
    
    // Aluno destaque
    const alunoCounts: Record<string, { count: number; nome: string }> = {};
    // Categoria campeã
    const catCounts: Record<string, number> = {};

    attendances.forEach(att => {
      // Aluno
      const aId = String(att.alunoId);
      if (!alunoCounts[aId]) {
        alunoCounts[aId] = { count: 0, nome: att.alunoNome || 'Desconhecido' };
      }
      alunoCounts[aId].count += 1;

      // Categoria
      const cat = att.aulaCategoria || att.turmaNome || 'Geral';
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    });

    // Resolve aluno com maior presença
    let bestStudentName = 'Nenhum';
    let bestStudentCount = 0;
    Object.values(alunoCounts).forEach(item => {
      if (item.count > bestStudentCount) {
        bestStudentCount = item.count;
        bestStudentName = item.nome;
      }
    });

    // Resolve categoria com maior presença
    let bestCategory = 'Nenhuma';
    let bestCategoryCount = 0;
    Object.entries(catCounts).forEach(([cat, count]) => {
      if (count > bestCategoryCount) {
        bestCategoryCount = count;
        bestCategory = cat;
      }
    });

    return {
      total,
      bestStudent: bestStudentCount > 0 ? `${bestStudentName} (${bestStudentCount}x)` : 'Nenhum',
      bestCategory: bestCategoryCount > 0 ? `${bestCategory} (${bestCategoryCount}x)` : 'Nenhuma'
    };
  }, [attendances]);

  // Exportar histórico para CSV
  const handleExportCSV = () => {
    if (attendances.length === 0) return;
    
    const headers = ['Aluno', 'Data', 'Horário', 'Professor', 'Turma/Categoria'];
    const rows = attendances.map(att => [
      att.alunoNome || 'Desconhecido',
      formatDate(att.data),
      att.horario.substring(0, 5),
      att.professorNome || 'N/A',
      att.aulaCategoria || att.turmaNome || 'Geral'
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(';'))
    ].join('\n');

    const blob = new Blob([`\ufeff${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `frequencia_sfbjj_${startDate}_a_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            Consulta de Frequência
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Pesquise a presença de alunos por período, turma e nome de membro.
          </p>
        </div>

        {attendances.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all text-xs font-black uppercase tracking-wider self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar Relatório (CSV)
          </button>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-obsidian-900/40 border border-obsidian-850 p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="p-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-zinc-500 text-[10px] uppercase font-black tracking-widest block">Total de Presenças</span>
            <span className="text-2xl font-black text-slate-200 block mt-0.5">{stats.total}</span>
          </div>
        </div>

        <div className="bg-obsidian-900/40 border border-obsidian-850 p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-zinc-500 text-[10px] uppercase font-black tracking-widest block">Aluno Mais Frequente</span>
            <span className="text-sm font-black text-slate-200 block mt-1.5 truncate max-w-[190px]" title={stats.bestStudent}>
              {stats.bestStudent}
            </span>
          </div>
        </div>

        <div className="bg-obsidian-900/40 border border-obsidian-850 p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-zinc-500 text-[10px] uppercase font-black tracking-widest block">Turma Campeã</span>
            <span className="text-sm font-black text-slate-200 block mt-1.5 truncate max-w-[190px]" title={stats.bestCategory}>
              {stats.bestCategory}
            </span>
          </div>
        </div>
      </div>

      {/* Painel de Filtros */}
      <div className="bg-obsidian-900/40 border border-obsidian-850 p-6 rounded-2xl">
        <div className="flex items-center gap-2 mb-4 border-b border-obsidian-850 pb-3">
          <Filter className="w-4 h-4 text-zinc-450" />
          <h2 className="text-xs font-black text-slate-200 uppercase tracking-widest">Filtros de Busca</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Data Inicial</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-obsidian-950 border border-obsidian-800 focus:border-zinc-500 hover:border-obsidian-700/80 rounded-xl px-9 py-2 text-xs font-semibold text-slate-200 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Data Final</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-obsidian-950 border border-obsidian-800 focus:border-zinc-500 hover:border-obsidian-700/80 rounded-xl px-9 py-2 text-xs font-semibold text-slate-200 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Filtrar por Categoria</label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-obsidian-950 border border-obsidian-800 focus:border-zinc-500 hover:border-obsidian-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">Todas as Categorias</option>
                <option value="Adulto">Adulto</option>
                <option value="Kids">Kids</option>
                <option value="Open Match">Open Match</option>
              </select>
              <div className="absolute right-3 top-3.5 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-zinc-500 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Filtrar por Aluno</label>
            <div className="relative">
              <select
                value={selectedAlunoId}
                onChange={(e) => setSelectedAlunoId(e.target.value)}
                className="w-full bg-obsidian-950 border border-obsidian-800 focus:border-zinc-500 hover:border-obsidian-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">Todos os Alunos</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
              </select>
              <div className="absolute right-3 top-3.5 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-zinc-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="bg-obsidian-900/20 border border-obsidian-850 rounded-2xl p-6">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl mb-4 text-xs font-bold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="w-8 h-8 text-zinc-500 animate-spin" />
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Buscando registros...</p>
          </div>
        ) : attendances.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 border border-dashed border-obsidian-800 rounded-xl bg-obsidian-900/10">
            <Search className="w-10 h-10 text-zinc-650 mx-auto mb-3" />
            <p className="text-sm font-bold">Nenhum check-in encontrado.</p>
            <p className="text-xs text-zinc-650 mt-1">Ajuste os filtros de busca para visualizar as presenças.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-obsidian-850 text-[9px] text-zinc-500 font-black uppercase tracking-wider">
                  <th className="py-3 px-4">Aluno</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Horário Check-in</th>
                  <th className="py-3 px-4">Aula / Professor</th>
                  <th className="py-3 px-4">Turma / Categoria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-obsidian-900 text-xs text-slate-350">
                {attendances.map(att => (
                  <tr key={att.id} className="hover:bg-obsidian-900/30 transition-colors">
                    <td className="py-3.5 px-4 font-black text-slate-200">
                      {att.alunoNome}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-300">
                      {formatDate(att.data)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-zinc-400">
                      {att.horario.substring(0, 5)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-300">{att.aulaHora}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        Prof. {att.professorNome}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5">
                        {att.aulaCategoria || att.turmaNome || 'Geral'}
                      </span>
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

export default AttendanceReportPage;
