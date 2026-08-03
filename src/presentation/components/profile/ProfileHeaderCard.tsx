import React from 'react';
import type { Aluno } from '@/domain/models/student';
import { Award, Edit3, ShieldCheck, UserCheck } from 'lucide-react';

interface ProfileHeaderCardProps {
  student: Aluno | null;
  effectiveStudent: Aluno | null;
  profileName: string;
  profileAvatar?: string | null;
  profileRole: string;
  onEditClick?: () => void;
}

export const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({
  student,
  effectiveStudent,
  profileName,
  profileAvatar,
  profileRole,
  onEditClick
}) => {
  const status = student?.status || 'Ativo';

  return (
    <div className="bg-gradient-to-br from-obsidian-900 via-obsidian-900 to-obsidian-950 border border-obsidian-850 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden w-full max-w-full min-w-0">
      {/* Glow decorativo de fundo */}
      <div 
        className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-gold-550/10 via-amber-500/5 to-transparent blur-3xl rounded-full pointer-events-none" 
        aria-hidden="true"
      />

      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 sm:gap-6 relative z-10 w-full min-w-0">
        
        {/* Foto Avatar & Info Principal */}
        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 text-center sm:text-left w-full sm:w-auto min-w-0">
          
          {/* Avatar com Lazy Loading e Fallback */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-gold-550/40 bg-obsidian-950 flex items-center justify-center text-3xl sm:text-4xl shadow-lg shrink-0 relative group">
            {profileAvatar ? (
              profileAvatar.length <= 2 ? (
                <span aria-label="Avatar Emoji">{profileAvatar}</span>
              ) : (
                <img 
                  src={profileAvatar} 
                  alt={`Foto de perfil de ${profileName}`} 
                  loading="lazy" 
                  className="w-full h-full object-cover" 
                />
              )
            ) : (
              <span className="text-slate-500" aria-label="Avatar Padrão">🥋</span>
            )}
            <span 
              className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-obsidian-950 shadow ${
                status === 'Ativo' ? 'bg-emerald-500' : 'bg-amber-500'
              }`} 
              title={`Situação: ${status}`}
              aria-hidden="true"
            />
          </div>

          {/* Nome, Perfil & Badges */}
          <div className="space-y-1.5 flex-1 min-w-0 w-full">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight truncate max-w-full">
                {profileName}
              </h1>
            </div>

            {/* Badges do Cargo e Status */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full shrink-0">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                {profileRole}
              </span>

              {student && (
                <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border shrink-0 ${
                  status === 'Ativo' 
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                    : 'text-orange-400 bg-orange-500/10 border-orange-500/20'
                }`}>
                  <UserCheck className="w-3 h-3" />
                  {status}
                </span>
              )}
            </div>

            {/* Faixa & Graus Atual (se for aluno) */}
            {effectiveStudent?.faixa && (
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-300 font-semibold pt-1">
                <Award className="w-4 h-4 text-gold-500 shrink-0" />
                <span className="font-bold text-gold-450">{effectiveStudent.faixa}</span>
                <span className="text-zinc-400">
                  ({effectiveStudent.graus} {effectiveStudent.graus === 1 ? 'grau' : 'graus'})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Botão "Editar Perfil" com touch area mínima de 44px e full width em telas < 480px */}
        {onEditClick && (
          <button
            type="button"
            onClick={onEditClick}
            className="btn-gold w-full sm:w-auto min-h-[44px] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 rounded-xl shadow-md transition-all active:scale-98 focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:outline-none shrink-0"
            aria-label="Editar informações do meu perfil"
          >
            <Edit3 className="w-4 h-4 shrink-0" />
            <span>Editar Perfil</span>
          </button>
        )}

      </div>
    </div>
  );
};

export default ProfileHeaderCard;
