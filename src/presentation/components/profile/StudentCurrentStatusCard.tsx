import React from 'react';
import type { Aluno } from '@/domain/models/student';
import type { GraduationEligibility } from '@/domain/models/graduation';
import { BeltBadge } from '@/presentation/components/shared/BeltBadge';
import { Award, Calendar, Clock, UserCheck, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatMonthYear } from '@/utils/formatters';

interface StudentCurrentStatusCardProps {
  student: Aluno;
  eligibility: GraduationEligibility;
  lastGraduationTeacher?: string;
}

export const StudentCurrentStatusCard: React.FC<StudentCurrentStatusCardProps> = ({
  student,
  eligibility,
  lastGraduationTeacher = 'Professor Master'
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Apto':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Apto para Graduação
          </span>
        );
      case 'Requisitos pendentes':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            Requisitos Pendentes
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            Em Andamento
          </span>
        );
    }
  };

  return (
    <div className="bg-gradient-to-br from-obsidian-900 via-obsidian-900 to-obsidian-950 border border-obsidian-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden text-left">
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-gold-550/5 blur-3xl rounded-full pointer-events-none" />

      {/* Cabeçalho do Card de Destaque */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-obsidian-800/80 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gold-550/10 border border-gold-550/20 rounded-2xl">
            <Award className="w-6 h-6 text-gold-500" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-100 uppercase tracking-tight">Situação Atual na Academia</h2>
            <p className="text-slate-400 text-xs mt-0.5">Status oficial de graduação e projeção de evolução</p>
          </div>
        </div>
        <div>{getStatusBadge(eligibility.status)}</div>
      </div>

      {/* Grid de Informações de Destaque */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card Faixa e Graus */}
        <div className="bg-obsidian-950/70 border border-obsidian-850 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
            Faixa & Graus Atuais
          </span>
          <div className="my-1">
            <BeltBadge faixa={student.faixa} graus={student.graus} />
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            {student.graus === 1 ? '1 Grau conquistado' : `${student.graus} Graus conquistados`}
          </span>
        </div>

        {/* Card Última Graduação */}
        <div className="bg-obsidian-950/70 border border-obsidian-850 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
            Última Graduação
          </span>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-100 font-mono">
              <Calendar className="w-4 h-4 text-gold-500 shrink-0" />
              {formatMonthYear(student.dataUltimaGraduacao || student.dataMatricula || '')}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
              <UserCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{lastGraduationTeacher}</span>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Tempo na faixa: <strong className="text-slate-200">{eligibility.tempoFaixaAtualMeses} meses</strong>
          </span>
        </div>

        {/* Card Projeção Próxima Graduação */}
        <div className="bg-obsidian-950/70 border border-obsidian-850 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
            Próxima Graduação Prevista
          </span>
          <div className="space-y-1">
            <div className="text-sm font-black text-gold-450 uppercase tracking-wide flex items-center gap-1.5">
              <span>{eligibility.proximaFaixa}</span>
              <span className="text-xs text-slate-400">({eligibility.proximoGrau}º grau)</span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Previsão: {formatMonthYear(eligibility.dataEstimadaProximaGraduacao)}
            </div>
          </div>
          <span className="text-[11px] text-amber-400/90 font-medium mt-2 block">
            {eligibility.status === 'Apto' ? 'Pronto para exame de faixa!' : 'Aguardando cumprimento de etapas'}
          </span>
        </div>

        {/* Card Barra de Evolução % */}
        <div className="bg-obsidian-950/70 border border-obsidian-850 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Evolução</span>
            <span className="text-xs font-mono font-black text-gold-400">{eligibility.percentualEvolucao}%</span>
          </div>

          <div className="w-full bg-obsidian-900 border border-obsidian-800 rounded-full h-3.5 p-0.5 overflow-hidden my-2">
            <div
              className="bg-gradient-to-r from-gold-600 to-amber-400 h-full rounded-full transition-all duration-500 shadow-md shadow-gold-500/20"
              style={{ width: `${eligibility.percentualEvolucao}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-gold-500" /> Meta do grau
            </span>
            <span>{eligibility.percentualEvolucao >= 100 ? 'Requisitos 100%' : 'Em progresso'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
