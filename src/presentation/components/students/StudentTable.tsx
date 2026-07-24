import React from 'react';
import type { Aluno } from '@/domain/models/student';
import { BeltBadge } from '@/presentation/components/shared/BeltBadge';
import { formatDate, formatPhone, formatMonthYear } from '@/utils/formatters';
import {
  Calendar,
  Phone,
  Eye,
  Edit,
  Trash2,
  Square,
  CheckSquare
} from 'lucide-react';

interface StudentTableProps {
  students: Aluno[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onSelectAll: (checked: boolean) => void;
  onView: (student: Aluno) => void;
  onEdit: (student: Aluno) => void;
  onDelete: (student: Aluno) => void;
  isLoading?: boolean;
  isTeacher: boolean;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onView,
  onEdit,
  onDelete,
  isLoading = false,
  isTeacher
}) => {
  const isAllSelected = students.length > 0 && students.every(s => selectedIds.includes(s.id));

  return (
    <>
      {/* Mobile Card List View */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-slate-500 font-bold uppercase tracking-wider text-xs bg-obsidian-950/20 rounded-xl border border-obsidian-850/50">
            Carregando membros...
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12 text-slate-550 font-semibold uppercase tracking-wider bg-obsidian-950/20 rounded-xl border border-obsidian-850/50">
            Nenhum aluno encontrado correspondente aos filtros.
          </div>
        ) : (
          students.map((student) => (
            <div
              key={student.id}
              onClick={() => onToggleSelect(student.id)}
              className={`bg-obsidian-900/40 border rounded-xl p-4 transition-all relative cursor-pointer ${
                selectedIds.includes(student.id)
                  ? 'border-gold-500 bg-obsidian-850/30'
                  : 'border-obsidian-800/80 hover:border-obsidian-750'
              }`}
            >
              {/* Top row: Checkbox, photo, name and status */}
              <div className="flex items-start gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect(student.id);
                  }}
                  className="text-slate-400 hover:text-slate-200 mt-1 shrink-0"
                  type="button"
                >
                  {selectedIds.includes(student.id) ? (
                    <CheckSquare className="w-4.5 h-4.5 text-gold-500" />
                  ) : (
                    <Square className="w-4.5 h-4.5" />
                  )}
                </button>

                <div className="w-11 h-11 rounded-full overflow-hidden border border-obsidian-750/80 bg-obsidian-950 flex items-center justify-center text-xl shadow-inner shrink-0 select-none">
                  {student.fotoPerfil ? (
                    student.fotoPerfil.length <= 2 ? (
                      <span>{student.fotoPerfil}</span>
                    ) : (
                      <img src={student.fotoPerfil} alt={student.nome} className="w-full h-full object-cover" />
                    )
                  ) : (
                    <span className="text-slate-500 text-sm">🥋</span>
                  )}
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <h4 className="font-bold text-slate-200 truncate leading-snug">
                    {student.nome}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                    CPF: {student.cpf || '—'}
                  </p>
                </div>

                {/* Status Indicator */}
                <span
                  className={`w-2.5 h-2.5 rounded-full absolute top-4 right-4 ${
                    student.status === 'Ativo'
                      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse'
                      : (student.status as string) === 'Pendente' || (student.status as string) === 'Aguardando' || (student.status as string) === 'Aguardando Aprovação'
                      ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)] animate-pulse'
                      : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                  }`}
                  title={`Status: ${student.status}`}
                />
              </div>

              {/* Middle row: Badges and basic info */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-obsidian-850/40 text-xs">
                <div>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Faixa Atual</p>
                  <div className="mt-1 flex">
                    <BeltBadge faixa={student.faixa} graus={student.graus} />
                  </div>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Turma</p>
                  <div className="mt-1">
                    <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider ${
                      student.turma === 'Kids'
                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/15'
                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15'
                    }`}>
                      {student.turma}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Nascimento / Idade</p>
                  <p className="text-slate-350 font-medium mt-0.5">
                    {formatDate(student.dataNascimento)} ({(() => {
                      if (!student.dataNascimento) return '-';
                      const birthDate = new Date(student.dataNascimento);
                      const today = new Date();
                      let age = today.getFullYear() - birthDate.getFullYear();
                      const monthDiff = today.getMonth() - birthDate.getMonth();
                      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                      }
                      return `${age} anos`;
                    })()})
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Última Graduação</p>
                  <p className="text-slate-350 font-semibold mt-0.5">
                    {formatMonthYear(student.dataUltimaGraduacao || student.dataMatricula)}
                  </p>
                </div>
              </div>

              {/* Contact Info (if available) */}
              {(student.telefone || student.email) && (
                <div className="mt-3 pt-2.5 border-t border-obsidian-850/40 text-xs">
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Contato</p>
                  <div className="flex flex-col gap-1 mt-1 text-slate-350">
                    {student.telefone && (
                      <span className="font-mono flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        {formatPhone(student.telefone)}
                      </span>
                    )}
                    {student.email && (
                      <span className="truncate flex items-center gap-1.5 text-[11px]">
                        <span className="text-slate-500 font-bold">@</span>
                        {student.email}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action buttons footer */}
              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-obsidian-850/40" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => onView(student)}
                  className="flex-1 py-2 px-3 rounded-lg bg-obsidian-950/80 hover:bg-obsidian-900 border border-obsidian-800 text-slate-300 flex items-center justify-center gap-2 font-bold text-xs transition-colors"
                  type="button"
                >
                  <Eye className="w-4 h-4 text-slate-450" />
                  Ficha
                </button>
                <button
                  onClick={() => onEdit(student)}
                  className="flex-1 py-2 px-3 rounded-lg bg-obsidian-950/80 hover:bg-obsidian-900 border border-obsidian-800 text-slate-300 flex items-center justify-center gap-2 font-bold text-xs transition-colors"
                  type="button"
                >
                  <Edit className="w-4 h-4 text-slate-450" />
                  {isTeacher ? 'Status' : 'Editar'}
                </button>
                {!isTeacher && (
                  <button
                    onClick={() => onDelete(student)}
                    className="py-2 px-3 rounded-lg bg-obsidian-950/80 hover:bg-red-500/10 border border-obsidian-800 hover:border-red-500/20 text-slate-455 hover:text-red-400 flex items-center justify-center transition-colors"
                    title="Excluir Aluno"
                    type="button"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-obsidian-850/80 text-[10px] font-bold uppercase tracking-widest text-slate-455 bg-obsidian-950/40">
              <th className="px-6 py-4 w-12 text-center">
                <button
                  onClick={() => onSelectAll(!isAllSelected)}
                  className="text-slate-455 hover:text-slate-200 transition-colors"
                  type="button"
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-4 h-4 text-gold-500" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="px-6 py-4">Membro</th>
              <th className="px-6 py-4">Nascimento / Idade</th>
              <th className="px-6 py-4">Faixa Atual</th>
              <th className="px-6 py-4">Turma</th>
              <th className="px-6 py-4">Última Graduação</th>
              <th className="px-6 py-4">Contato</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-obsidian-900/40 text-xs text-slate-305">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-500 font-bold uppercase tracking-wider text-xs">
                  Carregando membros...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-550 font-semibold uppercase tracking-wider">
                  Nenhum aluno encontrado correspondente aos filtros.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-obsidian-800/15 transition-colors group cursor-pointer"
                  onClick={() => onToggleSelect(student.id)}
                >
                  <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onToggleSelect(student.id)}
                      className="text-slate-400 hover:text-slate-200 transition-colors"
                      type="button"
                    >
                      {selectedIds.includes(student.id) ? (
                        <CheckSquare className="w-4 h-4 text-gold-500" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-obsidian-750/80 bg-obsidian-950 flex items-center justify-center text-xl shadow-inner select-none shrink-0">
                        {student.fotoPerfil ? (
                          student.fotoPerfil.length <= 2 ? (
                            <span>{student.fotoPerfil}</span>
                          ) : (
                            <img src={student.fotoPerfil} alt={student.nome} className="w-full h-full object-cover" />
                          )
                        ) : (
                          <span className="text-slate-500 text-sm">🥋</span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-200 group-hover:text-slate-100 transition-colors flex items-center gap-2">
                          <span>{student.nome}</span>
                          {((student.status as string) === 'Pendente' || (student.status as string) === 'Aguardando' || (student.status as string) === 'Aguardando Aprovação') && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-orange-500/15 text-orange-400 border border-orange-500/30">
                              Pendente
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                          CPF: {student.cpf || '—'}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-350">
                      <Calendar className="w-3.5 h-3.5 text-slate-455" />
                      {formatDate(student.dataNascimento)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-semibold mt-1">
                      {(() => {
                        if (!student.dataNascimento) return '-';
                        const birthDate = new Date(student.dataNascimento);
                        const today = new Date();
                        let age = today.getFullYear() - birthDate.getFullYear();
                        const monthDiff = today.getMonth() - birthDate.getMonth();
                        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                          age--;
                        }
                        return `${age} anos`;
                      })()}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-start">
                      <BeltBadge faixa={student.faixa} graus={student.graus} />
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider ${student.turma === 'Kids' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/15' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15'}`}>
                      {student.turma}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-350">
                      {formatMonthYear(student.dataUltimaGraduacao || student.dataMatricula)}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {student.telefone ? (
                      <div className="flex items-center gap-1.5 text-slate-350 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-455" />
                        {formatPhone(student.telefone)}
                      </div>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5 max-w-[150px] truncate">
                      {student.email || '—'}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2.5">
                      <button
                        onClick={() => onView(student)}
                        className="p-2 rounded bg-obsidian-950/80 hover:bg-obsidian-900 border border-obsidian-900 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all"
                        title="Visualizar Ficha"
                        type="button"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEdit(student)}
                        className="p-2 rounded bg-obsidian-950/80 hover:bg-obsidian-900 border border-obsidian-900 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all"
                        title={isTeacher ? "Alterar Status" : "Editar Aluno"}
                        type="button"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      {!isTeacher && (
                        <button
                          onClick={() => onDelete(student)}
                          className="p-2 rounded bg-obsidian-950/80 hover:bg-red-500/10 border border-obsidian-900 hover:border-red-500/20 text-slate-400 hover:text-red-400 transition-all"
                          title="Excluir Aluno"
                          type="button"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Sinalização de Status do Usuário */}
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ml-1.5 ${
                          student.status === 'Ativo'
                            ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse'
                            : (student.status as string) === 'Pendente' || (student.status as string) === 'Aguardando' || (student.status as string) === 'Aguardando Aprovação'
                            ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)] animate-pulse'
                            : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                        }`}
                        title={`Status: ${student.status}`}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};
export default StudentTable;
