import React, { useState } from 'react';
import { Shield, Eye, EyeOff, CheckCircle2, AlertCircle, Laptop, LogOut, Lock } from 'lucide-react';
import { useAuth } from '@/application/hooks/useAuth';

interface SecurityCardProps {
  onSavePassword: (currentPass: string, newPass: string) => Promise<void>;
  isAdminOverride?: boolean;
}

export const SecurityCard: React.FC<SecurityCardProps> = ({
  onSavePassword,
  isAdminOverride = false
}) => {
  const { logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loggingOutAll, setLoggingOutAll] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
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

  const handleLogoutAllDevices = async () => {
    if (!window.confirm('Tem certeza de que deseja encerrar a sessão em todos os dispositivos?')) {
      return;
    }
    setLoggingOutAll(true);
    try {
      await logout();
    } catch (err) {
      console.error('Erro ao desconectar dispositivos:', err);
    } finally {
      setLoggingOutAll(false);
    }
  };

  // Detectar navegador e SO simples para exibir na sessão ativa
  const userAgent = navigator.userAgent;
  let browserName = 'Navegador Web';
  if (userAgent.includes('Chrome')) browserName = 'Google Chrome';
  else if (userAgent.includes('Safari')) browserName = 'Apple Safari';
  else if (userAgent.includes('Firefox')) browserName = 'Mozilla Firefox';
  else if (userAgent.includes('Edg')) browserName = 'Microsoft Edge';

  let osName = 'Dispositivo';
  if (userAgent.includes('Macintosh')) osName = 'macOS';
  else if (userAgent.includes('Windows')) osName = 'Windows';
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) osName = 'iOS Mobile';
  else if (userAgent.includes('Android')) osName = 'Android Mobile';

  return (
    <div className="bg-obsidian-900/60 border border-obsidian-850 p-4 sm:p-6 rounded-2xl shadow-xl space-y-6 text-left w-full max-w-full min-w-0">
      
      {/* Título do Card */}
      <div className="flex items-center gap-2.5 border-b border-obsidian-850 pb-3">
        <Shield className="w-5 h-5 text-gold-500 shrink-0" />
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-100">Segurança da Conta</h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Gerencie sua senha de acesso e sessões ativas no sistema.
          </p>
        </div>
      </div>

      {/* Seção 1: Formulário de Alteração de Senha */}
      <div className="space-y-4">
        <h3 className="text-xs sm:text-sm font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Lock className="w-4 h-4 text-gold-500 shrink-0" />
          Alterar Senha de Acesso
        </h3>

        {passSuccess && (
          <div className="flex items-center gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-400 text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{passSuccess}</span>
          </div>
        )}

        {passError && (
          <div className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{passError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {!isAdminOverride && (
              <div className="flex flex-col gap-1.5 col-span-1">
                <label htmlFor="current-pass" className="text-xs text-slate-300 font-bold uppercase tracking-wider">
                  Senha Atual <span className="text-gold-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="current-pass"
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input-premium w-full min-h-[48px] px-4 py-3 pr-12 bg-obsidian-950 text-slate-100 rounded-xl border border-obsidian-800 focus:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/30"
                    required={!isAdminOverride}
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 min-w-[44px] min-h-[44px] justify-center text-slate-400 hover:text-slate-200"
                    disabled={submitting}
                    aria-label={showCurrentPass ? 'Ocultar senha atual' : 'Mostrar senha atual'}
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5 col-span-1">
              <label htmlFor="new-pass" className="text-xs text-slate-300 font-bold uppercase tracking-wider">
                Nova Senha <span className="text-gold-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="new-pass"
                  type={showNewPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-premium w-full min-h-[48px] px-4 py-3 pr-12 bg-obsidian-950 text-slate-100 rounded-xl border border-obsidian-800 focus:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/30"
                  required
                  disabled={submitting}
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 min-w-[44px] min-h-[44px] justify-center text-slate-400 hover:text-slate-200"
                  disabled={submitting}
                  aria-label={showNewPass ? 'Ocultar nova senha' : 'Mostrar nova senha'}
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 col-span-1">
              <label htmlFor="confirm-pass" className="text-xs text-slate-300 font-bold uppercase tracking-wider">
                Confirmar Nova Senha <span className="text-gold-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirm-pass"
                  type={showConfirmPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-premium w-full min-h-[48px] px-4 py-3 pr-12 bg-obsidian-950 text-slate-100 rounded-xl border border-obsidian-800 focus:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/30"
                  required
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 min-w-[44px] min-h-[44px] justify-center text-slate-400 hover:text-slate-200"
                  disabled={submitting}
                  aria-label={showConfirmPass ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="btn-gold w-full sm:w-auto min-h-[48px] px-6 py-3 text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 rounded-xl shadow-md transition-all active:scale-98"
            >
              {submitting ? 'Atualizando...' : 'Atualizar Senha'}
            </button>
          </div>
        </form>
      </div>

      {/* Seção 2: Sessões Ativas & Logout de Dispositivos */}
      <div className="pt-4 border-t border-obsidian-850 space-y-4">
        <h3 className="text-xs sm:text-sm font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Laptop className="w-4 h-4 text-gold-500 shrink-0" />
          Sessão Ativa Atual
        </h3>

        <div className="bg-obsidian-950 p-4 rounded-xl border border-obsidian-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-obsidian-900 border border-obsidian-800 flex items-center justify-center text-gold-450 shrink-0">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-100 block">{browserName} no {osName}</span>
              <span className="text-xs text-emerald-400 font-semibold block flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Sessão Ativa Agora
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogoutAllDevices}
            disabled={loggingOutAll}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>{loggingOutAll ? 'Saindo...' : 'Desconectar Dispositivos'}</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default SecurityCard;
