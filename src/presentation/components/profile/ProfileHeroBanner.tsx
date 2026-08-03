import React from 'react';
import type { Aluno } from '@/domain/models/student';
import { Award } from 'lucide-react';

interface ProfileHeroBannerProps {
  student: Aluno;
  effectiveStudent: Aluno | null;
  profileName: string;
  profileAvatar?: string | null;
  profileRole: string;
  ibjjfCategoryName?: string | null;
}

export const ProfileHeroBanner: React.FC<ProfileHeroBannerProps> = ({
  student,
  effectiveStudent,
  profileName,
  profileAvatar,
  profileRole,
  ibjjfCategoryName
}) => {
  return (
    <div className="bg-gradient-to-br from-obsidian-900 via-obsidian-900 to-obsidian-950 border border-obsidian-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden w-full max-w-full min-w-0">
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-gold-550/10 via-amber-500/5 to-transparent blur-3xl rounded-full pointer-events-none" />
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 w-full min-w-0">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left w-full md:w-auto min-w-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-gold-550/40 bg-obsidian-950 flex items-center justify-center text-4xl shadow-2xl shrink-0 relative group">
            {profileAvatar ? (
              profileAvatar.length <= 2 ? (
                <span>{profileAvatar}</span>
              ) : (
                <img src={profileAvatar} alt={profileName} className="w-full h-full object-cover" />
              )
            ) : (
              <span className="text-slate-500">🥋</span>
            )}
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-obsidian-950 rounded-full shadow" />
          </div>

          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-wide truncate">
                {profileName}
              </h2>
              <span className="text-[9.5px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full shrink-0">
                {profileRole}
              </span>
              {student.status && (
                <span className={`text-[9.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border shrink-0 ${
                  student.status === 'Ativo' 
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                    : 'text-orange-400 bg-orange-500/10 border-orange-500/20'
                }`}>
                  {student.status}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start text-xs text-slate-350 font-medium">
              {effectiveStudent?.faixa && (
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                  <span className="font-bold text-slate-200">{effectiveStudent.faixa}</span>
                  <span className="text-zinc-500">({effectiveStudent.graus} {effectiveStudent.graus === 1 ? 'grau' : 'graus'})</span>
                </div>
              )}
              {student.turma && (
                <span className="text-zinc-500 font-semibold">• Turma: <strong className="text-slate-200">{student.turma}</strong></span>
              )}
              {student.bairro && (
                <span className="text-zinc-500 font-semibold">• Bairro: <strong className="text-slate-200">{student.bairro}</strong></span>
              )}
            </div>
          </div>
        </div>

        {student && student.peso ? (
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 w-full md:w-auto border-t md:border-t-0 md:border-l border-obsidian-800/80 pt-4 md:pt-0 md:pl-6 shrink-0">
            <div className="text-center md:text-right space-y-1">
              <span className="text-[9.5px] font-bold text-zinc-500 uppercase tracking-widest block">Peso Atual</span>
              <span className="text-xs font-black text-gold-450 block font-mono">
                {student.peso} kg
              </span>
            </div>
            {ibjjfCategoryName && (
              <div className="text-center md:text-right space-y-1 border-l border-obsidian-800/80 pl-4">
                <span className="text-[9.5px] font-bold text-zinc-500 uppercase tracking-widest block">Categoria Oficial</span>
                <span className="text-xs font-black text-slate-100 block uppercase tracking-wide">
                  {ibjjfCategoryName}
                </span>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
