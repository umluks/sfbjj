import React from 'react';
import { Shield, Clock, Heart, Activity } from 'lucide-react';

export const TatameRules: React.FC = () => {
  const rules = [
    {
      icon: <Shield className="w-5 h-5 text-slate-350 group-hover:text-white transition-colors" />,
      title: 'Higiene e Uniforme',
      desc: 'Kimono e rashguard sempre limpos e secos. Mantenha as unhas cortadas e remova qualquer adorno metálico (anéis, brincos) antes de subir no tatame para a segurança de todos.'
    },
    {
      icon: <Clock className="w-5 h-5 text-slate-350 group-hover:text-white transition-colors" />,
      title: 'Pontualidade',
      desc: 'Chegue pelo menos 10 minutos antes do início do treino. Caso se atrase, peça permissão ao professor na borda do tatame antes de entrar para a aula.'
    },
    {
      icon: <Heart className="w-5 h-5 text-slate-350 group-hover:text-white transition-colors" />,
      title: 'Respeito e Irmandade',
      desc: 'Cumprimente o dojo ao entrar e sair. Apoie a evolução dos seus colegas mais novos e respeite a autoridade dos faixas mais graduadas e instrutores.'
    },
    {
      icon: <Activity className="w-5 h-5 text-slate-350 group-hover:text-white transition-colors" />,
      title: 'Segurança e Controle',
      desc: 'Treine com intensidade controlada. O objetivo é a evolução mútua. Ao sentir qualquer desconforto ou encaixe de finalização, dê os tapinhas (bata) imediatamente.'
    }
  ];

  return (
    <section id="regras" className="py-24 px-4 max-w-7xl mx-auto scroll-mt-20 relative">
      {/* Glow no canto inferior direito */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-slate-800/5 blur-[120px] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center relative z-10">
        
        {/* Lado Esquerdo - Chamada institucional */}
        <div className="space-y-5">
          <div className="inline-block text-[9px] font-black uppercase tracking-widest text-slate-500 border border-obsidian-800 px-3 py-1 bg-obsidian-950/40">
            Código de Conduta
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-100 uppercase tracking-tight leading-tight">
            Etiqueta e Regras<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-500 font-black">
              Do Nosso Tatame
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
            O Jiu-Jitsu começa e termina no respeito mútuo. Nossas regras de conduta garantem um ambiente limpo, seguro e focado na evolução marcial, pessoal e espiritual de cada atleta.
          </p>
        </div>

        {/* Lado Direito - Grade de Regras */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {rules.map((rule, idx) => (
            <div
              key={idx}
              className="group card-premium p-6 space-y-4 border border-obsidian-850 hover:border-zinc-500/20 hover:shadow-gold-glow transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-none bg-obsidian-950/80 flex items-center justify-center border border-obsidian-800 group-hover:border-zinc-500/30 transition-all duration-300 shadow-md">
                {rule.icon}
              </div>
              <h3 className="font-black text-slate-200 text-xs uppercase tracking-wider group-hover:text-white transition-colors">
                {rule.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                {rule.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default TatameRules;
