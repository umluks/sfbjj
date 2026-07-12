import React, { useState } from 'react';
import type { Aviso } from '@/domain/models/announcement';
import { useAuth } from '@/application/hooks/useAuth';
import { useStudents } from '@/application/contexts/StudentsContext';
import { useAnnouncements } from '@/application/hooks/useAnnouncements';
import {
  Users,
  Cake,
  Megaphone,
  Plus,
  Trash2,
  Pin,
  CalendarCheck,
  Edit,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { loggedUser } = useAuth();
  const { students } = useStudents();
  const { 
    announcements, 
    createAnnouncement, 
    updateAnnouncement, 
    deleteAnnouncement 
  } = useAnnouncements();

  const [showAddNotice, setShowAddNotice] = useState(false);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticeDate, setNewNoticeDate] = useState('');
  const [newNoticePinned, setNewNoticePinned] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Aviso | null>(null);
  const [noticeError, setNoticeError] = useState<string | null>(null);

  // Cálculo de estatísticas
  const totalActive = students.filter(s => s.status === 'Ativo').length;
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

  // Todos os aniversários do mês selecionado
  const allMonthBirthdayStudents = students.filter(s => {
    if (!s.dataNascimento) return false;
    const parts = s.dataNascimento.split('-');
    const birthMonth = parts[1];
    return birthMonth === selectedMonthNum;
  });

  const isCurrentMonthSelected = selectedMonthNum === currentMonthNum;

  // Verifica se há algum aniversariante no dia atual (apenas se o mês atual estiver selecionado)
  const hasBirthdayToday = isCurrentMonthSelected && allMonthBirthdayStudents.some(s => {
    const parts = s.dataNascimento.split('-');
    const birthDay = parseInt(parts[2], 10);
    return birthDay === currentDayNum;
  });

  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeContent.trim()) return;

    setNoticeError(null);
    const selectedDate = newNoticeDate || new Date().toISOString().split('T')[0];

    try {
      const payload = {
        titulo: newNoticeTitle,
        conteudo: newNoticeContent,
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

  // Ordena os comunicados: Fixados no topo, depois por data mais recente
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.fixado && !b.fixado) return -1;
    if (!a.fixado && b.fixado) return 1;
    return getAnnouncementTimestamp(b.data) - getAnnouncementTimestamp(a.data);
  });

  const getDayFormatted = (dateStr: string): string => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) return parts[2];
    return '';
  };

  const isAdmin = loggedUser?.role === 'admin';

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header Bem-vindo */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          Olá, {loggedUser?.nome || 'Professor'}
        </h1>
        <p className="text-slate-455 text-sm mt-1 uppercase tracking-wider font-bold">
          {loggedUser?.role === 'admin' ? 'Painel de Controle Administrador' : 'Portal de Acesso Rápido'}
        </p>
      </div>

      {/* Cards Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-premium flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Alunos Ativos</span>
            <span className="text-3xl font-black text-slate-100">{totalActive}</span>
          </div>
          <div className="w-12 h-12 bg-slate-100/5 border border-zinc-200/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-zinc-400" />
          </div>
        </div>

        <div className="card-premium flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Aniversariantes do Mês</span>
            <span className="text-3xl font-black text-slate-100">{allMonthBirthdayStudents.length}</span>
          </div>
          <div className="w-12 h-12 bg-slate-100/5 border border-zinc-200/10 flex items-center justify-center">
            <Cake className="w-6 h-6 text-zinc-400" />
          </div>
        </div>

        <div className="card-premium flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Comunicados Ativos</span>
            <span className="text-3xl font-black text-slate-100">{announcements.length}</span>
          </div>
          <div className="w-12 h-12 bg-slate-100/5 border border-zinc-200/10 flex items-center justify-center">
            <Megaphone className="w-6 h-6 text-zinc-400" />
          </div>
        </div>
      </div>

      {/* Grade de Conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Seção de Comunicados (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-obsidian-800 pb-4 mb-2">
            <div className="flex items-center gap-2.5">
              <Megaphone className="w-5 h-5 text-gold-500" />
              <h2 className="text-lg font-black text-slate-100 uppercase tracking-wider">
                Mural de Avisos
              </h2>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowAddNotice(true)}
                className="btn-gold px-3.5 py-1.5 text-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Novo Aviso
              </button>
            )}
          </div>

          <div className="space-y-4">
            {sortedAnnouncements.length === 0 ? (
              <div className="text-center py-20 bg-obsidian-800/20 border border-obsidian-800/80 text-slate-500 text-xs italic">
                Nenhum comunicado cadastrado no mural.
              </div>
            ) : (
              sortedAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  className={`card-premium p-6 border relative overflow-hidden transition-all duration-300 ${
                    ann.fixado
                      ? 'border-gold-500/20 bg-gradient-to-br from-obsidian-800/60 to-obsidian-850/60 shadow-lg shadow-gold-500/[0.02]'
                      : 'border-obsidian-800/90 bg-obsidian-800/40 hover:border-obsidian-750'
                  }`}
                >
                  {ann.fixado && (
                    <div className="absolute top-0 right-0 p-1.5 bg-gold-500 text-obsidian-950 flex items-center justify-center shadow-md">
                      <Pin className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 block font-mono">
                          {formatAnnouncementDate(ann.data)}
                        </span>
                      </div>
                      <h3 className="text-md font-black text-slate-200 uppercase tracking-wide leading-snug">
                        {ann.titulo}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">
                        {ann.conteudo}
                      </p>
                    </div>

                    {isAdmin && (
                      <div className="flex gap-2 shrink-0 self-start mt-1">
                        <button
                          onClick={() => handleEditNoticeClick(ann)}
                          className="p-1.5 bg-obsidian-850 hover:bg-obsidian-800 border border-obsidian-800 text-slate-400 hover:text-slate-200 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteNotice(ann.id)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 text-red-400 hover:text-red-300 transition-colors"
                          title="Excluir"
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

        {/* Aniversariantes do Mês (1/3) */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-obsidian-800 pb-4 mb-2">
            <Cake className="w-5 h-5 text-gold-500" />
            <h2 className="text-lg font-black text-slate-100 uppercase tracking-wider">
              Aniversariantes
            </h2>
          </div>

          <div className="card-premium p-5 space-y-4">
            <div className="flex flex-col gap-3 border-b border-obsidian-800 pb-3 mb-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Aniversariantes
                </span>
                <span className="text-xs font-mono font-bold text-slate-350">
                  {allMonthBirthdayStudents.length} aluno(s)
                </span>
              </div>
              <div className="flex items-center justify-between bg-obsidian-950 border border-obsidian-800 p-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-obsidian-850 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                  title="Mês Anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-black uppercase text-slate-200 tracking-wider">
                  {monthNames[selectedMonthIndex]}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-obsidian-850 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                  title="Próximo Mês"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
              {allMonthBirthdayStudents.length === 0 ? (
                <div className="text-center py-10 text-slate-650 text-xs italic">
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
                    const isToday = isCurrentMonthSelected && parseInt(s.dataNascimento.split('-')[2], 10) === currentDayNum;
                    const isHighlighted = hasBirthdayToday && isToday;
                    return (
                      <div
                        key={s.id}
                        className={`flex items-center justify-between p-3 border transition-colors ${
                          isHighlighted
                            ? 'border-gold-500/20 bg-gold-500/[0.02] text-gold-450 hover:bg-gold-500/[0.05]'
                            : 'border-obsidian-800/80 bg-obsidian-900/60 text-slate-300 hover:border-obsidian-750'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8.5 h-8.5 rounded-full shrink-0 flex items-center justify-center text-xs font-black ${
                            isHighlighted ? 'bg-gold-500 text-obsidian-950' : 'bg-obsidian-800 text-slate-400 border border-obsidian-750'
                          }`}>
                            {s.nome.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 leading-tight">
                            <span className={`text-xs font-black block truncate ${
                              isHighlighted ? 'text-amber-400 animate-soft-blink' : 'text-slate-200'
                            }`}>
                              {s.nome}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block mt-0.5">
                              {s.turma} • {s.faixa}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0 flex items-center gap-1.5">
                          {isHighlighted && (
                            <span className="text-[9px] font-black uppercase tracking-wider bg-gold-500 text-obsidian-950 px-1.5 py-0.5 rounded shadow-sm">
                              Hoje! 🎉
                            </span>
                          )}
                          <span className="text-xs font-mono font-bold text-slate-400">
                            Dia {getDayFormatted(s.dataNascimento)}
                          </span>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      </div>

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
                  className="input-premium w-full h-36 bg-obsidian-950 resize-none leading-relaxed"
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
                  <span className="text-xs text-slate-350 font-bold uppercase tracking-wide cursor-pointer" onClick={() => setNewNoticePinned(!newNoticePinned)}>
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
