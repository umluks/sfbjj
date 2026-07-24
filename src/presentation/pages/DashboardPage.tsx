import React, { useState } from 'react';
import type { Aviso } from '@/domain/models/announcement';
import type { Aluno } from '@/domain/models/student';
import { useAuth } from '@/application/hooks/useAuth';
import { useStudents } from '@/application/contexts/StudentsContext';
import { useAnnouncements } from '@/application/hooks/useAnnouncements';
import { BeltBadge } from '@/presentation/components/shared/BeltBadge';
import {
  UserCheck,
  UserX,
  Clock,
  Cake,
  Megaphone,
  Plus,
  Trash2,
  Pin,
  CalendarCheck,
  Edit,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Users,
  ShieldCheck,
  Sparkles,
  X,
  CheckCircle2
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { loggedUser } = useAuth();
  const { students, updateStudent, isLoading } = useStudents();
  const { 
    announcements, 
    createAnnouncement, 
    updateAnnouncement, 
    deleteAnnouncement 
  } = useAnnouncements();

  // Estados de Controle dos Modais
  const [showAddNotice, setShowAddNotice] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);

  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticeDate, setNewNoticeDate] = useState('');
  const [newNoticePinned, setNewNoticePinned] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Aviso | null>(null);
  const [noticeError, setNoticeError] = useState<string | null>(null);
  const [noticeSearch, setNoticeSearch] = useState('');

  // Cálculo de estatísticas de alunos
  const totalStudents = students.length;
  const totalActive = students.filter(s => s.status === 'Ativo').length;
  const totalInactive = students.filter(s => s.status === 'Inativo').length;
  
  const pendingStudentsList = students.filter(
    s => (s.status as string) === 'Pendente' || (s.status as string) === 'Aguardando' || (s.status as string) === 'Aguardando Aprovação'
  );
  const totalPending = pendingStudentsList.length;

  const kidsActiveCount = students.filter(s => s.status === 'Ativo' && s.turma === 'Kids').length;
  const adultoActiveCount = students.filter(s => s.status === 'Ativo' && s.turma === 'Adulto').length;

  // Gerenciamento de Aniversariantes por Mês
  const todayDate = new Date();
  const currentMonthNum = String(todayDate.getMonth() + 1).padStart(2, '0');
  const currentDayNum = todayDate.getDate();

  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(todayDate.getMonth());

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const selectedMonthNum = String(selectedMonthIndex + 1).padStart(2, '0');

  const handlePrevMonth = () => {
    setSelectedMonthIndex(prev => (prev === 0 ? 11 : prev - 1));
  };

  const handleNextMonth = () => {
    setSelectedMonthIndex(prev => (prev === 11 ? 0 : prev + 1));
  };

  // Aniversariantes do mês selecionado
  const allMonthBirthdayStudents = students.filter(s => {
    if (!s.dataNascimento) return false;
    const parts = s.dataNascimento.split('-');
    return parts.length === 3 && parts[1] === selectedMonthNum;
  });

  const isCurrentMonthSelected = selectedMonthNum === currentMonthNum;
  const todayBirthdays = allMonthBirthdayStudents.filter(s => {
    if (!s.dataNascimento) return false;
    const day = parseInt(s.dataNascimento.split('-')[2], 10);
    return isCurrentMonthSelected && day === currentDayNum;
  });

  // Ações de Aprovação / Rejeição de Alunos Pendentes
  const handleApproveStudent = async (student: Aluno) => {
    try {
      await updateStudent(student.id, { status: 'Ativo' });
      alert(`Aluno(a) "${student.nome}" foi aprovado(a) com sucesso!`);
    } catch (err: any) {
      alert(err.message || 'Erro ao aprovar aluno.');
    }
  };

  const handleRejectStudent = async (student: Aluno) => {
    if (!confirm(`Deseja alterar o status de "${student.nome}" para Inativo?`)) return;
    try {
      await updateStudent(student.id, { status: 'Inativo' });
      alert(`Status de "${student.nome}" alterado para Inativo.`);
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar status.');
    }
  };

  // Manipulação de Comunicados
  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeContent.trim()) return;

    setNoticeError(null);
    const selectedDate = newNoticeDate || new Date().toISOString().split('T')[0];

    try {
      const payload = {
        titulo: newNoticeTitle.trim(),
        conteudo: newNoticeContent.trim(),
        data: selectedDate,
        fixado: newNoticePinned
      };

      if (editingNotice) {
        await updateAnnouncement(editingNotice.id, payload);
      } else {
        await createAnnouncement(payload);
      }

      setNewNoticeTitle('');
      setNewNoticeContent('');
      setNewNoticeDate('');
      setNewNoticePinned(false);
      setEditingNotice(null);
      setShowAddNotice(false);
    } catch (err: any) {
      setNoticeError(err.message || 'Erro ao salvar comunicado.');
    }
  };

  const handleEditNoticeClick = (ann: Aviso) => {
    setEditingNotice(ann);
    setNewNoticeTitle(ann.titulo);
    setNewNoticeContent(ann.conteudo);
    setNewNoticeDate(ann.data);
    setNewNoticePinned(ann.fixado || false);
    setShowAddNotice(true);
  };

  const handleCancelNoticeForm = () => {
    setNewNoticeTitle('');
    setNewNoticeContent('');
    setNewNoticeDate('');
    setNewNoticePinned(false);
    setEditingNotice(null);
    setNoticeError(null);
    setShowAddNotice(false);
  };

  const handleDeleteNotice = async (id: number) => {
    if (confirm('Tem certeza que deseja remover este comunicado?')) {
      try {
        await deleteAnnouncement(id);
      } catch (err) {
        console.error('Erro ao deletar comunicado:', err);
      }
    }
  };

  const getAnnouncementTimestamp = (dateStr: string): number => {
    if (!dateStr) return 0;
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
      }
    }
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3 && parts[2].length === 4) {
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime();
      }
    }
    return new Date(dateStr).getTime() || 0;
  };

  const formatAnnouncementDate = (dateStr: string) => {
    if (!dateStr) return '';
    if (dateStr.includes('-')) {
      const p = dateStr.split('-');
      if (p.length === 3) return `${p[2]}/${p[1]}/${p[0]}`;
    }
    return dateStr;
  };

  // Ordenação e Filtragem de Avisos
  const filteredAnnouncements = announcements.filter(ann => {
    const q = noticeSearch.toLowerCase().trim();
    if (!q) return true;
    return ann.titulo.toLowerCase().includes(q) || ann.conteudo.toLowerCase().includes(q);
  });

  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    if (a.fixado && !b.fixado) return -1;
    if (!a.fixado && b.fixado) return 1;
    return getAnnouncementTimestamp(b.data) - getAnnouncementTimestamp(a.data);
  });

  const pinnedCount = announcements.filter(a => a.fixado).length;

  const getDayFormatted = (dateStr: string): string => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) return parts[2];
    return '';
  };

  const isAdmin = loggedUser?.role === 'admin';
  const isTeacher = loggedUser?.role === 'teacher';

  const formattedCurrentDate = todayDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const capitalizedDate = formattedCurrentDate.charAt(0).toUpperCase() + formattedCurrentDate.slice(1);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Top Banner / Welcome Bar */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-obsidian-900 via-obsidian-850 to-obsidian-900 border border-obsidian-750/80 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gold-500/10 text-gold-400 border border-gold-500/20 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3 h-3 text-gold-400" />
                {loggedUser?.role === 'admin' ? 'Administração Geral' : isTeacher ? 'Corpo Docente' : 'Atleta SFBJJ'}
              </span>
              <span className="text-xs text-slate-500 font-mono font-medium hidden sm:inline-block">
                • {capitalizedDate}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight leading-none">
              Olá, <span className="text-slate-100">{loggedUser?.nome || 'Professor'}</span> 👋
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-2xl leading-relaxed">
              Bem-vindo ao centro de controle da <strong className="text-slate-200">Sagrada Família BJJ</strong>. Acompanhe o status dos atletas, comunicados e aniversariantes do mês em tempo real.
            </p>
          </div>

          {/* Total de Alunos Summary Pill */}
          <div className="flex items-center shrink-0 self-start md:self-center">
            <div className="bg-obsidian-950/70 border border-obsidian-800 rounded-2xl px-5 py-3 text-center min-w-[120px]">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Total de Alunos</span>
              <span className="text-2xl font-black text-slate-100 font-mono">{totalStudents}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Informativo de Status de Aprovações Pendentes */}
      {(isAdmin || isTeacher) && (
        <div className={`rounded-2xl p-4.5 border transition-all duration-300 shadow-lg ${
          isLoading && students.length === 0
            ? 'bg-obsidian-900/60 border-obsidian-800 animate-pulse'
            : totalPending > 0
            ? 'bg-gradient-to-r from-orange-500/15 via-orange-500/10 to-obsidian-900 border-orange-500/35'
            : 'bg-obsidian-900/60 border-obsidian-800'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`p-2.5 rounded-xl shrink-0 ${
                isLoading && students.length === 0
                  ? 'bg-obsidian-800 text-slate-500 border border-obsidian-750'
                  : totalPending > 0 
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                  : 'bg-obsidian-800 text-emerald-400 border border-obsidian-750'
              }`}>
                {isLoading && students.length === 0 ? (
                  <Clock className="w-5 h-5 animate-spin text-slate-400" />
                ) : totalPending > 0 ? (
                  <Clock className="w-5 h-5 animate-pulse text-orange-400" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                )}
              </div>
              <div>
                <h3 className={`text-xs font-black uppercase tracking-wider ${
                  isLoading && students.length === 0 ? 'text-slate-400' : totalPending > 0 ? 'text-orange-300' : 'text-slate-200'
                }`}>
                  {isLoading && students.length === 0 
                    ? 'Verificando Aprovações de Cadastro...' 
                    : totalPending > 0 
                    ? 'Aprovações de Cadastro Pendentes' 
                    : 'Situação das Aprovações'}
                </h3>
                <p className={`text-xs mt-0.5 font-medium ${
                  isLoading && students.length === 0 ? 'text-slate-500' : totalPending > 0 ? 'text-orange-400/90' : 'text-slate-400'
                }`}>
                  {isLoading && students.length === 0 ? (
                    <>Consultando banco de dados para verificar novos atletas pendentes...</>
                  ) : totalPending > 0 ? (
                    <>
                      Há <strong className="text-orange-300 font-black text-sm">{totalPending}</strong> {totalPending === 1 ? 'aluno aguardando para aprovação' : 'alunos aguardando para aprovação'} de cadastro no sistema.
                    </>
                  ) : (
                    <>Tudo em ordem! Não há nenhum cadastro de aluno aguardando aprovação no momento.</>
                  )}
                </p>
              </div>
            </div>

            {totalPending > 0 && !(isLoading && students.length === 0) && (
              <button
                type="button"
                onClick={() => setShowPendingModal(true)}
                className="px-4 py-2.5 bg-orange-500 text-obsidian-950 hover:bg-orange-400 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shrink-0 flex items-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                Ver Pendentes ({totalPending})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Cards Indicadores / KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Alunos Ativos */}
        <div className="card-premium p-5 border-l-4 border-l-emerald-500 relative overflow-hidden group hover:border-emerald-500/80 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Alunos Ativos</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-100 font-mono">{totalActive}</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Liberados
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium pt-1">
                {totalStudents > 0 ? Math.round((totalActive / totalStudents) * 100) : 0}% do total de cadastros
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-inner">
              <UserCheck className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Alunos Inativos */}
        <div className="card-premium p-5 border-l-4 border-l-red-500 relative overflow-hidden group hover:border-red-500/80 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Alunos Inativos</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-100 font-mono">{totalInactive}</span>
                <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                  Inativos
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium pt-1">
                {totalStudents > 0 ? Math.round((totalInactive / totalStudents) * 100) : 0}% do total de cadastros
              </p>
            </div>
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-inner">
              <UserX className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>

        {/* Aniversariantes do Mês */}
        <div className="card-premium p-5 border-l-4 border-l-gold-500 relative overflow-hidden group hover:border-gold-500/80 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Aniversariantes</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-100 font-mono">{allMonthBirthdayStudents.length}</span>
                <span className="text-[10px] font-bold text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded-full border border-gold-500/20">
                  {monthNames[selectedMonthIndex]}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium pt-1">
                {todayBirthdays.length > 0 ? (
                  <span className="text-amber-400 font-bold">{todayBirthdays.length} comemorando hoje! 🎉</span>
                ) : (
                  'Nenhum aniversariante hoje'
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-gold-500/10 border border-gold-500/20 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-inner">
              <Cake className="w-6 h-6 text-gold-400" />
            </div>
          </div>
        </div>

        {/* Mural de Avisos */}
        <div className="card-premium p-5 border-l-4 border-l-sky-500 relative overflow-hidden group hover:border-sky-500/80 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Mural de Avisos</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-100 font-mono">{announcements.length}</span>
                <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                  Ativos
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium pt-1">
                {pinnedCount} comunicado(s) fixado(s) no topo
              </p>
            </div>
            <div className="w-12 h-12 bg-sky-500/10 border border-sky-500/20 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-inner">
              <Megaphone className="w-6 h-6 text-sky-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Grade Principal do Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna Esquerda: Mural de Avisos (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header da Seção de Avisos */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-obsidian-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gold-500/10 border border-gold-500/20 rounded-xl text-gold-400">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-100 uppercase tracking-wider">
                  Mural de Comunicados
                </h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  Avisos e orientações oficiais da academia
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Campo de Busca nos Avisos */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar aviso..."
                  value={noticeSearch}
                  onChange={(e) => setNoticeSearch(e.target.value)}
                  className="bg-obsidian-950 border border-obsidian-800 focus:border-slate-500 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none transition-all w-36 sm:w-44"
                />
              </div>

              {isAdmin && (
                <button
                  onClick={() => {
                    setEditingNotice(null);
                    setNewNoticeTitle('');
                    setNewNoticeContent('');
                    setNewNoticeDate('');
                    setNewNoticePinned(false);
                    setShowAddNotice(true);
                  }}
                  className="btn-gold px-3.5 py-1.5 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 shadow-md"
                >
                  <Plus className="w-4 h-4 text-obsidian-950" />
                  Novo Aviso
                </button>
              )}
            </div>
          </div>

          {/* Lista de Comunicados */}
          <div className="space-y-4">
            {sortedAnnouncements.length === 0 ? (
              <div className="text-center py-16 bg-obsidian-900/40 border border-obsidian-800 rounded-2xl p-8 space-y-3">
                <Megaphone className="w-8 h-8 text-slate-650 mx-auto" />
                <p className="text-slate-400 text-xs font-medium">
                  {noticeSearch ? 'Nenhum comunicado encontrado correspondente à busca.' : 'Nenhum comunicado cadastrado no mural.'}
                </p>
              </div>
            ) : (
              sortedAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  className={`card-premium p-6 border relative overflow-hidden transition-all duration-300 group ${
                    ann.fixado
                      ? 'border-gold-500/30 bg-gradient-to-br from-obsidian-850 to-obsidian-900 shadow-xl shadow-gold-500/[0.03]'
                      : 'border-obsidian-800/90 bg-obsidian-900/50 hover:border-obsidian-750'
                  }`}
                >
                  {ann.fixado && (
                    <div className="absolute top-0 right-0 px-3 py-1 bg-gold-500 text-obsidian-950 text-[9.5px] font-black uppercase tracking-widest flex items-center gap-1 shadow-md rounded-bl-xl">
                      <Pin className="w-3 h-3 fill-obsidian-950" />
                      Fixado
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 block font-mono bg-obsidian-950 px-2 py-0.5 rounded border border-obsidian-800">
                          {formatAnnouncementDate(ann.data)}
                        </span>
                      </div>

                      <h3 className="text-md font-black text-slate-100 uppercase tracking-wide leading-snug group-hover:text-gold-400 transition-colors">
                        {ann.titulo}
                      </h3>

                      <p className="text-xs text-slate-350 leading-relaxed whitespace-pre-wrap font-sans">
                        {ann.conteudo}
                      </p>
                    </div>

                    {isAdmin && (
                      <div className="flex gap-2 shrink-0 self-start pt-1">
                        <button
                          onClick={() => handleEditNoticeClick(ann)}
                          className="p-2 rounded-lg bg-obsidian-950 hover:bg-obsidian-800 border border-obsidian-800 text-slate-400 hover:text-slate-200 transition-colors"
                          title="Editar Aviso"
                          type="button"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteNotice(ann.id)}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                          title="Excluir Aviso"
                          type="button"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Coluna Direita: Aniversariantes & Distribuição (1/3) */}
        <div className="space-y-8">
          
          {/* Card de Aniversariantes do Mês */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 border-b border-obsidian-800 pb-4">
              <div className="p-2 bg-gold-500/10 border border-gold-500/20 rounded-xl text-gold-400">
                <Cake className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-100 uppercase tracking-wider">
                  Aniversariantes
                </h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  Comemorações da academia
                </p>
              </div>
            </div>

            <div className="card-premium p-5 space-y-4">
              {/* Seletor de Mês */}
              <div className="flex items-center justify-between bg-obsidian-950 border border-obsidian-800 p-1.5 rounded-xl">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-obsidian-850 text-slate-400 hover:text-slate-200 rounded-lg transition-colors focus:outline-none"
                  title="Mês Anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="text-center">
                  <span className="text-xs font-black uppercase text-slate-200 tracking-wider block">
                    {monthNames[selectedMonthIndex]}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 font-bold">
                    {allMonthBirthdayStudents.length} aluno(s)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-obsidian-850 text-slate-400 hover:text-slate-200 rounded-lg transition-colors focus:outline-none"
                  title="Próximo Mês"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Lista de Aniversariantes */}
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {allMonthBirthdayStudents.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs italic">
                    Sem aniversariantes neste mês.
                  </div>
                ) : (
                  allMonthBirthdayStudents
                    .sort((a, b) => {
                      const dayA = parseInt(a.dataNascimento.split('-')[2], 10);
                      const dayB = parseInt(b.dataNascimento.split('-')[2], 10);
                      return dayA - dayB;
                    })
                    .map(s => {
                      const day = getDayFormatted(s.dataNascimento);
                      const isToday = isCurrentMonthSelected && parseInt(day, 10) === currentDayNum;

                      return (
                        <div
                          key={s.id}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                            isToday
                              ? 'border-yellow-500/40 bg-yellow-500/10 shadow-lg shadow-yellow-500/[0.05]'
                              : 'border-obsidian-800/80 bg-obsidian-950/60 hover:border-obsidian-750 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-xs font-black uppercase shadow-inner ${
                              isToday
                                ? 'bg-yellow-500 text-obsidian-950 font-black shadow-[0_0_10px_rgba(234,179,8,0.5)]'
                                : 'bg-obsidian-850 text-slate-300 border border-obsidian-750'
                            }`}>
                              {s.nome.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 leading-tight">
                              <span className={`text-xs font-black block truncate ${
                                isToday ? 'text-amber-300 animate-pulse' : 'text-slate-200'
                              }`}>
                                {s.nome}
                              </span>
                              <span className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wider block mt-0.5">
                                {s.turma} • {s.faixa}
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0 flex items-center gap-1.5">
                            {isToday && (
                              <span className="text-[9px] font-black uppercase tracking-wider bg-yellow-500 text-obsidian-950 px-1.5 py-0.5 rounded shadow-sm">
                                Hoje! 🎉
                              </span>
                            )}
                            <span className="text-xs font-mono font-bold text-slate-400 bg-obsidian-900 border border-obsidian-800 px-2 py-1 rounded-lg">
                              Dia {day}
                            </span>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>

          {/* Resumo de Distribuição por Turma */}
          <div className="card-premium p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-obsidian-800 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Users className="w-4 h-4 text-gold-500" />
                Distribuição de Turmas (Ativos)
              </span>
              <span className="text-[10px] font-mono text-slate-500 font-bold">
                {totalActive} alunos
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Barra Proporcional */}
              <div className="w-full bg-obsidian-950 h-3 rounded-full overflow-hidden flex border border-obsidian-800 p-0.5">
                <div
                  className="bg-sky-500 h-full rounded-l-full transition-all duration-500"
                  style={{ width: `${totalActive > 0 ? (kidsActiveCount / totalActive) * 100 : 0}%` }}
                  title={`Turma Kids: ${kidsActiveCount}`}
                />
                <div
                  className="bg-indigo-500 h-full rounded-r-full transition-all duration-500"
                  style={{ width: `${totalActive > 0 ? (adultoActiveCount / totalActive) * 100 : 0}%` }}
                  title={`Turma Adulto: ${adultoActiveCount}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-obsidian-950/70 border border-sky-500/20 p-3 rounded-xl">
                  <span className="text-[9px] font-black uppercase text-sky-400 tracking-wider block">Turma Kids</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-lg font-black text-slate-100 font-mono">{kidsActiveCount}</span>
                    <span className="text-[10px] font-bold text-slate-500">
                      {totalActive > 0 ? Math.round((kidsActiveCount / totalActive) * 100) : 0}%
                    </span>
                  </div>
                </div>

                <div className="bg-obsidian-950/70 border border-indigo-500/20 p-3 rounded-xl">
                  <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider block">Turma Adulto</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-lg font-black text-slate-100 font-mono">{adultoActiveCount}</span>
                    <span className="text-[10px] font-bold text-slate-500">
                      {totalActive > 0 ? Math.round((adultoActiveCount / totalActive) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para Aprovação de Alunos Pendentes */}
      {showPendingModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-obsidian-850 border border-obsidian-750 rounded-2xl w-full max-w-2xl shadow-2xl animate-scale-up overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-obsidian-750 bg-obsidian-900 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-400">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-md font-black text-slate-100 uppercase tracking-wide flex items-center gap-2">
                    Alunos Aguardando Aprovação
                    <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-mono font-bold rounded-full border border-orange-500/30">
                      {pendingStudentsList.length}
                    </span>
                  </h2>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Aprove ou inative o cadastro dos atletas solicitantes para liberação do acesso.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPendingModal(false)}
                className="p-2 text-slate-400 hover:text-slate-100 rounded-xl hover:bg-obsidian-800 transition-colors"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista de Alunos Pendentes */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {pendingStudentsList.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <p className="text-slate-300 text-sm font-bold">
                    Nenhum aluno pendente de aprovação!
                  </p>
                  <p className="text-slate-500 text-xs">
                    Todos os cadastros foram processados com sucesso.
                  </p>
                </div>
              ) : (
                pendingStudentsList.map((student) => (
                  <div
                    key={student.id}
                    className="p-4 rounded-xl border border-orange-500/20 bg-obsidian-950/80 hover:border-orange-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-obsidian-750 bg-obsidian-900 flex items-center justify-center text-md font-black text-slate-300 shrink-0">
                        {student.fotoPerfil && student.fotoPerfil.length > 2 ? (
                          <img src={student.fotoPerfil} alt={student.nome} className="w-full h-full object-cover" />
                        ) : (
                          <span>{student.nome.charAt(0).toUpperCase()}</span>
                        )}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-100 truncate text-sm">
                            {student.nome}
                          </h4>
                          <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider ${
                            student.turma === 'Kids' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/15' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15'
                          }`}>
                            {student.turma}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                          <span>CPF: <strong className="font-mono text-slate-300">{student.cpf || '—'}</strong></span>
                          <span>•</span>
                          <span>Tel: <strong className="font-mono text-slate-300">{student.telefone || '—'}</strong></span>
                        </div>

                        <div className="pt-0.5">
                          <BeltBadge faixa={student.faixa} graus={student.graus} />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleRejectStudent(student)}
                        className="px-3 py-1.5 rounded-xl border border-obsidian-800 bg-obsidian-900 hover:bg-red-500/10 hover:border-red-500/20 text-slate-400 hover:text-red-400 text-xs font-bold transition-all"
                      >
                        Inativar
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApproveStudent(student)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5"
                      >
                        <UserCheck className="w-4 h-4" />
                        Aprovar Aluno
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-4 border-t border-obsidian-750 bg-obsidian-900 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowPendingModal(false)}
                className="btn-obsidian px-5 py-2 text-xs font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Cadastrar / Editar Aviso */}
      {showAddNotice && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-obsidian-850 border border-obsidian-750 rounded-2xl w-full max-w-lg shadow-2xl animate-scale-up overflow-hidden">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-obsidian-750 bg-obsidian-850 rounded-t-2xl">
              <h2 className="text-md font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wide">
                <Megaphone className="w-5 h-5 text-gold-500" />
                {editingNotice ? 'Editar Comunicado' : 'Novo Comunicado'}
              </h2>
            </div>

            {/* Form */}
            <form onSubmit={handleAddNotice} className="p-6 space-y-4">
              {noticeError && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{noticeError}</span>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Título do Comunicado</label>
                <input
                  type="text"
                  value={newNoticeTitle}
                  onChange={(e) => setNewNoticeTitle(e.target.value)}
                  placeholder="Ex: Treino Geral de Sábado"
                  className="input-premium w-full bg-obsidian-950"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Conteúdo da Mensagem</label>
                <textarea
                  value={newNoticeContent}
                  onChange={(e) => setNewNoticeContent(e.target.value)}
                  placeholder="Escreva a mensagem que os alunos visualizarão no mural do portal."
                  className="input-premium w-full h-36 bg-obsidian-950 resize-none leading-relaxed font-sans"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Data do Aviso</label>
                  <input
                    type="date"
                    value={newNoticeDate}
                    onChange={(e) => setNewNoticeDate(e.target.value)}
                    className="input-premium w-full bg-obsidian-950 font-mono text-xs"
                  />
                </div>
                <div className="flex items-center gap-3.5 pl-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setNewNoticePinned(!newNoticePinned)}
                    className={`w-9.5 h-6.5 rounded-full flex items-center p-1 transition-all duration-300 focus:outline-none ${
                      newNoticePinned ? 'bg-gold-500 justify-end' : 'bg-obsidian-950 justify-start border border-obsidian-800'
                    }`}
                  >
                    <span className="w-4.5 h-4.5 rounded-full bg-slate-100 shadow-md transition-all duration-300" />
                  </button>
                  <span className="text-xs text-slate-350 font-bold uppercase tracking-wide cursor-pointer select-none" onClick={() => setNewNoticePinned(!newNoticePinned)}>
                    Fixar no Topo
                  </span>
                </div>
              </div>

              {/* Botões do Rodapé */}
              <div className="mt-8 pt-4 border-t border-obsidian-750 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCancelNoticeForm}
                  className="btn-obsidian px-5 py-2.5 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-gold px-5 py-2.5 text-xs font-bold flex items-center gap-2"
                >
                  <CalendarCheck className="w-4 h-4 text-obsidian-950" />
                  {editingNotice ? 'Salvar Edição' : 'Publicar Aviso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
