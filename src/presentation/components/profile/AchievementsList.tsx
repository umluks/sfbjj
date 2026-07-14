import React, { useMemo } from 'react';
import {
  Compass,
  Flame,
  Shield,
  Zap,
  Calendar,
  Trophy,
  Lock
} from 'lucide-react';

interface AchievementsListProps {
  totalAulas: number;
  streak: number;
  dataMatricula: string;
  metaMensalProgresso: number; // Porcentagem (0 a 100)
}

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  unlocked: boolean;
  colorClass: string; // Tailwind color classes for custom gradient border/background
}

export const AchievementsList: React.FC<AchievementsListProps> = ({
  totalAulas,
  streak,
  dataMatricula,
  metaMensalProgresso
}) => {
  const badges = useMemo((): Badge[] => {
    // 1. Calcula dias de casa
    const dataMatr = new Date(dataMatricula);
    const hoje = new Date();
    const diffTime = Math.abs(hoje.getTime() - dataMatr.getTime());
    const diasDeCasa = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return [
      {
        id: 'first_step',
        title: 'Primeiro Passo',
        description: 'Realizou a primeira aula/presença na academia.',
        icon: Compass,
        unlocked: totalAulas >= 1,
        colorClass: 'from-blue-500/20 to-indigo-500/20 border-indigo-500/30 text-indigo-400'
      },
      {
        id: 'consistency',
        title: 'Consistência',
        description: 'Registrou pelo menos 5 presenças em aulas.',
        icon: Flame,
        unlocked: totalAulas >= 5,
        colorClass: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400'
      },
      {
        id: 'hard_work',
        title: 'Casca-Grossa',
        description: 'Completou 25 treinos registrados.',
        icon: Shield,
        unlocked: totalAulas >= 25,
        colorClass: 'from-amber-600/20 to-orange-500/20 border-amber-500/30 text-amber-500'
      },
      {
        id: 'iron_focus',
        title: 'Foco de Ferro',
        description: 'Manteve um streak de 3+ dias de treino.',
        icon: Zap,
        unlocked: streak >= 3,
        colorClass: 'from-red-500/20 to-pink-500/20 border-red-500/30 text-red-400'
      },
      {
        id: 'time_loyalty',
        title: 'Tempo de Casa',
        description: 'Treinando há mais de 6 meses (180 dias).',
        icon: Calendar,
        unlocked: diasDeCasa >= 180,
        colorClass: 'from-purple-500/20 to-fuchsia-500/20 border-purple-500/30 text-purple-400'
      },
      {
        id: 'perfect_month',
        title: 'Meta Cumprida',
        description: 'Atingiu 100% da meta de treinos mensal.',
        icon: Trophy,
        unlocked: metaMensalProgresso >= 100,
        colorClass: 'from-yellow-500/25 to-amber-400/25 border-yellow-500/40 text-yellow-400'
      }
    ];
  }, [totalAulas, streak, dataMatricula, metaMensalProgresso]);

  // Contagem de conquistas desbloqueadas
  const unlockedCount = useMemo(() => {
    return badges.filter(b => b.unlocked).length;
  }, [badges]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-obsidian-850 pb-3">
        <h4 className="text-[11px] font-black text-slate-200 uppercase tracking-widest flex items-center gap-2">
          <Trophy className="w-4 h-4 text-zinc-500" />
          Conquistas e Medalhas
        </h4>
        <span className="text-[10px] font-mono font-bold text-zinc-400 bg-obsidian-900 px-2 py-0.5 border border-obsidian-800">
          {unlockedCount} / {badges.length} Desbloqueadas
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {badges.map(badge => {
          const Icon = badge.icon;
          
          return (
            <div
              key={badge.id}
              className={`relative flex flex-col items-center justify-center p-5 text-center border transition-all duration-300 group select-none ${
                badge.unlocked
                  ? `bg-gradient-to-b ${badge.colorClass} shadow-md`
                  : 'bg-obsidian-950/40 border-obsidian-850/50 text-slate-600'
              }`}
            >
              {/* Efeito de Bloqueado/Lock */}
              {!badge.unlocked && (
                <div className="absolute top-2 right-2 text-slate-700">
                  <Lock className="w-3 h-3" />
                </div>
              )}

              {/* Ícone */}
              <div className={`p-3 rounded-full mb-3 transition-transform duration-300 group-hover:scale-110 ${
                badge.unlocked 
                  ? 'bg-black/25' 
                  : 'bg-obsidian-900/40 border border-obsidian-850'
              }`}>
                <Icon className={`w-6 h-6 ${badge.unlocked ? '' : 'text-slate-650'}`} />
              </div>

              {/* Título */}
              <h5 className={`text-[10.5px] font-black uppercase tracking-wider ${
                badge.unlocked ? 'text-slate-200' : 'text-slate-500'
              }`}>
                {badge.title}
              </h5>

              {/* Descrição em Tooltip ou Texto Pequeno */}
              <p className={`text-[8.5px] leading-snug mt-1 font-semibold ${
                badge.unlocked ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {badge.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
