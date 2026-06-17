import React, { useState } from 'react';
import type {
  Aluno,
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
  CalendarCheck
} from 'lucide-react';

interface DashboardProps {
  students: Aluno[];
  announcements: Aviso[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Aviso[]>>;
  loggedUser: LoggedUser | null;
}

export const Dashboard: React.FC<DashboardProps> = ({
  students,
  announcements,
  setAnnouncements,
  loggedUser
}) => {
  const [showAddNotice, setShowAddNotice] = useState(false);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticePinned, setNewNoticePinned] = useState(false);

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

  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeContent.trim()) return;

    const newAnnouncement: Aviso = {
      id: Date.now(),
      titulo: newNoticeTitle,
      conteudo: newNoticeContent,
      data: new Date().toISOString().split('T')[0],
      fixado: newNoticePinned
    };

    setAnnouncements(prev => [newAnnouncement, ...prev]);
    setNewNoticeTitle('');
    setNewNoticeContent('');
    setNewNoticePinned(false);
    setShowAddNotice(false);
  };

  const handleDeleteNotice = (id: number) => {
    setAnnouncements(prev => prev.filter(ann => ann.id !== id));
  };

  // Ordena os anúncios para mostrar os fixados primeiro
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.fixado && !b.fixado) return -1;
    if (!a.fixado && b.fixado) return 1;
    return new Date(b.data).getTime() - new Date(a.data).getTime();
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">
            Olá, {loggedUser?.nome || 'Administrador'} 👋
          </h1>
          <p className="text-slate-450 text-xs mt-1">
            Visão geral e avisos da academia Sagrada Família BJJ.
          </p>
        </div>
        <div className="text-slate-500 text-[10px] font-bold font-mono tracking-wider bg-obsidian-950/80 border border-obsidian-900 px-3.5 py-1.5 rounded-lg">
          {todayDate.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Students */}
        <div className="card-premium flex items-center justify-between border-l-2 border-l-emerald-500/80 bg-obsidian-900/40">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
              Alunos Ativos
            </span>
            <span className="text-3xl font-black text-slate-100 mt-2 block tracking-tight">
              {totalActive}
            </span>
            <span className="text-[10px] text-emerald-450 font-bold mt-1.5 inline-flex items-center gap-1">
              • Acesso Liberado
            </span>
          </div>
          <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Birthdays of the Month */}
        <div className="card-premium flex items-center justify-between border-l-2 border-l-slate-400 bg-obsidian-900/40">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
              Aniversariantes do Mês
            </span>
            <span className="text-3xl font-black text-slate-100 mt-2 block tracking-tight">
              {allMonthBirthdayStudents.length}
            </span>
            <span className="text-[10px] text-slate-400 font-bold mt-1.5 inline-flex items-center gap-1">
              • Comemorações em {new Date().toLocaleString('pt-BR', { month: 'long' }).replace(/^\w/, (c) => c.toUpperCase())} 🎂
            </span>
          </div>
          <div className="p-3.5 bg-slate-100/5 border border-slate-200/10 rounded-xl text-slate-350">
            <Cake className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Announcements/Avisos Section (Left/Middle) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Megaphone className="w-4.5 h-4.5 text-slate-400" />
              Quadro de Avisos Geral
            </h2>
            <button
              onClick={() => setShowAddNotice(!showAddNotice)}
              className="btn-gold text-[10px] uppercase font-black tracking-widest px-3.5 py-2"
            >
              <Plus className="w-3 h-3" />
              {showAddNotice ? 'Fechar' : 'Novo Aviso'}
            </button>
          </div>

          {/* Add Notice Panel */}
          {showAddNotice && (
            <form onSubmit={handleAddNotice} className="card-premium bg-obsidian-900/80 border border-obsidian-850 p-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-350 uppercase tracking-widest">Criar Novo Comunicado</h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Título do Aviso</label>
                <input
                  type="text"
                  value={newNoticeTitle}
                  onChange={(e) => setNewNoticeTitle(e.target.value)}
                  placeholder="Ex: Novo Horário de Sábado"
                  className="input-premium"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Conteúdo do Aviso</label>
                <textarea
                  value={newNoticeContent}
                  onChange={(e) => setNewNoticeContent(e.target.value)}
                  placeholder="Descreva os detalhes do comunicado..."
                  className="input-premium h-28 resize-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="noticePinned"
                  checked={newNoticePinned}
                  onChange={(e) => setNewNoticePinned(e.target.checked)}
                  className="rounded border-obsidian-800 bg-obsidian-950 text-slate-200 focus:ring-slate-300 w-4 h-4"
                />
                <label htmlFor="noticePinned" className="text-[10px] text-slate-400 font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1 select-none">
                  <Pin className="w-3 h-3 text-slate-400" /> Fixar aviso no topo
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddNotice(false)}
                  className="btn-obsidian text-[10px] uppercase font-black tracking-widest px-4 py-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-gold text-[10px] uppercase font-black tracking-widest px-4 py-2"
                >
                  Publicar Aviso
                </button>
              </div>
            </form>
          )}

          {/* Notices List */}
          <div className="space-y-4">
            {sortedAnnouncements.length === 0 ? (
              <div className="card-premium text-center py-12 text-slate-500 text-xs font-semibold">
                Sem avisos ativos no momento.
              </div>
            ) : (
              sortedAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  className={`card-premium relative transition-all duration-300 bg-obsidian-900/30 ${ann.fixado
                    ? 'border-l-2 border-l-slate-400'
                    : 'border border-obsidian-800/40'
                    }`}
                >
                  {ann.fixado && (
                    <div className="absolute top-4 right-4 text-slate-300 flex items-center gap-1 text-[8px] uppercase font-black tracking-widest bg-slate-100/10 px-2 py-0.5 rounded-full border border-slate-200/10">
                      <Pin className="w-2.5 h-2.5 fill-slate-300" />
                      Fixado
                    </div>
                  )}

                  <div className="pr-16">
                    <h3 className="font-bold text-base text-slate-200 flex items-center gap-2 leading-tight">
                      {ann.titulo}
                    </h3>
                    <p className="text-[9px] font-mono text-slate-500 mt-1">
                      Publicado em {ann.data.split('-').reverse().join('/')}
                    </p>
                    <p className="text-slate-350 text-xs mt-3.5 whitespace-pre-line leading-relaxed">
                      {ann.conteudo}
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-obsidian-850 flex justify-end">
                    <button
                      onClick={() => handleDeleteNotice(ann.id)}
                      className="text-red-500/70 hover:text-red-400 hover:bg-red-500/5 px-2.5 py-1.5 rounded-lg transition-all text-[10px] uppercase font-bold tracking-wider flex items-center gap-1"
                      title="Deletar aviso"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Birthdays Section & Team Info (Right Side) */}
        <div className="space-y-6">
          {/* Birthday List */}
          <div className="card-premium bg-obsidian-900/40">
            <h2 className="text-xs uppercase font-black tracking-widest text-slate-350 flex items-center gap-2 border-b border-obsidian-850 pb-3 mb-4">
              <Cake className="w-4 h-4 text-slate-400 animate-bounce" />
              Aniversariantes ({new Date().toLocaleString('pt-BR', { month: 'long' }).replace(/^\w/, (c) => c.toUpperCase())})
            </h2>

            {upcomingBirthdayStudents.length === 0 ? (
              <p className="text-xs text-slate-550 text-center py-4">
                Nenhum aluno faz aniversário este mês.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
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
                        className="flex items-center justify-between p-2.5 rounded-lg bg-obsidian-950/60 border border-obsidian-900 hover:border-slate-200/10 transition-colors"
                      >
                        <div>
                          <span className="font-bold text-xs block text-slate-200 truncate max-w-[140px]">
                            {student.nome}
                          </span>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 block">
                            Faixa {student.faixa}
                          </span>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded flex items-center gap-1 ${
                          isToday 
                            ? 'text-white bg-yellow-500 animate-pulse' 
                            : 'text-slate-300 bg-slate-100/5 border border-slate-200/10'
                        }`}>
                          Dia {day}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Quick Info / Belt Rules Panel */}
          <div className="card-premium bg-obsidian-900/40">
            <h2 className="text-xs uppercase font-black tracking-widest text-slate-350 flex items-center gap-2 border-b border-obsidian-850 pb-3 mb-3">
              <CalendarCheck className="w-4 h-4 text-slate-400" />
              Regras do Tatame
            </h2>
            <ul className="text-[11px] text-slate-450 space-y-2.5 list-none">
              <li className="flex items-start gap-1.5"><span className="text-slate-500 shrink-0 mt-0.5">•</span><span>Cumprimente ao entrar e sair e os parceiros por ordem de faixa.</span></li>
              <li className="flex items-start gap-1.5"><span className="text-slate-500 shrink-0 mt-0.5">•</span><span>Peça permissão ao professor antes de entrar ou sair.</span></li>
              <li className="flex items-start gap-1.5"><span className="text-slate-500 shrink-0 mt-0.5">•</span><span>Mantenha o kimono limpo, amarrado e em bom estado.</span></li>
              <li className="flex items-start gap-1.5"><span className="text-slate-500 shrink-0 mt-0.5">•</span><span>Use rash guard ou camiseta por baixo do kimono.</span></li>
              <li className="flex items-start gap-1.5"><span className="text-slate-500 shrink-0 mt-0.5">•</span><span>Mantenha unhas aparadas e retire acessórios.</span></li>
              <li className="flex items-start gap-1.5"><span className="text-slate-500 shrink-0 mt-0.5">•</span><span>Retire o calçado antes de entrar e não ande descalço fora do tatame.</span></li>
              <li className="flex items-start gap-1.5"><span className="text-slate-500 shrink-0 mt-0.5">•</span><span>Evite palavrões e gestos obscenos.</span></li>
              <li className="flex items-start gap-1.5"><span className="text-slate-500 shrink-0 mt-0.5">•</span><span>Não se vanglorie ao finalizar um colega.</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
