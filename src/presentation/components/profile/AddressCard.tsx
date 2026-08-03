import React, { useState, useEffect } from 'react';
import { MapPin, Search, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { fetchAddressByCep } from '@/infrastructure/services/viaCepService';
import { maskCep } from '@/utils/maskUtils';
import { BAIRROS_DF } from '@/constants';

export interface AddressFormState {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
}

interface AddressCardProps {
  initialAddress?: Partial<AddressFormState>;
  onAddressChange?: (address: AddressFormState) => void;
  disabled?: boolean;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  initialAddress,
  onAddressChange,
  disabled = false
}) => {
  const [cep, setCep] = useState(initialAddress?.cep || '');
  const [logradouro, setLogradouro] = useState(initialAddress?.logradouro || '');
  const [numero, setNumero] = useState(initialAddress?.numero || '');
  const [complemento, setComplemento] = useState(initialAddress?.complemento || '');
  const [bairro, setBairro] = useState(initialAddress?.bairro || '');
  const [cidade, setCidade] = useState(initialAddress?.cidade || 'Brasília');
  const [uf, setUf] = useState(initialAddress?.uf || 'DF');

  const [loadingCep, setLoadingCep] = useState(false);
  const [cepSuccessMessage, setCepSuccessMessage] = useState<string | null>(null);
  const [cepErrorMessage, setCepErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialAddress) {
      if (initialAddress.cep !== undefined) setCep(initialAddress.cep);
      if (initialAddress.logradouro !== undefined) setLogradouro(initialAddress.logradouro);
      if (initialAddress.numero !== undefined) setNumero(initialAddress.numero);
      if (initialAddress.complemento !== undefined) setComplemento(initialAddress.complemento);
      if (initialAddress.bairro !== undefined) setBairro(initialAddress.bairro);
      if (initialAddress.cidade !== undefined) setCidade(initialAddress.cidade);
      if (initialAddress.uf !== undefined) setUf(initialAddress.uf);
    }
  }, [initialAddress]);

  const notifyChange = (updated: Partial<AddressFormState>) => {
    if (onAddressChange) {
      onAddressChange({
        cep: updated.cep ?? cep,
        logradouro: updated.logradouro ?? logradouro,
        numero: updated.numero ?? numero,
        complemento: updated.complemento ?? complemento,
        bairro: updated.bairro ?? bairro,
        cidade: updated.cidade ?? cidade,
        uf: updated.uf ?? uf
      });
    }
  };

  const handleCepLookup = async (cepValue: string) => {
    const masked = maskCep(cepValue);
    setCep(masked);
    setCepSuccessMessage(null);
    setCepErrorMessage(null);

    const clean = masked.replace(/\D/g, '');
    if (clean.length === 8) {
      setLoadingCep(true);
      try {
        const res = await fetchAddressByCep(clean);
        if (res && !res.erro) {
          const newLogradouro = res.logradouro || '';
          const newBairro = res.bairro || '';
          const newCidade = res.localidade || 'Brasília';
          const newUf = res.uf || 'DF';

          setLogradouro(newLogradouro);
          setBairro(newBairro);
          setCidade(newCidade);
          setUf(newUf);

          setCepSuccessMessage('Endereço encontrado e preenchido!');
          notifyChange({
            cep: masked,
            logradouro: newLogradouro,
            bairro: newBairro,
            cidade: newCidade,
            uf: newUf
          });
        } else {
          setCepErrorMessage('CEP não encontrado. Por favor, preencha o endereço manualmente.');
        }
      } catch {
        setCepErrorMessage('Erro ao consultar CEP.');
      } finally {
        setLoadingCep(false);
      }
    } else {
      notifyChange({ cep: masked });
    }
  };

  return (
    <div className="bg-obsidian-900/60 border border-obsidian-850 p-4 sm:p-6 rounded-2xl shadow-xl space-y-4 text-left w-full max-w-full min-w-0">
      
      {/* Título do Card */}
      <div className="flex items-center gap-2.5 border-b border-obsidian-850 pb-3">
        <MapPin className="w-5 h-5 text-gold-500 shrink-0" />
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-100">Endereço Residencial</h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Dados de localização para correspondência e contato.
          </p>
        </div>
      </div>

      {/* Grid de Inputs (1 Coluna Mobile, 2 Colunas Tablet, 3 Colunas Desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* CEP com Busca Automática */}
        <div className="flex flex-col gap-1.5 col-span-1">
          <label htmlFor="input-cep" className="text-xs text-slate-300 font-bold uppercase tracking-wider">
            CEP <span className="text-gold-500">*</span>
          </label>
          <div className="relative">
            <input
              id="input-cep"
              type="text"
              inputMode="numeric"
              value={cep}
              onChange={(e) => handleCepLookup(e.target.value)}
              placeholder="70000-000"
              className="input-premium w-full min-h-[48px] px-4 py-3 bg-obsidian-950 font-mono text-slate-100 placeholder-slate-600 rounded-xl border border-obsidian-800 focus:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/30"
              disabled={disabled || loadingCep}
              aria-label="CEP"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
              {loadingCep ? (
                <Loader2 className="w-5 h-5 animate-spin text-gold-500" />
              ) : (
                <Search className="w-4 h-4 text-slate-500" />
              )}
            </div>
          </div>
        </div>

        {/* Rua / Logradouro */}
        <div className="flex flex-col gap-1.5 col-span-1 sm:col-span-2">
          <label htmlFor="input-logradouro" className="text-xs text-slate-300 font-bold uppercase tracking-wider">
            Rua / Logradouro
          </label>
          <input
            id="input-logradouro"
            type="text"
            value={logradouro}
            onChange={(e) => {
              setLogradouro(e.target.value);
              notifyChange({ logradouro: e.target.value });
            }}
            placeholder="Ex: Quadra 3, Bloco B"
            className="input-premium w-full min-h-[48px] px-4 py-3 bg-obsidian-950 text-slate-100 placeholder-slate-600 rounded-xl border border-obsidian-800 focus:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/30"
            disabled={disabled}
          />
        </div>

        {/* Número */}
        <div className="flex flex-col gap-1.5 col-span-1">
          <label htmlFor="input-numero" className="text-xs text-slate-300 font-bold uppercase tracking-wider">
            Número
          </label>
          <input
            id="input-numero"
            type="text"
            value={numero}
            onChange={(e) => {
              setNumero(e.target.value);
              notifyChange({ numero: e.target.value });
            }}
            placeholder="Ex: 102"
            className="input-premium w-full min-h-[48px] px-4 py-3 bg-obsidian-950 text-slate-100 placeholder-slate-600 rounded-xl border border-obsidian-800 focus:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/30"
            disabled={disabled}
          />
        </div>

        {/* Complemento */}
        <div className="flex flex-col gap-1.5 col-span-1">
          <label htmlFor="input-complemento" className="text-xs text-slate-300 font-bold uppercase tracking-wider">
            Complemento
          </label>
          <input
            id="input-complemento"
            type="text"
            value={complemento}
            onChange={(e) => {
              setComplemento(e.target.value);
              notifyChange({ complemento: e.target.value });
            }}
            placeholder="Ex: Apto 304"
            className="input-premium w-full min-h-[48px] px-4 py-3 bg-obsidian-950 text-slate-100 placeholder-slate-600 rounded-xl border border-obsidian-800 focus:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/30"
            disabled={disabled}
          />
        </div>

        {/* Bairro */}
        <div className="flex flex-col gap-1.5 col-span-1">
          <label htmlFor="input-bairro" className="text-xs text-slate-300 font-bold uppercase tracking-wider">
            Bairro / Região
          </label>
          <div className="relative">
            {BAIRROS_DF.includes(bairro) ? (
              <select
                id="input-bairro"
                value={bairro}
                onChange={(e) => {
                  setBairro(e.target.value);
                  notifyChange({ bairro: e.target.value });
                }}
                className="input-premium w-full min-h-[48px] px-4 py-3 bg-obsidian-950 text-slate-100 rounded-xl border border-obsidian-800 focus:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/30 cursor-pointer"
                disabled={disabled}
              >
                <option value="" disabled>Selecione um bairro...</option>
                {BAIRROS_DF.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            ) : (
              <input
                id="input-bairro"
                type="text"
                value={bairro}
                onChange={(e) => {
                  setBairro(e.target.value);
                  notifyChange({ bairro: e.target.value });
                }}
                placeholder="Ex: Asa Sul, Taguatinga..."
                className="input-premium w-full min-h-[48px] px-4 py-3 bg-obsidian-950 text-slate-100 placeholder-slate-600 rounded-xl border border-obsidian-800 focus:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/30"
                disabled={disabled}
              />
            )}
          </div>
        </div>

        {/* Cidade */}
        <div className="flex flex-col gap-1.5 col-span-1">
          <label htmlFor="input-cidade" className="text-xs text-slate-300 font-bold uppercase tracking-wider">
            Cidade
          </label>
          <input
            id="input-cidade"
            type="text"
            value={cidade}
            onChange={(e) => {
              setCidade(e.target.value);
              notifyChange({ cidade: e.target.value });
            }}
            className="input-premium w-full min-h-[48px] px-4 py-3 bg-obsidian-950 text-slate-100 placeholder-slate-600 rounded-xl border border-obsidian-800 focus:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/30"
            disabled={disabled}
          />
        </div>

        {/* Estado */}
        <div className="flex flex-col gap-1.5 col-span-1">
          <label htmlFor="input-uf" className="text-xs text-slate-300 font-bold uppercase tracking-wider">
            UF / Estado
          </label>
          <input
            id="input-uf"
            type="text"
            maxLength={2}
            value={uf}
            onChange={(e) => {
              const val = e.target.value.toUpperCase();
              setUf(val);
              notifyChange({ uf: val });
            }}
            placeholder="DF"
            className="input-premium w-full min-h-[48px] px-4 py-3 bg-obsidian-950 font-mono text-slate-100 placeholder-slate-600 rounded-xl border border-obsidian-800 focus:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/30 uppercase"
            disabled={disabled}
          />
        </div>

      </div>

      {/* Feedbacks Visuais do CEP */}
      {cepSuccessMessage && (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{cepSuccessMessage}</span>
        </div>
      )}

      {cepErrorMessage && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{cepErrorMessage}</span>
        </div>
      )}

    </div>
  );
};

export default AddressCard;
