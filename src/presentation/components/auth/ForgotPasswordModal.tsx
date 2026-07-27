import React, { useState } from 'react';
import { authService } from '@/application/services/authService';
import { formatCPF } from '@/utils/formatters';
import { 
  KeyRound, 
  X, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  MessageCircle,
  Mail
} from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (identifier: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [identifier, setIdentifier] = useState('');
  const [confirmationData, setConfirmationData] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [tabMode, setTabMode] = useState<'reset' | 'whatsapp'>('reset');

  if (!isOpen) return null;

  const handleIdentifierChange = (value: string) => {
    const onlyNumbers = value.replace(/[.-]/g, '');
    const hasLettersOrAt = /[a-zA-Z@]/.test(value);

    if (hasLettersOrAt) {
      setIdentifier(value);
    } else if (/^\d+$/.test(onlyNumbers)) {
      setIdentifier(formatCPF(value));
    } else {
      setIdentifier(value);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!identifier.trim()) {
      setErrorMsg('Informe o CPF ou E-mail da sua conta.');
      return;
    }

    if (!confirmationData.trim()) {
      setErrorMsg('Informe o E-mail ou Telefone de confirmação cadastrado na sua conta.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMsg('A nova senha e a confirmação não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({
        identifier,
        confirmationData,
        newPasswordString: newPassword
      });

      onSuccess(identifier);
    } catch (err: any) {
      console.error('Erro na redefinição de senha:', err);
      setErrorMsg(err.message || 'Falha ao redefinir senha. Verifique seus dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWhatsApp = () => {
    const phone = '5561981182026';
    const text = encodeURIComponent(
      `Olá! Esqueci minha senha no Portal SFBJJ.\nMeu CPF/E-mail de cadastro é: ${identifier || '[Não informado]'}.\nPoderiam me ajudar a redefinir?`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-obsidian-900 border border-obsidian-750/70 rounded-2xl p-6 md:p-8 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-obsidian-750/60 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-200/10 border border-slate-200/20 rounded-xl text-slate-200">
              <KeyRound className="w-5 h-5 text-gold-450" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 uppercase tracking-wide">
                Recuperar Senha
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Escolha a melhor forma para redefinir seu acesso
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-obsidian-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Buttons */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-obsidian-950/80 rounded-xl border border-obsidian-750/60 mb-6">
          <button
            type="button"
            onClick={() => setTabMode('reset')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tabMode === 'reset'
                ? 'bg-slate-200/15 text-white border border-slate-200/20 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Redefinir Online</span>
          </button>
          <button
            type="button"
            onClick={() => setTabMode('whatsapp')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tabMode === 'whatsapp'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Via Suporte WhatsApp</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-6 flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {tabMode === 'reset' ? (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            {/* CPF / E-mail */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                CPF (Aluno) ou E-mail (Admin/Professor) *
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Seu CPF ou E-mail cadastrado"
                  className="w-full bg-obsidian-950/80 border border-obsidian-700 hover:border-obsidian-600 focus:border-slate-500 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-200 placeholder:text-slate-650 focus:outline-none transition-all"
                  value={identifier}
                  onChange={(e) => handleIdentifierChange(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Confirmação (E-mail ou Telefone) */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                E-mail ou Telefone Cadastrado *
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Digite o e-mail ou telefone da sua conta"
                  className="w-full bg-obsidian-950/80 border border-obsidian-700 hover:border-obsidian-600 focus:border-slate-500 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-200 placeholder:text-slate-650 focus:outline-none transition-all"
                  value={confirmationData}
                  onChange={(e) => setConfirmationData(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Usado para confirmar que você é o verdadeiro proprietário desta conta.
              </p>
            </div>

            {/* Nova Senha */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Nova Senha (Mínimo 6 caracteres) *
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-obsidian-950/80 border border-obsidian-700 hover:border-obsidian-600 focus:border-slate-500 rounded-xl pl-10 pr-10 py-3 text-xs text-slate-200 placeholder:text-slate-650 focus:outline-none transition-all"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none"
                  disabled={loading}
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirmar Nova Senha */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Confirmar Nova Senha *
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-obsidian-950/80 border border-obsidian-700 hover:border-obsidian-600 focus:border-slate-500 rounded-xl pl-10 pr-10 py-3 text-xs text-slate-200 placeholder:text-slate-650 focus:outline-none transition-all"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none"
                  disabled={loading}
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-white text-obsidian-950 font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validando e Atualizando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Redefinir Minha Senha</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* WhatsApp Support Option */
          <div className="space-y-4 text-center py-2">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-left space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>Atendimento via Suporte da Academia</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Caso não se recorde dos dados de confirmação ou prefira falar com um de nossos professores ou administradores, você pode solicitar a redefinição diretamente no nosso WhatsApp.
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 text-left mb-1.5">
                Seu CPF ou Nome (Opcional)
              </label>
              <input
                type="text"
                placeholder="Informe seu CPF ou Nome para adiantar o atendimento"
                className="w-full bg-obsidian-950/80 border border-obsidian-700 focus:border-emerald-500 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none"
                value={identifier}
                onChange={(e) => handleIdentifierChange(e.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Abrir WhatsApp da Academia</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default ForgotPasswordModal;
