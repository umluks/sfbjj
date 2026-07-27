import React, { useState } from 'react';
import { Plus, Edit, Trash2, Award, AlertCircle, Calendar, Clock } from 'lucide-react';
import type { Aluno, Belt, Degree, GraduacaoHistorico } from '@/domain/models/student';
import { BeltBadge } from '@/presentation/components/shared/BeltBadge';
import { getBeltsByAge } from '@/application/services/diplomaService';
import { formatMonthYear, getDurationFriendly } from '@/utils/formatters';

const getLocalTodayStr = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface GraduationHistoryTableProps {
  student: Aluno;
  canEdit: boolean;
  onAddGraduacao: (faixa: Belt, graus: Degree, data: string) => Promise<void>;
  onUpdateGraduacao: (gradId: number, faixa: Belt, graus: Degree, data: string) => Promise<void>;
  onDeleteGraduacao: (gradId: number) => Promise<void>;
}

export const GraduationHistoryTable: React.FC<GraduationHistoryTableProps> = ({
  student,
  canEdit,
  onAddGraduacao,
  onUpdateGraduacao,
  onDeleteGraduacao,
}) => {
  const [showGradModal, setShowGradModal] = useState(false);
  const [editingGrad, setEditingGrad] = useState<GraduacaoHistorico | null>(null);
  const [gradToDelete, setGradToDelete] = useState<GraduacaoHistorico | null>(null);
  const [newGradFaixa, setNewGradFaixa] = useState<Belt>('Branca');
  const [newGradGrau, setNewGradGrau] = useState<Degree>(0);
  const [newGradData, setNewGradData] = useState('');
  const [gradError, setGradError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const toMonthInputValue = (dateStr: string) => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) {
      const p = dateStr.split('/');
      if (p.length === 3) return `${p[2]}-${p[1].padStart(2, '0')}`;
    }
    if (dateStr.includes('-')) {
      return dateStr.substring(0, 7);
    }
    return '';
  };

  const handleOpenRegister = () => {
    setGradError(null);
    setEditingGrad(null);
    setNewGradFaixa(student.faixa || 'Branca');
    setNewGradGrau(student.graus || 0);
    setNewGradData(new Date().toISOString().substring(0, 7));
    setShowGradModal(true);
  };

  const handleOpenEdit = (grad: GraduacaoHistorico) => {
    setEditingGrad(grad);
    setNewGradFaixa(grad.faixa);
    setNewGradGrau(grad.graus);
    setNewGradData(toMonthInputValue(grad.data));
    setGradError(null);
    setShowGradModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGradError(null);
    if (!newGradData) {
      setGradError('Por favor, informe a data da graduação.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingGrad) {
        await onUpdateGraduacao(editingGrad.id, newGradFaixa, newGradGrau, newGradData);
      } else {
        await onAddGraduacao(newGradFaixa, newGradGrau, newGradData);
      }
      setShowGradModal(false);
      setEditingGrad(null);
    } catch (err: any) {
      setGradError(err.message || 'Erro ao registrar graduação.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!gradToDelete) return;
    setSubmitting(true);
    try {
      await onDeleteGraduacao(gradToDelete.id);
      setGradToDelete(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir registro de graduação.');
    } finally {
      setSubmitting(false);
    }
  };

  // Prepara histórico para exibição
  const hasCurrentInHistory = (student.historicoGraduacoes || []).some(
    (g) => g.faixa === student.faixa && g.graus === student.graus
  );
  const displayHistory = [...(student.historicoGraduacoes || [])];
  if (!hasCurrentInHistory && student.faixa) {
    displayHistory.push({
      id: -999,
      data: student.dataUltimaGraduacao || student.dataMatricula || new Date().toISOString().substring(0, 10),
      faixa: student.faixa,
      graus: student.graus,
      avaliador: 'Sistema',
    });
  }

  const sortedHistory = displayHistory.sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );
  const todayStr = getLocalTodayStr();

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Histórico de Faixas & Graus</h2>
          <p className="text-slate-400 text-xs mt-1">
            Acompanhe a jornada, faixas e graus alcançados.
          </p>
        </div>
        {canEdit && (
          <button
            onClick={handleOpenRegister}
            className="btn-gold flex items-center justify-center gap-2 text-xs py-2.5 px-4 rounded-xl font-black uppercase tracking-wider touch-manipulation min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            Registrar Faixa/Grau
          </button>
        )}
      </div>

      {/* Visualização em Cards (Mobile: md:hidden) */}
      <div className="md:hidden space-y-3">
        {sortedHistory.length > 0 ? (
          sortedHistory.map((grad, idx) => {
            const nextGradData = idx === 0 ? todayStr : sortedHistory[idx - 1].data;
            const tempoNaFaixa = getDurationFriendly(grad.data, nextGradData);
            const isCurrent = grad.faixa === student.faixa && grad.graus === student.graus;

            return (
              <div
                key={grad.id}
                className="bg-obsidian-900/60 border border-obsidian-800 rounded-xl p-4 space-y-3 shadow-md relative"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{formatMonthYear(grad.data)}</span>
                  </div>
                  {isCurrent && (
                    <span className="text-[9px] uppercase font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      Faixa Atual
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4 pt-1">
                  <BeltBadge faixa={grad.faixa} graus={grad.graus} />
                  <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{tempoNaFaixa}</span>
                  </div>
                </div>

                {canEdit && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-obsidian-850">
                    <button
                      onClick={() => handleOpenEdit(grad)}
                      className="flex-1 py-2 px-3 bg-obsidian-950 hover:bg-obsidian-850 border border-obsidian-800 rounded-lg text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all touch-manipulation min-h-[40px]"
                    >
                      <Edit className="w-3.5 h-3.5 text-slate-400" />
                      Editar
                    </button>
                    {grad.id !== -999 && (
                      <button
                        onClick={() => setGradToDelete(grad)}
                        className="py-2 px-3 bg-red-950/20 hover:bg-red-950/40 border border-red-950/40 rounded-lg text-red-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all touch-manipulation min-h-[40px]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Excluir
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-obsidian-800 rounded-xl bg-obsidian-900/20">
            Nenhum registro de graduação encontrado para este aluno.
          </div>
        )}
      </div>

      {/* Visualização em Tabela (Desktop: hidden md:block) */}
      <div className="hidden md:block border border-obsidian-755 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300 min-w-[600px]">
            <thead className="bg-obsidian-850 text-xs uppercase text-slate-400 border-b border-obsidian-755">
              <tr>
                <th className="px-4 py-3 font-semibold">Data</th>
                <th className="px-4 py-3 font-semibold">Faixa & Grau</th>
                <th className="px-4 py-3 font-semibold">Tempo na Faixa</th>
                {canEdit && <th className="px-4 py-3 font-semibold text-right">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-755/50">
              {sortedHistory.length > 0 ? (
                sortedHistory.map((grad, idx) => {
                  const nextGradData = idx === 0 ? todayStr : sortedHistory[idx - 1].data;
                  const tempoNaFaixa = getDurationFriendly(grad.data, nextGradData);
                  return (
                    <tr key={grad.id} className="hover:bg-obsidian-800/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-xs font-mono">
                        {formatMonthYear(grad.data)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-start">
                          <BeltBadge faixa={grad.faixa} graus={grad.graus} />
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-400">
                        {tempoNaFaixa}
                      </td>
                      {canEdit && (
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            {grad.faixa === student.faixa && grad.graus === student.graus && (
                              <span className="text-[10px] uppercase font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 select-none font-sans">
                                Faixa Atual
                              </span>
                            )}
                            <button
                              onClick={() => handleOpenEdit(grad)}
                              className="p-2 rounded-lg bg-obsidian-750 text-slate-300 hover:bg-slate-200/10 hover:text-slate-100 transition-all border border-obsidian-700"
                              title="Editar"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {grad.id !== -999 && (
                              <button
                                onClick={() => setGradToDelete(grad)}
                                className="p-2 rounded-lg bg-obsidian-750 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all border border-obsidian-700"
                                title="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={canEdit ? 4 : 3} className="px-4 py-8 text-center text-slate-500 text-xs">
                    Nenhum registro de graduação encontrado para este aluno.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Registro/Edição de Graduação */}
      {showGradModal && canEdit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-obsidian-850 border border-obsidian-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-scale-up text-left">
            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-gold-500" />
              {editingGrad ? 'Editar Faixa/Grau' : 'Registrar Faixa/Grau'}
            </h3>

            {gradError && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{gradError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Nova Faixa</label>
                <select
                  value={newGradFaixa}
                  onChange={(e) => setNewGradFaixa(e.target.value as Belt)}
                  className="input-premium w-full bg-obsidian-950 min-h-[44px]"
                  disabled={submitting}
                >
                  {getBeltsByAge(student.dataNascimento).map((b: Belt) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Novo Grau</label>
                <select
                  value={newGradGrau}
                  onChange={(e) => setNewGradGrau(Number(e.target.value) as Degree)}
                  className="input-premium w-full bg-obsidian-950 min-h-[44px]"
                  disabled={submitting}
                >
                  <option value={0}>0 Grau</option>
                  <option value={1}>1 Grau</option>
                  <option value={2}>2 Graus</option>
                  <option value={3}>3 Graus</option>
                  <option value={4}>4 Graus</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Mês/Ano da Graduação</label>
                <input
                  type="month"
                  value={newGradData}
                  onChange={(e) => setNewGradData(e.target.value)}
                  className="input-premium w-full bg-obsidian-950 min-h-[44px]"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-obsidian-750">
                <button
                  type="button"
                  onClick={() => {
                    setShowGradModal(false);
                    setEditingGrad(null);
                  }}
                  className="btn-obsidian px-4 py-2.5 text-xs min-h-[44px]"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-gold px-4 py-2.5 text-xs min-h-[44px]" disabled={submitting}>
                  {submitting ? 'Salvando...' : editingGrad ? 'Salvar' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão de Graduação */}
      {gradToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-obsidian-850 border border-obsidian-750 p-6 rounded-2xl w-full max-w-sm shadow-2xl text-left animate-scale-up">
            <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider mb-2">Excluir Graduação</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Tem certeza que deseja remover o registro da faixa <strong>{gradToDelete.faixa} ({gradToDelete.graus}º grau)</strong> do histórico de graduações?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setGradToDelete(null)}
                className="btn-obsidian px-4 py-2 text-xs"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="btn-gold px-4 py-2 text-xs bg-red-650 hover:bg-red-600 border border-red-500/20 text-white"
                disabled={submitting}
              >
                {submitting ? 'Excluindo...' : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default GraduationHistoryTable;
