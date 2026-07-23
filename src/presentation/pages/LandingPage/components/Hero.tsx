import React, { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

interface HeroProps {
  onAccessLogin: () => void;
  loggedUser: any;
  logoSFBJJ: string;
}

const HERO_PHRASES = [
  {
    line1: "Fé que fortalece a alma.",
    line2: "Disciplina que molda o caráter."
  },
  {
    line1: "Respeito dentro do tatame.",
    line2: "Honra em cada jornada."
  },
  {
    line1: "A força da arte suave.",
    line2: "A constante evolução do espírito."
  },
  {
    line1: "Unidos na mesma fé.",
    line2: "Fortalecidos no mesmo propósito."
  },
  {
    line1: "My shield is my faith.",
    line2: "Minha disciplina é o meu legado."
  },
  {
    line1: "Força, união e Jiu-Jitsu.",
    line2: "Excelência técnica em cada treino."
  }
];

export const Hero: React.FC<HeroProps> = ({ onAccessLogin, loggedUser, logoSFBJJ }) => {
  // Seleciona uma frase aleatoriamente a cada carregamento/atualização da página
  const [phraseIndex, setPhraseIndex] = useState(() => Math.floor(Math.random() * HERO_PHRASES.length));

  const handleNextPhrase = () => {
    setPhraseIndex((prev) => (prev + 1) % HERO_PHRASES.length);
  };

  const currentPhrase = HERO_PHRASES[phraseIndex];

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-36 px-4 overflow-hidden">
      {/* Background Glows e Efeitos Visuais */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-slate-800/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-zinc-700/5 blur-[100px] pointer-events-none" />
      
      {/* Grid Pattern sutil no background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
        
        {/* Logo em destaque com animação de flutuação e glow */}
        <div className="mb-8 relative animate-float">
          <div className="absolute inset-0 rounded-full bg-zinc-200/5 blur-2xl scale-125" />
          <div className="relative p-1 bg-gradient-to-b from-zinc-200/20 to-transparent rounded-full shadow-2xl">
            <img
              src={logoSFBJJ}
              alt="Logo Central SFBJJ"
              className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border-2 border-obsidian-800"
              loading="eager"
              width={144}
              height={144}
            />
          </div>
        </div>

        {/* Badge da Academia + Alternador de Frase */}
        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-obsidian-900/80 border border-obsidian-800/80 rounded-none text-slate-350 text-[10px] font-black uppercase tracking-widest shadow-xl backdrop-blur-sm mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-zinc-400 animate-pulse" />
            Sagrada Família BJJ • Asa Sul
          </div>
          <span className="text-obsidian-750">|</span>
          <button
            onClick={handleNextPhrase}
            title="Alternar frase motivacional"
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3 hover:rotate-180 transition-transform duration-500" />
            <span className="text-[9px] lowercase font-normal opacity-75 hover:opacity-100">alternar</span>
          </button>
        </div>

        {/* Headline com frases dinâmicas rigorosamente em duas linhas */}
        <h1 className="text-[3.6vw] sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight uppercase max-w-6xl flex flex-col items-center justify-center text-center mx-auto w-full min-h-[2.4em] px-2">
          <span className="block whitespace-nowrap text-center transition-opacity duration-300">
            {currentPhrase.line1}
          </span>
          <span className="block whitespace-nowrap mt-2 sm:mt-3 transition-opacity duration-300">
            {currentPhrase.line2}
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="text-xs sm:text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed mt-6">
          Nossa missão é formar faixas pretas dentro e fora do tatame. Respeito, lealdade, excelência técnica e disciplina espiritual como pilares da nossa jornada marcial.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 w-full sm:w-auto">
          <button
            onClick={onAccessLogin}
            className="w-full sm:w-auto btn-gold px-10 py-4 font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-[0.98] transition-all duration-300"
          >
            {loggedUser ? 'Acessar Painel' : 'Área do Aluno'}
          </button>
          <a
            href="#horarios"
            className="w-full sm:w-auto btn-obsidian px-10 py-4 font-black text-xs uppercase tracking-widest border border-obsidian-800 hover:border-obsidian-750 transition-all duration-300 text-center hover:bg-obsidian-850"
          >
            Grade de Aulas
          </a>
        </div>
      </div>
    </section>
  );
};
export default Hero;

