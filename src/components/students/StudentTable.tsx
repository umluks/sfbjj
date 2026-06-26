import React from 'react';
import type { Aluno } from '../../types';
import { BeltBadge } from '../shared/BeltBadge';
import { formatDate, formatPhone, formatMonthYear } from '../../utils/formatters';
import {
  Calendar,
  Phone,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Square,
  CheckSquare
} from 'lucide-react';

interface StudentTableProps {
  paginatedStudents: Aluno[];
  selectedStudentIds: number[];
  onToggleSelectStudent: (id: number) => void;
  onToggleSelectAllPage: () => void;
  isAllPageSelected: boolean;
  isTeacher: boolean;
  onOpenView: (student: Aluno) => void;
  onOpenEdit: (student: Aluno) => void;
  onOpenDelete: (student: Aluno) => void;
  startIndex: number;
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  paginatedStudents,
  selectedStudentIds,
  onToggleSelectStudent,
  onToggleSelectAllPage,
  isAllPageSelected,
  isTeacher,
  onOpenView,
  onOpenEdit,
  onOpenDelete,
  startIndex,
  itemsPerPage,
  totalItems,
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage
}) => {
  return (
    <div className="bg-obsidian-900/20 border border-obsidian-900/60 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-obsidian-850/80 text-[10px] font-bold uppercase tracking-widest text-slate-450 bg-obsidian-950/40">
              <th className="px-6 py-4 w-12 text-center">
                <button
                  onClick={onToggleSelectAllPage}
                  className="text-slate-450 hover:text-slate-200 transition-colors"
                  type="button"
                >
                  {isAllPageSelected ? (
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
            {paginatedStudents.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-500 font-semibold uppercase tracking-wider">
                  Nenhum aluno encontrado correspondente aos filtros.
                </td>
              </tr>
            ) : (
              paginatedStudents.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-obsidian-800/15 transition-colors group cursor-pointer"
                  onClick={() => onToggleSelectStudent(student.id)}
                >
                  {/* Checkbox de Seleção */}
                  <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onToggleSelectStudent(student.id)}
                      className="text-slate-400 hover:text-slate-200 transition-colors"
                      type="button"
                    >
                      {selectedStudentIds.includes(student.id) ? (
                        <CheckSquare className="w-4 h-4 text-gold-500" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </td>

                  {/* Membro */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-obsidian-750/80 bg-obsidian-950 flex items-center justify-center text-xl shadow-inner select-none shrink-0">
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
                        <div className="font-bold text-slate-200 group-hover:text-slate-100 transition-colors">
                          {student.nome}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Nascimento / Idade */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-350">
                      <Calendar className="w-3.5 h-3.5 text-slate-450" />
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

                  {/* Faixa Atual */}
                  <td className="px-6 py-4">
                    <BeltBadge faixa={student.faixa} graus={student.graus} />
                  </td>

                  {/* Turma */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${student.turma === 'Kids'
                      ? 'bg-sky-500/5 text-sky-400 border border-sky-500/10'
                      : 'bg-indigo-500/5 text-indigo-400 border border-indigo-500/10'
                      }`}>
                      {student.turma || 'Adulto'}
                    </span>
                  </td>

                  {/* Última Graduação */}
                  <td className="px-6 py-4 text-slate-300 font-semibold font-mono">
                    {formatMonthYear(student.dataUltimaGraduacao || '')}
                  </td>

                  {/* Contato */}
                  <td className="px-6 py-4 min-w-[160px] whitespace-nowrap">
                    <div className="flex items-center gap-1 text-slate-300 whitespace-nowrap">
                      <Phone className="w-3.5 h-3.5 text-slate-450 shrink-0" />
                      <span className="font-mono">{student.telefone ? formatPhone(student.telefone) : '-'}</span>
                    </div>
                  </td>

                  {/* Ações */}
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onOpenView(student)}
                          className="p-2 rounded bg-obsidian-950/80 hover:bg-obsidian-900 border border-obsidian-900 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all"
                          title="Visualizar Aluno"
                          type="button"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {!isTeacher && (
                          <>
                            <button
                              onClick={() => onOpenEdit(student)}
                              className="p-2 rounded bg-obsidian-950/80 hover:bg-obsidian-900 border border-obsidian-900 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all"
                              title="Editar Aluno"
                              type="button"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onOpenDelete(student)}
                              className="p-2 rounded bg-obsidian-950/80 hover:bg-red-500/10 border border-obsidian-900 hover:border-red-500/20 text-slate-400 hover:text-red-400 transition-all"
                              title="Excluir Aluno"
                              type="button"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                      {/* Status Dot */}
                      <span
                        className={`inline-block w-2.5 h-2.5 rounded-full transition-all duration-300 ${student.status === 'Ativo'
                          ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                          : 'bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.3)]'
                          }`}
                        title={student.status}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Seção de Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-obsidian-850/80 bg-obsidian-950/20">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Mostrando <span className="text-slate-300">{startIndex + 1}</span> a <span className="text-slate-300">{Math.min(startIndex + itemsPerPage, totalItems)}</span> de <span className="text-slate-300">{totalItems}</span> membros
          </span>
          <div className="flex gap-2">
            <button
              onClick={onPrevPage}
              disabled={currentPage === 1}
              className="btn-obsidian py-1.5 px-3 text-[10px] uppercase font-black tracking-widest disabled:opacity-50 disabled:pointer-events-none"
              type="button"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Anterior
            </button>
            <button
              onClick={onNextPage}
              disabled={currentPage === totalPages}
              className="btn-obsidian py-1.5 px-3 text-[10px] uppercase font-black tracking-widest disabled:opacity-50 disabled:pointer-events-none"
              type="button"
            >
              Próximo
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
