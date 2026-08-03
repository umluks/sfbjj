import React from 'react';
import type { GraduationEligibility } from '@/domain/models/graduation';
import { Activity, Percent, CalendarCheck, Clock, Trophy, UserCheck } from 'lucide-react';

interface StudentIndicatorsGridProps {
  eligibility: GraduationEligibility;
  ibjjfCategoryName?: string | null;
}

export const StudentIndicatorsGrid: React.FC<StudentIndicatorsGridProps> = ({
  eligibility,
  ibjjfCategoryName
}) => {
  return (
    <div className="space-y-4 text-left">
      <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
        <Activity className="w-4 h-4 text-gold-500" />
        Indicadores de Desempenho
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total de Treinos */}
        <div className="bg-obsidian-900/60 border border-obsidian-850 p-4 rounded-2xl flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Treinos</span>
            <Activity className="w-4 h-4 text-gold-500" />
          </div>
          <div className="text-xl font-black text-slate-100 font-mono">{eligibility.totalTreinos}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Aulas praticadas</span>
        </div>

        {/* Frequência % */}
        <div className="bg-obsidian-900/60 border border-obsidian-850 p-4 rounded-2xl flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Frequência</span>
            <Percent className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-400 font-mono">{eligibility.frequenciaPercentual}%</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Assiduidade estimada</span>
        </div>

        {/* Check-ins Mês Atual */}
        <div className="bg-obsidian-900/60 border border-obsidian-850 p-4 rounded-2xl flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Check-ins</span>
            <CalendarCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-black text-amber-400 font-mono">{eligibility.checkinsMesAtual}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">No mês vigente</span>
        </div>

        {/* Tempo de Academia */}
        <div className="bg-obsidian-900/60 border border-obsidian-850 p-4 rounded-2xl flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Tempo Academia</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-black text-slate-100 font-mono">{eligibility.tempoAcademiaMeses}m</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Desde a matrícula</span>
        </div>

        {/* Competições / Categoria */}
        <div className="bg-obsidian-900/60 border border-obsidian-850 p-4 rounded-2xl flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Competições</span>
            <Trophy className="w-4 h-4 text-gold-400" />
          </div>
          <div className="text-xs font-black text-slate-100 uppercase truncate">
            {ibjjfCategoryName || 'N/D'}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block truncate">Categoria IBJJF</span>
        </div>

        {/* Última Presença */}
        <div className="bg-obsidian-900/60 border border-obsidian-850 p-4 rounded-2xl flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Última Presença</span>
            <UserCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xs font-black text-slate-200 font-mono">
            {eligibility.ultimaPresencaData ? eligibility.ultimaPresencaData : 'Sem registro'}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Data de presençat</span>
        </div>
      </div>
    </div>
  );
};
