import React, { useState, useEffect } from 'react';
import type { Belt, Degree, Gender } from '@/domain/models/student';
import { BAIRROS_DF } from '@/constants';

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
                  onChange={(e) => setDataNascimento(e.target.value)}
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
