import React, { useState, useEffect } from 'react';
import { MapPin, Info, Edit3, Check, X, Navigation, Eye, HelpCircle } from 'lucide-react';
import { locationService } from '@/application/services/locationService';
import type { Localizacao } from '@/application/services/locationService';

interface LocationManagerProps {
  isAdmin: boolean;
}

export const LocationManager: React.FC<LocationManagerProps> = ({ isAdmin }) => {
  const [location, setLocation] = useState<Localizacao>(locationService.getLocation());
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Campos locais do formulário
  const [nome, setNome] = useState(location.nome);
  const [endereco, setEndereco] = useState(location.endereco);
  const [detalhes, setDetalhes] = useState(location.detalhes);
  const [cep, setCep] = useState(location.cep);
  const [iframeUrl, setIframeUrl] = useState(location.iframeUrl);
  const [mapsUrl, setMapsUrl] = useState(location.mapsUrl);
  const [descricao, setDescricao] = useState(location.descricao);

  useEffect(() => {
    // Sincroniza se houver atualização externa
    const handleUpdate = () => {
      const current = locationService.getLocation();
      setLocation(current);
      if (!isEditing) {
        setNome(current.nome);
        setEndereco(current.endereco);
        setDetalhes(current.detalhes);
        setCep(current.cep);
        setIframeUrl(current.iframeUrl);
        setMapsUrl(current.mapsUrl);
        setDescricao(current.descricao);
      }
    };
    window.addEventListener('sfbjj_location_changed', handleUpdate);
    return () => window.removeEventListener('sfbjj_location_changed', handleUpdate);
  }, [isEditing]);

  const handleStartEdit = () => {
    setNome(location.nome);
    setEndereco(location.endereco);
    setDetalhes(location.detalhes);
    setCep(location.cep);
    setIframeUrl(location.iframeUrl);
    setMapsUrl(location.mapsUrl);
    setDescricao(location.descricao);
    setError(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações básicas
    if (!nome.trim() || !endereco.trim() || !detalhes.trim() || !iframeUrl.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Extrair URL do iframe se o admin colar a tag <iframe> inteira
    let finalIframeUrl = iframeUrl.trim();
    if (finalIframeUrl.includes('<iframe')) {
      const match = finalIframeUrl.match(/src="([^"]+)"/);
      if (match && match[1]) {
        finalIframeUrl = match[1];
      } else {
        setError('Tag iframe inválida. Por favor, cole apenas o link src ou a tag <iframe> válida.');
        return;
      }
    }

    const payload: Localizacao = {
      nome: nome.trim(),
      endereco: endereco.trim(),
      detalhes: detalhes.trim(),
      cep: cep.trim(),
      iframeUrl: finalIframeUrl,
      mapsUrl: mapsUrl.trim() || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nome.trim() + ' ' + endereco.trim())}`,
      descricao: descricao.trim()
    };

    try {
      locationService.saveLocation(payload);
      setLocation(payload);
      setIsEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar a localização.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header local */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-obsidian-850 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
            <span className="p-2 bg-gold-500/10 rounded-xl text-gold-500">
              <MapPin className="w-5 h-5" />
            </span>
            Localização da Academia
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {isEditing ? 'Atualize as informações de endereço e o mapa do dojo.' : 'Consulte o endereço oficial e visualize o mapa do nosso tatame.'}
          </p>
        </div>

        {isAdmin && !isEditing && (
          <button
            onClick={handleStartEdit}
            className="btn-gold flex items-center gap-2 py-2.5 px-4 shadow-lg shadow-gold-500/10 active:scale-[0.98] transition-transform"
          >
            <Edit3 className="w-4 h-4" />
            Editar Localização
          </button>
        )}
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/25 rounded-2xl text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Localização salva e sincronizada com sucesso!</span>
        </div>
      )}

      {isEditing ? (
        /* FORMULÁRIO DE EDIÇÃO */
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 card-premium space-y-5 p-6 border border-obsidian-800">
            <h3 className="text-md font-bold text-slate-200 border-b border-obsidian-850 pb-2 mb-4 flex items-center gap-2">
              📝 Dados do Endereço
            </h3>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-xs font-medium animate-shake">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Nome do Local *</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Sagrada Família Brasília Jiu-Jitsu"
                className="input-premium w-full bg-obsidian-950"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Endereço Principal *</label>
                <input
                  type="text"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Ex: SGAS 615, Conjunto D, Lotes 33/34"
                  className="input-premium w-full bg-obsidian-950"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">CEP</label>
                <input
                  type="text"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  placeholder="Ex: 70200-750"
                  className="input-premium w-full bg-obsidian-950"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Complemento / Cidade / Estado *</label>
              <input
                type="text"
                value={detalhes}
                onChange={(e) => setDetalhes(e.target.value)}
                placeholder="Ex: Paróquia Sagrado Coração de Jesus e Nossa Senhora das Mercês, Asa Sul, Brasília - DF"
                className="input-premium w-full bg-obsidian-950"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Descrição / Como Chegar</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: O dojo fica no subsolo da igreja..."
                className="input-premium w-full h-24 resize-none bg-obsidian-950"
              />
            </div>
          </div>

          <div className="space-y-6">
            {/* CONFIGURAÇÕES DE MAPA */}
            <div className="card-premium p-6 border border-obsidian-800 space-y-4">
              <h3 className="text-md font-bold text-slate-200 border-b border-obsidian-850 pb-2 flex items-center gap-2">
                🗺️ Mapa e Rotas
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  URL de Embed Google Maps *
                  <span className="group relative cursor-pointer text-slate-500 hover:text-slate-350">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-obsidian-900 border border-obsidian-800 text-[10px] text-slate-300 rounded shadow-xl hidden group-hover:block z-10 font-normal leading-normal">
                      No Google Maps, clique em Compartilhar &gt; Incorporar um mapa e copie o link da URL do src ou a tag iframe inteira.
                    </span>
                  </span>
                </label>
                <input
                  type="text"
                  value={iframeUrl}
                  onChange={(e) => setIframeUrl(e.target.value)}
                  placeholder="https://www.google.com/maps/embed?..."
                  className="input-premium w-full bg-obsidian-950 text-xs font-mono"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Link para Traçar Rota (Google/Waze)</label>
                <input
                  type="text"
                  value={mapsUrl}
                  onChange={(e) => setMapsUrl(e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                  className="input-premium w-full bg-obsidian-950 text-xs font-mono"
                />
              </div>

              <div className="pt-4 flex gap-2 border-t border-obsidian-850">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 btn-obsidian py-2.5 text-xs flex items-center justify-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-gold py-2.5 text-xs flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Salvar
                </button>
              </div>
            </div>

            {/* PREVISÃO DO MAPA */}
            <div className="card-premium p-4 border border-obsidian-800 text-center">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-center gap-1">
                <Eye className="w-3.5 h-3.5" /> Prévia do Mapa
              </h4>
              <div className="rounded-xl overflow-hidden border border-obsidian-850 h-44 bg-obsidian-950 flex items-center justify-center">
                {iframeUrl.trim() ? (
                  <iframe
                    src={iframeUrl.includes('<iframe') ? iframeUrl.match(/src="([^"]+)"/)?.[1] || '' : iframeUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                  ></iframe>
                ) : (
                  <span className="text-slate-600 text-xs font-medium">Insira a URL do mapa para visualizar</span>
                )}
              </div>
            </div>
          </div>
        </form>
      ) : (
        /* MODO VISUALIZAÇÃO PREMIUM */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações à esquerda */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card-premium p-6 border border-obsidian-800 bg-gradient-to-br from-obsidian-900/60 to-obsidian-950/20 backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gold-500/5 rounded-full blur-2xl group-hover:bg-gold-500/10 transition-all duration-300" />
              
              <h3 className="text-md font-bold text-slate-100 tracking-tight flex items-center gap-2 border-b border-obsidian-850 pb-3 mb-4">
                <Info className="w-4 h-4 text-gold-500" />
                Dados do Dojo
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Nome</h4>
                  <p className="text-sm font-black text-slate-200 mt-1 leading-tight">
                    {location.nome}
                  </p>
                </div>

                <div>
                  <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Endereço Principal</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {location.endereco}
                  </p>
                </div>

                <div>
                  <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Detalhes</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {location.detalhes}
                  </p>
                </div>

                {location.cep && (
                  <div>
                    <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">CEP</h4>
                    <p className="text-xs font-mono text-slate-400 mt-1">
                      {location.cep}
                    </p>
                  </div>
                )}

                {location.descricao && (
                  <div className="pt-2 border-t border-obsidian-850/60">
                    <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Sobre o Local</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      {location.descricao}
                    </p>
                  </div>
                )}

                {location.mapsUrl && (
                  <div className="pt-4">
                    <a
                      href={location.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gold-550/10 hover:bg-gold-550/20 border border-gold-500/20 hover:border-gold-500/40 text-gold-500 font-bold py-2.5 px-4 rounded-xl transition-all text-xs flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
                    >
                      <Navigation className="w-4 h-4 shrink-0" />
                      Como Chegar (Google Maps)
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mapa interativo à direita */}
          <div className="lg:col-span-2">
            <div className="card-premium p-4 border border-obsidian-800 h-[480px] flex flex-col justify-between">
              <div className="flex items-center gap-2 border-b border-obsidian-850 pb-3 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-gold-500 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mapa Interativo</span>
              </div>
              <div className="flex-1 rounded-xl overflow-hidden border border-obsidian-850 relative shadow-2xl bg-obsidian-950">
                <iframe
                  src={location.iframeUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localização do Tatame SFBJJ"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationManager;
