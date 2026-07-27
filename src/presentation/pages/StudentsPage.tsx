import React, { useState } from 'react';
import type { Aluno } from '@/domain/models/student';
import { useAuth } from '@/application/hooks/useAuth';
import { useStudents } from '@/application/contexts/StudentsContext';
import { StudentTable } from '@/presentation/components/students/StudentTable';
import { StudentFormModal } from '@/presentation/components/students/StudentFormModal';
import { StudentImportModal } from '@/presentation/components/students/StudentImportModal';
import { StudentExportDropdown } from '@/presentation/components/students/StudentExportDropdown';
import { AdminResetPasswordModal } from '@/presentation/components/students/AdminResetPasswordModal';
import { Search, UserPlus } from 'lucide-react';

export const StudentsPage: React.FC = () => {
  const { loggedUser } = useAuth();
  const {
    students,
    createStudent,
    updateStudent,
    deleteStudent,
    batchUpdateStatus,
    batchDeleteStudents,
    importStudents,
    isLoading
  } = useStudents();

  const isTeacher = loggedUser?.role === 'teacher';
  const isAdmin = loggedUser?.role === 'admin';

  // Seleção múltipla
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

  // Filtros e busca
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBelt, setSelectedBelt] = useState<string>('Todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [selectedTurma, setSelectedTurma] = useState<string>('Todos');
  const [sortBy, setSortBy] = useState<string>('nome-asc');

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Controle de Modais
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const [editingStudent, setEditingStudent] = useState<Aluno | null>(null);
  const [isReadOnlyModal, setIsReadOnlyModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Aluno | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Redefinição de Senha por Admin
  const [resetPasswordTarget, setResetPasswordTarget] = useState<{ id: number; name: string; type: 'student' | 'teacher' | 'admin' } | null>(null);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  const handleOpenResetPassword = (student: Aluno) => {
    setResetPasswordTarget({ id: student.id, name: student.nome, type: 'student' });
    setShowResetPasswordModal(true);
  };

  // Abertura de Modais
  const handleOpenCreate = () => {
    setEditingStudent(null);
    setIsReadOnlyModal(false);
    setShowFormModal(true);
  };

  const handleOpenEdit = (student: Aluno) => {
    setEditingStudent(student);
    setIsReadOnlyModal(false);
    setShowFormModal(true);
  };

  const handleOpenView = (student: Aluno) => {
    setEditingStudent(student);
    setIsReadOnlyModal(true);
    setShowFormModal(true);
  };

  const handleOpenDelete = (student: Aluno) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  // Operações de Salvamento e Deleção
  const handleSaveStudent = async (formData: any) => {
    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, formData);
      } else {
        await createStudent(formData, loggedUser);
      }
      setShowFormModal(false);
      setEditingStudent(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar o aluno.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    try {
      await deleteStudent(studentToDelete.id);
      setShowDeleteModal(false);
      setStudentToDelete(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir o aluno.');
    }
  };

  // Ações em Lote
  const handleToggleSelectStudent = (id: number) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleBatchStatusChange = async (newStatus: 'Ativo' | 'Inativo' | 'Pendente') => {
    if (selectedStudentIds.length === 0) return;
    const confirmMessage = `Deseja realmente alterar o status de ${selectedStudentIds.length} aluno(s) para "${newStatus}"?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      await batchUpdateStatus(selectedStudentIds, newStatus);
      setSelectedStudentIds([]);
      alert('Status atualizado com sucesso!');
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar os status.');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedStudentIds.length === 0) return;
    const confirmMessage = `ATENÇÃO: Deseja realmente excluir permanentemente ${selectedStudentIds.length} aluno(s) selecionado(s)? Esta ação não pode ser desfeita e removerá históricos e pagamentos associados.`;
    if (!window.confirm(confirmMessage)) return;

    try {
      await batchDeleteStudents(selectedStudentIds);
      setSelectedStudentIds([]);
      alert('Alunos excluídos com sucesso!');
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir alunos.');
    }
  };

  const handleConfirmImport = async (parsedRows: any[]) => {
    try {
      await importStudents(parsedRows, loggedUser);
      setShowImportModal(false);
      alert('Alunos importados com sucesso!');
    } catch (err: any) {
      setImportError(err.message || 'Erro na importação.');
    }
  };

  // Filtragem e Ordenação
  const filteredStudents = students
    .filter(student => {
      const cleanQuery = searchQuery.toLowerCase();
      const cleanCPFQuery = searchQuery.replace(/\D/g, '');

      const matchesSearch =
        student.nome.toLowerCase().includes(cleanQuery) ||
        (student.cpf && cleanCPFQuery !== '' && student.cpf.replace(/\D/g, '').includes(cleanCPFQuery)) ||
        (student.email && student.email.toLowerCase().includes(cleanQuery));

      const matchesBelt = selectedBelt === 'Todos' || student.faixa === selectedBelt;

      const studentStatusNorm = (student.status || '').toLowerCase().trim();
      let matchesStatus = false;
      if (selectedStatus === 'Todos') {
        matchesStatus = true;
      } else if (selectedStatus === 'Ativo') {
        matchesStatus = studentStatusNorm === 'ativo';
      } else if (selectedStatus === 'Inativo') {
        matchesStatus = studentStatusNorm === 'inativo';
      } else if (selectedStatus === 'Pendente' || selectedStatus === 'Aguardando' || selectedStatus === 'Aguardando Aprovação') {
        matchesStatus = studentStatusNorm === 'pendente' || studentStatusNorm === 'aguardando' || studentStatusNorm.includes('aguardando');
      } else {
        matchesStatus = student.status === selectedStatus;
      }

      const matchesTurma = selectedTurma === 'Todos' || student.turma === selectedTurma;

      return matchesSearch && matchesBelt && matchesStatus && matchesTurma;
    })
    .sort((a, b) => {
      if (sortBy === 'nome-asc') return a.nome.localeCompare(b.nome, 'pt-BR');
      if (sortBy === 'nome-desc') return b.nome.localeCompare(a.nome, 'pt-BR');
      if (sortBy === 'matricula-desc') return new Date(b.dataMatricula).getTime() - new Date(a.dataMatricula).getTime();
      if (sortBy === 'matricula-asc') return new Date(a.dataMatricula).getTime() - new Date(b.dataMatricula).getTime();
      return 0;
    });

  // Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            Gestão de Alunos
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Cadastre, pesquise, edite e acompanhe os alunos da Sagrada Família BJJ.
          </p>
        </div>

        {!isTeacher && (
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowImportModal(true)}
              className="btn-obsidian py-2.5 px-4 font-bold text-xs uppercase tracking-wider rounded-lg flex-1 sm:flex-initial"
            >
              Importar Planilha
            </button>
            <button
              onClick={handleOpenCreate}
              className="btn-gold py-2.5 px-4 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 flex-1 sm:flex-initial"
            >
              <UserPlus className="w-4.5 h-4.5" />
              Novo Aluno
            </button>
          </div>
        )}
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-obsidian-900/40 p-4 border border-obsidian-850/60 rounded-2xl flex flex-col gap-4 backdrop-blur-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Busca por Texto */}
          <div className="relative group col-span-1 md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-slate-300 transition-colors">
              <Search className="w-4.5 h-4.5" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nome, CPF ou e-mail..."
              className="w-full bg-obsidian-950/70 border border-obsidian-800 hover:border-obsidian-750 focus:border-slate-500 rounded-xl pl-11 pr-4 py-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-500/25 transition-all"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Filtro por Faixa */}
          <div>
            <select
              value={selectedBelt}
              onChange={(e) => {
                setSelectedBelt(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-obsidian-950/70 border border-obsidian-800 hover:border-obsidian-750 focus:border-slate-500 rounded-xl px-4 py-3 text-xs text-slate-350 focus:outline-none transition-all cursor-pointer font-bold"
            >
              <option value="Todos">Todas as Faixas</option>
              <option value="Branca">Branca</option>
              <option value="Cinza">Cinza (Qualquer)</option>
              <option value="Amarela">Amarela (Qualquer)</option>
              <option value="Laranja">Laranja (Qualquer)</option>
              <option value="Verde">Verde (Qualquer)</option>
              <option value="Azul">Azul</option>
              <option value="Roxa">Roxa</option>
              <option value="Marrom">Marrom</option>
              <option value="Preta">Preta</option>
            </select>
          </div>

          {/* Filtro por Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-obsidian-950/70 border border-obsidian-800 hover:border-obsidian-750 focus:border-slate-500 rounded-xl px-4 py-3 text-xs text-slate-350 focus:outline-none transition-all cursor-pointer font-bold"
            >
              <option value="Todos">Todos os Status</option>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
              <option value="Pendente">Aguardando Aprovação / Pendentes</option>
            </select>
          </div>
        </div>

        {/* Sub-filtros: Turma, Ordenação e Limite por Página */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-obsidian-850/50">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Filtro Turma */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black shrink-0">Turma:</span>
              <select
                value={selectedTurma}
                onChange={(e) => {
                  setSelectedTurma(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-obsidian-950/70 border border-obsidian-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none cursor-pointer font-bold"
              >
                <option value="Todos">Todas</option>
                <option value="Kids">Kids</option>
                <option value="Adulto">Adulto</option>
              </select>
            </div>

            {/* Ordenação */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black shrink-0">Ordem:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-obsidian-950/70 border border-obsidian-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none cursor-pointer font-bold"
              >
                <option value="nome-asc">Nome (A - Z)</option>
                <option value="nome-desc">Nome (Z - A)</option>
                <option value="matricula-desc">Matrícula Recente</option>
                <option value="matricula-asc">Matrícula Antiga</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto shrink-0">
            {/* Ações em Lote */}
            {selectedStudentIds.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase font-black tracking-widest text-gold-450">{selectedStudentIds.length} selecionados:</span>
                <select
                  onChange={(e) => {
                    const action = e.target.value;
                    if (action === 'Ativo' || action === 'Inativo' || action === 'Pendente') {
                      handleBatchStatusChange(action as any);
                    } else if (action === 'delete') {
                      handleBatchDelete();
                    }
                    e.target.value = '';
                  }}
                  className="bg-gold-500 text-obsidian-950 border border-gold-400 rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-wider focus:outline-none cursor-pointer"
                >
                  <option value="" disabled selected>Ações em Lote...</option>
                  <option value="Ativo">Marcar como Ativos</option>
                  <option value="Pendente">Marcar como Pendentes</option>
                  <option value="Inativo">Marcar como Inativos</option>
                  {!isTeacher && <option value="delete">Excluir Alunos</option>}
                </select>
              </div>
            )}

            {/* Limite de registros por página */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black shrink-0">Por Página:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-obsidian-950/70 border border-obsidian-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none cursor-pointer font-bold"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Exportar */}
            <StudentExportDropdown filteredStudents={filteredStudents} />
          </div>
        </div>
      </div>

      {/* Tabela de Alunos */}
      <div className="bg-obsidian-800/40 border border-obsidian-850/65 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <StudentTable
          students={currentItems}
          selectedIds={selectedStudentIds}
          onToggleSelect={handleToggleSelectStudent}
          onSelectAll={(checked) => {
            if (checked) {
              setSelectedStudentIds(currentItems.map(s => s.id));
            } else {
              setSelectedStudentIds([]);
            }
          }}
          onView={handleOpenView}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onResetPassword={handleOpenResetPassword}
          isLoading={isLoading}
          isTeacher={isTeacher}
          isAdmin={isAdmin}
        />

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-obsidian-800 pt-4">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredStudents.length)} de {filteredStudents.length} alunos
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-obsidian-850 border border-obsidian-800 text-slate-350 hover:text-slate-200 hover:bg-obsidian-800 disabled:opacity-40 disabled:hover:text-slate-350 transition-colors"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  onClick={() => handlePageChange(num)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === num
                      ? 'bg-slate-100 text-obsidian-950 shadow-md'
                      : 'bg-obsidian-850 border border-obsidian-800 text-slate-350 hover:text-slate-200 hover:bg-obsidian-800'
                  }`}
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-obsidian-850 border border-obsidian-800 text-slate-350 hover:text-slate-200 hover:bg-obsidian-800 disabled:opacity-40 disabled:hover:text-slate-350 transition-colors"
              >
                Próximo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Formulário (Criar / Editar / Visualizar) */}
      {showFormModal && (
        <StudentFormModal
          isOpen={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setEditingStudent(null);
          }}
          onSave={handleSaveStudent}
          editingStudent={editingStudent}
          isTeacher={isTeacher}
          isReadOnly={isReadOnlyModal}
        />
      )}

      {/* Modal Importar CSV */}
      {showImportModal && (
        <StudentImportModal
          isOpen={showImportModal}
          onClose={() => {
            setShowImportModal(false);
            setImportError(null);
          }}
          onImport={handleConfirmImport}
          importError={importError}
        />
      )}

      {/* Modal Deletar Confirmação */}
      {showDeleteModal && studentToDelete && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-obsidian-850 border border-obsidian-750 p-6 md:p-8 rounded-2xl w-full max-w-md shadow-2xl animate-scale-up">
            <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wider mb-2">Excluir Aluno</h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Tem certeza que deseja excluir permanentemente o aluno <strong>{studentToDelete.nome}</strong>? Esta ação removerá também todo o histórico de graduações e faturas de pagamentos.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-obsidian px-5 py-2.5 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="btn-gold px-5 py-2.5 text-xs font-bold bg-red-650 hover:bg-red-600 border border-red-500/20 text-white"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Redefinição de Senha por Admin */}
      <AdminResetPasswordModal
        isOpen={showResetPasswordModal}
        onClose={() => {
          setShowResetPasswordModal(false);
          setResetPasswordTarget(null);
        }}
        targetUser={resetPasswordTarget}
      />
    </div>
  );
};
export default StudentsPage;
