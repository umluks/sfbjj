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
  Calendar,
  Heart,
  Upload,
  FileSpreadsheet,
  Download
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
  const [selectedTurma, setSelectedTurma] = useState<string>('Todos');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Import fields state
  const [importText, setImportText] = useState('');
  const [parsedImportRows, setParsedImportRows] = useState<any[]>([]);
  const [importError, setImportError] = useState<string | null>(null);

  // Export dropdown state
  const [showExportDropdown, setShowExportDropdown] = useState(false);

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
  const [formTurma, setFormTurma] = useState<'Kids' | 'Adulto'>('Adulto');
  const [formFotoPerfil, setFormFotoPerfil] = useState('');

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
    setFormTurma('Adulto');
    setFormFotoPerfil('');
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
    setFormTurma(student.turma || 'Adulto');
    setFormFotoPerfil(student.fotoPerfil || '');
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
            status: formStatus,
            turma: formTurma,
            fotoPerfil: formFotoPerfil
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
        turma: formTurma,
        fotoPerfil: formFotoPerfil,
        totalTreinos: 0,
        pagamentos: [
          {
            id: `pay_${Date.now()}`,
            mesRef: 'Maio/2026',
            valor: 100,
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

  // Export to CSV function
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
      "Última Graduação",
      "Total de Treinos"
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
      s.dataUltimaGraduacao || "",
      s.totalTreinos ?? 0
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

  // Export to XLS (HTML-based spreadsheet compatible with Excel)
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
      "Última Graduação",
      "Total de Treinos"
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
      s.dataUltimaGraduacao || "",
      s.totalTreinos ?? 0
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

  // Filter and sort students alphabetically
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

  const parseData = (text: string) => {
    setImportError(null);
    if (!text.trim()) {
      setParsedImportRows([]);
      return;
    }

    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return;

    // Detect delimiter
    const firstLine = lines[0];
    let delimiter = '\t';
    if (firstLine.includes('\t')) {
      delimiter = '\t';
    } else if (firstLine.includes(';')) {
      delimiter = ';';
    } else if (firstLine.includes(',')) {
      delimiter = ',';
    }

    // Parse headers
    const rawHeaders = firstLine.split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));

    // Map headers to Student fields
    const mappings: { [key: string]: number } = {};
    const clean = (h: string) => h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

    rawHeaders.forEach((header, idx) => {
      const hClean = clean(header);
      if (hClean.includes('nome') || hClean.includes('name') || hClean.includes('membro') || hClean.includes('aluno')) {
        mappings['nome'] = idx;
      } else if (hClean.includes('cpf')) {
        mappings['cpf'] = idx;
      } else if (hClean.includes('nascimento') || hClean.includes('nasc') || hClean.includes('birth') || (hClean.includes('data') && hClean.includes('nasc')) || hClean.includes('idade')) {
        mappings['dataNascimento'] = idx;
      } else if (hClean.includes('telefone') || hClean.includes('tel') || hClean.includes('cel') || hClean.includes('fone') || hClean.includes('contato')) {
        mappings['telefone'] = idx;
      } else if (hClean.includes('email') || hClean.includes('mail')) {
        mappings['email'] = idx;
      } else if (hClean.includes('genero') || hClean.includes('sexo') || hClean.includes('gender')) {
        mappings['genero'] = idx;
      } else if (hClean.includes('bairro') || hClean.includes('endereco') || hClean.includes('local')) {
        mappings['bairro'] = idx;
      } else if (hClean.includes('faixa') || hClean.includes('belt') || hClean.includes('graduacao')) {
        mappings['faixa'] = idx;
      } else if (hClean.includes('grau') || hClean.includes('stripe')) {
        mappings['graus'] = idx;
      } else if (hClean.includes('turma') || hClean.includes('categoria') || hClean.includes('class') || hClean.includes('grupo')) {
        mappings['turma'] = idx;
      } else if (hClean.includes('emergencianome') || hClean.includes('emergenciacontato') || hClean.includes('responsavel')) {
        mappings['contatoEmergenciaNome'] = idx;
      } else if (hClean.includes('emergenciatel') || hClean.includes('emergenciatelefone')) {
        mappings['contatoEmergenciaTel'] = idx;
      } else if (hClean.includes('ultima') || (hClean.includes('data') && hClean.includes('grad'))) {
        mappings['dataUltimaGraduacao'] = idx;
      } else if (hClean.includes('matricula')) {
        mappings['dataMatricula'] = idx;
      }
    });

    // Parse data rows
    const rows: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(delimiter).map(p => p.trim().replace(/^["']|["']$/g, ''));
      // If the row has fewer elements than headers, fill with empty strings
      while (parts.length < rawHeaders.length) {
        parts.push('');
      }

      const getValue = (field: string) => {
        const idx = mappings[field];
        return idx !== undefined ? parts[idx] : '';
      };

      const rawNome = getValue('nome');
      if (!rawNome) continue; // Skip empty rows

      // Process gender
      const rawGen = getValue('genero').toLowerCase();
      let gender: Gender = 'Masculino';
      if (rawGen.startsWith('f') || rawGen.includes('fem')) {
        gender = 'Feminino';
      } else if (rawGen.startsWith('o') || rawGen.includes('out')) {
        gender = 'Outro';
      }

      // Process birth date
      let rawBirth = getValue('dataNascimento');
      let dataNasc = '';
      if (rawBirth) {
        // Handle DD/MM/YYYY or D/M/YYYY
        if (rawBirth.includes('/')) {
          const birthParts = rawBirth.split('/');
          if (birthParts.length === 3) {
            dataNasc = `${birthParts[2]}-${birthParts[1].padStart(2, '0')}-${birthParts[0].padStart(2, '0')}`;
          }
        } else if (rawBirth.match(/^\d{4}-\d{2}-\d{2}$/)) {
          dataNasc = rawBirth;
        }
      }

      // If dataNasc is invalid or empty, set a default
      if (!dataNasc) {
        dataNasc = '2000-01-01'; // Fallback
      }

      // Process belt
      const rawFaixa = getValue('faixa').toLowerCase();
      let faixa: Belt = 'Branca';
      const belts: Belt[] = ['Branca', 'Cinza', 'Amarela', 'Laranja', 'Verde', 'Azul', 'Roxa', 'Marrom', 'Preta'];
      const foundBelt = belts.find(b => b.toLowerCase() === rawFaixa || rawFaixa.includes(b.toLowerCase()));
      if (foundBelt) {
        faixa = foundBelt;
      }

      // Process degrees
      const rawGraus = parseInt(getValue('graus'), 10);
      const graus: Degree = (rawGraus >= 0 && rawGraus <= 4) ? (rawGraus as Degree) : 0;

      // Process class (turma)
      const rawTurma = getValue('turma').toLowerCase();
      let turma: 'Kids' | 'Adulto' = 'Adulto';
      if (rawTurma.includes('kid') || rawTurma.includes('inf') || rawTurma.includes('cri')) {
        turma = 'Kids';
      } else {
        // Check age based on birth year
        const year = parseInt(dataNasc.split('-')[0], 10);
        if (year >= 2010) {
          turma = 'Kids';
        }
      }

      // Process registration date
      let rawMatr = getValue('dataMatricula');
      let dataMatr = new Date().toISOString().split('T')[0];
      if (rawMatr) {
        if (rawMatr.includes('/')) {
          const matrParts = rawMatr.split('/');
          if (matrParts.length === 3) {
            dataMatr = `${matrParts[2]}-${matrParts[1].padStart(2, '0')}-${matrParts[0].padStart(2, '0')}`;
          }
        } else if (rawMatr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          dataMatr = rawMatr;
        }
      }

      rows.push({
        nome: rawNome,
        cpf: getValue('cpf') || `000.000.000-${Math.floor(Math.random() * 90 + 10)}`,
        dataNascimento: dataNasc,
        telefone: getValue('telefone'),
        email: getValue('email') || `${rawNome.toLowerCase().replace(/\s+/g, '.')}@sfbjj.com.br`,
        genero: gender,
        dataMatricula: dataMatr,
        bairro: getValue('bairro') || 'Asa Sul',
        faixa: faixa,
        graus: graus,
        dataUltimaGraduacao: getValue('dataUltimaGraduacao') || '',
        contatoEmergenciaNome: getValue('contatoEmergenciaNome') || '',
        contatoEmergenciaTel: getValue('contatoEmergenciaTel') || '',
        turma: turma,
        status: 'Ativo',
        totalTreinos: 0,
        pagamentos: [
          {
            id: `pay_${Date.now()}_${i}`,
            mesRef: 'Maio/2026',
            valor: 100,
            status: 'Pendente',
            dataVencimento: '2026-05-30',
            dataPagamento: null
          }
        ]
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

  const handleImportConfirm = () => {
    if (parsedImportRows.length === 0) {
      setImportError('Nenhum dado válido para importar.');
      return;
    }

    // Generate unique IDs for imported students
    const studentsWithIds = parsedImportRows.map((student, index) => ({
      ...student,
      id: `std_imp_${Date.now()}_${index}`
    }));

    setStudents(prev => [...studentsWithIds, ...prev]);
    setShowImportModal(false);
    setImportText('');
    setParsedImportRows([]);
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
          <button
            onClick={() => setShowImportModal(true)}
            className="btn-obsidian flex items-center gap-2 border border-obsidian-700 hover:border-gold-500/50 hover:text-gold-450 transition-all"
          >
            <Upload className="w-4 h-4" />
            Importar Planilha
          </button>

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

          <button
            onClick={handleOpenCreate}
            className="btn-gold flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Cadastrar Membro
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 bg-obsidian-850 p-4 rounded-xl border border-obsidian-800/80">
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
      </div>

      {/* Desktop List / Table */}
      <div className="bg-obsidian-800/50 border border-obsidian-800/90 rounded-xl overflow-hidden shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-obsidian-750 text-xs font-bold uppercase tracking-wider text-slate-400 bg-obsidian-850/40">
                <th className="px-4 py-4 text-center w-16">Status</th>
                <th className="px-6 py-4">Membro</th>
                <th className="px-6 py-4">Nascimento / Idade</th>
                <th className="px-6 py-4">Faixa Atual</th>
                <th className="px-6 py-4">Turma</th>
                <th className="px-6 py-4">Última Graduação</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-750 text-sm text-slate-300">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-500 font-medium">
                    Nenhum aluno encontrado correspondente aos filtros.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-obsidian-700/20 transition-colors group"
                  >
                    {/* Status */}
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-block w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                          student.status === 'Ativo'
                            ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                            : 'bg-white border border-slate-300 shadow-[0_0_8px_rgba(255,255,255,0.4)]'
                        }`}
                        title={student.status}
                      />
                    </td>

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

                    {/* Faixa Atual */}
                    <td className="px-6 py-4">
                      {renderBeltBadge(student.faixa, student.graus)}
                    </td>

                    {/* Turma */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${student.turma === 'Kids'
                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}>
                        {student.turma || 'Adulto'}
                      </span>
                    </td>

                    {/* Última Graduação */}
                    <td className="px-6 py-4 text-xs font-medium text-slate-300">
                      {formatDate(student.dataUltimaGraduacao)}
                    </td>

                    {/* Contato */}
                    <td className="px-6 py-4 min-w-[160px] whitespace-nowrap">
                      <div className="flex items-center gap-1 text-xs text-slate-200 whitespace-nowrap">
                        <Phone className="w-3.5 h-3.5 text-gold-500/80 shrink-0" />
                        <span className="font-mono">{student.telefone ? formatPhone(student.telefone) : '-'}</span>
                      </div>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Turma *</label>
                    <select
                      value={formTurma}
                      onChange={(e) => setFormTurma(e.target.value as 'Kids' | 'Adulto')}
                      className="input-premium bg-obsidian-950 text-slate-200 font-semibold text-slate-200"
                      required
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
                      onChange={(e) => {
                        const val = e.target.value;
                        const formatted = val
                          .replace(/\D/g, '')
                          .replace(/(\d{2})(\d)/, '$1/$2')
                          .replace(/(\d{2})(\d)/, '$1/$2')
                          .replace(/(\d{4})(\d)/, '$1')
                          .substring(0, 10);
                        setFormDataUltimaGraduacao(formatted);
                      }}
                      placeholder="DD/MM/AAAA"
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
                className="text-slate-400 hover:text-gold-500 p-1 transition-colors"
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
                  />
                  <label
                    htmlFor="csv-file-upload-input"
                    className="flex flex-col items-center justify-center border border-dashed border-obsidian-700 hover:border-gold-500/50 rounded-xl p-8 cursor-pointer bg-obsidian-900/40 hover:bg-obsidian-900/80 transition-all text-slate-400 hover:text-slate-200 h-40"
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
                    className="input-premium w-full h-40 font-mono text-[10px] leading-normal"
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
                className="btn-obsidian"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleImportConfirm}
                disabled={parsedImportRows.length === 0}
                className="btn-gold px-6 disabled:opacity-50 disabled:pointer-events-none"
              >
                Importar {parsedImportRows.length > 0 ? `${parsedImportRows.length} Alunos` : 'Membros'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
