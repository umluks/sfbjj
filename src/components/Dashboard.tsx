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
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
          Olá, {loggedUser?.nome || 'Administrador'} 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Visão geral e avisos da academia Sagrada Família BJJ.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Students */}
        <div className="card-premium bg-gradient-to-br from-obsidian-800 to-obsidian-850 flex items-center justify-between border-l-4 border-l-emerald-500">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Alunos Ativos
            </span>
            <span className="text-4xl font-black text-slate-100 mt-2 block">
              {totalActive}
            </span>
            <span className="text-xs text-emerald-400 font-medium mt-1 inline-flex items-center gap-1">
              • Acesso Liberado
            </span>
          </div>
          <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500">
            <Users className="w-8 h-8" />
          </div>
        </div>

        {/* Birthdays of the Month */}
        <div className="card-premium bg-gradient-to-br from-obsidian-800 to-obsidian-850 flex items-center justify-between border-l-4 border-l-gold-500">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Aniversariantes do Mês
            </span>
            <span className="text-4xl font-black text-slate-100 mt-2 block">
              {allMonthBirthdayStudents.length}
            </span>
            <span className="text-xs text-gold-400 font-medium mt-1 inline-flex items-center gap-1">
              • Comemorações em {new Date().toLocaleString('pt-BR', { month: 'long' }).replace(/^\w/, (c) => c.toUpperCase())} 🎂
            </span>
          </div>
          <div className="p-4 bg-gold-500/10 rounded-2xl text-gold-500">
            <Cake className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Announcements/Avisos Section (Left/Middle) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-gold-500" />
              Quadro de Avisos Geral
            </h2>
            <button
              onClick={() => setShowAddNotice(!showAddNotice)}
              className="btn-gold text-xs px-3 py-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              {showAddNotice ? 'Fechar' : 'Novo Aviso'}
            </button>
          </div>

          {/* Add Notice Panel */}
          {showAddNotice && (
            <form onSubmit={handleAddNotice} className="card-premium bg-obsidian-850 border border-obsidian-700/80 p-5 space-y-4">
              <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider">Criar Novo Comunicado</h3>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Título do Aviso</label>
                <input
                  type="text"
                  value={newNoticeTitle}
                  onChange={(e) => setNewNoticeTitle(e.target.value)}
                  placeholder="Ex: Novo Horário de Sábado"
                  className="input-premium"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Conteúdo do Aviso</label>
                <textarea
                  value={newNoticeContent}
                  onChange={(e) => setNewNoticeContent(e.target.value)}
                  placeholder="Descreva os detalhes do comunicado..."
                  className="input-premium h-24 resize-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="noticePinned"
                  checked={newNoticePinned}
                  onChange={(e) => setNewNoticePinned(e.target.checked)}
                  className="rounded border-obsidian-700 bg-obsidian-950 text-gold-500 focus:ring-gold-500 w-4 h-4"
                />
                <label htmlFor="noticePinned" className="text-xs text-slate-300 cursor-pointer flex items-center gap-1 select-none">
                  <Pin className="w-3 h-3 text-gold-500" /> Fixar aviso no topo
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddNotice(false)}
                  className="btn-obsidian text-xs px-3 py-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-gold text-xs px-4 py-2"
                >
                  Publicar Aviso
                </button>
              </div>
            </form>
          )}

          {/* Notices List */}
          <div className="space-y-4">
            {sortedAnnouncements.length === 0 ? (
              <div className="card-premium text-center py-10 text-slate-500">
                Sem avisos ativos no momento.
              </div>
            ) : (
              sortedAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  className={`card-premium relative transition-all duration-300 ${ann.fixado
                    ? 'border border-gold-500/30 bg-gradient-to-r from-obsidian-800 to-gold-950/5'
                    : 'bg-obsidian-800/60'
                    }`}
                >
                  {ann.fixado && (
                    <div className="absolute top-4 right-4 text-gold-500 flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider bg-gold-500/10 px-2 py-0.5 rounded-full">
                      <Pin className="w-3 h-3 fill-gold-500" />
                      Fixado
                    </div>
                  )}

                  <div className="pr-16">
                    <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                      {ann.titulo}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Publicado em {ann.data.split('-').reverse().join('/')}
                    </p>
                    <p className="text-slate-300 text-sm mt-3 whitespace-pre-line leading-relaxed">
                      {ann.conteudo}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-obsidian-750 flex justify-end">
                    <button
                      onClick={() => handleDeleteNotice(ann.id)}
                      className="text-red-500/70 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-all text-xs flex items-center gap-1"
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
          <div className="card-premium bg-gradient-to-b from-obsidian-800 to-obsidian-850">
            <h2 className="text-md font-bold text-slate-100 flex items-center gap-2 border-b border-obsidian-750 pb-3 mb-4">
              <Cake className="w-4 h-4 text-gold-500 animate-bounce" />
              Aniversariantes ({new Date().toLocaleString('pt-BR', { month: 'long' }).replace(/^\w/, (c) => c.toUpperCase())})
            </h2>

            {upcomingBirthdayStudents.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">
                Nenhum aluno faz aniversário este mês.
              </p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
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
                        className="flex items-center justify-between p-2 rounded-lg bg-obsidian-900/60 border border-obsidian-750 hover:border-gold-500/10 transition-colors"
                      >
                        <div>
                          <span className="font-semibold text-sm block text-slate-200 truncate max-w-[150px]">
                            {student.nome}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Faixa {student.faixa}
                          </span>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                          isToday 
                            ? 'text-white bg-yellow-500 animate-pulse' 
                            : 'text-gold-500 bg-gold-500/10'
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
          <div className="card-premium bg-obsidian-800/40 border border-obsidian-750">
            <h2 className="text-md font-bold text-slate-100 flex items-center gap-2 border-b border-obsidian-750 pb-3 mb-3">
              <CalendarCheck className="w-4 h-4 text-gold-500" />
              Regras do Tatame
            </h2>
            <ul className="text-xs text-slate-400 space-y-2.5 list-disc list-inside">
              <li>Cumprimente ao entrar e sair e os parceiros por ordem de faixa.</li>
              <li>Peça permissão ao professor antes de entrar ou sair.</li>
              <li>Mantenha o kimono limpo, amarrado e em bom estado.</li>
              <li>Use rash guard ou camiseta por baixo do kimono.</li>
              <li>Mantenha unhas aparadas e retire acessórios.</li>
              <li>Retire o calçado antes de entrar e não ande descalço fora do tatame.</li>
              <li>Evite palavrões e gestos obscenos.</li>
              <li>Não se vanglorie ao finalizar um colega.</li>
              <li>Siga as instruções do professor. Treine sempre.</li>
              <li>Trabalhe suas deficiências e busque evolução.</li>
            </ul>

          </div>
        </div>

      </div>
    </div>
  );
};
