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
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[900px]">
        <thead>
          <tr className="border-b border-obsidian-850/80 text-[10px] font-bold uppercase tracking-widest text-slate-450 bg-obsidian-950/40">
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
                      <div className="font-bold text-slate-200 group-hover:text-slate-100 transition-colors">
                        {student.nome}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                        CPF: {student.cpf || '—'}
                      </div>
                    </div>
                  </div>
                </td>

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
                      <Phone className="w-3.5 h-3.5 text-slate-450" />
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
                    {!isTeacher && (
                      <>
                        <button
                          onClick={() => onEdit(student)}
                          className="p-2 rounded bg-obsidian-950/80 hover:bg-obsidian-900 border border-obsidian-900 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all"
                          title="Editar Aluno"
                          type="button"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(student)}
                          className="p-2 rounded bg-obsidian-950/80 hover:bg-red-500/10 border border-obsidian-900 hover:border-red-500/20 text-slate-400 hover:text-red-400 transition-all"
                          title="Excluir Aluno"
                          type="button"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    {/* Sinalização de Status do Usuário */}
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ml-1.5 ${
                        student.status === 'Ativo'
                          ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse'
                          : student.status === 'Inativo'
                          ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                          : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]'
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
  );
};
export default StudentTable;
