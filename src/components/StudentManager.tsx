import React, { useState } from 'react';
import type { Aluno, Belt, Degree, Gender, LoggedUser } from '../types';
import { supabase } from '../lib/supabase';
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
  Calendar,
  Heart,
  Upload,
  FileSpreadsheet,
  Download,
  Eye
} from 'lucide-react';

const parseCSVDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  // Formato YYYY-MM-DD
  const ymdMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch) {
    return `${ymdMatch[1]}-${ymdMatch[2].padStart(2, '0')}-${ymdMatch[3].padStart(2, '0')}`;
  }
  // Formato DD-MM-YYYY ou DD/MM/YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    return `${dmyMatch[3]}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[1].padStart(2, '0')}`;
  }
  return '';
};

const splitCSVLine = (line: string, delimiter: string): string[] => {
  if (delimiter === '\t') {
    return line.split('\t').map(p => p.trim().replace(/^["']|["']$/g, ''));
  }
  
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  
  return result.map(p => p.trim().replace(/^["']|["']$/g, ''));
};

interface StudentManagerProps {
  students: Aluno[];
  setStudents: React.Dispatch<React.SetStateAction<Aluno[]>>;
  loggedUser: LoggedUser | null;
}

export const StudentManager: React.FC<StudentManagerProps> = ({ students, setStudents, loggedUser }) => {
  const isTeacher = loggedUser?.role === 'teacher';
  // Estado de Busca e Filtro
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBelt, setSelectedBelt] = useState<string>('Todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [selectedTurma, setSelectedTurma] = useState<string>('Todos');
  const [sortBy, setSortBy] = useState<string>('nome-asc');

  // Estado de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estado dos modais
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Aluno | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Aluno | null>(null);

  // Estado dos campos de importação
  const [importText, setImportText] = useState('');
  const [parsedImportRows, setParsedImportRows] = useState<any[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Estado do menu de exportação
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Estado dos campos do formulário
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
  const [formRole, setFormRole] = useState<'admin' | 'student' | 'teacher'>('student');
  const [formDataUltimaGraduacao, setFormDataUltimaGraduacao] = useState('');
  const [formContatoEmergenciaNome, setFormContatoEmergenciaNome] = useState('');
  const [formContatoEmergenciaTel, setFormContatoEmergenciaTel] = useState('');
  const [formStatus, setFormStatus] = useState<'Ativo' | 'Inativo'>('Ativo');
  const [formTurma, setFormTurma] = useState<'Kids' | 'Adulto'>('Adulto');
  const [formFotoPerfil, setFormFotoPerfil] = useState('');
  const [formHistoricoGraduacoes, setFormHistoricoGraduacoes] = useState<any[]>([]);

  // Helpers de formatação de entrada
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

  // Abre o modal de formulário para criação
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
    setFormRole('student');
    setFormDataUltimaGraduacao('');
    setFormContatoEmergenciaNome('');
    setFormContatoEmergenciaTel('');
    setFormStatus('Ativo');
    setFormTurma('Adulto');
    setFormFotoPerfil('');
    setFormHistoricoGraduacoes([]);
    setShowFormModal(true);
  };

  // Abre o modal de formulário para edição
  const handleOpenEdit = (student: Aluno) => {
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
    setFormRole(student.role || 'student');
    // Converte para formato YYYY-MM para uso no input type="month"
    const ug = student.dataUltimaGraduacao || '';
    let monthVal = '';
    if (ug) {
      if (ug.includes('/')) {
        // DD/MM/YYYY -> YYYY-MM
        const p = ug.split('/');
        if (p.length === 3) monthVal = `${p[2]}-${p[1].padStart(2, '0')}`;
      } else if (ug.includes('-')) {
        // YYYY-MM-DD ou YYYY-MM
        monthVal = ug.substring(0, 7);
      }
    }
    setFormDataUltimaGraduacao(monthVal);
    setFormContatoEmergenciaNome(student.contatoEmergenciaNome || '');
    setFormContatoEmergenciaTel(formatPhone(student.contatoEmergenciaTel || ''));
    setFormStatus(student.status || 'Ativo');
    setFormTurma(student.turma || 'Adulto');
    setFormFotoPerfil(student.fotoPerfil || '');
    setFormHistoricoGraduacoes(student.historicoGraduacoes || []);
    setShowFormModal(true);
  };

  // Salva o aluno (Criar ou Atualizar)
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome || !formDataNascimento || !formBairro) return;

    // formDataUltimaGraduacao está no formato YYYY-MM (input type="month")
    // Converte para YYYY-MM-01 para armazenar no banco
    const dbUltimaGrad = formDataUltimaGraduacao
      ? `${formDataUltimaGraduacao}-01`
      : new Date().toISOString().split('T')[0];

    if (editingStudent) {
      // Atualiza o aluno no supabase
      const { error: updateError } = await supabase
        .from('alunos')
        .update({
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
          role: formRole,
          dataUltimaGraduacao: dbUltimaGrad,
          contatoEmergenciaNome: formContatoEmergenciaNome,
          contatoEmergenciaTel: formContatoEmergenciaTel,
          status: formStatus,
          turma: formTurma,
          fotoPerfil: formFotoPerfil
        })
        .eq('id', editingStudent.id);

      if (updateError) {
        console.error('Error updating student:', updateError);
        alert('Erro ao atualizar aluno no banco de dados.');
        return;
      }

      let updatedHistory = formHistoricoGraduacoes || [];
      if (editingStudent.faixa !== formFaixa || editingStudent.graus !== formGraus) {
        // Insere novo registro de graduação no supabase
        const { data: newGradDataDb, error: gradError } = await supabase
          .from('graduacoes_historico')
          .insert({
            aluno_id: editingStudent.id,
            faixa: formFaixa,
            graus: formGraus,
            data_graduacao: dbUltimaGrad,
            avaliador: loggedUser?.nome || 'Professor'
          })
          .select()
          .single();

        if (gradError) {
          console.error('Error inserting graduation record:', gradError);
        } else if (newGradDataDb) {
          updatedHistory = [
            ...updatedHistory,
            {
              id: newGradDataDb.id,
              faixa: newGradDataDb.faixa,
              graus: newGradDataDb.graus,
              data: newGradDataDb.data_graduacao,
              avaliador: newGradDataDb.avaliador
            }
          ];
        }
      }

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
            role: formRole,
            dataUltimaGraduacao: dbUltimaGrad,
            contatoEmergenciaNome: formContatoEmergenciaNome,
            contatoEmergenciaTel: formContatoEmergenciaTel,
            status: formStatus,
            turma: formTurma,
            fotoPerfil: formFotoPerfil,
            historicoGraduacoes: updatedHistory
          };
        }
        return s;
      }));
    } else {
      // Cria aluno no supabase
      const { data: newStudentData, error: insertError } = await supabase
        .from('alunos')
        .insert({
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
          role: formRole,
          dataUltimaGraduacao: dbUltimaGrad,
          contatoEmergenciaNome: formContatoEmergenciaNome,
          contatoEmergenciaTel: formContatoEmergenciaTel,
          status: formStatus,
          turma: formTurma,
          fotoPerfil: formFotoPerfil
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting student:', insertError);
        alert('Erro ao cadastrar aluno no banco de dados.');
        return;
      }

      let initialHistory: any[] = [];
      if (newStudentData) {
        // Insere registro inicial de graduação no supabase
        const { data: newGradDataDb, error: gradError } = await supabase
          .from('graduacoes_historico')
          .insert({
            aluno_id: newStudentData.id,
            faixa: formFaixa,
            graus: formGraus,
            data_graduacao: dbUltimaGrad,
            avaliador: loggedUser?.nome || 'Professor'
          })
          .select()
          .single();

        if (gradError) {
          console.error('Error inserting initial graduation record:', gradError);
        } else if (newGradDataDb) {
          initialHistory = [{
            id: newGradDataDb.id,
            faixa: newGradDataDb.faixa,
            graus: newGradDataDb.graus,
            data: newGradDataDb.data_graduacao,
            avaliador: newGradDataDb.avaliador
          }];
        }

        const newStudent: Aluno = {
          id: newStudentData.id,
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
          role: formRole,
          dataUltimaGraduacao: dbUltimaGrad,
          contatoEmergenciaNome: formContatoEmergenciaNome,
          contatoEmergenciaTel: formContatoEmergenciaTel,
          status: formStatus,
          turma: formTurma,
          fotoPerfil: formFotoPerfil,
          historicoGraduacoes: initialHistory,
          pagamentos: []
        };

        setStudents(prev => [newStudent, ...prev]);
      }
    }

    setShowFormModal(false);
    setEditingStudent(null);
  };

  // Abre modal de confirmação de exclusão
  const handleOpenDelete = (student: Aluno) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  // Confirma a exclusão do aluno
  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;

    // Exclui pagamentos primeiro devido à chave estrangeira
    const { error: deletePaymentsError } = await supabase
      .from('pagamentos')
      .delete()
      .eq('alunoId', studentToDelete.id);

    if (deletePaymentsError) {
      console.error('Error deleting student payments:', deletePaymentsError);
    }

    // Exclui histórico de graduação primeiro devido à chave estrangeira
    const { error: deleteHistoryError } = await supabase
      .from('graduacoes_historico')
      .delete()
      .eq('aluno_id', studentToDelete.id);

    if (deleteHistoryError) {
      console.error('Error deleting student graduation history:', deleteHistoryError);
    }

    // Exclui aluno do supabase
    const { error: deleteStudentError } = await supabase
      .from('alunos')
      .delete()
      .eq('id', studentToDelete.id);

    if (deleteStudentError) {
      console.error('Error deleting student:', deleteStudentError);
      alert('Erro ao excluir aluno do banco de dados.');
      return;
    }

    setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  // Função para exportar para CSV
  const handleExportCSV = () => {
    const BOM = "\uFEFF";
    const headers = [
      "Nome",
      "CPF",
      "Data de Nascimento",
      "Telefone",
      "Email",
      "Gênero",
      "Bairro",
      "Faixa",
      "Graus",
      "Turma",
      "Status",
      "Data de Matrícula",
      "Última Graduação"
    ];

    const rows = filteredStudents.map(s => [
      s.nome,
      s.cpf || "",
      s.dataNascimento || "",
      s.telefone || "",
      s.email || "",
      s.genero || "",
      s.bairro || "",
      s.faixa || "",
      s.graus ?? 0,
      s.turma || "Adulto",
      s.status || "Ativo",
      s.dataMatricula || "",
      s.dataUltimaGraduacao || ""
    ]);

    const csvContent = BOM + [
      headers.join(";"),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(";"))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `alunos_sfbjj_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Exportar para XLS (planilha baseada em HTML compatível com Excel)
  const handleExportXLS = () => {
    const headers = [
      "Nome",
      "CPF",
      "Data de Nascimento",
      "Telefone",
      "Email",
      "Gênero",
      "Bairro",
      "Faixa",
      "Graus",
      "Turma",
      "Status",
      "Data de Matrícula",
      "Última Graduação"
    ];

    const rows = filteredStudents.map(s => [
      s.nome,
      s.cpf || "",
      s.dataNascimento || "",
      s.telefone || "",
      s.email || "",
      s.genero || "",
      s.bairro || "",
      s.faixa || "",
      s.graus ?? 0,
      s.turma || "Adulto",
      s.status || "Ativo",
      s.dataMatricula || "",
      s.dataUltimaGraduacao || ""
    ]);

    let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
    html += '<head><meta charset="utf-8"/><style>td { border: 0.5pt solid #ccc; font-family: sans-serif; font-size: 10pt; } th { background-color: #dcdcdc; font-weight: bold; border: 0.5pt solid #ccc; font-family: sans-serif; font-size: 10pt; }</style></head><body>';
    html += '<table>';
    html += '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
    rows.forEach(row => {
      html += '<tr>' + row.map(val => `<td>${val}</td>`).join('') + '</tr>';
    });
    html += '</table></body></html>';

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `alunos_sfbjj_${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtra e ordena alunos
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
      } else if (sortBy === 'dataMatricula-desc') {
        return new Date(b.dataMatricula || 0).getTime() - new Date(a.dataMatricula || 0).getTime();
      } else if (sortBy === 'dataMatricula-asc') {
        return new Date(a.dataMatricula || 0).getTime() - new Date(b.dataMatricula || 0).getTime();
      } else if (sortBy === 'dataUltimaGraduacao-desc') {
        return new Date(b.dataUltimaGraduacao || 0).getTime() - new Date(a.dataUltimaGraduacao || 0).getTime();
      }
      return a.nome.localeCompare(b.nome, 'pt-BR');
    });

  // Calcula a paginação
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
        beltClass = 'bg-blue-600 text-white border border-blue-700';
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
                ? 'bg-white shadow-[0_0_3px_rgba(255,255,255,0.7)]'
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
    // Se já estiver em DD/MM/YYYY
    if (dateStr.includes('/')) return dateStr;
    // Se for YYYY-MM-DD
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Formata data para exibir apenas mês/ano (MM/AAAA)
  const formatMonthYear = (dateStr: string) => {
    if (!dateStr) return '-';
    // Se vier como YYYY-MM ou YYYY-MM-DD
    const parts = dateStr.split('-');
    if (parts.length >= 2) {
      return `${parts[1]}/${parts[0]}`;
    }
    // Se vier como DD/MM/AAAA, retorna MM/AAAA
    if (dateStr.includes('/')) {
      const p = dateStr.split('/');
      if (p.length >= 2) return `${p[1]}/${p[p.length - 1]}`;
    }
    return dateStr;
  };

  const parseData = (text: string) => {
    setImportError(null);
    if (!text.trim()) {
      setParsedImportRows([]);
      return;
    }

    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return;

    // Detecta o delimitador
    const firstLine = lines[0];
    let delimiter = '\t';
    if (firstLine.includes('\t')) {
      delimiter = '\t';
    } else if (firstLine.includes(';')) {
      delimiter = ';';
    } else if (firstLine.includes(',')) {
      delimiter = ',';
    }

    // Analisa os cabeçalhos
    const rawHeaders = firstLine.split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));

    // Mapeia cabeçalhos para os campos de Aluno
    const mappings: { [key: string]: number } = {};
    const clean = (h: string) => h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

    rawHeaders.forEach((header, idx) => {
      const hClean = clean(header);
      if (hClean.includes('emergencianome') || hClean.includes('emergenciacontatonome') || hClean.includes('nomedeemergencia') || hClean.includes('responsavel')) {
        mappings['contatoEmergenciaNome'] = idx;
      } else if (hClean.includes('emergenciatel') || hClean.includes('emergenciaphone') || hClean.includes('telefoneemergencia') || hClean.includes('telephonedeemergencia')) {
        mappings['contatoEmergenciaTel'] = idx;
      } else if (hClean.includes('datamatricula') || hClean.includes('matriculadata') || (hClean.includes('matricula') && !hClean.includes('responsavel'))) {
        mappings['dataMatricula'] = idx;
      } else if (hClean.includes('ultimagraduacao') || hClean.includes('graduacaoultima') || hClean.includes('datagraduacao') || (hClean.includes('graduacao') && hClean.includes('ultima'))) {
        mappings['dataUltimaGraduacao'] = idx;
      } else if (hClean.includes('nascimento') || hClean.includes('nasc') || hClean.includes('birth') || hClean.includes('idade')) {
        mappings['dataNascimento'] = idx;
      } else if (hClean.includes('nome') || hClean.includes('name') || hClean.includes('membro') || hClean.includes('aluno')) {
        mappings['nome'] = idx;
      } else if (hClean.includes('cpf')) {
        mappings['cpf'] = idx;
      } else if (hClean.includes('telefone') || hClean.includes('tel') || hClean.includes('cel') || hClean.includes('fone')) {
        mappings['telefone'] = idx;
      } else if (hClean.includes('email') || hClean.includes('mail')) {
        mappings['email'] = idx;
      } else if (hClean.includes('genero') || hClean.includes('sexo') || hClean.includes('gender')) {
        mappings['genero'] = idx;
      } else if (hClean.includes('bairro') || hClean.includes('endereco') || hClean.includes('local')) {
        mappings['bairro'] = idx;
      } else if (hClean.includes('faixa') || hClean.includes('belt')) {
        mappings['faixa'] = idx;
      } else if (hClean.includes('grau') || hClean.includes('stripe')) {
        mappings['graus'] = idx;
      } else if (hClean.includes('turma') || hClean.includes('categoria') || hClean.includes('class') || hClean.includes('grupo')) {
        mappings['turma'] = idx;
      } else if (hClean.includes('status')) {
        mappings['status'] = idx;
      }
    });

    // Analisa as linhas de dados
    const rows: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = splitCSVLine(lines[i], delimiter);
      // Se a linha tiver menos elementos que os cabeçalhos, preencha com strings vazias
      while (parts.length < rawHeaders.length) {
        parts.push('');
      }

      const getValue = (field: string) => {
        const idx = mappings[field];
        return idx !== undefined ? parts[idx] : '';
      };

      const rawNome = getValue('nome');
      if (!rawNome) continue; // Skip empty rows

      // Processa gênero
      const rawGen = getValue('genero').toLowerCase();
      let gender: Gender = 'Masculino';
      if (rawGen.startsWith('f') || rawGen.includes('fem')) {
        gender = 'Feminino';
      } else if (rawGen.startsWith('o') || rawGen.includes('out')) {
        gender = 'Outro';
      }

      // Processa data de nascimento
      const dataNasc = parseCSVDate(getValue('dataNascimento')) || '2000-01-01';

      // Processa faixa
      const rawFaixa = getValue('faixa').toLowerCase();
      let faixa: Belt = 'Branca';
      const belts: Belt[] = ['Branca', 'Cinza', 'Amarela', 'Laranja', 'Verde', 'Azul', 'Roxa', 'Marrom', 'Preta'];
      const foundBelt = belts.find(b => b.toLowerCase() === rawFaixa || rawFaixa.includes(b.toLowerCase()));
      if (foundBelt) {
        faixa = foundBelt;
      }

      // Processa graus
      const rawGraus = parseInt(getValue('graus'), 10);
      const graus: Degree = (rawGraus >= 0 && rawGraus <= 4) ? (rawGraus as Degree) : 0;

      // Processa turma
      const rawTurma = getValue('turma').toLowerCase();
      let turma: 'Kids' | 'Adulto' = 'Adulto';
      if (rawTurma.includes('kid') || rawTurma.includes('inf') || rawTurma.includes('cri')) {
        turma = 'Kids';
      } else if (rawTurma.includes('adult') || rawTurma.includes('adul')) {
        turma = 'Adulto';
      } else {
        // Verifica a idade com base no ano de nascimento
        const year = parseInt(dataNasc.split('-')[0], 10);
        if (year >= 2010) {
          turma = 'Kids';
        }
      }

      // Processa data de matrícula
      const dataMatr = parseCSVDate(getValue('dataMatricula')) || new Date().toISOString().split('T')[0];

      // Processa data da última graduação
      const dataUltimaGrad = parseCSVDate(getValue('dataUltimaGraduacao')) || dataMatr;

      // Processa status
      const rawStatus = getValue('status').toLowerCase();
      let status: 'Ativo' | 'Inativo' = 'Ativo';
      if (rawStatus.includes('inativ') || rawStatus === 'inativo') {
        status = 'Inativo';
      }

      rows.push({
        nome: rawNome,
        cpf: getValue('cpf') || `000.000.000-${Math.floor(Math.random() * 90 + 10)}`,
        dataNascimento: dataNasc,
        telefone: getValue('telefone'),
        email: getValue('email') || `${rawNome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '.')}@sfbjj.com.br`,
        genero: gender,
        dataMatricula: dataMatr,
        bairro: getValue('bairro') || 'Asa Sul',
        faixa: faixa,
        graus: graus,
        role: 'student',
        dataUltimaGraduacao: dataUltimaGrad,
        contatoEmergenciaNome: getValue('contatoEmergenciaNome') || '',
        contatoEmergenciaTel: getValue('contatoEmergenciaTel') || '',
        turma: turma,
        status: status,
        fotoPerfil: '',
        historicoGraduacoes: [],
        pagamentos: []
      });
    }

    setParsedImportRows(rows);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportText(text);
      parseData(text);
    };
    reader.readAsText(file);
  };

  const handleImportConfirm = async () => {
    if (parsedImportRows.length === 0) {
      setImportError('Nenhum dado válido para importar.');
      return;
    }

    setIsImporting(true);
    setImportError(null);

    try {
      // 1. Prepare data to insert into `alunos` table
      const alunosToInsert = parsedImportRows.map(student => ({
        nome: student.nome,
        cpf: student.cpf,
        dataNascimento: student.dataNascimento,
        telefone: student.telefone,
        email: student.email,
        genero: student.genero,
        dataMatricula: student.dataMatricula,
        bairro: student.bairro,
        faixa: student.faixa,
        graus: student.graus,
        role: student.role || 'student',
        dataUltimaGraduacao: student.dataUltimaGraduacao,
        contatoEmergenciaNome: student.contatoEmergenciaNome,
        contatoEmergenciaTel: student.contatoEmergenciaTel,
        status: student.status,
        turma: student.turma,
        fotoPerfil: ''
      }));

      const { data: insertedAlunos, error: insertError } = await supabase
        .from('alunos')
        .insert(alunosToInsert)
        .select();

      if (insertError) {
        console.error('Error importing students to Supabase:', insertError);
        throw new Error('Erro ao inserir alunos no banco de dados: ' + insertError.message);
      }

      if (insertedAlunos && insertedAlunos.length > 0) {
        // 2. Prepare graduation history records
        const graducoesToInsert = insertedAlunos.map(aluno => ({
          aluno_id: aluno.id,
          faixa: aluno.faixa,
          graus: aluno.graus,
          data_graduacao: aluno.dataUltimaGraduacao || aluno.dataMatricula,
          avaliador: loggedUser?.nome || 'Professor'
        }));

        const { data: insertedGrads, error: gradsError } = await supabase
          .from('graduacoes_historico')
          .insert(graducoesToInsert)
          .select();

        if (gradsError) {
          console.error('Error inserting graduation records for imported students:', gradsError);
        }

        // 3. Update local state
        const newStudentsWithHistory = insertedAlunos.map(aluno => {
          const alunoGrads = (insertedGrads || []).filter(g => g.aluno_id === aluno.id);
          return {
            ...aluno,
            historicoGraduacoes: alunoGrads.map(g => ({
              id: g.id,
              data: g.data_graduacao,
              faixa: g.faixa,
              graus: g.graus,
              avaliador: g.avaliador
            })).sort((a: any, b: any) => new Date(a.data).getTime() - new Date(b.data).getTime()),
            pagamentos: []
          };
        });

        setStudents(prev => {
          const merged = [...newStudentsWithHistory, ...prev];
          return merged.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
        });
      }

      setShowImportModal(false);
      setImportText('');
      setParsedImportRows([]);
    } catch (err: any) {
      setImportError(err.message || 'Erro inesperado durante a importação.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
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
              className="btn-obsidian flex items-center gap-2 border border-obsidian-700 hover:border-gold-500/50 hover:text-gold-450 transition-all"
            >
              <Upload className="w-4 h-4" />
              Importar Alunos
            </button>
          )}

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="btn-obsidian flex items-center gap-2 border border-obsidian-700 hover:border-gold-500/50 hover:text-gold-450 transition-all"
            >
              <Download className="w-4 h-4" />
              Exportar Alunos
            </button>
            {showExportDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExportDropdown(false)} />
                <div className="absolute right-0 mt-2 w-44 rounded-xl bg-obsidian-850 border border-obsidian-750/90 shadow-2xl z-20 py-1.5 animate-scale-up">
                  <button
                    onClick={() => {
                      handleExportCSV();
                      setShowExportDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:text-gold-400 hover:bg-obsidian-750/50 transition-all flex items-center gap-2 font-semibold"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                    Exportar como CSV
                  </button>
                  <button
                    onClick={() => {
                      handleExportXLS();
                      setShowExportDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:text-gold-400 hover:bg-obsidian-750/50 transition-all flex items-center gap-2 font-semibold"
                  >
                    <Download className="w-3.5 h-3.5 text-gold-500" />
                    Exportar como XLS
                  </button>
                </div>
              </>
            )}
          </div>

          {!isTeacher && (
            <button
              onClick={handleOpenCreate}
              className="btn-gold flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Cadastrar Membro
            </button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 bg-obsidian-900/40 p-4 rounded-xl border border-obsidian-850/60 backdrop-blur-md">
        {/* Search */}
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

        {/* Belt Filter */}
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

        {/* Turma Filter */}
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

        {/* Sorting Selection */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="input-premium w-full bg-obsidian-950 text-slate-200"
          >
            <option value="dataMatricula-desc">Matrícula (Recente)</option>
            <option value="dataMatricula-asc">Matrícula (Antiga)</option>
            <option value="nome-asc">Nome (A-Z)</option>
            <option value="nome-desc">Nome (Z-A)</option>
            <option value="dataUltimaGraduacao-desc">Última Graduação</option>
          </select>
        </div>
      </div>

      {/* Desktop List / Table */}
      <div className="bg-obsidian-900/20 border border-obsidian-900/60 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-obsidian-850/80 text-[10px] font-bold uppercase tracking-widest text-slate-450 bg-obsidian-950/40">
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
                  <td colSpan={7} className="text-center py-12 text-slate-500 font-semibold uppercase tracking-wider">
                    Nenhum aluno encontrado correspondente aos filtros.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-obsidian-800/15 transition-colors group"
                  >
                    {/* Membro */}
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                        {/* Foto de Perfil */}
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
                          <div className="text-[10px] text-slate-500 font-semibold mt-1">
                            Matrícula: {formatDate(student.dataMatricula)}
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
                      {renderBeltBadge(student.faixa, student.graus)}
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
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(student)}
                            className="p-2 rounded bg-obsidian-950/80 hover:bg-obsidian-900 border border-obsidian-900 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all"
                            title={isTeacher ? "Visualizar cadastro" : "Editar cadastro"}
                          >
                            {isTeacher ? <Eye className="w-3.5 h-3.5" /> : <Edit className="w-3.5 h-3.5" />}
                          </button>
                          {!isTeacher && (
                            <button
                              onClick={() => handleOpenDelete(student)}
                              className="p-2 rounded bg-obsidian-950/80 hover:bg-red-500/10 border border-obsidian-900 hover:border-red-500/20 text-slate-400 hover:text-red-400 transition-all"
                              title="Excluir Aluno"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        {/* Status Dot (em último lugar) */}
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

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-obsidian-850/80 bg-obsidian-950/20">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Mostrando <span className="text-slate-300">{startIndex + 1}</span> a <span className="text-slate-300">{Math.min(startIndex + itemsPerPage, totalItems)}</span> de <span className="text-slate-300">{totalItems}</span> membros
            </span>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="btn-obsidian py-1.5 px-3 text-[10px] uppercase font-black tracking-widest disabled:opacity-50 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Anterior
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="btn-obsidian py-1.5 px-3 text-[10px] uppercase font-black tracking-widest disabled:opacity-50 disabled:pointer-events-none"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-obsidian-850 border border-obsidian-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-scale-up">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-obsidian-750 shrink-0 bg-obsidian-850 z-10 rounded-t-2xl">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Shield className="w-5 h-5 text-gold-500" />
                {isTeacher ? 'Visualizar Cadastro de Membro' : editingStudent ? 'Editar Cadastro de Membro' : 'Cadastrar Novo Membro'}
              </h2>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-slate-400 hover:text-gold-500 p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveStudent} className="flex flex-col overflow-hidden">
              <div className="p-6 space-y-5 overflow-y-auto flex-1">

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
                    disabled={isTeacher}
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
                      disabled={isTeacher}
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
                      disabled={isTeacher}
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
                      disabled={isTeacher}
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
                      disabled={isTeacher}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">CPF</label>
                    <input
                      type="text"
                      value={formCpf}
                      onChange={(e) => setFormCpf(formatCPF(e.target.value))}
                      placeholder="000.000.000-00"
                      className="input-premium font-mono"
                      disabled={isTeacher}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Gênero</label>
                    <select
                      value={formGenero}
                      onChange={(e) => setFormGenero(e.target.value as Gender)}
                      className="input-premium bg-obsidian-950 text-slate-200"
                      disabled={isTeacher}
                    >
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Turma *</label>
                    <select
                      value={formTurma}
                      onChange={(e) => setFormTurma(e.target.value as 'Kids' | 'Adulto')}
                      className="input-premium bg-obsidian-950 text-slate-200 font-semibold"
                      required
                      disabled={isTeacher}
                    >
                      <option value="Adulto">Adulto</option>
                      <option value="Kids">Kids</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Foto de Perfil */}
              <div className="border-t border-obsidian-750 pt-4 mt-4">
                <h3 className="text-xs font-bold text-gold-450 uppercase tracking-widest mb-3">Foto de Perfil</h3>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Preview */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-gold-500/25 bg-obsidian-950 flex items-center justify-center text-3xl shadow-inner select-none shrink-0">
                    {formFotoPerfil ? (
                      formFotoPerfil.length === 2 ? (
                        <span>{formFotoPerfil}</span>
                      ) : (
                        <img src={formFotoPerfil} alt="Preview" className="w-full h-full object-cover" />
                      )
                    ) : (
                      <span className="text-slate-600">🥋</span>
                    )}
                  </div>
                  {/* Options */}
                  {!isTeacher && (
                    <div className="flex-1 space-y-3 w-full">
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-xs text-slate-500 mr-1">Avatares padrão:</span>
                        <button type="button" onClick={() => setFormFotoPerfil('👦')} className={`p-1.5 rounded-lg border text-lg hover:bg-obsidian-700 transition-colors ${formFotoPerfil === '👦' ? 'border-gold-500 bg-gold-500/10' : 'border-obsidian-700'}`}>👦</button>
                        <button type="button" onClick={() => setFormFotoPerfil('👨')} className={`p-1.5 rounded-lg border text-lg hover:bg-obsidian-700 transition-colors ${formFotoPerfil === '👨' ? 'border-gold-500 bg-gold-500/10' : 'border-obsidian-700'}`}>👨</button>
                        <button type="button" onClick={() => setFormFotoPerfil('🧑')} className={`p-1.5 rounded-lg border text-lg hover:bg-obsidian-700 transition-colors ${formFotoPerfil === '🧑' ? 'border-gold-500 bg-gold-500/10' : 'border-obsidian-700'}`}>🧑</button>
                        <button type="button" onClick={() => setFormFotoPerfil('👧')} className={`p-1.5 rounded-lg border text-lg hover:bg-obsidian-700 transition-colors ${formFotoPerfil === '👧' ? 'border-gold-500 bg-gold-500/10' : 'border-obsidian-700'}`}>👧</button>
                        <button type="button" onClick={() => setFormFotoPerfil('👩')} className={`p-1.5 rounded-lg border text-lg hover:bg-obsidian-700 transition-colors ${formFotoPerfil === '👩' ? 'border-gold-500 bg-gold-500/10' : 'border-obsidian-700'}`}>👩</button>
                        <button type="button" onClick={() => setFormFotoPerfil('👩‍🦰')} className={`p-1.5 rounded-lg border text-lg hover:bg-obsidian-700 transition-colors ${formFotoPerfil === '👩‍🦰' ? 'border-gold-500 bg-gold-500/10' : 'border-obsidian-700'}`}>👩‍🦰</button>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-slate-500">Ou envie sua foto:</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                if (event.target?.result) {
                                  setFormFotoPerfil(event.target.result as string);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="text-xs text-slate-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-obsidian-800 file:text-slate-200 hover:file:bg-obsidian-750 file:cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
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
                      disabled={isTeacher}
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
                      disabled={isTeacher}
                    >
                      <option value={0}>0 Grau</option>
                      <option value={1}>1 Grau</option>
                      <option value={2}>2 Graus</option>
                      <option value={3}>3 Graus</option>
                      <option value={4}>4 Graus</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tipo de Usuário</label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value as 'admin' | 'student' | 'teacher')}
                      className="input-premium w-full bg-obsidian-950 disabled:opacity-50"
                      disabled={isTeacher}
                    >
                      <option value="student">Aluno</option>
                      <option value="teacher">Professor</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Última Graduação</label>
                    <input
                      type="month"
                      value={formDataUltimaGraduacao}
                      onChange={(e) => setFormDataUltimaGraduacao(e.target.value)}
                      className="input-premium"
                      disabled={isTeacher}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Data de Matrícula</label>
                    <input
                      type="date"
                      value={formDataMatricula}
                      onChange={(e) => setFormDataMatricula(e.target.value)}
                      className="input-premium"
                      disabled={isTeacher}
                    />
                  </div>
                </div>
              </div>

              {/* Histórico de Graduações */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-obsidian-750 pb-1.5">
                  <h3 className="text-xs font-bold text-gold-450 uppercase tracking-widest flex items-center gap-1.5">
                    📜 Histórico de Graduações
                  </h3>
                </div>
                <div className="border border-obsidian-750 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-obsidian-900 text-[10px] uppercase text-slate-400 border-b border-obsidian-750 font-bold">
                      <tr>
                        <th className="px-4 py-2.5">Data</th>
                        <th className="px-4 py-2.5">Faixa & Grau</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-obsidian-750/50 bg-obsidian-900/40">
                      {formHistoricoGraduacoes && formHistoricoGraduacoes.length > 0 ? (
                        formHistoricoGraduacoes.slice().reverse().map((grad, idx) => (
                          <tr key={idx} className="hover:bg-obsidian-800/30 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap font-mono">
                              {formatMonthYear(grad.data)}
                            </td>
                            <td className="px-4 py-3">
                              {renderBeltBadge(grad.faixa, grad.graus)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="px-4 py-6 text-center text-slate-500 italic">
                            Nenhum histórico de graduação registrado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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
                      disabled={isTeacher}
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
                      disabled={isTeacher}
                    />
                  </div>
                </div>
              </div>

              {/* Status field */}
              <div className="flex items-center gap-3 pt-3">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Status Acadêmico:</span>
                <label className={`relative inline-flex items-center select-none ${isTeacher ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}>
                  <input
                    type="checkbox"
                    checked={formStatus === 'Ativo'}
                    onChange={(e) => setFormStatus(e.target.checked ? 'Ativo' : 'Inativo')}
                    className="sr-only peer"
                    disabled={isTeacher}
                  />
                  <div className="w-11 h-6 bg-obsidian-950 border border-obsidian-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-gold-500 after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500/10 peer-checked:border-gold-500"></div>
                  <span className={`ml-3 text-sm font-semibold transition-colors ${formStatus === 'Ativo' ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {formStatus}
                  </span>
                </label>
              </div>

              </div>

              {/* Footer controls */}
              <div className="flex justify-end gap-3 p-6 border-t border-obsidian-750 shrink-0 bg-obsidian-850 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="btn-obsidian"
                >
                  {isTeacher ? 'Fechar' : 'Cancelar'}
                </button>
                {!isTeacher && (
                  <button
                    type="submit"
                    className="btn-gold px-6"
                  >
                    {editingStudent ? 'Salvar Alterações' : 'Confirmar Cadastro'}
                  </button>
                )}
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

      {/* Spreadsheet Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-obsidian-850 border border-obsidian-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-up">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-obsidian-750 sticky top-0 bg-obsidian-850 z-10">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-gold-500" />
                Importar Membros da Planilha
              </h2>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportText('');
                  setParsedImportRows([]);
                }}
                disabled={isImporting}
                className="text-slate-400 hover:text-gold-500 p-1 transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <div className="text-sm text-slate-400 leading-relaxed">
                Você pode importar membros de duas maneiras:
                <ol className="list-decimal pl-5 mt-2 space-y-1">
                  <li>Selecione um arquivo <strong className="text-slate-200">.CSV</strong> exportado do Google Sheets.</li>
                  <li>Copie as linhas da sua tabela no Google Sheets (incluindo o cabeçalho) e <strong className="text-slate-200">cole diretamente</strong> na caixa de texto abaixo.</li>
                </ol>
              </div>

              {/* File Upload Selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Opção 1: Enviar Arquivo CSV</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="csv-file-upload-input"
                    disabled={isImporting}
                  />
                  <label
                    htmlFor="csv-file-upload-input"
                    className={`flex flex-col items-center justify-center border border-dashed border-obsidian-700 hover:border-gold-500/50 rounded-xl p-8 cursor-pointer bg-obsidian-900/40 hover:bg-obsidian-900/80 transition-all text-slate-400 hover:text-slate-200 h-40 ${isImporting ? 'opacity-45 pointer-events-none' : ''}`}
                  >
                    <Upload className="w-8 h-8 mb-2 text-gold-500" />
                    <span className="text-sm font-semibold">Carregar Arquivo .CSV</span>
                    <span className="text-xs text-slate-500 mt-1">Selecione seu arquivo local</span>
                  </label>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Opção 2: Copiar e Colar Linhas da Planilha</span>
                  <textarea
                    value={importText}
                    onChange={(e) => {
                      setImportText(e.target.value);
                      parseData(e.target.value);
                    }}
                    placeholder="Cole aqui os dados copiados da planilha (com cabeçalho)...&#10;Ex:&#10;Nome&#9;Nascimento&#9;Faixa&#9;Bairro&#9;Turma&#10;Lucas dos Anjos&#9;18/03/1987&#9;Preta&#9;Guará&#9;Adulto"
                    className="input-premium w-full h-40 font-mono text-[10px] leading-normal disabled:opacity-40"
                    disabled={isImporting}
                  />
                </div>
              </div>

              {importError && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm">
                  {importError}
                </div>
              )}

              {/* Data Preview */}
              {parsedImportRows.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gold-450 uppercase tracking-widest">
                      Pré-visualização dos Dados ({parsedImportRows.length} linhas detectadas)
                    </h3>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase bg-obsidian-900 px-2 py-0.5 rounded border border-obsidian-800">
                      Auto-mapeado com sucesso
                    </span>
                  </div>

                  <div className="border border-obsidian-750 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-obsidian-900 text-slate-400 border-b border-obsidian-750 font-bold uppercase">
                          <th className="px-4 py-2">Nome</th>
                          <th className="px-4 py-2">Turma</th>
                          <th className="px-4 py-2">Faixa</th>
                          <th className="px-4 py-2">Nascimento</th>
                          <th className="px-4 py-2">Bairro</th>
                          <th className="px-4 py-2">Telefone</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-obsidian-750 text-slate-300">
                        {parsedImportRows.slice(0, 10).map((row, idx) => (
                          <tr key={idx} className="hover:bg-obsidian-750/30">
                            <td className="px-4 py-2 font-semibold text-slate-100">{row.nome}</td>
                            <td className="px-4 py-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${row.turma === 'Kids' ? 'bg-sky-500/10 text-sky-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                {row.turma}
                              </span>
                            </td>
                            <td className="px-4 py-2 font-medium">{row.faixa}</td>
                            <td className="px-4 py-2 font-mono">{formatDate(row.dataNascimento)}</td>
                            <td className="px-4 py-2">{row.bairro || '-'}</td>
                            <td className="px-4 py-2 font-mono">{row.telefone || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parsedImportRows.length > 10 && (
                      <div className="bg-obsidian-900 text-center py-2 text-slate-500 text-[10px] font-medium border-t border-obsidian-750">
                        E mais {parsedImportRows.length - 10} linhas ocultas...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-obsidian-750 bg-obsidian-850 z-10">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportText('');
                  setParsedImportRows([]);
                }}
                disabled={isImporting}
                className="btn-obsidian disabled:opacity-50 disabled:pointer-events-none"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleImportConfirm}
                disabled={parsedImportRows.length === 0 || isImporting}
                className="btn-gold px-6 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
              >
                {isImporting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-obsidian-950" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Salvando no Banco...</span>
                  </>
                ) : (
                  <span>Importar {parsedImportRows.length > 0 ? `${parsedImportRows.length} Alunos` : 'Membros'}</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
