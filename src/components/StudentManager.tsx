import React, { useState } from 'react';
import type { Aluno, LoggedUser } from '../types';
import { useStudents } from '../contexts/StudentsContext';
import { StudentTable } from './students/StudentTable';
import { StudentFormModal } from './students/StudentFormModal';
import { StudentImportModal } from './students/StudentImportModal';
import { StudentExportDropdown } from './students/StudentExportDropdown';
import { Search, UserPlus } from 'lucide-react';

interface StudentManagerProps {
  loggedUser: LoggedUser | null;
}

export const StudentManager: React.FC<StudentManagerProps> = ({ loggedUser }) => {
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

  const handleBatchStatusChange = async (newStatus: 'Ativo' | 'Inativo') => {
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
      const matchesSearch =
        student.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.bairro || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBelt = selectedBelt === 'Todos' || student.faixa === selectedBelt;
      const matchesStatus = selectedStatus === 'Todos' || student.status === selectedStatus;
      const matchesTurma = selectedTurma === 'Todos' || student.turma === selectedTurma;

      return matchesSearch && matchesBelt && matchesStatus && matchesTurma;
    })
    .sort((a, b) => {
      if (sortBy === 'nome-asc') {
        return a.nome.localeCompare(b.nome, 'pt-BR');
      } else if (sortBy === 'nome-desc') {
        return b.nome.localeCompare(a.nome, 'pt-BR');
      } else if (sortBy === 'dataUltimaGraduacao-desc') {
        return new Date(b.dataUltimaGraduacao || 0).getTime() - new Date(a.dataUltimaGraduacao || 0).getTime();
      }
      return a.nome.localeCompare(b.nome, 'pt-BR');
    });

  // Paginação
  const totalItems = filteredStudents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  const handleToggleSelectAllPage = () => {
    const pageIds = paginatedStudents.map(s => s.id);
    const allSelected = pageIds.every(id => selectedStudentIds.includes(id));

    if (allSelected) {
      setSelectedStudentIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedStudentIds(prev => [
        ...prev,
        ...pageIds.filter(id => !prev.includes(id))
      ]);
    }
  };

  const isAllPageSelected = paginatedStudents.length > 0 && paginatedStudents.every(s => selectedStudentIds.includes(s.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <span className="text-gold-500">🥋</span> Gestão de Alunos
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Cadastre, edite e acompanhe os alunos da Sagrada Família BJJ.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto relative">
          {!isTeacher && (
            <button
              onClick={() => setShowImportModal(true)}
              className="btn-obsidian flex items-center gap-2 border border-obsidian-750 hover:border-gold-500/50 hover:text-gold-450 transition-all font-bold text-xs"
              type="button"
            >
              Importar Alunos
            </button>
          )}

          <StudentExportDropdown filteredStudents={filteredStudents} />

          {!isTeacher && (
            <button
              onClick={handleOpenCreate}
              className="btn-gold flex items-center gap-2"
              type="button"
            >
              <UserPlus className="w-4 h-4" />
              Cadastrar Membro
            </button>
          )}
        </div>
      </div>

      {/* Busca e Filtros */}
      <div className="space-y-4 bg-obsidian-900/40 p-4 rounded-xl border border-obsidian-850/60 backdrop-blur-md">
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 text-left">
          {/* Busca */}
          <div className="sm:col-span-2 relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por nome ou bairro..."
              className="input-premium w-full pl-10"
            />
          </div>

          {/* Filtro de Faixa */}
          <div>
            <select
              value={selectedBelt}
              onChange={(e) => {
                setSelectedBelt(e.target.value);
                setCurrentPage(1);
              }}
              className="input-premium w-full bg-obsidian-950 text-slate-200"
            >
              <option value="Todos">Todas as Faixas</option>
              <option value="Branca">Branca</option>
              <option value="Cinza">Cinza</option>
              <option value="Amarela">Amarela</option>
              <option value="Laranja">Laranja</option>
              <option value="Verde">Verde</option>
              <option value="Azul">Azul</option>
              <option value="Roxa">Roxa</option>
              <option value="Marrom">Marrom</option>
              <option value="Preta">Preta</option>
            </select>
          </div>

          {/* Filtro de Turma */}
          <div>
            <select
              value={selectedTurma}
              onChange={(e) => {
                setSelectedTurma(e.target.value);
                setCurrentPage(1);
              }}
              className="input-premium w-full bg-obsidian-950 text-slate-200"
            >
              <option value="Todos">Todas as Turmas</option>
              <option value="Adulto">Adultos</option>
              <option value="Kids">Kids</option>
            </select>
          </div>

          {/* Filtro de Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="input-premium w-full bg-obsidian-950 text-slate-200"
            >
              <option value="Todos">Status: Todos</option>
              <option value="Ativo">Ativos</option>
              <option value="Inativo">Inativos</option>
            </select>
          </div>

          {/* Ordenação */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="input-premium w-full bg-obsidian-950 text-slate-200"
            >
              <option value="nome-asc">Nome (A-Z)</option>
              <option value="nome-desc">Nome (Z-A)</option>
              <option value="dataUltimaGraduacao-desc">Última Graduação</option>
            </select>
          </div>
        </div>

        {/* Ações em Lote */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-obsidian-850/50 gap-3">
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Mostrar:</span>
            <select
              value={itemsPerPage === 999999 ? 'Todos' : itemsPerPage}
              onChange={(e) => {
                const val = e.target.value;
                setItemsPerPage(val === 'Todos' ? 999999 : Number(val));
                setCurrentPage(1);
              }}
              className="bg-obsidian-950 border border-obsidian-800 rounded px-2 py-1 text-slate-200 text-xs focus:border-gold-500/50 outline-none"
            >
              <option value={10}>10 membros</option>
              <option value={20}>20 membros</option>
              <option value={30}>30 membros</option>
              <option value="Todos">Todos</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {selectedStudentIds.length > 0 ? (
              <>
                <span className="text-[10px] text-gold-450 font-bold uppercase tracking-wider">
                  {selectedStudentIds.length} selecionado(s):
                </span>
                <button
                  onClick={() => setSelectedStudentIds([])}
                  className="px-2.5 py-1 text-[9px] uppercase font-bold tracking-wider text-slate-400 hover:text-slate-200 bg-obsidian-850 hover:bg-obsidian-800 border border-obsidian-750 transition-colors rounded"
                  type="button"
                >
                  Limpar
                </button>
                {!isTeacher && (
                  <>
                    <button
                      onClick={() => handleBatchStatusChange('Ativo')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9px] uppercase tracking-wider py-1 px-2.5 rounded transition-colors"
                      type="button"
                    >
                      Ativar
                    </button>
                    <button
                      onClick={() => handleBatchStatusChange('Inativo')}
                      className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-[9px] uppercase tracking-wider py-1 px-2.5 rounded transition-colors"
                      type="button"
                    >
                      Inativar
                    </button>
                    <button
                      onClick={handleBatchDelete}
                      className="bg-red-600/90 hover:bg-red-650 text-white font-bold text-[9px] uppercase tracking-wider py-1 px-2.5 rounded border border-red-500/20 transition-colors"
                      type="button"
                    >
                      Excluir
                    </button>
                  </>
                )}
              </>
            ) : (
              <span className="text-[10px] text-slate-500 italic">Selecione alunos usando as caixas de seleção na tabela para ações em lote</span>
            )}
          </div>
        </div>
      </div>

      {/* Tabela de Membros */}
      {isLoading ? (
        <div className="text-center py-20 text-slate-450 font-bold uppercase text-xs">
          Carregando dados dos alunos...
        </div>
      ) : (
        <StudentTable
          paginatedStudents={paginatedStudents}
          selectedStudentIds={selectedStudentIds}
          onToggleSelectStudent={handleToggleSelectStudent}
          onToggleSelectAllPage={handleToggleSelectAllPage}
          isAllPageSelected={isAllPageSelected}
          isTeacher={isTeacher}
          onOpenView={handleOpenView}
          onOpenEdit={handleOpenEdit}
          onOpenDelete={handleOpenDelete}
          startIndex={startIndex}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevPage={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
          onNextPage={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
        />
      )}

      {/* Modal Formulário Cadastro/Edição */}
      <StudentFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        editingStudent={editingStudent}
        onSave={handleSaveStudent}
        isTeacher={isTeacher}
        isReadOnly={isReadOnlyModal}
      />

      {/* Modal de Exclusão */}
      {showDeleteModal && studentToDelete && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-obsidian-850 border border-obsidian-700/80 rounded-2xl w-full max-w-md shadow-2xl p-6 animate-scale-up text-left">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="text-red-500">⚠️</span> Excluir Membro?
            </h2>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Você está prestes a excluir definitivamente o registro do aluno <span className="text-gold-450 font-semibold">{studentToDelete.nome}</span>.
              Esta ação removerá todos os dados cadastrais, presenças e histórico financeiro, não podendo ser revertida.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-obsidian text-xs"
                type="button"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="bg-red-650 hover:bg-red-600 border border-red-500/20 text-white font-semibold px-4 py-2 rounded-lg transition-all text-xs active:scale-[0.98]"
                type="button"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Importação CSV */}
      <StudentImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleConfirmImport}
        isImporting={isLoading}
        importError={importError}
        setImportError={setImportError}
      />
    </div>
  );
};
