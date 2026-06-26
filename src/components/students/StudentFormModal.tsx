import React, { useState, useEffect } from 'react';
import type { Aluno, Belt, Degree, Gender } from '../../types';
import { BAIRROS_DF, BELT_RANKS } from '../../types';
import { getBeltsByAge, getBjjAge } from '../../utils/bjj';
import { formatCPF, formatPhone, formatMonthYear } from '../../utils/formatters';
import { BeltBadge } from '../shared/BeltBadge';
import { Shield, X, Heart, User } from 'lucide-react';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingStudent: Aluno | null;
  onSave: (studentData: any) => Promise<void>;
  isTeacher: boolean;
  isReadOnly?: boolean;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  editingStudent,
  onSave,
  isTeacher,
  isReadOnly = false
}) => {
  // Estados do formulário
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [genero, setGenero] = useState<Gender>('Masculino');
  const [dataMatricula, setDataMatricula] = useState('');
  const [bairro, setBairro] = useState('');
  const [faixa, setFaixa] = useState<Belt>('Branca');
  const [graus, setGraus] = useState<Degree>(0);
  const [role, setRole] = useState<'admin' | 'student' | 'teacher'>('student');
  const [dataUltimaGraduacao, setDataUltimaGraduacao] = useState('');
  const [contatoEmergenciaNome, setContatoEmergenciaNome] = useState('');
  const [contatoEmergenciaTel, setContatoEmergenciaTel] = useState('');
  const [status, setStatus] = useState<'Ativo' | 'Inativo' | 'Graduado'>('Ativo');
  const [turma, setTurma] = useState<'Kids' | 'Adulto'>('Adulto');
  const [fotoPerfil, setFotoPerfil] = useState('');
  const [historicoGraduacoes, setHistoricoGraduacoes] = useState<any[]>([]);
  const isDisabled = isTeacher || isReadOnly;

  // Inicializa o formulário com dados do aluno ao abrir para edição
  useEffect(() => {
    if (editingStudent) {
      setNome(editingStudent.nome);
      setCpf(editingStudent.cpf || '');
      setDataNascimento(editingStudent.dataNascimento || '');
      setTelefone(formatPhone(editingStudent.telefone || ''));
      setEmail(editingStudent.email || '');
      setGenero(editingStudent.genero || 'Masculino');
      setDataMatricula(editingStudent.dataMatricula || new Date().toISOString().split('T')[0]);
      setBairro(editingStudent.bairro || '');
      setFaixa(editingStudent.faixa || 'Branca');
      setGraus(editingStudent.graus || 0);
      setRole(editingStudent.role || 'student');

      // Converte YYYY-MM-DD para YYYY-MM para uso no input type="month"
      const ug = editingStudent.dataUltimaGraduacao || '';
      let monthVal = '';
      if (ug) {
        if (ug.includes('/')) {
          const p = ug.split('/');
          if (p.length === 3) monthVal = `${p[2]}-${p[1].padStart(2, '0')}`;
        } else if (ug.includes('-')) {
          monthVal = ug.substring(0, 7);
        }
      }
      setDataUltimaGraduacao(monthVal);
      setContatoEmergenciaNome(editingStudent.contatoEmergenciaNome || '');
      setContatoEmergenciaTel(formatPhone(editingStudent.contatoEmergenciaTel || ''));
      setStatus(editingStudent.status || 'Ativo');
      setTurma(editingStudent.turma || 'Adulto');
      setFotoPerfil(editingStudent.fotoPerfil || '');
      setHistoricoGraduacoes(editingStudent.historicoGraduacoes || []);
    } else {
      // Valores padrão para novo cadastro
      setNome('');
      setCpf('');
      setDataNascimento('');
      setTelefone('');
      setEmail('');
      setGenero('Masculino');
      setDataMatricula(new Date().toISOString().split('T')[0]);
      setBairro('');
      setFaixa('Branca');
      setGraus(0);
      setRole('student');
      setDataUltimaGraduacao('');
      setContatoEmergenciaNome('');
      setContatoEmergenciaTel('');
      setStatus('Ativo');
      setTurma('Adulto');
      setFotoPerfil('');
      setHistoricoGraduacoes([]);
    }
  }, [editingStudent, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !dataNascimento) return;

    const cleanedCpf = cpf.replace(/\D/g, '');
    if (!cleanedCpf) {
      alert('O CPF é obrigatório.');
      return;
    }
    if (cleanedCpf.length !== 11) {
      alert('O CPF deve conter exatamente 11 dígitos.');
      return;
    }

    const age = getBjjAge(dataNascimento);

    // Valida Contato de Emergência para menores de idade
    if (age < 18) {
      if (!contatoEmergenciaNome.trim() || !contatoEmergenciaTel.trim()) {
        alert('Para menores de idade, o Contato de Emergência (Nome e Telefone) é obrigatório.');
        return;
      }
    }

    // Valida regras de faixa por idade
    const allowed = getBeltsByAge(dataNascimento);
    if (!allowed.includes(faixa)) {
      alert(`A faixa "${faixa}" não é permitida para a idade de ${age} anos.`);
      return;
    }

    // formDataUltimaGraduacao está no formato YYYY-MM
    // Converte para YYYY-MM-01 para armazenar no banco
    const dbUltimaGrad = dataUltimaGraduacao
      ? `${dataUltimaGraduacao}-01`
      : new Date().toISOString().split('T')[0];

    if (editingStudent) {
      // Valida rebaixamento de faixa ou graus
      const oldFaixa = editingStudent.faixa;
      const oldGraus = editingStudent.graus;

      if (BELT_RANKS[faixa] < BELT_RANKS[oldFaixa]) {
        alert(`Não é permitido rebaixar a faixa do aluno de ${oldFaixa} para ${faixa}.`);
        return;
      }
      if (faixa === oldFaixa && graus < oldGraus) {
        alert('Não é permitido diminuir a quantidade de graus do aluno.');
        return;
      }
    }

    await onSave({
      nome,
      cpf,
      dataNascimento,
      telefone,
      email,
      genero,
      dataMatricula,
      bairro,
      faixa,
      graus,
      role,
      dataUltimaGraduacao: dbUltimaGrad,
      contatoEmergenciaNome,
      contatoEmergenciaTel,
      status,
      turma,
      fotoPerfil,
      historicoGraduacoes
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-obsidian-850 border border-obsidian-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-scale-up">
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-obsidian-750 shrink-0 bg-obsidian-850 z-10 rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-gold-500" />
            {isDisabled ? 'Visualizar Cadastro de Membro' : editingStudent ? 'Editar Cadastro de Membro' : 'Cadastrar Novo Membro'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-gold-500 p-1 transition-colors"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            {/* Seção 1: Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gold-450 uppercase tracking-widest border-b border-obsidian-750 pb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Dados Pessoais
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Nome Completo *</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome e Sobrenome"
                  className="input-premium"
                  required
                  disabled={isDisabled}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Data de Nascimento *</label>
                  <input
                    type="date"
                    value={dataNascimento}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setDataNascimento(newDate);
                      const allowed = getBeltsByAge(newDate);
                      if (!allowed.includes(faixa)) {
                        setFaixa(allowed[0]);
                      }
                      if (newDate) {
                        const age = getBjjAge(newDate);
                        if (age >= 4 && age <= 12) {
                          setTurma('Kids');
                        } else if (age >= 13) {
                          setTurma('Adulto');
                        }
                      }
                    }}
                    className="input-premium"
                    required
                    disabled={isDisabled}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Bairro</label>
                  <select
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    className="input-premium bg-obsidian-950 text-slate-200"
                    disabled={isDisabled}
                  >
                    <option value="">Selecione o bairro...</option>
                    {bairro && !BAIRROS_DF.includes(bairro) && (
                      <option value={bairro}>{bairro}</option>
                    )}
                    {BAIRROS_DF.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Telefone (Contato) *</label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(formatPhone(e.target.value))}
                    placeholder="(61) 99999-9999"
                    className="input-premium font-mono"
                    required
                    disabled={isDisabled}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@dominio.com"
                    className="input-premium"
                    disabled={isDisabled}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">CPF *</label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(formatCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    className="input-premium font-mono"
                    disabled={isDisabled}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Gênero</label>
                  <select
                    value={genero}
                    onChange={(e) => setGenero(e.target.value as Gender)}
                    className="input-premium bg-obsidian-950 text-slate-200"
                    disabled={isDisabled}
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Turma (Automática)</label>
                  <select
                    value={turma}
                    onChange={(e) => setTurma(e.target.value as 'Kids' | 'Adulto')}
                    className="input-premium bg-obsidian-950 text-slate-200 font-semibold opacity-75 cursor-not-allowed"
                    required
                    disabled={true}
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
                  {fotoPerfil ? (
                    fotoPerfil.length === 2 ? (
                      <span>{fotoPerfil}</span>
                    ) : (
                      <img src={fotoPerfil} alt="Preview" className="w-full h-full object-cover" />
                    )
                  ) : (
                    <span className="text-slate-600">🥋</span>
                  )}
                </div>
                {/* Options */}
                {!isDisabled && (
                  <div className="flex-1 space-y-3 w-full">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-xs text-slate-500 mr-1">Avatares padrão:</span>
                      <button type="button" onClick={() => setFotoPerfil('👦')} className={`p-1.5 rounded-lg border text-lg hover:bg-obsidian-700 transition-colors ${fotoPerfil === '👦' ? 'border-gold-500 bg-gold-500/10' : 'border-obsidian-700'}`}>👦</button>
                      <button type="button" onClick={() => setFotoPerfil('👨')} className={`p-1.5 rounded-lg border text-lg hover:bg-obsidian-700 transition-colors ${fotoPerfil === '👨' ? 'border-gold-500 bg-gold-500/10' : 'border-obsidian-700'}`}>👨</button>
                      <button type="button" onClick={() => setFotoPerfil('🧑')} className={`p-1.5 rounded-lg border text-lg hover:bg-obsidian-700 transition-colors ${fotoPerfil === '🧑' ? 'border-gold-500 bg-gold-500/10' : 'border-obsidian-700'}`}>🧑</button>
                      <button type="button" onClick={() => setFotoPerfil('👧')} className={`p-1.5 rounded-lg border text-lg hover:bg-obsidian-700 transition-colors ${fotoPerfil === '👧' ? 'border-gold-500 bg-gold-500/10' : 'border-obsidian-700'}`}>👧</button>
                      <button type="button" onClick={() => setFotoPerfil('👩')} className={`p-1.5 rounded-lg border text-lg hover:bg-obsidian-700 transition-colors ${fotoPerfil === '👩' ? 'border-gold-500 bg-gold-500/10' : 'border-obsidian-700'}`}>👩</button>
                      <button type="button" onClick={() => setFotoPerfil('👩‍🦰')} className={`p-1.5 rounded-lg border text-lg hover:bg-obsidian-700 transition-colors ${fotoPerfil === '👩‍🦰' ? 'border-gold-500 bg-gold-500/10' : 'border-obsidian-700'}`}>👩‍🦰</button>
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
                                setFotoPerfil(event.target.result as string);
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
                    value={faixa}
                    onChange={(e) => setFaixa(e.target.value as Belt)}
                    className="input-premium bg-obsidian-950 text-slate-200"
                    disabled={isDisabled}
                  >
                    {getBeltsByAge(dataNascimento).map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Graus (0 a 4)</label>
                  <select
                    value={graus}
                    onChange={(e) => setGraus(Number(e.target.value) as Degree)}
                    className="input-premium bg-obsidian-950 text-slate-200"
                    disabled={isDisabled}
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
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tipo de Usuário</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'admin' | 'student' | 'teacher')}
                    className="input-premium w-full bg-obsidian-950 disabled:opacity-50"
                    disabled={isDisabled}
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
                    value={dataUltimaGraduacao}
                    onChange={(e) => setDataUltimaGraduacao(e.target.value)}
                    className="input-premium"
                    disabled={isDisabled}
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
                    {historicoGraduacoes && historicoGraduacoes.length > 0 ? (
                      historicoGraduacoes.slice().reverse().map((grad, idx) => (
                        <tr key={idx} className="hover:bg-obsidian-800/30 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap font-mono">
                            {formatMonthYear(grad.data)}
                          </td>
                          <td className="px-4 py-3">
                            <BeltBadge faixa={grad.faixa} graus={grad.graus} />
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
                <Heart className="w-3.5 h-3.5 text-red-500" /> Contato de Emergência {getBjjAge(dataNascimento) < 18 && <span className="text-xs text-red-400 normal-case font-normal">(Obrigatório para menores)</span>}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Nome de Emergência {getBjjAge(dataNascimento) < 18 && <span className="text-red-500 font-bold">*</span>}
                  </label>
                  <input
                    type="text"
                    value={contatoEmergenciaNome}
                    onChange={(e) => setContatoEmergenciaNome(e.target.value)}
                    placeholder="Nome do responsável / contato"
                    className="input-premium"
                    disabled={isDisabled}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Telefone de Emergência {getBjjAge(dataNascimento) < 18 && <span className="text-red-500 font-bold">*</span>}
                  </label>
                  <input
                    type="text"
                    value={contatoEmergenciaTel}
                    onChange={(e) => setContatoEmergenciaTel(formatPhone(e.target.value))}
                    placeholder="(61) 99999-9999"
                    className="input-premium font-mono"
                    disabled={isDisabled}
                  />
                </div>
              </div>
            </div>

            {/* Status Acadêmico */}
            <div className="flex items-center gap-3 pt-3">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Status Acadêmico:</span>
              <label className={`relative inline-flex items-center select-none ${isDisabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={status === 'Ativo'}
                  onChange={(e) => setStatus(e.target.checked ? 'Ativo' : 'Inativo')}
                  className="sr-only peer"
                  disabled={isDisabled}
                />
                <div className="w-11 h-6 bg-obsidian-950 border border-obsidian-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-gold-500 after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500/10 peer-checked:border-gold-500"></div>
                <span className={`ml-3 text-sm font-semibold transition-colors ${status === 'Ativo' ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {status}
                </span>
              </label>
            </div>
          </div>

          {/* Footer do Modal */}
          <div className="flex justify-end gap-3 p-6 border-t border-obsidian-750 shrink-0 bg-obsidian-850 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="btn-obsidian"
            >
              {isDisabled ? 'Fechar' : 'Cancelar'}
            </button>
            {!isDisabled && (
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
  );
};
