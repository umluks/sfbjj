import React, { useState } from 'react';
import { useAuth } from '@/application/hooks/useAuth';
import { studentService } from '@/application/services/studentService';
import { teacherService } from '@/application/services/teacherService';
import { adminService } from '@/application/services/adminService';
import { 
  KeyRound, 
  X, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ShieldAlert
} from 'lucide-react';

interface AdminResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: {
    id: number;
    name: string;
    type: 'student' | 'teacher' | 'admin';
  } | null;
  onSuccess?: () => void;
}

export const AdminResetPasswordModal: React.FC<AdminResetPasswordModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  onSuccess
}) => {
  const { loggedUser } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !targetUser) return null;

  const isAdmin = loggedUser?.role === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isAdmin) {
      setErrorMsg('Apenas usuários com perfil de Administrador possuem permissão para redefinir senhas.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('A nova senha deve possuir no mínimo 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('A senha e a confirmação não coincidem.');
      return;
    }

    setLoading(true);
    try {
      if (targetUser.type === 'student') {
        await studentService.updateStudent(targetUser.id, { senha: newPassword });
      } else if (targetUser.type === 'teacher') {
        await teacherService.updateTeacher(targetUser.id, { senha: newPassword });
      } else if (targetUser.type === 'admin') {
        await adminService.updateAdmin(targetUser.id, { senha: newPassword });
      }

      setSuccessMsg(`Senha do usuário "${targetUser.name}" redefinida com sucesso!`);
      setNewPassword('');
      setConfirmPassword('');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Erro ao alterar senha pelo admin:', err);
      setErrorMsg(err.message || 'Erro ao redefinir a senha do usuário.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-obsidian-900 border border-obsidian-750/70 rounded-2xl p-6 md:p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-obsidian-750/60 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 uppercase tracking-wide">
                Alterar Senha do Usuário
              </h3>
              <p className="text-[11px] text-amber-400 font-bold flex items-center gap-1 mt-0.5">
                <ShieldAlert className="w-3 h-3" />
                Ação restrita a Administradores
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

        {!isAdmin ? (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Acesso negado. Apenas administradores podem alterar a senha de outros usuários.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-obsidian-950/80 border border-obsidian-800 rounded-xl text-xs text-slate-300">
              Redefinindo a senha para: <strong className="text-white">{targetUser.name}</strong> ({targetUser.type === 'student' ? 'Aluno' : targetUser.type === 'teacher' ? 'Professor' : 'Admin'})
            </div>

            {successMsg && (
              <div className="flex items-center gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-400 text-xs animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Nova Senha *
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-obsidian-950/80 border border-obsidian-700 hover:border-obsidian-600 focus:border-amber-500 rounded-xl pl-10 pr-10 py-3 text-xs text-slate-200 focus:outline-none transition-all"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none"
                  disabled={loading}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                Confirmar Nova Senha *
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-obsidian-950/80 border border-obsidian-700 hover:border-obsidian-600 focus:border-amber-500 rounded-xl pl-10 pr-10 py-3 text-xs text-slate-200 focus:outline-none transition-all"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-obsidian-750 text-slate-400 hover:text-white hover:bg-obsidian-800 text-xs font-bold transition-all"
                disabled={loading}
              >
                Fechar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-obsidian-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Salvar Nova Senha</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
export default AdminResetPasswordModal;
