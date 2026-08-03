import React, { useState, useEffect } from 'react';
import type { Aluno, Belt, Degree, Gender } from '@/domain/models/student';
import type { GraduationEligibility } from '@/domain/models/graduation';
import { getBeltRank, BAIRROS_DF } from '@/constants';
import { getBeltsByAge, getTurmaByAge } from '@/application/services/diplomaService';
import { maskCpf, maskPhone, validateCpf } from '@/utils/maskUtils';
import { User, CheckCircle2, AlertCircle, Save, Camera, MapPin, School, UserCheck, Award, AlertTriangle } from 'lucide-react';

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
  isEditingOtherStudent: boolean;
  onSave: (data: any) => Promise<void>;
  student?: Aluno;
  eligibility?: GraduationEligibility | null;
  lastTeacherName?: string;
  ibjjfCategoryText?: string | null;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  initialData,
  role,
  isEditingOtherStudent,
  onSave,
  student,
  eligibility,
  lastTeacherName,
  ibjjfCategoryText
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

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setNome(initialData.nome || '');
    setCpf(initialData.cpf ? maskCpf(initialData.cpf) : '');
    setDataNascimento(initialData.dataNascimento || '');
    setTelefone(initialData.telefone ? maskPhone(initialData.telefone) : '');
    setEmail(initialData.email || '');
    setGenero(initialData.genero || 'Masculino');
    setBairro(initialData.bairro || '');

    setDataMatricula(initialData.dataMatricula || '');
    setFaixa(initialData.faixa || 'Branca');
    setGraus(initialData.graus || 0);
    setTurma(initialData.turma || 'Adulto');
    setContatoEmergenciaNome(initialData.contatoEmergenciaNome || '');
    setContatoEmergenciaTel(initialData.contatoEmergenciaTel ? maskPhone(initialData.contatoEmergenciaTel) : '');
    setFotoPerfil(initialData.fotoPerfil || '');
    setAssinatura(initialData.assinatura || '');
    setPeso(initialData.peso !== undefined && initialData.peso !== null ? initialData.peso : '');
  }, [initialData]);

  const isStudentType = role === 'student' || isEditingOtherStudent;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (isStudentType && cpf && !validateCpf(cpf)) {
      setErrorMsg('O CPF informado é inválido. Verifique os números digitados.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = { nome };

      if (isStudentType) {
        const initialRank = getBeltRank(initialData.faixa);
        const selectedRank = getBeltRank(faixa);
        const initialGrau = Number(initialData.graus) || 0;
        const selectedGrau = Number(graus) || 0;

        if (selectedRank < initialRank || (selectedRank === initialRank && selectedGrau < initialGrau)) {
          setErrorMsg('Não é possível rebaixar a faixa ou grau atual nas Informações Pessoais.');
          setSubmitting(false);
          return;
        }

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
      setSuccessMsg('Informações atualizadas com sucesso!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar informações.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 text-left w-full max-w-full min-w-0">
      
      {/* Mensagens de Feedback */}
      {successMsg && (
        <div className="flex items-center gap-2.5 p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2.5 p-4 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Card 1: Informações Pessoais (Nome, CPF, Data Nasc, Sexo, Telefone, Email) */}
      <div className="bg-obsidian-900/60 border border-obsidian-850 p-4 sm:p-6 rounded-2xl shadow-xl space-y-5">
        <div className="flex items-center gap-2.5 border-b border-obsidian-850 pb-3">
          <User className="w-5 h-5 text-gold-500 shrink-0" />
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-100">Informações Pessoais</h2>
            <p className="text-slate-400 text-xs mt-0.5">Seus dados cadastrais básicos de identificação.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Avatar Upload */}
          <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center justify-center bg-obsidian-950 border border-obsidian-800 p-5 rounded-2xl shadow-inner">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gold-550/40 bg-obsidian-900 flex items-center justify-center text-4xl shadow-md shrink-0 mb-3 relative">
              {fotoPerfil ? (
                fotoPerfil.length <= 2 ? (
                  <span>{fotoPerfil}</span>
                ) : (
                  <img src={fotoPerfil} alt="Perfil" loading="lazy" className="w-full h-full object-cover" />
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
                  className={`p-2 border rounded-lg text-sm transition-all min-w-[36px] min-h-[36px] flex items-center justify-center ${
                    fotoPerfil === emoji ? 'border-gold-550 bg-gold-550/15' : 'border-obsidian-800 hover:bg-obsidian-800'
                  }`}
                  aria-label={`Selecionar avatar ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <label className="btn-secondary w-full text-center py-2 px-3 text-xs font-bold uppercase rounded-xl cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px]">
              <Camera className="w-4 h-4 text-gold-500" />
              <span>Enviar Foto</span>
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
                className="hidden"
              />
            </label>
          </div>

          {/* Form Fields */}
          <div className="md:col-span-8 lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Nome Completo */}
            <div className="flex flex-col gap-1.5 col-span-1 sm:col-span-2">
              <label htmlFor="field-nome" className="text-xs text-slate-300 font-bold uppercase tracking-wider">
                Nome Completo <span className="text-gold-500">*</span>
              </label>
              <input
                id="field-nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="input-premium w-full min-h-[48px] px-4 py-3 bg-obsidian-950 text-slate-100 rounded-xl border border-obsidian-800 focus:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/30"
                required
                disabled={submitting}
              />
            </div>

            {isStudentType && (
              <>
                {/* CPF */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="field-cpf" className="text-xs text-slate-300 font-bold uppercase tracking-wider">
                    CPF <span className="text-gold-500">*</span>
                  </label>
                  <input
                    id="field-cpf"
                    type="text"
                    inputMode="numeric"
                    value={cpf}
                    onChange={(e) => setCpf(maskCpf(e.target.value))}
                    placeholder="000.000.000-00"
                    className="input-premium w-full min-h-[48px] px-4 py-3 bg-obsidian-950 font-mono text-slate-100 rounded-xl border border-obsidian-800 focus:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/30"
                    required
                    disabled={submitting || !isEditingOtherStudent}
                  />
                </div>

                {/* Data de Nascimento */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="field-nascimento" className="text-xs text-slate-300 font-bold uppercase tracking-wider">
                    Data de Nascimento <span className="text-gold-500">*</span>
                  </label>
                  <input
                    id="field-nascimento"
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
                    className="input-premium w-full min-h-[48px] px-4 py-3 bg-obsidian-950 font-mono text-slate-100 rounded-xl border border-obsidian-800 focus:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/30"
                    required
                    disabled={submitting || !isEditingOtherStudent}
                  />
                </div>
              </>
            )}

            {/* Telefone & Email */}
            {(role === 'teacher' || isStudentType) && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="field-telefone" className="text-xs text-slate-300 font-bold uppercase tracking-wider">
                    Telefone / WhatsApp
                  </label>
                  <input
                    id="field-telefone"
                    type="text"
                    inputMode="tel"
                    value={telefone}
                    onChange={(e) => setTelefone(maskPhone(e.target.value))}
                    placeholder="(00) 00000-0000"
                    className="input-premium w-full min-h-[48px] px-4 py-3 bg-obsidian-950 font-mono text-slate-100 rounded-xl border border-obsidian-800 focus:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/30"
                    disabled={submitting}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="field-email" className="text-xs text-slate-300 font-bold uppercase tracking-wider">
                    E-mail
                  </label>
                  <input
                    id="field-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@email.com"
                    className="input-premium w-full min-h-[48px] px-4 py-3 bg-obsidian-950 text-slate-100 rounded-xl border border-obsidian-800 focus:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/30"
                    disabled={submitting}
                  />
                </div>
              </>
            )}

            {isStudentType && (
              <>
                {/* Sexo / Gênero */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="field-genero" className="text-xs text-slate-300 font-bold uppercase tracking-wider">
                    Sexo / Gênero
                  </label>
                  <select
                    id="field-genero"
                    value={genero}
                    onChange={(e) => setGenero(e.target.value as Gender)}
                    className="input-premium w-full min-h-[48px] px-4 py-3 bg-obsidian-950 text-slate-100 rounded-xl border border-obsidian-800 focus:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/30 cursor-pointer"
                    disabled={submitting || !isEditingOtherStudent}
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                  </select>
                </div>

                {/* Peso Atual */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="field-peso" className="text-xs text-slate-300 font-bold uppercase tracking-wider">
                    Peso Atual (kg)
                  </label>
                  <input
                    id="field-peso"
                    type="number"
                    step="0.1"
                    min="10"
                    max="250"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                    placeholder="Ex: 75.5"
                    className="input-premium w-full min-h-[48px] px-4 py-3 bg-obsidian-950 font-mono text-slate-100 rounded-xl border border-obsidian-800 focus:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/30"
                    disabled={submitting}
                  />
                </div>

                {/* Bairro / Região */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="field-bairro" className="text-xs text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                    <span>Bairro / Região</span>
                  </label>
                  {BAIRROS_DF.includes(bairro) || !bairro ? (
                    <select
                      id="field-bairro"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                      className="input-premium w-full min-h-[48px] px-4 py-3 bg-obsidian-950 text-slate-100 rounded-xl border border-obsidian-800 focus:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/30 cursor-pointer text-sm"
                      disabled={submitting}
                    >
                      <option value="">Selecione um bairro...</option>
                      {BAIRROS_DF.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="field-bairro"
                      type="text"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                      placeholder="Ex: Asa Sul, Taguatinga..."
                      className="input-premium w-full min-h-[48px] px-4 py-3 bg-obsidian-950 text-slate-100 placeholder-slate-600 rounded-xl border border-obsidian-800 focus:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/30 text-sm"
                      disabled={submitting}
                    />
                  )}
                </div>
              </>
            )}

          </div>
        </div>
      </div>

      {/* Card 2: Informações da Academia (agrupado em Dados Pessoais) */}
      {isStudentType && (
        <div className="bg-obsidian-900/60 border border-obsidian-850 p-4 sm:p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-obsidian-850 pb-3 gap-2">
            <div className="flex items-center gap-2.5">
              <School className="w-5 h-5 text-gold-500 shrink-0" />
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-100">Informações da Academia</h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Turma, professor responsável e categoria oficial de jiu-jitsu.
                </p>
              </div>
            </div>

            {student?.status && (
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border shrink-0 ${
                student.status === 'Ativo'
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                  : 'text-orange-400 bg-orange-500/10 border-orange-500/20'
              }`}>
                {student.status}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Turma Principal */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="field-turma" className="text-xs text-slate-300 font-bold uppercase tracking-wider">
                Turma Principal
              </label>
              <select
                id="field-turma"
                value={turma}
                onChange={(e) => setTurma(e.target.value as 'Kids' | 'Adulto')}
                className="input-premium w-full min-h-[48px] px-4 py-3 bg-obsidian-950 text-slate-100 rounded-xl border border-obsidian-800 focus:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/30 cursor-pointer text-sm"
                disabled={submitting || !isEditingOtherStudent}
              >
                <option value="Adulto">Adulto</option>
                <option value="Kids">Kids</option>
              </select>
            </div>

            {/* Professor Responsável */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                <span>Professor Responsável</span>
              </label>
              <div className="min-h-[48px] px-4 py-3 bg-obsidian-950/80 text-slate-200 font-bold rounded-xl border border-obsidian-800/80 flex items-center text-sm truncate">
                {lastTeacherName || 'Professor Master'}
              </div>
            </div>

            {/* Categoria Oficial IBJJF */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                <span>Categoria Oficial IBJJF</span>
              </label>
              <div className="min-h-[48px] px-4 py-3 bg-obsidian-950/80 text-slate-200 font-bold rounded-xl border border-obsidian-800/80 flex items-center text-xs uppercase truncate">
                {ibjjfCategoryText || 'Configure peso e data de nascimento'}
              </div>
            </div>
          </div>

          {/* Elegibilidade de Graduação */}
          {eligibility && (
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-2 ${
              eligibility.status === 'Apto' 
                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' 
                : 'bg-obsidian-950 border-obsidian-800 text-slate-300'
            }`}>
              <div className="flex items-center gap-3">
                {eligibility.status === 'Apto' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                )}
                <div>
                  <span className="text-xs font-black uppercase tracking-wider block">
                    {eligibility.status === 'Apto' ? 'Elegível para Graduação!' : `Elegibilidade: ${eligibility.status}`}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                    {eligibility.tempoFaixaAtualMeses} meses cumpridos na faixa atual • {eligibility.percentualEvolucao}% de evolução
                  </span>
                </div>
              </div>
              
              <div className="text-left sm:text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Previsão</span>
                <span className="text-xs font-black text-gold-450">{eligibility.dataEstimadaProximaGraduacao || 'Em breve'}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Card 3: Contato de Emergência (se aluno) */}
      {isStudentType && (
        <div className="bg-obsidian-900/60 border border-obsidian-850 p-4 sm:p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-200 uppercase tracking-wider">
            Contato de Emergência
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="field-emergencia-nome" className="text-xs text-slate-300 font-bold uppercase tracking-wider">
                Nome do Contato
              </label>
              <input
                id="field-emergencia-nome"
                type="text"
                value={contatoEmergenciaNome}
                onChange={(e) => setContatoEmergenciaNome(e.target.value)}
                placeholder="Ex: Mãe, Cônjuge"
                className="input-premium w-full min-h-[48px] px-4 py-3 bg-obsidian-950 text-slate-100 rounded-xl border border-obsidian-800 focus:border-gold-500"
                disabled={submitting}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="field-emergencia-tel" className="text-xs text-slate-300 font-bold uppercase tracking-wider">
                Telefone de Emergência
              </label>
              <input
                id="field-emergencia-tel"
                type="text"
                inputMode="tel"
                value={contatoEmergenciaTel}
                onChange={(e) => setContatoEmergenciaTel(maskPhone(e.target.value))}
                placeholder="(00) 00000-0000"
                className="input-premium w-full min-h-[48px] px-4 py-3 bg-obsidian-950 font-mono text-slate-100 rounded-xl border border-obsidian-800 focus:border-gold-500"
                disabled={submitting}
              />
            </div>
          </div>
        </div>
      )}

      {/* Botão de Salvar Alterações (Full width no mobile min-h-[48px]) */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="btn-gold w-full sm:w-auto min-h-[48px] px-8 py-3 text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 rounded-xl shadow-lg transition-all active:scale-98"
        >
          <Save className="w-4 h-4 shrink-0" />
          <span>{submitting ? 'Salvando Alterações...' : 'Salvar Alterações'}</span>
        </button>
      </div>

    </form>
  );
};

export default PersonalInfoForm;
