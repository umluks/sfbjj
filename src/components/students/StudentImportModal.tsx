import React, { useState } from 'react';
import type { Belt, Degree, Gender } from '../../types';
import { formatDate } from '../../utils/formatters';
import { FileSpreadsheet, X, Upload } from 'lucide-react';

interface StudentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (parsedRows: any[]) => Promise<void>;
  isImporting: boolean;
  importError: string | null;
  setImportError: (err: string | null) => void;
}

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

export const StudentImportModal: React.FC<StudentImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  isImporting,
  importError,
  setImportError
}) => {
  const [importText, setImportText] = useState('');
  const [parsedImportRows, setParsedImportRows] = useState<any[]>([]);

  const handleClose = () => {
    setImportText('');
    setParsedImportRows([]);
    setImportError(null);
    onClose();
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

    const rows: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = splitCSVLine(lines[i], delimiter);
      while (parts.length < rawHeaders.length) {
        parts.push('');
      }

      const getValue = (field: string) => {
        const idx = mappings[field];
        return idx !== undefined ? parts[idx] : '';
      };

      const rawNome = getValue('nome');
      if (!rawNome) continue;

      const rawGen = getValue('genero').toLowerCase();
      let gender: Gender = 'Masculino';
      if (rawGen.startsWith('f') || rawGen.includes('fem')) {
        gender = 'Feminino';
      }

      const dataNasc = parseCSVDate(getValue('dataNascimento')) || '2000-01-01';

      const rawFaixa = getValue('faixa').toLowerCase();
      let faixa: Belt = 'Branca';
      const belts: Belt[] = ['Branca', 'Cinza', 'Amarela', 'Laranja', 'Verde', 'Azul', 'Roxa', 'Marrom', 'Preta'];
      const foundBelt = belts.find(b => b.toLowerCase() === rawFaixa || rawFaixa.includes(b.toLowerCase()));
      if (foundBelt) {
        faixa = foundBelt;
      }

      const rawGraus = parseInt(getValue('graus'), 10);
      const degrees: Degree = (rawGraus >= 0 && rawGraus <= 4) ? (rawGraus as Degree) : 0;

      const rawTurma = getValue('turma').toLowerCase();
      let classType: 'Kids' | 'Adulto' = 'Adulto';
      if (rawTurma.includes('kid') || rawTurma.includes('inf') || rawTurma.includes('cri')) {
        classType = 'Kids';
      } else if (rawTurma.includes('adult') || rawTurma.includes('adul')) {
        classType = 'Adulto';
      } else {
        const birthYear = parseInt(dataNasc.split('-')[0], 10);
        if (birthYear >= 2010) {
          classType = 'Kids';
        }
      }

      const dataMatr = parseCSVDate(getValue('dataMatricula')) || new Date().toISOString().split('T')[0];
      const dataUltimaGradVal = parseCSVDate(getValue('dataUltimaGraduacao')) || dataMatr;

      const rawStatus = getValue('status').toLowerCase();
      let statusVal: 'Ativo' | 'Inativo' = 'Ativo';
      if (rawStatus.includes('inativ') || rawStatus === 'inativo') {
        statusVal = 'Inativo';
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
        graus: degrees,
        role: 'student',
        dataUltimaGraduacao: dataUltimaGradVal,
        contatoEmergenciaNome: getValue('contatoEmergenciaNome') || '',
        contatoEmergenciaTel: getValue('contatoEmergenciaTel') || '',
        turma: classType,
        status: statusVal,
        fotoPerfil: ''
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

  const handleConfirmImport = async () => {
    if (parsedImportRows.length === 0) {
      setImportError('Nenhum dado válido para importar.');
      return;
    }
    await onImport(parsedImportRows);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-obsidian-850 border border-obsidian-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-obsidian-750 sticky top-0 bg-obsidian-850 z-10">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-gold-500" />
            Importar Membros da Planilha
          </h2>
          <button
            onClick={handleClose}
            disabled={isImporting}
            className="text-slate-400 hover:text-gold-500 p-1 transition-colors disabled:opacity-40"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-6">
          <div className="text-sm text-slate-400 leading-relaxed">
            Você pode importar membros de duas maneiras:
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>Selecione um arquivo <strong className="text-slate-200">.CSV</strong> exportado do Google Sheets.</li>
              <li>Copie as linhas da sua tabela no Google Sheets (incluindo o cabeçalho) e <strong className="text-slate-200">cole diretamente</strong> na caixa de texto abaixo.</li>
            </ol>
          </div>

          {/* Opções de Upload */}
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

          {/* Pré-visualização */}
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

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-obsidian-750 bg-obsidian-850 z-10">
          <button
            type="button"
            onClick={handleClose}
            disabled={isImporting}
            className="btn-obsidian disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={parsedImportRows.length === 0 || isImporting}
            className="btn-gold px-6 disabled:opacity-50 flex items-center gap-2"
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
  );
};
