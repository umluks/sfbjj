import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import type {
  Aviso,
  LoggedUser
} from '../types';
import {
  Users,
  Cake,
  Megaphone,
  Plus,
  Trash2,
  Pin,
  CalendarCheck,
  Edit
} from 'lucide-react';
import { useStudents } from '../contexts/StudentsContext';

interface DashboardProps {
  announcements: Aviso[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Aviso[]>>;
  loggedUser: LoggedUser | null;
}

export const Dashboard: React.FC<DashboardProps> = ({
  announcements,
  setAnnouncements,
  loggedUser
}) => {
  const { students } = useStudents();
  const [showAddNotice, setShowAddNotice] = useState(false);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticeDate, setNewNoticeDate] = useState('');
  const [newNoticePinned, setNewNoticePinned] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Aviso | null>(null);

  // Cálculo de estatísticas
  const totalActive = students.filter(s => s.status === 'Ativo').length;
  const todayDate = new Date();
  const currentMonthNum = String(todayDate.getMonth() + 1).padStart(2, '0');
  const currentDayNum = todayDate.getDate();

  // Todos os aniversários do mês (contagem total, sem remoção)
  const allMonthBirthdayStudents = students.filter(s => {
    if (!s.dataNascimento) return false;
    const parts = s.dataNascimento.split('-');
    const birthMonth = parts[1];
    return birthMonth === currentMonthNum;
  });

