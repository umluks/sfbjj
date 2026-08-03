import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { QrValidationService } from '@/infrastructure/services/qrValidationService';

interface GraduationQrModalProps {
  selectedQrCode: string | null;
  onClose: () => void;
}

export const GraduationQrModal: React.FC<GraduationQrModalProps> = ({
  selectedQrCode,
  onClose
}) => {
  if (!selectedQrCode) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-obsidian-850 border border-obsidian-750 p-6 rounded-2xl w-full max-w-sm shadow-2xl text-center space-y-4">
        <div className="flex items-center justify-center text-emerald-400 gap-2">
          <ShieldCheck className="w-6 h-6" />
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-100">Validação Digital de Diploma</h3>
        </div>

        <div className="bg-white p-4 rounded-xl inline-block shadow-inner mx-auto">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(QrValidationService.getValidationUrl(selectedQrCode))}`}
            alt="QR Code Validador"
            className="w-44 h-44 mx-auto"
          />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Código Verificador</span>
          <div className="text-xs font-mono font-bold text-gold-400 break-all select-all bg-obsidian-950 p-2 rounded-lg border border-obsidian-800">
            {selectedQrCode}
          </div>
        </div>

        <button
          onClick={onClose}
          className="btn-gold w-full py-2.5 text-xs font-bold uppercase tracking-wider min-h-[44px]"
        >
          Fechar Validador
        </button>
      </div>
    </div>
  );
};
