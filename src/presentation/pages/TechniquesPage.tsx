import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/application/hooks/useAuth';
import { techniqueService } from '@/application/services/techniqueService';
import { studentService } from '@/application/services/studentService';
import type { Technique } from '@/domain/models/technique';
import type { Aluno } from '@/domain/models/student';
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
  Filter
} from 'lucide-react';

export const TechniquesPage: React.FC = () => {
  const { loggedUser } = useAuth();
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [studentInfo, setStudentInfo] = useState<Aluno | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados dos Filtros
  const [selectedClassificacao, setSelectedClassificacao] = useState<string>('Todas');

  // Estados do Modal de Cadastro/Edição
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

  const isEditor = loggedUser?.role === 'admin' || loggedUser?.role === 'teacher';

  const filterOptions = ['Todas', 'Guarda', 'Passagem', 'Raspagem', 'Finalização', 'Queda', 'Defesa', 'Outros'];

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Carrega técnicas
      const list = await techniqueService.getTechniques();
      setTechniques(list);

      // 2. Se for aluno, carrega informações da turma
      if (loggedUser?.role === 'student' && loggedUser.alunoId) {
        const stud = await studentService.getStudentById(loggedUser.alunoId);
        setStudentInfo(stud);
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

  // Filtra as técnicas com base no perfil do aluno e classificação selecionada
  const filteredTechniques = useMemo(() => {
    let list = techniques;

    // Filtro por categoria do Aluno
    if (!isEditor) {
      if (studentInfo) {
        const turma = studentInfo.turma; // 'Kids' | 'Adulto'
        list = list.filter(t => t.categoria === 'Geral' || t.categoria === turma);
      } else {
        list = list.filter(t => t.categoria === 'Geral');
      }
    }

    // Filtro por tipo de posição selecionado no topo
    if (selectedClassificacao !== 'Todas') {
      list = list.filter(t => t.classificacao === selectedClassificacao);
    }

    return list;
  }, [techniques, studentInfo, isEditor, selectedClassificacao]);

  // Função utilitária para obter a URL de embed do YouTube
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
      categoria: 'Geral',
      classificacao: 'Outros',
      video_url: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tech: Technique) => {
    setEditingTechnique(tech);
    setFormData({
      titulo: tech.titulo,
      descricao: tech.descricao,
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
    if (!formData.titulo) {
      alert('Por favor, preencha os campos obrigatórios.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingTechnique) {
        // Atualização
        await techniqueService.updateTechnique(editingTechnique.id, formData);
        setTechniques(prev =>
          prev.map(t => (t.id === editingTechnique.id ? { ...t, ...formData } : t))
        );
      } else {
        // Criação
        const newTech = await techniqueService.createTechnique(formData);
        setTechniques(prev => [newTech, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar técnica.';
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 animate-fade-in text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-obsidian-850 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-100 uppercase tracking-widest flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-zinc-400" />
            Biblioteca de Posições
          </h1>
          <p className="text-xs text-slate-450 font-medium mt-1.5">
            {isEditor
              ? 'Gerencie a biblioteca de posições e técnicas para os alunos.'
              : `Biblioteca de posições e técnicas de treino recomendadas para a categoria ${studentInfo?.turma || 'Geral'}.`}
          </p>
        </div>

        {isEditor && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-white text-obsidian-950 text-xs font-black uppercase tracking-wider rounded-none transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nova Posição
          </button>
        )}
      </div>

      {/* Barra de Filtros rápidos */}
      <div className="flex flex-col gap-3.5 bg-obsidian-950 p-4 border border-obsidian-850/80">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" />
          Filtrar Posições
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
          Nenhuma técnica cadastrada correspondente aos filtros selecionados.
        </div>
      ) : (
        /* Lista de Técnicas */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTechniques.map(tech => {
            const embedUrl = getYoutubeEmbedUrl(tech.video_url);

            return (
              <div key={tech.id} className="card-premium flex flex-col justify-between overflow-hidden">
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

                    {isEditor && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleOpenEditModal(tech)}
                          title="Editar técnica"
                          className="p-1.5 rounded bg-obsidian-900 hover:bg-obsidian-850 border border-obsidian-800 text-zinc-400 hover:text-white transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tech.id)}
                          title="Excluir técnica"
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
                </div>

                {tech.created_at && (
                  <div className="px-6 py-3 border-t border-obsidian-900 bg-obsidian-950/30 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                    <span>Lançado em</span>
                    <span>{new Date(tech.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="card-premium w-full max-w-lg overflow-hidden animate-scale-up text-left">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-5 border-b border-obsidian-850">
              <h2 className="text-sm font-black text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <BookOpen className="w-4.5 h-4.5 text-zinc-500" />
                {editingTechnique ? 'Editar Posição' : 'Cadastrar Posição'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Confirmar
                    </>
                  )}
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
