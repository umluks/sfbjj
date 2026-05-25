import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

export const Contact: React.FC = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [assunto, setAssunto] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !mensagem) return;

    // Simulate sending email
    setEnviado(true);
    
    // Construct mailto link to open email client
    const mailtoUrl = `mailto:lucas.sga@gmaill.com?subject=${encodeURIComponent(assunto || 'Mensagem do Portal SFBJJ')}&body=${encodeURIComponent(
      `Nome: ${nome}\nEmail: ${email}\n\nMensagem:\n${mensagem}`
    )}`;
    
    // Delay opening mailto to show success state first
    setTimeout(() => {
      window.location.href = mailtoUrl;
    }, 1000);

    setTimeout(() => {
      setEnviado(false);
      setNome('');
      setEmail('');
      setAssunto('');
      setMensagem('');
    }, 5000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
          <span>✉️</span> Contato e Localização
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Fale conosco, envie dúvidas ou visite nossa academia Sagrada Família BJJ.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact info & Form (Left/Center) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-premium">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-obsidian-750 pb-3 mb-4">
              <Mail className="w-5 h-5 text-gold-500" />
              Enviar uma Mensagem
            </h2>

            {enviado && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-400 text-sm animate-fade-in">
                Mensagem preparada! Abrindo seu cliente de e-mail para enviar para lucas.sga@gmaill.com...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Nome Completo</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome"
                    className="input-premium w-full"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Seu e-mail"
                    className="input-premium w-full"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Assunto</label>
                <input
                  type="text"
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                  placeholder="Assunto da mensagem"
                  className="input-premium w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Mensagem</label>
                <textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Escreva sua mensagem aqui..."
                  className="input-premium w-full h-36 resize-none"
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="btn-gold px-6 py-2.5 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Enviar E-mail
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar Info & Support (Right) */}
        <div className="space-y-6">
          {/* Suporte WhatsApp */}
          <div className="card-premium bg-gradient-to-br from-obsidian-800 to-obsidian-850 border-l-4 border-l-emerald-500">
            <h2 className="text-md font-bold text-slate-100 flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              Suporte via WhatsApp
            </h2>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Precisa de ajuda imediata ou prefere conversar pelo WhatsApp? Entre em contato agora mesmo!
            </p>
            <a
              href="https://wa.me/5561981580353?text=Ol%C3%A1%2C%20gostaria%20de%20obter%20mais%20informa%C3%A7%C3%B5es%20sobre%20a%20Sagrada%20Fam%C3%ADlia%20BJJ"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-650 hover:bg-emerald-600 border border-emerald-500/25 text-white font-bold py-2.5 px-4 rounded-lg transition-all text-xs flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
            >
              <Phone className="w-4 h-4" />
              Para mais informações
            </a>
          </div>

          {/* Endereço */}
          <div className="card-premium">
            <h2 className="text-md font-bold text-slate-100 flex items-center gap-2 border-b border-obsidian-750 pb-3 mb-3">
              <MapPin className="w-4 h-4 text-gold-500" />
              Nosso Endereço
            </h2>
            <p className="text-xs text-slate-300 font-semibold">
              Sagrada Família Brasília Jiu-Jitsu
            </p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Paróquia Sagrado Coração de Jesus e Nossa Senhora das Mercês, Asa Sul, Brasília - DF.
            </p>
          </div>
        </div>
      </div>

      {/* Google Maps Location */}
      <div className="card-premium p-4">
        <h2 className="text-md font-bold text-slate-100 flex items-center gap-2 border-b border-obsidian-750 pb-3 mb-4">
          <MapPin className="w-4 h-4 text-gold-500" />
          Mapa de Localização
        </h2>
        <div className="rounded-xl overflow-hidden border border-obsidian-750">
          <iframe 
            src="https://google.com" 
            width="100%" 
            height="450" 
            style={{ border: 0 }} 
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
};
