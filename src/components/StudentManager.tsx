import React, { useState } from 'react';
import type { Student, Belt, Degree, Gender } from '../types';
import {
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  UserPlus,
  Shield,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Plus
} from 'lucide-react';

interface StudentManagerProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
}

export const StudentManager: React.FC<StudentManagerProps> = ({ students, setStudents }) => {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBelt, setSelectedBelt] = useState<string>('Todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Form fields state
  const [formNome, setFormNome] = useState('');
  const [formCpf, setFormCpf] = useState('');
  const [formDataNascimento, setFormDataNascimento] = useState('');
  const [formTelefone, setFormTelefone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formGenero, setFormGenero] = useState<Gender>('Masculino');
  const [formDataMatricula, setFormDataMatricula] = useState('');
  const [formBairro, setFormBairro] = useState('');
  const [formFaixa, setFormFaixa] = useState<Belt>('Branca');
  const [formGraus, setFormGraus] = useState<Degree>(0);
  const [formDataUltimaGraduacao, setFormDataUltimaGraduacao] = useState('');
  const [formContatoEmergenciaNome, setFormContatoEmergenciaNome] = useState('');
  const [formContatoEmergenciaTel, setFormContatoEmergenciaTel] = useState('');
  const [formStatus, setFormStatus] = useState<'Ativo' | 'Inativo'>('Ativo');

  // Input formatting helpers
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '') // Remove non-digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .substring(0, 14);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .substring(0, 14);
    }
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 15);
  };

  // Open form modal for creating
  const handleOpenCreate = () => {
    setEditingStudent(null);
    setFormNome('');
    setFormCpf('');
    setFormDataNascimento('');
    setFormTelefone('');
    setFormEmail('');
    setFormGenero('Masculino');
    setFormDataMatricula(new Date().toISOString().split('T')[0]);
    setFormBairro('');
    setFormFaixa('Branca');
    setFormGraus(0);
    setFormDataUltimaGraduacao('');
    setFormContatoEmergenciaNome('');
    setFormContatoEmergenciaTel('');
    setFormStatus('Ativo');
    setShowFormModal(true);
  };

  // Open form modal for editing
  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormNome(student.nome);
    setFormCpf(student.cpf || '');
    setFormDataNascimento(student.dataNascimento || '');
    setFormTelefone(formatPhone(student.telefone || ''));
    setFormEmail(student.email || '');
    setFormGenero(student.genero || 'Masculino');
    setFormDataMatricula(student.dataMatricula || new Date().toISOString().split('T')[0]);
    setFormBairro(student.bairro || '');
    setFormFaixa(student.faixa || 'Branca');
    setFormGraus(student.graus || 0);
    setFormDataUltimaGraduacao(student.dataUltimaGraduacao || '');
    setFormContatoEmergenciaNome(student.contatoEmergenciaNome || '');
    setFormContatoEmergenciaTel(formatPhone(student.contatoEmergenciaTel || ''));
    setFormStatus(student.status || 'Ativo');
    setShowFormModal(true);
  };

  // Save student (Create or Update)
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome || !formDataNascimento || !formBairro) return;

    if (editingStudent) {
      // Update
      setStudents(prev => prev.map(s => {
        if (s.id === editingStudent.id) {
          return {
            ...s,
            nome: formNome,
            cpf: formCpf,
            dataNascimento: formDataNascimento,
            telefone: formTelefone,
            email: formEmail,
            genero: formGenero,
            dataMatricula: formDataMatricula,
            bairro: formBairro,
            faixa: formFaixa,
            graus: formGraus,
            dataUltimaGraduacao: formDataUltimaGraduacao,
            contatoEmergenciaNome: formContatoEmergenciaNome,
            contatoEmergenciaTel: formContatoEmergenciaTel,
            status: formStatus
          };
        }
        return s;
      }));
    } else {
      // Create
      const newStudent: Student = {
        id: `std_${Date.now()}`,
        nome: formNome,
        cpf: formCpf || `000.000.000-${Math.floor(Math.random() * 90 + 10)}`,
        dataNascimento: formDataNascimento,
        telefone: formTelefone,
        email: formEmail || `${formNome.toLowerCase().replace(/\s+/g, '.')}@sfbjj.com.br`,
        genero: formGenero,
        dataMatricula: formDataMatricula,
        bairro: formBairro,
        faixa: formFaixa,
        graus: formGraus,
        dataUltimaGraduacao: formDataUltimaGraduacao,
        contatoEmergenciaNome: formContatoEmergenciaNome,
        contatoEmergenciaTel: formContatoEmergenciaTel,
        status: formStatus,
        totalTreinos: 0,
        pagamentos: [
          {
            id: `pay_${Date.now()}`,
            mesRef: 'Maio/2026',
            valor: 150,
            status: 'Pendente',
            dataVencimento: '2026-05-30',
            dataPagamento: null
          }
        ]
      };
      setStudents(prev => [newStudent, ...prev]);
    }

    setShowFormModal(false);
    setEditingStudent(null);
  };

  // Open delete confirmation modal
  const handleOpenDelete = (student: Student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  // Confirm delete student
  const handleConfirmDelete = () => {
    if (!studentToDelete) return;
    setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  // Filter and sort students alphabetically
  const filteredStudents = students
    .filter(student => {
      const matchesSearch =
        student.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.bairro || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBelt = selectedBelt === 'Todos' || student.faixa === selectedBelt;
      const matchesStatus = selectedStatus === 'Todos' || student.status === selectedStatus;

      return matchesSearch && matchesBelt && matchesStatus;
    })
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  // Calculate pagination
  const totalItems = filteredStudents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Helper to render beautiful visual BJJ belt
  const renderBeltBadge = (faixa: Belt, graus: Degree) => {
    let beltClass = '';
    let barColor = 'bg-black'; // Black sleeve bar standard

    switch (faixa) {
      case 'Branca':
        beltClass = 'bg-white text-slate-900 border border-slate-300';
        barColor = 'bg-neutral-900';
        break;
      case 'Cinza':
        beltClass = 'bg-slate-400 text-slate-950 border border-slate-500';
        barColor = 'bg-neutral-950';
        break;
      case 'Amarela':
        beltClass = 'bg-yellow-400 text-slate-950 border border-yellow-500';
        barColor = 'bg-neutral-950';
        break;
      case 'Laranja':
        beltClass = 'bg-orange-500 text-white';
        barColor = 'bg-neutral-950';
        break;
      case 'Verde':
        beltClass = 'bg-emerald-600 text-white';
        barColor = 'bg-neutral-950';
        break;
      case 'Azul':
        beltClass = 'bg-blue-750 text-white';
        barColor = 'bg-neutral-950';
        break;
      case 'Roxa':
        beltClass = 'bg-purple-700 text-white';
        barColor = 'bg-neutral-950';
        break;
      case 'Marrom':
        beltClass = 'bg-amber-900 text-white';
        barColor = 'bg-neutral-950';
        break;
      case 'Preta':
        beltClass = 'bg-neutral-950 border border-gold-500/75 text-gold-450';
        barColor = 'bg-red-600'; // Red sleeve bar for black belts
        break;
    }

    return (
      <div className={`w-28 h-6 rounded flex items-center relative overflow-hidden font-extrabold text-[10px] tracking-wider shadow-sm select-none ${beltClass}`}>
        {/* Belt Name */}
        <span className="pl-2 uppercase z-10">{faixa}</span>

        {/* Sleeve section for stripes (degrees) */}
        <div className={`absolute right-0 top-0 bottom-0 w-8 ${barColor} flex items-center justify-around px-0.5 border-l border-obsidian-950/45`}>
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className={`w-0.5 h-3 rounded-sm transition-all ${idx < graus
                ? 'bg-amber-300 shadow shadow-gold-500/60'
                : 'bg-neutral-800/40'
                }`}
              title={`${graus} Grau(s)`}
            />
          ))}
        </div>
      </div>
    );
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    // If it's already DD/MM/YYYY
    if (dateStr.includes('/')) return dateStr;
    // If YYYY-MM-DD
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <span className="text-gold-500">🥋</span> Gestão de Membros
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Cadastre, edite e acompanhe os alunos da Sagrada Família BJJ.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="btn-gold self-start sm:self-auto flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Cadastrar Membro
        </button>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-obsidian-850 p-4 rounded-xl border border-obsidian-800/80">
        {/* Search */}
        <div className="sm:col-span-2 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
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
            className="input-premium w-full pl-9"
          />
        </div>

        {/* Belt Filter */}
        <div>
          <select
            value={selectedBelt}
            onChange={(e) => {
              setSelectedBelt(e.target.value);
              setCurrentPage(1);
            }}
            className="input-premium w-full bg-obsidian-950 text-slate-200">
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

        {/* Status Filter */}
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
      </div>

      {/* Desktop List / Table */}
      <div className="bg-obsidian-800/50 border border-obsidian-800/90 rounded-xl overflow-hidden shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-obsidian-750 text-xs font-bold uppercase tracking-wider text-slate-400 bg-obsidian-850/40">
                <th className="px-6 py-4">Membro</th>
                <th className="px-6 py-4">Nascimento / Idade</th>
                <th className="px-6 py-4">Bairro</th>
                <th className="px-6 py-4">Faixa Atual</th>
                <th className="px-6 py-4">Última Graduação</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-750 text-sm text-slate-300">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-500 font-medium">
                    Nenhum aluno encontrado correspondente aos filtros.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-obsidian-700/20 transition-colors group"
                  >
                    {/* Membro */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-100 group-hover:text-gold-450 transition-colors">
                        {student.nome}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Matrícula: {formatDate(student.dataMatricula)}
                      </div>
                    </td>

                    {/* Nascimento / Idade */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-gold-500/80" />
                        {formatDate(student.dataNascimento)}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
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

                    {/* Bairro */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-xs text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-gold-500/80" />
                        <span>{student.bairro || '-'}</span>
                      </div>
                    </td>

                    {/* Faixa Atual */}
                    <td className="px-6 py-4">
                      {renderBeltBadge(student.faixa, student.graus)}
                    </td>

                    {/* Última Graduação */}
                    <td className="px-6 py-4 text-xs font-medium text-slate-300">
                      {student.dataUltimaGraduacao || '-'}
                    </td>

                    {/* Contato */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-xs text-slate-200">
                        <Phone className="w-3.5 h-3.5 text-gold-500/80" />
                        <span className="font-mono">{student.telefone ? formatPhone(student.telefone) : '-'}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${student.status === 'Ativo'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-700/10 text-slate-400 border border-slate-750'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'Ativo' ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                        {student.status}
                      </span>
                    </td>

                    {/* Ações */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="p-1.5 rounded bg-obsidian-850 hover:bg-obsidian-750 border border-obsidian-700 text-slate-300 hover:text-gold-500 transition-all"
                          title="Editar cadastro"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(student)}
                          className="p-1.5 rounded bg-obsidian-850 hover:bg-red-500/10 border border-obsidian-700 hover:border-red-500/30 text-slate-300 hover:text-red-500 transition-all"
                          title="Excluir Aluno"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-obsidian-750 bg-obsidian-850/20">
            <span className="text-xs text-slate-400">
              Mostrando <span className="text-slate-200">{startIndex + 1}</span> a <span className="text-slate-200">{Math.min(startIndex + itemsPerPage, totalItems)}</span> de <span className="text-slate-200">{totalItems}</span> membros
            </span>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="btn-obsidian py-1.5 px-2.5 text-xs disabled:opacity-50 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Anterior
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="btn-obsidian py-1.5 px-2.5 text-xs disabled:opacity-50 disabled:pointer-events-none"
              >
                Próximo
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CRUD Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-obsidian-850 border border-obsidian-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-up">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-obsidian-750 sticky top-0 bg-obsidian-850 z-10">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Shield className="w-5 h-5 text-gold-500" />
                {editingStudent ? 'Editar Cadastro de Membro' : 'Cadastrar Novo Membro'}
              </h2>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-slate-400 hover:text-gold-500 p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveStudent} className="p-6 space-y-5">

              {/* Seção 1: Dados Pessoais */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gold-450 uppercase tracking-widest border-b border-obsidian-750 pb-1.5 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Dados Gerais
                </h3>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Nome Completo *</label>
                  <input
                    type="text"
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    placeholder="Nome e Sobrenome"
                    className="input-premium"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Data de Nascimento *</label>
                    <input
                      type="date"
                      value={formDataNascimento}
                      onChange={(e) => setFormDataNascimento(e.target.value)}
                      className="input-premium"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Bairro *</label>
                    <input
                      type="text"
                      value={formBairro}
                      onChange={(e) => setFormBairro(e.target.value)}
                      placeholder="Ex: Asa Sul, Guará"
                      className="input-premium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Telefone (Contato) *</label>
                    <input
                      type="text"
                      value={formTelefone}
                      onChange={(e) => setFormTelefone(formatPhone(e.target.value))}
                      placeholder="(61) 99999-9999"
                      className="input-premium font-mono"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">E-mail</label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="email@dominio.com"
                      className="input-premium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">CPF</label>
                    <input
                      type="text"
                      value={formCpf}
                      onChange={(e) => setFormCpf(formatCPF(e.target.value))}
                      placeholder="000.000.000-00"
                      className="input-premium font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Gênero</label>
                    <select
                      value={formGenero}
                      onChange={(e) => setFormGenero(e.target.value as Gender)}
                      className="input-premium bg-obsidian-950 text-slate-200"
                    >
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Seção 2: Graduação Jiu-Jitsu */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-gold-450 uppercase tracking-widest border-b border-obsidian-750 pb-1.5 flex items-center gap-1.5">
                  🥋 Graduação (BJJ)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Graduação (Faixa Atual)</label>
                    <select
                      value={formFaixa}
                      onChange={(e) => setFormFaixa(e.target.value as Belt)}
                      className="input-premium bg-obsidian-950 text-slate-200"
                    >
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
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Graus (0 a 4)</label>
                    <select
                      value={formGraus}
                      onChange={(e) => setFormGraus(Number(e.target.value) as Degree)}
                      className="input-premium bg-obsidian-950 text-slate-200"
                    >
                      <option value={0}>0 Grau</option>
                      <option value={1}>1 Grau</option>
                      <option value={2}>2 Graus</option>
                      <option value={3}>3 Graus</option>
                      <option value={4}>4 Graus</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Última Graduação</label>
                    <input
                      type="text"
                      value={formDataUltimaGraduacao}
                      onChange={(e) => setFormDataUltimaGraduacao(e.target.value)}
                      placeholder="Ex: 23/08/2025 ou 2025"
                      className="input-premium"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Data de Matrícula</label>
                    <input
                      type="date"
                      value={formDataMatricula}
                      onChange={(e) => setFormDataMatricula(e.target.value)}
                      className="input-premium"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 3: Emergência */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-gold-450 uppercase tracking-widest border-b border-obsidian-750 pb-1.5 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-red-500" /> Contato de Emergência
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Nome de Emergência</label>
                    <input
                      type="text"
                      value={formContatoEmergenciaNome}
                      onChange={(e) => setFormContatoEmergenciaNome(e.target.value)}
                      placeholder="Nome do responsável / contato"
                      className="input-premium"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Telefone de Emergência</label>
                    <input
                      type="text"
                      value={formContatoEmergenciaTel}
                      onChange={(e) => setFormContatoEmergenciaTel(formatPhone(e.target.value))}
                      placeholder="(61) 99999-9999"
                      className="input-premium font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Status field */}
              <div className="flex items-center gap-3 pt-3">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Status Acadêmico:</span>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formStatus === 'Ativo'}
                    onChange={(e) => setFormStatus(e.target.checked ? 'Ativo' : 'Inativo')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-obsidian-950 border border-obsidian-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-gold-500 after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500/10 peer-checked:border-gold-500"></div>
                  <span className={`ml-3 text-sm font-semibold transition-colors ${formStatus === 'Ativo' ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {formStatus}
                  </span>
                </label>
              </div>

              {/* Footer controls */}
              <div className="flex justify-end gap-3 pt-6 border-t border-obsidian-750">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="btn-obsidian"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-gold px-6"
                >
                  {editingStudent ? 'Salvar Alterações' : 'Confirmar Cadastro'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && studentToDelete && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-obsidian-850 border border-obsidian-700/80 rounded-2xl w-full max-w-md shadow-2xl p-6 animate-scale-up">
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
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="bg-red-650 hover:bg-red-600 border border-red-500/20 text-white font-semibold px-4 py-2 rounded-lg transition-all text-xs active:scale-[0.98]"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
