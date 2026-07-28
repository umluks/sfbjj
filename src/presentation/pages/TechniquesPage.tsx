import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/application/hooks/useAuth';
import { techniqueService } from '@/application/services/techniqueService';
import { studentService } from '@/application/services/studentService';
import { notificationService } from '@/application/services/notificationService';
import type { Technique } from '@/domain/models/technique';
import type { Aluno } from '@/domain/models/student';
import type { AppNotification } from '@/domain/models/notification';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Loader2,
  AlertCircle,
  Video,
  X,
  Check,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Bell,
  Send
} from 'lucide-react';

export const TechniquesPage: React.FC = () => {
  const { loggedUser } = useAuth();
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [studentInfo, setStudentInfo] = useState<Aluno | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados dos Filtros
  const [selectedClassificacao, setSelectedClassificacao] = useState<string>('Todas');
  const [selectedStatusTab, setSelectedStatusTab] = useState<'aprovado' | 'pendente' | 'minhas'>('aprovado');

  // Estados do Modal de Cadastro/Edição/Sugestão
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTechnique, setEditingTechnique] = useState<Technique | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoria: 'Geral' as 'Kids' | 'Adulto' | 'Geral',
    classificacao: 'Outros' as 'Guarda' | 'Passagem' | 'Raspagem' | 'Finalização' | 'Queda' | 'Defesa' | 'Outros',
    video_url: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Estado do Modal de Rejeição (para Admins)
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [techniqueToReject, setTechniqueToReject] = useState<Technique | null>(null);
  const [rejectionFeedback, setRejectionFeedback] = useState('');
  const [validating, setValidating] = useState(false);

  const isEditor = loggedUser?.role === 'admin' || loggedUser?.role === 'teacher';

  const filterOptions = ['Todas', 'Guarda', 'Passagem', 'Raspagem', 'Finalização', 'Queda', 'Defesa', 'Outros'];

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Carrega todas as técnicas do banco
      const list = await techniqueService.getTechniques('todos');
      setTechniques(list);

      // 2. Se for aluno, carrega informações da turma e notificações
      if (loggedUser?.role === 'student' && loggedUser.alunoId) {
        const stud = await studentService.getStudentById(loggedUser.alunoId);
        setStudentInfo(stud);

        try {
          const notifs = await notificationService.getNotificationsByStudent(loggedUser.alunoId);
          setNotifications(notifs);
        } catch (notifErr) {
          console.warn('Erro ao carregar notificações do aluno:', notifErr);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar dados da página.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [loggedUser]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  // Contadores para abas
  const pendingCount = useMemo(() => {
    return techniques.filter(t => t.status === 'pendente').length;
  }, [techniques]);

  const mySuggestionsCount = useMemo(() => {
    if (!loggedUser?.alunoId) return 0;
    return techniques.filter(t => t.aluno_id === loggedUser.alunoId).length;
  }, [techniques, loggedUser]);

  // Notificações não lidas do aluno
  const unreadNotifications = useMemo(() => {
    return notifications.filter(n => !n.lida);
  }, [notifications]);

  const handleMarkNotificationRead = async (id: number) => {
    if (!loggedUser?.alunoId) return;
    try {
      await notificationService.markAsRead(id, loggedUser.alunoId);
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, lida: true } : n)));
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err);
    }
  };

  // Filtra as técnicas com base na aba, perfil do aluno e classificação selecionada
  const filteredTechniques = useMemo(() => {
    let list = techniques;

    // 1. Filtragem por Aba principal (Aprovadas, Pendentes ou Minhas Sugestões)
    if (selectedStatusTab === 'aprovado') {
      list = list.filter(t => t.status === 'aprovado' || !t.status);
      
      // Filtro por turma do aluno se não for editor
      if (!isEditor) {
        if (studentInfo) {
          const turma = studentInfo.turma; // 'Kids' | 'Adulto'
          list = list.filter(t => t.categoria === 'Geral' || t.categoria === turma);
        } else {
          list = list.filter(t => t.categoria === 'Geral');
        }
      }
    } else if (selectedStatusTab === 'pendente') {
      // Admins e professores visualizam todas as pendentes
      list = list.filter(t => t.status === 'pendente');
    } else if (selectedStatusTab === 'minhas') {
      // Aluno visualiza todas as suas sugestões (pendentes, aprovadas e rejeitadas)
      if (loggedUser?.alunoId) {
        list = list.filter(t => t.aluno_id === loggedUser.alunoId);
      } else {
        list = [];
      }
    }

    // 2. Filtro por tipo de posição selecionado (Guarda, Passagem, etc)
    if (selectedClassificacao !== 'Todas') {
      list = list.filter(t => t.classificacao === selectedClassificacao);
    }

    return list;
  }, [techniques, studentInfo, isEditor, selectedClassificacao, selectedStatusTab, loggedUser]);

  // Utilitário para embed de YouTube
  const getYoutubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null;
  };

  const handleOpenCreateModal = () => {
    setEditingTechnique(null);
    setFormData({
      titulo: '',
      descricao: '',
      categoria: isEditor ? 'Geral' : (studentInfo?.turma || 'Adulto'),
      classificacao: 'Outros',
      video_url: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tech: Technique) => {
    setEditingTechnique(tech);
    setFormData({
      titulo: tech.titulo,
      descricao: tech.descricao || '',
      categoria: tech.categoria,
      classificacao: tech.classificacao || 'Outros',
      video_url: tech.video_url || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta técnica?')) return;

    try {
      setLoading(true);
      await techniqueService.deleteTechnique(id);
      setTechniques(prev => prev.filter(t => t.id !== id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao deletar técnica.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo.trim()) {
      alert('Por favor, informe o título da posição.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingTechnique) {
        // Atualização
        const isStudentEdit = !isEditor && loggedUser?.role === 'student';
        const updatedPayload: Partial<Technique> = {
          ...formData,
          ...(isStudentEdit ? { status: 'pendente' as const } : {})
        };
        await techniqueService.updateTechnique(editingTechnique.id, updatedPayload);
        setTechniques(prev =>
          prev.map(t => (t.id === editingTechnique.id ? { ...t, ...updatedPayload } : t))
        );
        if (isStudentEdit) {
          alert('Sua posição foi atualizada e reenviada para análise da administração!');
        }
      } else {
        // Criação ou Sugestão
        const isStudentSubmit = !isEditor && loggedUser?.role === 'student';
        const payload: Omit<Technique, 'id' | 'created_at'> = {
          ...formData,
          status: isStudentSubmit ? 'pendente' : 'aprovado',
          aluno_id: isStudentSubmit ? loggedUser.alunoId : undefined,
          aluno_nome: isStudentSubmit ? (studentInfo?.nome || loggedUser.nome) : undefined
        };

        const newTech = await techniqueService.createTechnique(payload);
        setTechniques(prev => [newTech, ...prev]);

        if (isStudentSubmit) {
          alert('Sua sugestão de posição foi enviada com sucesso! Ela passará pela validação do professor/administrador.');
          setSelectedStatusTab('minhas');
        }
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar técnica.';
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Lógica de Validação pelo ADM (Aprovar / Rejeitar)
  const handleApproveTechnique = async (tech: Technique) => {
    if (!window.confirm(`Deseja aprovar e publicar a posição "${tech.titulo}"?`)) return;

    try {
      setValidating(true);
      const updated = await techniqueService.validateTechnique(
        tech.id,
        'aprovado',
        '',
        loggedUser?.nome || 'Administrador'
      );

      setTechniques(prev => prev.map(t => (t.id === tech.id ? updated : t)));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao aprovar posição.';
      alert(msg);
    } finally {
      setValidating(false);
    }
  };

  const handleOpenRejectModal = (tech: Technique) => {
    setTechniqueToReject(tech);
    setRejectionFeedback('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!techniqueToReject) return;

    try {
      setValidating(true);
      const updated = await techniqueService.validateTechnique(
        techniqueToReject.id,
        'rejeitado',
        rejectionFeedback.trim(),
        loggedUser?.nome || 'Administrador'
      );

      setTechniques(prev => prev.map(t => (t.id === techniqueToReject.id ? updated : t)));
      setRejectModalOpen(false);
      setTechniqueToReject(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao rejeitar posição.';
      alert(msg);
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl w-full max-w-full min-w-0 mx-auto p-3 sm:p-4 md:p-6 animate-fade-in text-left overflow-x-hidden">
      {/* Header Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-obsidian-850 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-100 uppercase tracking-widest flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-zinc-400" />
            Biblioteca de Posições
          </h1>
          <p className="text-xs text-slate-450 font-medium mt-1.5">
            {isEditor
              ? 'Gerencie o acervo de posições da academia e valide as sugestões enviadas pelos alunos.'
              : `Acervo de posições e técnicas de treino recomendadas para a categoria ${studentInfo?.turma || 'Geral'}.`}
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-white text-obsidian-950 text-xs font-black uppercase tracking-wider rounded-none transition-all shrink-0 shadow-md"
        >
          {isEditor ? <Plus className="w-4 h-4" /> : <Send className="w-4 h-4 text-emerald-700" />}
          {isEditor ? 'Nova Posição' : 'Sugerir Posição'}
        </button>
      </div>

      {/* Banner de Notificação para Alunos */}
      {!isEditor && unreadNotifications.length > 0 && (
        <div className="space-y-2">
          {unreadNotifications.map(n => (
            <div
              key={n.id}
              className={`p-4 border rounded-none flex items-start justify-between gap-4 animate-scale-up ${
                n.tipo === 'posicao_aprovada'
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-950/30 border-red-500/30 text-red-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 shrink-0 mt-0.5 text-zinc-400" />
                <div className="space-y-1 text-xs">
                  <span className="font-black uppercase tracking-wider block text-slate-100">{n.titulo}</span>
                  <p className="leading-relaxed opacity-90">{n.mensagem}</p>
                </div>
              </div>
              <button
                onClick={() => handleMarkNotificationRead(n.id)}
                className="text-[10px] uppercase font-bold text-zinc-400 hover:text-white underline shrink-0"
              >
                Ciente
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Abas Principais (Publicadas vs Pendentes vs Minhas Sugestões) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-obsidian-850 pb-3">
        <button
          onClick={() => setSelectedStatusTab('aprovado')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
            selectedStatusTab === 'aprovado'
              ? 'border-zinc-200 text-slate-100 bg-obsidian-900/60'
              : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-obsidian-950'
          }`}
        >
          Posições Publicadas
        </button>

        {isEditor && (
          <button
            onClick={() => setSelectedStatusTab('pendente')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
              selectedStatusTab === 'pendente'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-obsidian-950'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Pendentes de Validação
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.5 text-[9px] font-black bg-amber-500 text-obsidian-950 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        )}

        {!isEditor && loggedUser?.role === 'student' && (
          <button
            onClick={() => setSelectedStatusTab('minhas')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
              selectedStatusTab === 'minhas'
                ? 'border-sky-400 text-sky-300 bg-sky-500/10'
                : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-obsidian-950'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Minhas Sugestões
            {mySuggestionsCount > 0 && (
              <span className="px-1.5 py-0.5 text-[9px] font-black bg-sky-500 text-obsidian-950 rounded-full">
                {mySuggestionsCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Barra de Filtros de Classificação (Guarda, Passagem, etc) */}
      <div className="flex flex-col gap-3.5 bg-obsidian-950 p-4 border border-obsidian-850/80">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" />
          Filtrar Tipo de Posição
        </span>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map(opt => (
            <button
              key={opt}
              onClick={() => setSelectedClassificacao(opt)}
              className={`px-3 py-1.5 text-[9.5px] font-black uppercase tracking-wider border rounded-none transition-all ${
                selectedClassificacao === opt
                  ? 'bg-zinc-100 border-zinc-100 text-obsidian-950'
                  : 'bg-obsidian-900 border-obsidian-800 text-zinc-400 hover:text-slate-200 hover:border-obsidian-700'
              }`}
            >
              {opt === 'Todas' ? 'Todas as Posições' : opt === 'Passagem' ? 'Passagem de Guarda' : opt}
            </button>
          ))}
        </div>
      </div>

      {/* Alerta de erro */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-950/20 border border-red-900/30 text-red-400 rounded-none text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-bold">Ocorreu um erro</p>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && techniques.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
          <span className="text-xs font-bold uppercase tracking-wider">Carregando biblioteca de posições...</span>
        </div>
      ) : filteredTechniques.length === 0 ? (
        <div className="card-premium p-12 text-center text-slate-500 text-xs italic">
          {selectedStatusTab === 'pendente'
            ? 'Nenhuma posição pendente de validação no momento.'
            : selectedStatusTab === 'minhas'
            ? 'Você ainda não enviou sugestões de posições.'
            : 'Nenhuma técnica cadastrada correspondente aos filtros selecionados.'}
        </div>
      ) : (
        /* Lista de Posições */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTechniques.map(tech => {
            const embedUrl = getYoutubeEmbedUrl(tech.video_url);

            return (
              <div key={tech.id} className="card-premium flex flex-col justify-between overflow-hidden relative">
                {/* Badges de Status de Validação */}
                {tech.status === 'pendente' && (
                  <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-amber-400 text-[10px] font-black uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Pendente de Validação pelo ADM
                    </span>
                    {tech.aluno_nome && <span>Enviado por: {tech.aluno_nome}</span>}
                  </div>
                )}

                {tech.status === 'rejeitado' && (
                  <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2 flex flex-col gap-1 text-red-400 text-[10px]">
                    <div className="flex items-center justify-between font-black uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5" />
                        Não Aprovada
                      </span>
                      {tech.validado_por && <span>Avaliado por: {tech.validado_por}</span>}
                    </div>
                    {tech.feedback_admin && (
                      <p className="normal-case text-[11px] text-red-300/90 font-medium italic mt-0.5">
                        "{tech.feedback_admin}"
                      </p>
                    )}
                  </div>
                )}

                <div className="p-6 space-y-4">
                  {/* Topo do card: título + tags + ações */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          tech.categoria === 'Kids'
                            ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                            : tech.categoria === 'Adulto'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                        }`}>
                          {tech.categoria}
                        </span>
                        <span className="inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-obsidian-900 text-zinc-400 border border-obsidian-800">
                          {tech.classificacao === 'Passagem' ? 'Passagem de Guarda' : tech.classificacao}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-slate-200 uppercase tracking-wide">
                        {tech.titulo}
                      </h3>
                    </div>

                    {(isEditor || (loggedUser?.role === 'student' && loggedUser?.alunoId && tech.aluno_id === loggedUser.alunoId)) && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleOpenEditModal(tech)}
                          title="Editar posição"
                          className="p-1.5 rounded bg-obsidian-900 hover:bg-obsidian-850 border border-obsidian-800 text-zinc-400 hover:text-white transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tech.id)}
                          title="Excluir posição"
                          className="p-1.5 rounded bg-obsidian-900 hover:bg-red-950/20 border border-obsidian-800 hover:border-red-900/30 text-zinc-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Player de Vídeo ou Link */}
                  {tech.video_url && (
                    <div className="pt-2">
                      {embedUrl ? (
                        <div className="relative aspect-video w-full rounded border border-obsidian-800 overflow-hidden bg-obsidian-950">
                          <iframe
                            src={embedUrl}
                            title={`Vídeo demonstrativo: ${tech.titulo}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full border-0"
                          />
                        </div>
                      ) : (
                        <a
                          href={tech.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3.5 bg-obsidian-900 hover:bg-obsidian-850 border border-obsidian-800 rounded text-xs font-semibold text-zinc-350 hover:text-white transition-all group"
                        >
                          <span className="flex items-center gap-2">
                            <Video className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                            Assistir demonstração da técnica
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Ações de Validação pelo Administrador */}
                  {isEditor && tech.status === 'pendente' && (
                    <div className="pt-4 border-t border-obsidian-850 flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleOpenRejectModal(tech)}
                        disabled={validating}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/30 hover:bg-red-900/40 border border-red-900/50 text-red-300 text-xs font-bold uppercase rounded-none transition-all"
                      >
                        <XCircle className="w-4 h-4 text-red-400" />
                        Rejeitar Posição
                      </button>
                      <button
                        onClick={() => handleApproveTechnique(tech)}
                        disabled={validating}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase rounded-none transition-all shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Aprovar & Publicar
                      </button>
                    </div>
                  )}
                </div>

                {tech.created_at && (
                  <div className="px-6 py-3 border-t border-obsidian-900 bg-obsidian-950/30 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                    <span>{tech.aluno_nome ? `Sugerido por ${tech.aluno_nome}` : 'Lançado em'}</span>
                    <span>{new Date(tech.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Cadastro / Edição / Sugestão */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="card-premium w-full max-w-lg overflow-hidden animate-scale-up text-left">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-5 border-b border-obsidian-850">
              <h2 className="text-sm font-black text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <BookOpen className="w-4.5 h-4.5 text-zinc-500" />
                {editingTechnique ? 'Editar Posição' : isEditor ? 'Cadastrar Posição' : 'Sugerir Nova Posição'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isEditor && !editingTechnique && (
              <div className="bg-sky-950/20 border-b border-sky-900/30 p-4 text-sky-300 text-xs flex items-start gap-2.5">
                <MessageSquare className="w-4 h-4 shrink-0 mt-0.5 text-sky-400" />
                <p className="leading-relaxed">
                  Sua sugestão de posição será enviada para validação da equipe de instrução. Após a análise, você receberá uma notificação sobre a publicação.
                </p>
              </div>
            )}

            {/* Form Modal */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Título da Posição *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Passagem de Guarda Emborrachando"
                  className="w-full bg-obsidian-950/70 border border-obsidian-750 focus:border-slate-500 rounded px-3 py-2.5 text-xs text-slate-200 focus:outline-none transition-colors"
                  value={formData.titulo}
                  onChange={e => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Categoria/Turma *
                  </label>
                  <select
                    className="w-full bg-obsidian-950/70 border border-obsidian-750 focus:border-slate-500 rounded px-3 py-2.5 text-xs text-slate-200 focus:outline-none transition-colors"
                    value={formData.categoria}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        categoria: e.target.value as 'Kids' | 'Adulto' | 'Geral'
                      }))
                    }
                  >
                    <option value="Geral">Geral (Todos)</option>
                    <option value="Kids">Kids (Infantil)</option>
                    <option value="Adulto">Adulto</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Classificação da Posição *
                  </label>
                  <select
                    className="w-full bg-obsidian-950/70 border border-obsidian-750 focus:border-slate-500 rounded px-3 py-2.5 text-xs text-slate-200 focus:outline-none transition-colors"
                    value={formData.classificacao}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        classificacao: e.target.value as 'Guarda' | 'Passagem' | 'Raspagem' | 'Finalização' | 'Queda' | 'Defesa' | 'Outros'
                      }))
                    }
                  >
                    <option value="Guarda">Guarda</option>
                    <option value="Passagem">Passagem de Guarda</option>
                    <option value="Raspagem">Raspagem</option>
                    <option value="Finalização">Finalização</option>
                    <option value="Queda">Queda</option>
                    <option value="Defesa">Defesa</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  URL do Vídeo (YouTube/Outro)
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-obsidian-950/70 border border-obsidian-750 focus:border-slate-500 rounded px-3 py-2.5 text-xs text-slate-200 focus:outline-none transition-colors"
                  value={formData.video_url}
                  onChange={e => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                />
              </div>

              {/* Botões do Modal */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-obsidian-850 mt-5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-obsidian-750 hover:bg-obsidian-900 text-zinc-400 hover:text-white text-xs font-bold uppercase rounded-none transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-white text-obsidian-950 text-xs font-black uppercase rounded-none transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {isEditor ? 'Confirmar' : 'Enviar Sugestão'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Rejeição de Posição (para ADM) */}
      {rejectModalOpen && techniqueToReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="card-premium w-full max-w-md overflow-hidden animate-scale-up text-left">
            <div className="flex items-center justify-between p-5 border-b border-obsidian-850">
              <h2 className="text-sm font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
                <XCircle className="w-4.5 h-4.5" />
                Rejeitar Sugestão de Posição
              </h2>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="p-5 space-y-4">
              <div className="p-3 bg-obsidian-950 border border-obsidian-850 rounded text-xs space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-black">Posição Avaliada:</span>
                <p className="font-bold text-slate-200">{techniqueToReject.titulo}</p>
                {techniqueToReject.aluno_nome && (
                  <p className="text-[10px] text-zinc-400">Enviada por: {techniqueToReject.aluno_nome}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Motivo da Não Aprovação (Feedback ao Aluno)
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: O vídeo enviado possui baixa resolução ou a técnica já foi cadastrada previamente."
                  className="w-full bg-obsidian-950/70 border border-obsidian-750 focus:border-slate-500 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none transition-colors"
                  value={rejectionFeedback}
                  onChange={e => setRejectionFeedback(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-obsidian-850">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 border border-obsidian-750 hover:bg-obsidian-900 text-zinc-400 hover:text-white text-xs font-bold uppercase rounded-none transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={validating}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase rounded-none transition-all disabled:opacity-50"
                >
                  {validating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Confirmar Rejeição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechniquesPage;
