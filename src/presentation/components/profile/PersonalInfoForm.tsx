import React, { useState, useEffect } from 'react';
import type { Belt, Degree, Gender } from '@/domain/models/student';
import { BAIRROS_DF } from '@/constants';
import { getBeltsByAge, getTurmaByAge } from '@/application/services/diplomaService';
import { calculateIbjjfCategory } from '@/utils/ibjjfCalculator';

interface PersonalInfoFormProps {
  initialData: {
    nome: string;
    cpf?: string;
    dataNascimento?: string;
    telefone?: string;
    email?: string;
    genero?: Gender;
    bairro?: string;
    dataMatricula?: string;
    faixa?: Belt;
    graus?: Degree;
    turma?: 'Kids' | 'Adulto';
    contatoEmergenciaNome?: string;
    contatoEmergenciaTel?: string;
    fotoPerfil?: string;
    assinatura?: string;
    peso?: number;
  };
  role: 'admin' | 'teacher' | 'student';
  isEditingOtherStudent: boolean; // Se o admin/professor está editando a ficha de outro aluno
  onSave: (data: any) => Promise<void>;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  initialData,
  role,
  isEditingOtherStudent,
  onSave
}) => {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [genero, setGenero] = useState<Gender>('Masculino');
  const [bairro, setBairro] = useState('');
  const [dataMatricula, setDataMatricula] = useState('');
  const [faixa, setFaixa] = useState<Belt>('Branca');
  const [graus, setGraus] = useState<Degree>(0);
  const [turma, setTurma] = useState<'Kids' | 'Adulto'>('Adulto');
  const [contatoEmergenciaNome, setContatoEmergenciaNome] = useState('');
  const [contatoEmergenciaTel, setContatoEmergenciaTel] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState('');
  const [assinatura, setAssinatura] = useState('');
  const [peso, setPeso] = useState<string | number>('');
  const [modality, setModality] = useState<'gi' | 'nogi'>('gi');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setNome(initialData.nome || '');
    setCpf(initialData.cpf || '');
    setDataNascimento(initialData.dataNascimento || '');
    setTelefone(initialData.telefone || '');
    setEmail(initialData.email || '');
    setGenero(initialData.genero || 'Masculino');
    setBairro(initialData.bairro || '');
    setDataMatricula(initialData.dataMatricula || '');
    setFaixa(initialData.faixa || 'Branca');
    setGraus(initialData.graus || 0);
    setTurma(initialData.turma || 'Adulto');
    setContatoEmergenciaNome(initialData.contatoEmergenciaNome || '');
    setContatoEmergenciaTel(initialData.contatoEmergenciaTel || '');
    setFotoPerfil(initialData.fotoPerfil || '');
    setAssinatura(initialData.assinatura || '');
    setPeso(initialData.peso !== undefined && initialData.peso !== null ? initialData.peso : '');
  }, [initialData]);

  const handlePhoneMask = (val: string) => {
    let raw = val.replace(/\D/g, '');
    if (raw.length > 11) raw = raw.substring(0, 11);
    if (raw.length > 2) raw = `(${raw.substring(0, 2)}) ${raw.substring(2)}`;
    if (raw.length > 9) raw = `${raw.substring(0, 10)}-${raw.substring(10)}`;
    return raw;
  };

  const handleCpfMask = (val: string) => {
    let raw = val.replace(/\D/g, '');
    if (raw.length > 11) raw = raw.substring(0, 11);
    if (raw.length > 9) {
      raw = `${raw.substring(0, 3)}.${raw.substring(3, 6)}.${raw.substring(6, 9)}-${raw.substring(9)}`;
    } else if (raw.length > 6) {
      raw = `${raw.substring(0, 3)}.${raw.substring(3, 6)}.${raw.substring(6)}`;
    } else if (raw.length > 3) {
      raw = `${raw.substring(0, 3)}.${raw.substring(3)}`;
    }
    return raw;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: any = { nome };
      if (role === 'student' || isEditingOtherStudent) {
        payload.cpf = cpf;
        payload.dataNascimento = dataNascimento;
        payload.telefone = telefone;
        payload.email = email;
        payload.genero = genero;
        payload.bairro = bairro;
        payload.dataMatricula = dataMatricula;
        payload.faixa = faixa;
        payload.graus = graus;
        payload.turma = turma;
        payload.contatoEmergenciaNome = contatoEmergenciaNome;
        payload.contatoEmergenciaTel = contatoEmergenciaTel;
        payload.fotoPerfil = fotoPerfil;
        payload.peso = peso !== '' ? parseFloat(String(peso)) : null;
      } else if (role === 'teacher') {
        payload.email = email;
        payload.telefone = telefone;
        payload.foto_perfil = fotoPerfil;
        payload.assinatura = assinatura;
      } else if (role === 'admin') {
        payload.foto_perfil = fotoPerfil;
      }

      await onSave(payload);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const isStudentType = role === 'student' || isEditingOtherStudent;

  const ibjjfResult = calculateIbjjfCategory({
    dataNascimento,
    gender: genero,
    modality,
    weightKg: peso !== '' ? peso : 70,
    beltColor: faixa
  });

  return (
    <form onSubmit={handleSave} className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-bold text-slate-100">Informações Pessoais</h2>
        <p className="text-slate-400 text-xs mt-1">
          Visualize ou atualize seus dados de cadastro no sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Avatar & Signature Upload (for teacher) */}
        <div className="md:col-span-3 flex flex-col gap-6">
          {/* Avatar Upload Card */}
          <div className="flex flex-col items-center justify-center bg-obsidian-900 border border-obsidian-850 p-6 rounded-2xl relative shadow-md">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gold-550/20 bg-obsidian-950 flex items-center justify-center text-4xl shadow-inner select-none mb-4 shrink-0">
              {fotoPerfil ? (
                fotoPerfil.length <= 2 ? (
                  <span>{fotoPerfil}</span>
                ) : (
                  <img src={fotoPerfil} alt="Perfil" className="w-full h-full object-cover" />
                )
              ) : (
                <span className="text-slate-500">🥋</span>
              )}
            </div>
            <div className="flex gap-1.5 mb-3">
              {['🥋', '🥇', '🦁', '🛡️'].map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFotoPerfil(emoji)}
                  className={`p-1.5 border rounded hover:bg-obsidian-750 text-sm ${fotoPerfil === emoji ? 'border-gold-550 bg-gold-550/10' : 'border-obsidian-700'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
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
              className="text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:bg-obsidian-800 file:text-slate-205 hover:file:bg-obsidian-750 file:cursor-pointer w-full"
            />
          </div>

          {/* Signature Upload Card */}
          {role === 'teacher' && (
            <div className="flex flex-col items-center justify-center bg-obsidian-900 border border-obsidian-850 p-6 rounded-2xl relative shadow-md">
              <span className="text-xs font-bold text-slate-350 mb-2 uppercase tracking-wider">Assinatura Digital</span>
              <div className="w-full h-16 rounded border border-obsidian-800 bg-white flex items-center justify-center p-2 mb-3 overflow-hidden shadow-inner">
                {assinatura ? (
                  <img src={assinatura} alt="Assinatura Digital" className="max-w-full max-h-full object-contain" />
                ) : (
                  <span className="text-slate-400 text-[10px] italic">Sem assinatura</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      if (event.target?.result) {
                        setAssinatura(event.target.result as string);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:bg-obsidian-800 file:text-slate-205 hover:file:bg-obsidian-750 file:cursor-pointer w-full"
              />
              {assinatura && (
                <button
                  type="button"
                  onClick={() => setAssinatura('')}
                  className="text-[10px] text-red-400 hover:underline mt-2 font-semibold"
                >
                  Remover Assinatura
                </button>
              )}
            </div>
          )}
        </div>

        {/* Inputs */}
        <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 col-span-2">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Nome Completo</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="input-premium w-full bg-obsidian-950"
              required
              disabled={submitting}
            />
          </div>

          {isStudentType && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">CPF</label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(handleCpfMask(e.target.value))}
                  placeholder="000.000.000-00"
                  className="input-premium w-full bg-obsidian-950 font-mono"
                  required
                  disabled={submitting || !isEditingOtherStudent} // Aluno comum não altera CPF por segurança
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Data de Nascimento</label>
                <input
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setDataNascimento(newDate);
                    if (newDate) {
                      setTurma(getTurmaByAge(newDate));
                      const allowed = getBeltsByAge(newDate);
                      if (!allowed.includes(faixa)) {
                        setFaixa(allowed[0]);
                      }
                    }
                  }}
                  className="input-premium w-full bg-obsidian-950 font-mono"
                  required
                  disabled={submitting || !isEditingOtherStudent}
                />
              </div>
            </>
          )}

          {(role === 'teacher' || isStudentType) && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Telefone</label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(handlePhoneMask(e.target.value))}
                  placeholder="(00) 00000-0000"
                  className="input-premium w-full bg-obsidian-950 font-mono"
                  disabled={submitting}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-premium w-full bg-obsidian-950 font-mono"
                  disabled={submitting}
                />
              </div>
            </>
          )}

          {isStudentType && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Gênero</label>
                <select
                  value={genero}
                  onChange={(e) => setGenero(e.target.value as Gender)}
                  className="input-premium w-full bg-obsidian-950"
                  disabled={submitting || !isEditingOtherStudent}
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Peso Atual (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="10"
                  max="250"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  placeholder="Ex: 75.5"
                  className="input-premium w-full bg-obsidian-950 font-mono"
                  disabled={submitting}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Bairro do DF</label>
                <select
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  className="input-premium w-full bg-obsidian-950"
                  disabled={submitting}
                >
                  <option value="" disabled>Selecione um bairro...</option>
                  {BAIRROS_DF.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Faixa Atual</label>
                <select
                  value={faixa}
                  onChange={(e) => setFaixa(e.target.value as Belt)}
                  className="input-premium w-full bg-obsidian-950 text-gold-450 font-bold"
                  disabled={submitting}
                >
                  {getBeltsByAge(dataNascimento).map((b: Belt) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Graus na Faixa</label>
                <select
                  value={graus}
                  onChange={(e) => setGraus(Number(e.target.value) as Degree)}
                  className="input-premium w-full bg-obsidian-950 text-gold-450 font-bold"
                  disabled={submitting}
                >
                  <option value={0}>0 Grau</option>
                  <option value={1}>1 Grau</option>
                  <option value={2}>2 Graus</option>
                  <option value={3}>3 Graus</option>
                  <option value={4}>4 Graus</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Turma Principal</label>
                <select
                  value={turma}
                  onChange={(e) => setTurma(e.target.value as 'Kids' | 'Adulto')}
                  className="input-premium w-full bg-obsidian-950"
                  disabled={submitting || !isEditingOtherStudent}
                >
                  <option value="Kids">Kids</option>
                  <option value="Adulto">Adulto</option>
                </select>
              </div>

              {/* Card de Categoria e Divisão Calculada do Aluno */}
              <div className="col-span-1 sm:col-span-2 mt-2 p-4 sm:p-5 bg-obsidian-950 border border-obsidian-850 rounded-2xl space-y-4 shadow-inner w-full min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-obsidian-850 pb-3 w-full min-w-0">
                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[10px] font-black text-gold-500 uppercase tracking-widest block leading-snug">
                      Resultado IBJJF Calculado (Ano de Referência: {ibjjfResult.currentYear})
                    </span>
                    <span className="text-[11px] text-zinc-400 block leading-snug">
                      Categorias e tempo de luta oficiais baseados em seus dados cadastrais.
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto bg-obsidian-900 border border-obsidian-800 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setModality('gi')}
                      className={`px-3 py-1 text-[10px] font-extrabold uppercase rounded-lg transition-all ${
                        modality === 'gi' 
                          ? 'bg-gold-550/20 text-gold-400 border border-gold-550/30' 
                          : 'text-zinc-500 hover:text-slate-300'
                      }`}
                    >
                      De Kimono (Gi)
                    </button>
                    <button
                      type="button"
                      onClick={() => setModality('nogi')}
                      className={`px-3 py-1 text-[10px] font-extrabold uppercase rounded-lg transition-all ${
                        modality === 'nogi' 
                          ? 'bg-gold-550/20 text-gold-400 border border-gold-550/30' 
                          : 'text-zinc-500 hover:text-slate-300'
                      }`}
                    >
                      Sem Kimono (No-Gi)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full min-w-0">
                  <div className="space-y-1 min-w-0">
                    <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider block">Categoria de Idade</span>
                    <span className="text-xs sm:text-sm font-black text-slate-150 block truncate">{ibjjfResult.category}</span>
                    <span className="text-[10px] text-zinc-450 font-bold block">{ibjjfResult.calculatedAge} anos de idade</span>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider block">Tempo Reg. de Luta</span>
                    <span className="text-xs sm:text-sm font-black text-slate-150 block">{ibjjfResult.fightTime}</span>
                    <span className="text-[10px] text-zinc-450 font-semibold block">
                      Final: {ibjjfResult.category.startsWith('MASTER') || ibjjfResult.category.startsWith('ADULTO') ? 'Mesmo tempo' : 'Dobro'}
                    </span>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider block">Categoria de Peso</span>
                    <span className="text-xs sm:text-sm font-black text-slate-150 block">Peso {ibjjfResult.weightClass.name}</span>
                    <span className="text-[10px] text-zinc-450 font-semibold block">
                      {peso !== '' ? `${peso} kg informado` : 'Peso não informado'}
                    </span>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider block">Limite Divisão</span>
                    <span className="text-xs sm:text-sm font-black text-gold-450 block">{ibjjfResult.weightClass.limit}</span>
                    <span className="text-[10px] text-zinc-450 font-semibold block">
                      {modality === 'gi' ? 'Modalidade Kimono' : 'Modalidade No-Gi'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 col-span-2 pt-2 border-t border-obsidian-850">
                <span className="text-[10px] text-zinc-555 font-bold uppercase tracking-wider block mb-1">Contato de Emergência</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Nome do Contato</label>
                    <input
                      type="text"
                      value={contatoEmergenciaNome}
                      onChange={(e) => setContatoEmergenciaNome(e.target.value)}
                      placeholder="Ex: Mãe, Cônjuge"
                      className="input-premium w-full bg-obsidian-950"
                      disabled={submitting}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Telefone de Emergência</label>
                    <input
                      type="text"
                      value={contatoEmergenciaTel}
                      onChange={(e) => setContatoEmergenciaTel(handlePhoneMask(e.target.value))}
                      placeholder="(00) 00000-0000"
                      className="input-premium w-full bg-obsidian-950 font-mono"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-obsidian-850">
        <button
          type="submit"
          disabled={submitting}
          className="btn-gold px-8 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
        >
          {submitting ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </form>
  );
};
export default PersonalInfoForm;