  // Próximos aniversários (apenas hoje e dias futuros)
  const upcomingBirthdayStudents = students.filter(s => {
    if (!s.dataNascimento) return false;
    const parts = s.dataNascimento.split('-');
    const birthMonth = parts[1];
    const birthDay = parseInt(parts[2], 10);
    return birthMonth === currentMonthNum && birthDay >= currentDayNum;
  });

  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeContent.trim()) return;

    const selectedDate = newNoticeDate || new Date().toISOString().split('T')[0];

    if (editingNotice) {
      // Editar comunicado existente
      const updatedAnnouncementObj = {
        titulo: newNoticeTitle,
        conteudo: newNoticeContent,
        data: selectedDate,
        fixado: newNoticePinned
      };

      try {
        const { error } = await supabase
          .from('avisos')
          .update(updatedAnnouncementObj)
          .eq('id', editingNotice.id);

        if (error) throw error;

        setAnnouncements(prev => prev.map(ann => {
          if (ann.id === editingNotice.id) {
            return {
              ...ann,
              titulo: newNoticeTitle,
              conteudo: newNoticeContent,
              data: selectedDate,
              fixado: newNoticePinned
            };
          }
          return ann;
        }));
      } catch (err) {
        console.error('Error updating notice in database, falling back to local state:', err);
        setAnnouncements(prev => prev.map(ann => {
          if (ann.id === editingNotice.id) {
            return {
              ...ann,
              titulo: newNoticeTitle,
              conteudo: newNoticeContent,
              data: selectedDate,
              fixado: newNoticePinned
            };
          }
          return ann;
        }));
      }
    } else {
      // Criar novo comunicado
      const newAnnouncementObj = {
        titulo: newNoticeTitle,
        conteudo: newNoticeContent,
        data: selectedDate,
        fixado: newNoticePinned
      };

      try {
        const { data: insertedData, error } = await supabase
          .from('avisos')
          .insert(newAnnouncementObj)
          .select()
          .single();

        if (error) throw error;

        if (insertedData) {
          setAnnouncements(prev => [insertedData, ...prev]);
        }
      } catch (err) {
        console.error('Error saving notice to database, falling back to local state:', err);
        const fallbackAnnouncement: Aviso = {
          id: Date.now(),
          titulo: newNoticeTitle,
          conteudo: newNoticeContent,
          data: selectedDate,
          fixado: newNoticePinned
        };
        setAnnouncements(prev => [fallbackAnnouncement, ...prev]);
      }
    }

    setNewNoticeTitle('');
    setNewNoticeContent('');
    setNewNoticeDate('');
    setNewNoticePinned(false);
    setEditingNotice(null);
    setShowAddNotice(false);
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
    setShowAddNotice(false);
  };

  const handleDeleteNotice = async (id: number) => {
    try {
      const { error } = await supabase
        .from('avisos')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting notice from database:', err);
    }
    setAnnouncements(prev => prev.filter(ann => ann.id !== id));
  };

  const getAnnouncementTimestamp = (dateStr: string): number => {
    if (!dateStr) return 0;
    // Caso esteja no formato YYYY-MM-DD
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
      }
    }
    // Caso esteja no formato DD/MM/YYYY
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3 && parts[2].length === 4) {
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime();
      }
    }

    const parsed = Date.parse(dateStr);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Ordena os anúncios por data (oldest first)
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    const timeA = getAnnouncementTimestamp(a.data);
    const timeB = getAnnouncementTimestamp(b.data);
    return timeA - timeB;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-obsidian-850 pb-5">
        <div>
          <h1 className="text-xl font-extrabold text-zinc-100 tracking-tight uppercase">
            Olá, {loggedUser?.nome || 'Admin'} <span className="text-zinc-550 font-medium text-sm">/ Painel Central</span>
          </h1>
          <p className="text-zinc-550 text-[10px] uppercase font-bold tracking-widest mt-1">
            Gestão de elite, progressões e atividades do dia
          </p>
        </div>
        <div className="text-zinc-400 text-[10px] font-bold tracking-wider bg-obsidian-900 border border-obsidian-800 px-4 py-2 rounded-none">
          {todayDate.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
        </div>
      </div>

      {/* Main Grid: Coluna Central (Dados) + Coluna Direita (Atividades/Avisos) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* COLUNA CENTRAL DE DADOS (2/3 de largura) */}
        <div className="lg:col-span-2 space-y-8">

          {/* Métricas e Estatísticas Rápidas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Active Students */}
            <div className="card-premium flex items-center justify-between border-l border-zinc-400">
              <div>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">
                  Matrículas Ativas
                </span>
                <span className="text-3xl font-black text-zinc-100 mt-2 block tracking-tight">
                  {totalActive}
                </span>
                <span className="text-[9px] text-zinc-400 font-bold mt-1.5 inline-flex items-center gap-1 uppercase tracking-wider">
                  • Acesso Autorizado
                </span>
              </div>
              <div className="p-3 bg-zinc-100/5 border border-zinc-200/10 text-zinc-300">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* Birthday Count */}
            <div className="card-premium flex items-center justify-between border-l border-zinc-500">
              <div>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">
                  Ciclo de Aniversários
                </span>
                <span className="text-3xl font-black text-zinc-100 mt-2 block tracking-tight">
                  {allMonthBirthdayStudents.length}
                </span>
                <span className="text-[9px] text-zinc-400 font-bold mt-1.5 inline-flex items-center gap-1 uppercase tracking-wider">
                  • Mês de {new Date().toLocaleString('pt-BR', { month: 'short' }).toUpperCase()}
                </span>
              </div>
              <div className="p-3 bg-zinc-100/5 border border-zinc-200/10 text-zinc-300">
                <Cake className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Seção Acadêmica e Treino do Dia (Mockup/Visual) */}
          <div className="card-premium space-y-5">
            <div className="flex items-center justify-between border-b border-obsidian-800 pb-3">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-zinc-400" />
                Métricas de Progressão & Treinos do Dia
              </h3>
              <span className="text-[8px] bg-zinc-100/10 text-zinc-300 px-2 py-0.5 border border-zinc-200/10 uppercase tracking-wider font-bold">
                SFBJJ
              </span>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Estrutura de graduação baseada na consistência e refinamento técnico da flor-de-lis. Acompanhe a evolução de faixas e o cumprimento das regras do tatame.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-obsidian-950 p-4 border border-obsidian-800">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Instruções Técnicas</h4>
                  <p className="text-[11px] text-zinc-500 leading-normal">
                    Foco no desenvolvimento de guarda e transições para a montada nesta semana. Kimono oficial obrigatório em todos os treinos.
                  </p>
                </div>
                <div className="bg-obsidian-950 p-4 border border-obsidian-800">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Código de Conduta</h4>
                  <p className="text-[11px] text-zinc-500 leading-normal">
                    Respeito à hierarquia de faixas, unhas aparadas e pontualidade são premissas fundamentais da Sagrada Família BJJ.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* COLUNA DE ATIVIDADES E AVISOS (1/3 de largura) - PAINEL DIREITO */}
        <div className="space-y-6 lg:border-l lg:border-obsidian-850 lg:pl-6">

          {/* Quadro de Comunicados */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-obsidian-800 pb-3">
              <h2 className="text-xs font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-zinc-400" />
                Atividades & Avisos
              </h2>
              <button
                onClick={() => {
                  if (showAddNotice) {
                    handleCancelNoticeForm();
                  } else {
                    setShowAddNotice(true);
                  }
                }}
                className="btn-gold text-[9px] uppercase font-bold tracking-widest px-2.5 py-1.5"
              >
                <Plus className="w-3 h-3" />
                {showAddNotice ? 'Fechar' : 'Criar'}
              </button>
            </div>

            {/* Add Notice Panel */}
            {showAddNotice && (
              <form onSubmit={handleAddNotice} className="bg-obsidian-900 border border-obsidian-800 p-4 space-y-3">
                <h3 className="text-[10px] font-bold text-zinc-350 uppercase tracking-widest">
                  {editingNotice ? 'Editar Comunicado' : 'Novo Comunicado'}
                </h3>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Título</label>
                  <input
                    type="text"
                    value={newNoticeTitle}
                    onChange={(e) => setNewNoticeTitle(e.target.value)}
                    placeholder="Ex: Novo Horário"
                    className="input-premium py-1.5 text-xs"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Conteúdo</label>
                  <textarea
                    value={newNoticeContent}
                    onChange={(e) => setNewNoticeContent(e.target.value)}
                    placeholder="Detalhes..."
                    className="input-premium h-20 resize-none py-1.5 text-xs"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Data do Comunicado</label>
                  <input
                    type="date"
                    value={newNoticeDate}
                    onChange={(e) => setNewNoticeDate(e.target.value)}
                    className="input-premium py-1.5 text-xs text-zinc-300 bg-obsidian-950 border border-obsidian-850"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="noticePinned"
                    checked={newNoticePinned}
                    onChange={(e) => setNewNoticePinned(e.target.checked)}
                    className="border-obsidian-800 bg-obsidian-950 text-zinc-200 focus:ring-0 w-3.5 h-3.5 rounded-none"
                  />
                  <label htmlFor="noticePinned" className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1 select-none">
                    <Pin className="w-3 h-3 text-zinc-400" /> Fixar no topo
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-1.5">
                  <button
                    type="button"
                    onClick={handleCancelNoticeForm}
                    className="btn-obsidian text-[9px] uppercase font-bold tracking-widest px-3 py-1.5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-gold text-[9px] uppercase font-bold tracking-widest px-3 py-1.5"
                  >
                    {editingNotice ? 'Salvar' : 'Publicar'}
                  </button>
                </div>
              </form>
            )}



            {/* Notices List */}
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {sortedAnnouncements.length === 0 ? (
                <div className="text-center py-8 text-zinc-650 text-[10px] uppercase font-bold">
                  Sem comunicados ativos.
                </div>
              ) : (
                sortedAnnouncements.map((ann) => (
                  <div
                    key={ann.id}
                    className={`p-4 bg-obsidian-900 border transition-all duration-200 relative ${ann.fixado
                      ? 'border-zinc-500/30'
                      : 'border-obsidian-800'
                      }`}
                  >
                    {ann.fixado && (
                      <div className="absolute top-3 right-3 text-zinc-400 flex items-center gap-0.5 text-[8px] uppercase font-bold tracking-widest bg-zinc-150/10 px-2 py-0.5 border border-zinc-200/10">
                        <Pin className="w-2.5 h-2.5 fill-zinc-400" />
                        Fixado
                      </div>
                    )}

                    <div className="pr-12">
                      <h3 className="font-bold text-xs text-zinc-200 leading-tight">
                        {ann.titulo}
                      </h3>
                      <p className="text-[8px] font-mono text-zinc-500 mt-0.5">
                        {ann.data.split('-').reverse().join('/')}
                      </p>
                      <p className="text-zinc-400 text-[11px] mt-2 whitespace-pre-line leading-relaxed">
                        {ann.conteudo}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-obsidian-850 flex justify-end gap-3">
                      <button
                        onClick={() => handleEditNoticeClick(ann)}
                        className="text-zinc-400 hover:text-zinc-200 text-[9px] uppercase font-bold tracking-wider flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteNotice(ann.id)}
                        className="text-red-400/80 hover:text-red-400 text-[9px] uppercase font-bold tracking-wider flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Excluir
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Aniversariantes do Mês */}
          <div className="bg-obsidian-900/60 p-4 border border-obsidian-800">
            <h2 className="text-xs uppercase font-black tracking-widest text-zinc-300 flex items-center gap-2 border-b border-obsidian-800 pb-3 mb-3">
              <Cake className="w-4 h-4 text-zinc-400" />
              Aniversários do Mês
            </h2>

            {upcomingBirthdayStudents.length === 0 ? (
              <p className="text-[10px] uppercase font-bold text-zinc-600 text-center py-4">
                Nenhum ciclo este mês.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {upcomingBirthdayStudents
                  .sort((a, b) => {
                    const diaA = parseInt(a.dataNascimento.split('-')[2], 10);
                    const diaB = parseInt(b.dataNascimento.split('-')[2], 10);
                    return diaA - diaB;
                  })
                  .map((student) => {
                    const day = student.dataNascimento.split('-')[2];
                    const isToday = parseInt(day, 10) === currentDayNum;
                    return (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-2 bg-obsidian-950 border border-obsidian-900"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Foto de Perfil */}
                          <div className="w-7 h-7 rounded-full overflow-hidden border border-obsidian-800 bg-obsidian-900 flex items-center justify-center text-xs select-none shrink-0">
                            {student.fotoPerfil ? (
                              student.fotoPerfil.length <= 2 ? (
                                <span>{student.fotoPerfil}</span>
                              ) : (
                                <img src={student.fotoPerfil} alt={student.nome} className="w-full h-full object-cover" />
                              )
                            ) : (
                              <span className="text-zinc-650 text-[10px]">🥋</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-[11px] block text-zinc-300 truncate max-w-[110px]">
                              {student.nome}
                            </span>
                            <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5 block">
                              Faixa {student.faixa}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border ${isToday
                            ? 'text-zinc-950 bg-zinc-100 border-zinc-200 animate-pulse'
                            : 'text-zinc-400 bg-zinc-100/5 border-zinc-200/10'
                          }`}>
                          Dia {day}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
