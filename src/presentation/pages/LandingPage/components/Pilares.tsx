import React from 'react';
import { Flame, Award, Users, ShieldAlert } from 'lucide-react';

export const Pilares: React.FC = () => {
  const items = [
    {
      icon: <Flame className="w-6 h-6 text-slate-300" />,
      title: 'Fé e Tradição',
      desc: 'Nossos treinos integram força mental, resiliência espiritual e disciplina física, honrando as origens e a filosofia tradicional do Jiu-Jitsu.'
    },
    {
      icon: <Award className="w-6 h-6 text-slate-300" />,
      title: 'Excelência Técnica',
      desc: 'Instrução de alta qualidade com foco nos detalhes de defesa pessoal, jiu-jitsu esportivo e refino técnico contínuo para todos os níveis.'
    },
    {
      icon: <Users className="w-6 h-6 text-slate-300" />,
      title: 'Ambiente Familiar',
      desc: 'Acolhemos homens, mulheres e crianças em uma comunidade focada no respeito mútuo, apoio coletivo e amizade duradoura.'
    },
    {
      icon: <ShieldAlert className="w-6 h-6 text-slate-300" />,
      title: 'Segurança Total',
      desc: 'Metodologia de ensino que prioriza a integridade física dos alunos através de treinos supervisionados e regras de conduta rígidas.'
    }
  ];

  return (
    <section id="valores" className="py-24 px-4 max-w-7xl mx-auto scroll-mt-20 relative">
      <div className="absolute top-[10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-slate-800/5 blur-[120px] pointer-events-none" />
      
      <div className="space-y-16 relative z-10">
        
        {/* Cabeçalho */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-block text-[9px] font-black uppercase tracking-widest text-slate-500 border border-obsidian-800 px-3 py-1 bg-obsidian-950/40">
            Nossos Valores
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-100 uppercase tracking-wider">
            Os Pilares da SFBJJ
          </h2>
          <p className="text-xs text-slate-400">
            Muito mais do que técnicas de luta, formamos cidadãos exemplares fundamentados no caráter, disciplina e respeito.
          </p>
        </div>

        {/* Grade de 4 Colunas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((pilar, idx) => (
            <div
              key={idx}
              className="group p-6 bg-obsidian-900/30 border border-obsidian-850 hover:border-zinc-500/20 hover:shadow-gold-glow transition-all duration-300 flex flex-col items-center text-center justify-between gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-obsidian-900 border border-obsidian-800 flex items-center justify-center shadow-inner group-hover:border-zinc-500/35 transition-all duration-300">
                {pilar.icon}
              </div>
              <h3 className="font-black text-slate-200 text-xs uppercase tracking-wider group-hover:text-white transition-colors">
                {pilar.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                {pilar.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Pilares;
