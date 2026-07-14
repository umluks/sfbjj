import React, { useState } from 'react';
import { Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

interface ChangePasswordFormProps {
  onSavePassword: (currentPass: string, newPass: string) => Promise<void>;
}

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ onSavePassword }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccess(null);
    setPassError(null);

    if (newPassword.length < 6) {
      setPassError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('A nova senha e a confirmação não coincidem.');
      return;
    }

    setSubmitting(true);
    try {
      await onSavePassword(currentPassword, newPassword);
      setPassSuccess('Senha de acesso atualizada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassError(err.message || 'Erro ao atualizar a senha.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-bold text-slate-100">Alterar Senha de Acesso</h2>
        <p className="text-slate-400 text-xs mt-1">
          Proteja sua conta alterando sua senha de acesso ao portal. A nova senha deve ter no mínimo 6 caracteres.
        </p>
      </div>

      {passSuccess && (
        <div className="flex items-center gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{passSuccess}</span>
        </div>
      )}

      {passError && (
        <div className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm animate-shake">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{passError}</span>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-4 max-w-md">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Senha Atual</label>
          <div className="relative">
            <input
              type={showCurrentPass ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-premium w-full pr-11"
              required
              disabled={submitting}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPass(!showCurrentPass)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-330"
              disabled={submitting}
            >
              {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Nova Senha</label>
          <div className="relative">
            <input
              type={showNewPass ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-premium w-full pr-11"
              required
              disabled={submitting}
            />
            <button
              type="button"
              onClick={() => setShowNewPass(!showNewPass)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-330"
              disabled={submitting}
            >
              {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Confirmar Nova Senha</label>
          <div className="relative">
            <input
              type={showConfirmPass ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-premium w-full pr-11"
              required
              disabled={submitting}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPass(!showConfirmPass)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-330"
              disabled={submitting}
            >
              {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" className="btn-gold px-8 py-2.5 text-xs font-bold uppercase tracking-wider" disabled={submitting}>
            {submitting ? 'Atualizando...' : 'Atualizar Senha'}
          </button>
        </div>
      </form>
    </div>
  );
};
export default ChangePasswordForm;
