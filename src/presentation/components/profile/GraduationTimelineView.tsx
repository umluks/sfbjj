import React, { useState } from 'react';
import type { Aluno, Belt, Degree } from '@/domain/models/student';
import type { GraduationHistoryEvent } from '@/domain/models/graduation';
import { getDurationFriendly } from '@/utils/formatters';

import { GraduationSummaryHeader } from './graduation/GraduationSummaryHeader';
import { GraduationTimelineItem } from './graduation/GraduationTimelineItem';
import { GraduationFormModal } from './graduation/GraduationFormModal';
import { GraduationDeleteModal } from './graduation/GraduationDeleteModal';

interface GraduationTimelineViewProps {
  student: Aluno;
  history: GraduationHistoryEvent[];
  canEdit: boolean;
  onAddGraduacao: (faixa: Belt, graus: Degree, data: string, observacoes?: string) => Promise<void>;
  onUpdateGraduacao: (gradId: number, faixa: Belt, graus: Degree, data: string, observacoes?: string) => Promise<void>;
  onDeleteGraduacao: (gradId: number) => Promise<void>;
}

export const GraduationTimelineView: React.FC<GraduationTimelineViewProps> = ({
  student,
  history,
  canEdit,
  onAddGraduacao,
  onUpdateGraduacao,
  onDeleteGraduacao
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingGrad, setEditingGrad] = useState<GraduationHistoryEvent | null>(null);
  const [gradToDelete, setGradToDelete] = useState<GraduationHistoryEvent | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleOpenRegister = () => {
    setEditingGrad(null);
    setShowModal(true);
  };

  const handleOpenEdit = (grad: GraduationHistoryEvent) => {
    setEditingGrad(grad);
    setShowModal(true);
  };

  const handleSaveGraduation = async (faixa: Belt, graus: Degree, data: string, observacoes?: string) => {
    if (editingGrad) {
      await onUpdateGraduacao(editingGrad.id, faixa, graus, data, observacoes);
    } else {
      await onAddGraduacao(faixa, graus, data, observacoes);
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

  // Garante exibição da faixa atual caso não haja histórico salvo no banco
  const displayList = [...history];
  if (displayList.length === 0 && student.faixa) {
    displayList.push({
      id: -999,
      alunoId: student.id,
      faixa: student.faixa,
      graus: student.graus,
      dataGraduacao: student.dataUltimaGraduacao || student.dataMatricula || new Date().toISOString().substring(0, 10),
      professorNome: 'Corpo Docente SFBJJ',
      usuarioLancamento: 'Sistema'
    });
  }

  // Ordena decrescente pela data da graduação (mais recente no topo)
  const sortedTimeline = [...displayList].sort(
    (a, b) => new Date(b.dataGraduacao).getTime() - new Date(a.dataGraduacao).getTime()
  );

  const currentBeltDate = sortedTimeline.length > 0 ? sortedTimeline[0].dataGraduacao : student.dataUltimaGraduacao || new Date().toISOString().substring(0, 10);
  const todayStr = new Date().toISOString().substring(0, 10);

  return (
    <div className="space-y-6 text-left">
      {/* Cabeçalho */}
      <GraduationSummaryHeader
        student={student}
        totalEvents={history.length}
        currentBeltDate={currentBeltDate}
        canEdit={canEdit}
        onOpenRegister={handleOpenRegister}
      />

      {/* Lista de Registros de Graduação */}
      <div className="space-y-3">
        {sortedTimeline.map((event, idx) => {
          const isCurrentBelt = idx === 0;
          const endDate = isCurrentBelt ? todayStr : sortedTimeline[idx - 1].dataGraduacao;
          const tempoFaixa = getDurationFriendly(event.dataGraduacao, endDate);

          return (
            <GraduationTimelineItem
              key={event.id}
              event={event}
              isCurrentBelt={isCurrentBelt}
              tempoFaixa={tempoFaixa}
              canEdit={canEdit}
              onEdit={handleOpenEdit}
              onDelete={(grad) => setGradToDelete(grad)}
            />
          );
        })}
      </div>

      {/* Modais */}
      <GraduationFormModal
        showModal={showModal}
        editingGrad={editingGrad}
        student={student}
        history={history}
        onClose={() => setShowModal(false)}
        onSave={handleSaveGraduation}
      />

      <GraduationDeleteModal
        gradToDelete={gradToDelete}
        submitting={submitting}
        onClose={() => setGradToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
