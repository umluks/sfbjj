import React, { useState, useEffect } from 'react';
import type { Aluno, Belt, Degree } from '@/domain/models/student';
import type { GraduationHistoryEvent } from '@/domain/models/graduation';
import { BELT_RANKS } from '@/constants';
import { GraduationRulesEngine } from '@/domain/services/GraduationRulesEngine';
import { Award, AlertCircle } from 'lucide-react';

interface GraduationFormModalProps {
  showModal: boolean;
  editingGrad: GraduationHistoryEvent | null;
  student: Aluno;
  history: GraduationHistoryEvent[];
  onClose: () => void;
  onSave: (faixa: Belt, graus: Degree, data: string, observacoes?: string) => Promise<void>;
}

const AVAILABLE_BELTS = Object.keys(BELT_RANKS) as Belt[];

export const GraduationFormModal: React.FC<GraduationFormModalProps> = ({
  showModal,
  editingGrad,
  student,
  history,
  onClose,
  onSave
}) => {
  const [formFaixa, setFormFaixa] = useState<Belt>(student.faixa || 'Branca');
  const [formGrau, setFormGrau] = useState<Degree>(student.graus || 0);
  const [formData, setFormData] = useState(new Date().toISOString().substring(0, 10));
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingGrad) {
      setFormFaixa(editingGrad.faixa);
      setFormGrau(editingGrad.graus);
      setFormData(editingGrad.dataGraduacao ? editingGrad.dataGraduacao.substring(0, 10) : new Date().toISOString().substring(0, 10));
    } else {
      setFormFaixa(student.faixa || 'Branca');
      setFormGrau(student.graus || 0);
      setFormData(new Date().toISOString().substring(0, 10));
    }
    setFormError(null);
  }, [editingGrad, student, showModal]);

  if (!showModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData) {
      setFormError('Por favor, informe a data da graduação.');
      return;
    }

    const formattedDate = formData;

    // Pré-validação estrita contra o histórico
    const timelineCheck = GraduationRulesEngine.validateGraduationTimeline(
      student.dataNascimento,
      { faixa: formFaixa, graus: formGrau, dataGraduacao: formattedDate },
      history,
      editingGrad ? editingGrad.id : null
    );

    if (!timelineCheck.isValid) {
      setFormError(timelineCheck.error || 'Graduação inválida para o histórico.');
      return;
    }

    setSubmitting(true);
    try {
      await onSave(formFaixa, formGrau, formattedDate);
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao registrar graduação.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-obsidian-850 border border-obsidian-750 rounded-2xl w-full max-w-md p-6 shadow-2xl text-left">
        <h3 className="text-lg font-black text-slate-100 mb-4 flex items-center gap-2 uppercase tracking-wide">
          <Award className="w-5 h-5 text-gold-500" />
          {editingGrad ? 'Editar Graduação' : 'Registrar Nova Graduação'}
        </h3>

        {formError && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Faixa</label>
            <select
              value={formFaixa}
              onChange={(e) => setFormFaixa(e.target.value as Belt)}
              className="input-premium w-full bg-obsidian-950 min-h-[44px]"
              disabled={submitting}
            >
              {AVAILABLE_BELTS.map((belt) => (
                <option key={belt} value={belt}>
                  {belt}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Grau</label>
            <select
              value={formGrau}
              onChange={(e) => setFormGrau(Number(e.target.value) as Degree)}
              className="input-premium w-full bg-obsidian-950 min-h-[44px]"
              disabled={submitting}
            >
              <option value={0}>0 Grau</option>
              <option value={1}>1º Grau</option>
              <option value={2}>2º Grau</option>
              <option value={3}>3º Grau</option>
              <option value={4}>4º Grau</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Data da Graduação</label>
            <input
              type="date"
              value={formData}
              onChange={(e) => setFormData(e.target.value)}
              className="input-premium w-full bg-obsidian-950 min-h-[44px]"
              required
              disabled={submitting}
            />
          </div>

          <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-obsidian-750">
            <button
              type="button"
              onClick={onClose}
              className="btn-obsidian px-4 py-2.5 text-xs min-h-[44px]"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-gold px-4 py-2.5 text-xs min-h-[44px]" disabled={submitting}>
              {submitting ? 'Salvando...' : editingGrad ? 'Salvar Alterações' : 'Confirmar Graduação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
