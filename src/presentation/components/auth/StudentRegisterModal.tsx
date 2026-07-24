import React, { useState } from 'react';
import type { Belt, Degree, Gender } from '@/domain/models/student';
import { BAIRROS_DF } from '@/constants';
import { formatCPF, formatPhone } from '@/utils/formatters';
import { getBeltsByAge, getBjjAge } from '@/application/services/diplomaService';
import { authService } from '@/application/services/authService';
import { Shield, X, User, AlertCircle, Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';

const isValidCPF = (value: string): boolean => {
  const cleanCPF = value.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cleanCPF.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cleanCPF.charAt(10))) return false;

  return true;
};

interface StudentRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (credentials: { identifier: string; password: string }) => void;
}

export const StudentRegisterModal: React.FC<StudentRegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [genero, setGenero] = useState<Gender>('Masculino');
  const [bairro, setBairro] = useState('');
  const [faixa, setFaixa] = useState<Belt>('Branca');
  const [graus, setGraus] = useState<Degree>(0);
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [contatoEmergenciaNome, setContatoEmergenciaNome] = useState('');
  const [contatoEmergenciaTel, setContatoEmergenciaTel] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!nome.trim()) {
      setErrorMsg('Por favor, informe seu nome completo.');
      return;
    }

    if (!dataNascimento) {
      setErrorMsg('Por favor, informe sua data de nascimento.');
      return;
    }

    const cleanedCpf = cpf.replace(/\D/g, '');
    if (!cleanedCpf) {
      setErrorMsg('O CPF é obrigatório.');
      return;
    }

    if (!isValidCPF(cleanedCpf)) {
      setErrorMsg('CPF inválido. Por favor, verifique os dígitos digitados.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Por favor, informe um e-mail válido.');
      return;
    }

    if (!telefone.trim()) {
      setErrorMsg('Por favor, informe um telefone de contato.');
      return;
    }

    if (senha.length < 6) {
      setErrorMsg('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (senha !== confirmSenha) {
      setErrorMsg('As senhas digitadas não coincidem.');
      return;
    }

    const age = getBjjAge(dataNascimento);
    if (age < 18) {
      if (!contatoEmergenciaNome.trim() || !contatoEmergenciaTel.trim()) {
        setErrorMsg('Para alunos menores de 18 anos, é obrigatório preencher o Contato de Emergência.');
        return;
      }
    }

    const turmaCalculada: 'Kids' | 'Adulto' = age < 13 ? 'Kids' : 'Adulto';
    const hojeStr = new Date().toISOString().substring(0, 10);

    setLoading(true);

    try {
      await authService.registerStudent({
        nome: nome.trim(),
        cpf: cpf.trim(),
        dataNascimento,
        telefone: telefone.trim(),
        email: email.trim().toLowerCase(),
        genero,
        bairro,
        senha,
        status: 'Inativo',
        role: 'student',
        faixa,
        graus,
        turma: turmaCalculada,
        dataMatricula: hojeStr,
        dataUltimaGraduacao: hojeStr,
        contatoEmergenciaNome: contatoEmergenciaNome.trim(),
        contatoEmergenciaTel: contatoEmergenciaTel.trim()
      });

      setSuccessMsg('Cadastro realizado com sucesso! Sua conta foi enviada para validação de um professor ou administrador. Você poderá acessar o sistema assim que ela for ativada.');
      setTimeout(() => {
        onSuccess({ identifier: email.trim().toLowerCase(), password: senha });
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao realizar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 text-left">
      <div className="bg-obsidian-850 border border-obsidian-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-scale-up">
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-obsidian-750 shrink-0 bg-obsidian-850 z-10 rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-gold-500" />
            Cadastro de Novo Aluno
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-gold-550 p-1 transition-colors"
            type="button"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificações */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3.5 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            {/* Seção Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gold-450 uppercase tracking-widest border-b border-obsidian-750 pb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Informações Pessoais
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome e sobrenome"
                  className="input-premium"
                  disabled={loading}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    E-mail (para login) *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="input-premium"
                    disabled={loading}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    CPF *
                  </label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(formatCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    className="input-premium font-mono"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Data de Nascimento *
                  </label>
                  <input
                    type="date"
                    value={dataNascimento}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setDataNascimento(newDate);
                      if (newDate) {
                        const allowed = getBeltsByAge(newDate);
                        if (!allowed.includes(faixa)) {
                          setFaixa(allowed[0]);
                        }
                      }
                    }}
                    className="input-premium"
                    disabled={loading}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Telefone *
                  </label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(formatPhone(e.target.value))}
                    placeholder="(61) 99999-9999"
                    className="input-premium font-mono"
                    disabled={loading}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Gênero
                  </label>
                  <select
                    value={genero}
                    onChange={(e) => setGenero(e.target.value as Gender)}
                    className="input-premium bg-obsidian-950 text-slate-200"
                    disabled={loading}
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Bairro
                </label>
                <select
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  className="input-premium bg-obsidian-950 text-slate-200"
                  disabled={loading}
                >
                  <option value="">Selecione o bairro...</option>
                  {BAIRROS_DF.map((b: string) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Seção Faixa Atual & Graus */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold text-gold-450 uppercase tracking-widest border-b border-obsidian-750 pb-1.5 flex items-center gap-1.5">
                🥋 Graduação (Faixa Atual & Graus)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Faixa Atual *
                  </label>
                  <select
                    value={faixa}
                    onChange={(e) => setFaixa(e.target.value as Belt)}
                    className="input-premium bg-obsidian-950 text-slate-200"
                    disabled={loading}
                  >
                    {getBeltsByAge(dataNascimento).map((b: Belt) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Graus (0 a 4)
                  </label>
                  <select
                    value={graus}
                    onChange={(e) => setGraus(Number(e.target.value) as Degree)}
                    className="input-premium bg-obsidian-950 text-slate-200"
                    disabled={loading}
                  >
                    <option value={0}>0 Grau</option>
                    <option value={1}>1 Grau</option>
                    <option value={2}>2 Graus</option>
                    <option value={3}>3 Graus</option>
                    <option value={4}>4 Graus</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Seção Senha de Acesso */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold text-gold-450 uppercase tracking-widest border-b border-obsidian-750 pb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Senha de Acesso
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Crie sua Senha *
                  </label>
                  <div className="relative">
                    <input
                      type={showSenha ? 'text' : 'password'}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="input-premium pr-10"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSenha(!showSenha)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                    >
                      {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Confirme sua Senha *
                  </label>
                  <input
                    type={showSenha ? 'text' : 'password'}
                    value={confirmSenha}
                    onChange={(e) => setConfirmSenha(e.target.value)}
                    placeholder="Repita a senha"
                    className="input-premium"
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Seção Emergência (Menores de Idade) */}
            {dataNascimento && getBjjAge(dataNascimento) < 18 && (
              <div className="space-y-4 pt-2 animate-fade-in">
                <h3 className="text-xs font-bold text-red-450 uppercase tracking-widest border-b border-obsidian-750 pb-1.5 flex items-center gap-1.5">
                  🚨 Contato do Responsável (Menores de Idade)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                      Nome do Responsável *
                    </label>
                    <input
                      type="text"
                      value={contatoEmergenciaNome}
                      onChange={(e) => setContatoEmergenciaNome(e.target.value)}
                      placeholder="Nome do pai, mãe ou responsável"
                      className="input-premium"
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                      Telefone do Responsável *
                    </label>
                    <input
                      type="text"
                      value={contatoEmergenciaTel}
                      onChange={(e) => setContatoEmergenciaTel(formatPhone(e.target.value))}
                      placeholder="(61) 99999-9999"
                      className="input-premium font-mono"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer do Modal */}
          <div className="flex justify-end gap-3 p-6 border-t border-obsidian-750 shrink-0 bg-obsidian-850 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="btn-obsidian"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-gold px-6 flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Cadastrando...</span>
                </>
              ) : (
                <span>Concluir Cadastro</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentRegisterModal;
