import React from 'react';
import type { GraduationHistoryEvent } from '@/domain/models/graduation';

interface GraduationDeleteModalProps {
  gradToDelete: GraduationHistoryEvent | null;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const GraduationDeleteModal: React.FC<GraduationDeleteModalProps> = ({
  gradToDelete,
  submitting,
  onClose,
  onConfirm
}) => {
  if (!gradToDelete) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-obsidian-850 border border-obsidian-750 p-6 rounded-2xl w-full max-w-sm shadow-2xl text-left">
        <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider mb-2">Excluir Graduação</h3>
        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          Tem certeza que deseja desativar o registro da faixa{' '}
          <strong>
            {gradToDelete.faixa} ({gradToDelete.graus}º grau)
          </strong>
          ? O evento sofrerá exclusão lógica preservando histórico e auditoria.
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-obsidian px-4 py-2 text-xs"
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn-gold px-4 py-2 text-xs bg-red-650 hover:bg-red-600 border border-red-500/20 text-white"
            disabled={submitting}
          >
            {submitting ? 'Excluindo...' : 'Confirmar Exclusão'}
          </button>
        </div>
      </div>
    </div>
  );
};
