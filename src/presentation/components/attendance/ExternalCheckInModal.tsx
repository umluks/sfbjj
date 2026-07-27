import React, { useState } from 'react';
import { X, MapPin, Calendar, Clock, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface ExternalCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    data: string;
    horario: string;
    localExterno: string;
    observacao?: string;
  }) => Promise<void>;
}

export const ExternalCheckInModal: React.FC<ExternalCheckInModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const todayStr = new Date().toISOString().substring(0, 10);
  const nowTimeStr = new Date().toTimeString().substring(0, 5);

  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState(nowTimeStr);
  const [local, setLocal] = useState('');
  const [observacao, setObservacao] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!local.trim()) {
      setError('Por favor, informe o nome ou local da academia.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Format horario HH:MM:SS
      const fullTime = time.length === 5 ? `${time}:00` : time;
      await onSubmit({
        data: date,
        horario: fullTime,
        localExterno: local.trim(),
        observacao: observacao.trim() || undefined,
      });

      // Clear form & close
      setLocal('');
      setObservacao('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Falha ao registrar check-in externo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-obsidian-900 border border-obsidian-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-obsidian-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-100 tracking-tight">
                Check-in Externo
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Registre um treino realizado em outra academia.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-zinc-400 hover:text-white bg-obsidian-850 border border-obsidian-800 hover:border-zinc-700 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-2.5 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Data & Horário */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[9.5px] font-black uppercase tracking-wider text-zinc-400 block">
                Data do Treino *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full bg-obsidian-950 border border-obsidian-800 focus:border-amber-500/50 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9.5px] font-black uppercase tracking-wider text-zinc-400 block">
                Horário *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full bg-obsidian-950 border border-obsidian-800 focus:border-amber-500/50 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Local / Academia */}
          <div className="space-y-1.5">
            <label className="text-[9.5px] font-black uppercase tracking-wider text-zinc-400 block">
              Nome da Academia / Local *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Ex: Gracie Barra - SP, Alliance HQ..."
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                required
                className="w-full bg-obsidian-950 border border-obsidian-800 focus:border-amber-500/50 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none placeholder:text-zinc-650 transition-all"
              />
            </div>
          </div>

          {/* Observações / Notas */}
          <div className="space-y-1.5">
            <label className="text-[9.5px] font-black uppercase tracking-wider text-zinc-400 block">
              Observações / Detalhes (Opcional)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Ex: Treino de Passagem de Guarda, Open Mat..."
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                className="w-full bg-obsidian-950 border border-obsidian-800 focus:border-amber-500/50 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none placeholder:text-zinc-650 transition-all"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-obsidian-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-obsidian-800 bg-obsidian-850 hover:bg-obsidian-800 text-slate-300 text-xs font-bold transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-obsidian-950 text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 shadow-lg shadow-amber-500/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              {loading ? 'Confirmando...' : 'Confirmar Check-in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
