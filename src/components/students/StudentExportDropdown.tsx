import React, { useState } from 'react';
import type { Aluno } from '../../types';
import { Download, FileSpreadsheet } from 'lucide-react';

interface StudentExportDropdownProps {
  filteredStudents: Aluno[];
}

export const StudentExportDropdown: React.FC<StudentExportDropdownProps> = ({ filteredStudents }) => {
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-obsidian flex items-center gap-2 border border-obsidian-700 hover:border-gold-500/50 hover:text-gold-450 transition-all font-bold text-xs"
        type="button"
      >
        <Download className="w-4 h-4" />
        Exportar Alunos
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-44 rounded-xl bg-obsidian-850 border border-obsidian-750/90 shadow-2xl z-20 py-1.5 animate-scale-up">
            <button
              onClick={() => {
                handleExportCSV();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:text-gold-400 hover:bg-obsidian-750/50 transition-all flex items-center gap-2 font-semibold"
              type="button"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
              Exportar como CSV
            </button>
            <button
              onClick={() => {
                handleExportXLS();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:text-gold-400 hover:bg-obsidian-750/50 transition-all flex items-center gap-2 font-semibold"
              type="button"
            >
              <Download className="w-3.5 h-3.5 text-gold-500" />
              Exportar como XLS
            </button>
          </div>
        </>
      )}
    </div>
  );
};
