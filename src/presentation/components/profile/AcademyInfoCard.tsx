import React from 'react';
import type { Aluno } from '@/domain/models/student';
import type { GraduationEligibility } from '@/domain/models/graduation';
import { School, Calendar, Award, UserCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

interface AcademyInfoCardProps {
  student: Aluno;
  eligibility?: GraduationEligibility | null;
  lastTeacherName?: string;
  ibjjfCategoryName?: string | null;
}

export const AcademyInfoCard: React.FC<AcademyInfoCardProps> = ({
  student,
  eligibility,
  lastTeacherName,
  ibjjfCategoryName
}) => {
  const formattedMatricula = student.id ? `#${String(student.id).padStart(4, '0')}` : 'N/A';
  
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Não cadastrada';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-obsidian-900/60 border border-obsidian-850 p-4 sm:p-6 rounded-2xl shadow-xl space-y-4 text-left w-full max-w-full min-w-0">
      
      {/* Título do Card */}
      <div className="flex items-center justify-between border-b border-obsidian-850 pb-3 gap-2">
        <div className="flex items-center gap-2.5">
          <School className="w-5 h-5 text-gold-500 shrink-0" />
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-100">Informações da Academia</h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Ficha institucional de jiu-jitsu e elegibilidade de treino.
            </p>
          </div>
        </div>

        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border shrink-0 ${
          student.status === 'Ativo'
            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            : 'text-orange-400 bg-orange-500/10 border-orange-500/20'
        }`}>
          {student.status || 'Ativo'}
        </span>
      </div>

      {/* Grid de Dados (1 Coluna Mobile, 2 Colunas Tablet, 4 Colunas Desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Matrícula */}
        <div className="bg-obsidian-950 p-3.5 rounded-xl border border-obsidian-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Matrícula</span>
          <span className="text-base font-black text-gold-450 font-mono block">{formattedMatricula}</span>
        </div>

        {/* Data de Ingresso */}
        <div className="bg-obsidian-950 p-3.5 rounded-xl border border-obsidian-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-1">
            <Calendar className="w-3 h-3 text-gold-500 shrink-0" />
            Data de Ingresso
          </span>
          <span className="text-sm font-bold text-slate-200 block">{formatDate(student.dataMatricula)}</span>
        </div>

        {/* Professor Responsável */}
        <div className="bg-obsidian-950 p-3.5 rounded-xl border border-obsidian-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-gold-500 shrink-0" />
            Professor Responsável
          </span>
          <span className="text-sm font-bold text-slate-200 block truncate">{lastTeacherName || 'Professor Master'}</span>
        </div>

        {/* Turma Principal */}
        <div className="bg-obsidian-950 p-3.5 rounded-xl border border-obsidian-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Turma Principal</span>
          <span className="text-sm font-bold text-slate-200 block">{student.turma || 'Adulto'}</span>
        </div>

        {/* Faixa & Graus Atual */}
        <div className="bg-obsidian-950 p-3.5 rounded-xl border border-obsidian-800 space-y-1 col-span-1 sm:col-span-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-gold-500 shrink-0" />
            Graduação Atual
          </span>
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-slate-100">{student.faixa}</span>
            <span className="text-xs text-gold-400 font-extrabold bg-gold-550/10 px-2 py-0.5 rounded border border-gold-550/20">
              {student.graus} {student.graus === 1 ? 'grau' : 'graus'}
            </span>
          </div>
        </div>

        {/* Categoria Oficial IBJJF */}
        <div className="bg-obsidian-950 p-3.5 rounded-xl border border-obsidian-800 space-y-1 col-span-1 sm:col-span-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Categoria Oficial IBJJF
          </span>
          <span className="text-sm font-bold text-slate-200 block uppercase truncate">
            {ibjjfCategoryName || 'Configure peso e data de nascimento'}
          </span>
        </div>

      </div>

      {/* Box de Elegibilidade de Graduação (se houver) */}
      {eligibility && (
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          eligibility.status === 'Apto' 
            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' 
            : 'bg-obsidian-950 border-obsidian-800 text-slate-300'
        }`}>
          <div className="flex items-center gap-3">
            {eligibility.status === 'Apto' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <div>
              <span className="text-xs font-black uppercase tracking-wider block">
                {eligibility.status === 'Apto' ? 'Elegível para Graduação!' : `Elegibilidade: ${eligibility.status}`}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                {eligibility.tempoFaixaAtualMeses} meses cumpridos na faixa atual • {eligibility.percentualEvolucao}% de evolução
              </span>
            </div>
          </div>
          
          <div className="text-left sm:text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Previsão</span>
            <span className="text-xs font-black text-gold-450">{eligibility.dataEstimadaProximaGraduacao || 'Em breve'}</span>
          </div>
        </div>
      )}

    </div>
  );
};

export default AcademyInfoCard;
