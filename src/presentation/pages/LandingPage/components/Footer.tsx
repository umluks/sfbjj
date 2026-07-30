import React from 'react';
import type { Aviso } from '@/domain/models/announcement';
import { PWAInstallSection } from '@/presentation/components/shared/PWAInstallSection';

interface FooterProps {
  logoSFBJJ: string;
  logoLucas: string;
  announcements: Aviso[];
  setShowGraduationModal: (show: boolean) => void;
  onAccessLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  logoSFBJJ,
  logoLucas,
  announcements,
  setShowGraduationModal,
  onAccessLogin
}) => {
  return (
    <footer className="bg-obsidian-950 border-t border-obsidian-900">
      {/* Seção de Destaque da Instalação do PWA */}
      <PWAInstallSection />

      <div className="py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Descrição Institucional */}
        <div className="space-y-4">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 group text-left focus:outline-none"
          >
            <img
              src={logoSFBJJ}
              alt="Logo SFBJJ"
              className="w-12 h-12 rounded-full border border-obsidian-800 object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              width={48}
              height={48}
            />
            <span className="font-black text-sm tracking-wider text-slate-100 uppercase leading-none">
              Sagrada Família <span className="text-zinc-400">BJJ</span>
            </span>
          </button>
          <p className="text-xs text-slate-450 max-w-sm leading-relaxed font-medium">
            Dojo tradicional focado no desenvolvimento marcial de excelência técnica, mentalidade de alta performance e princípios espirituais e morais.
          </p>
        </div>

        {/* Links Rápidos */}
        <div>
          <h5 className="font-black text-xs text-slate-200 uppercase tracking-widest mb-5">
            Navegação
          </h5>
          <ul className="space-y-3 text-xs text-slate-450 font-bold uppercase tracking-wider">
            {announcements && announcements.length > 0 && (
              <li>
                <a href="#avisos" className="hover:text-slate-200 transition-colors">Avisos</a>
              </li>
            )}
            <li>
              <a href="#valores" className="hover:text-slate-200 transition-colors">Nossos Pilares</a>
            </li>
            <li>
              <a href="#regras" className="hover:text-slate-200 transition-colors">Regras do Tatame</a>
            </li>
            <li>
              <button
                onClick={() => setShowGraduationModal(true)}
                className="hover:text-slate-200 transition-colors text-left uppercase font-bold"
              >
                Regras IBJJF
              </button>
            </li>
            <li>
              <a href="#horarios" className="hover:text-slate-200 transition-colors">Horários</a>
            </li>
            <li>
              <a href="#contato" className="hover:text-slate-200 transition-colors">Contato</a>
            </li>
            <li>
              <button
                onClick={onAccessLogin}
                className="hover:text-slate-200 transition-colors text-left font-bold"
              >
                Acessar Portal
              </button>
            </li>
          </ul>
        </div>

        {/* Assinatura / Desenvolvimento */}
        <div>
          <h5 className="font-black text-xs text-slate-200 uppercase tracking-widest mb-5">
            Plataforma
          </h5>
          <div className="flex items-start gap-3.5 bg-obsidian-900/35 border border-obsidian-850 p-4">
            <img
              src={logoLucas}
              alt="Logo Lucas dos Anjos"
              className="w-10 h-10 rounded-full border border-obsidian-800 object-cover mt-0.5"
              loading="lazy"
              width={40}
              height={40}
            />
            <div className="space-y-2">
              <p className="text-xs text-slate-450 leading-relaxed font-semibold">
                Exclusivo para membros e gestão interna da Sagrada Família BJJ. Desenvolvido por Lucas dos Anjos.
              </p>
              <p className="text-[10px] text-slate-500 font-mono tracking-wider">
                VERSÃO {import.meta.env.VITE_APP_VERSION || '1.0.0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Créditos no rodapé final */}
      <div className="max-w-7xl mx-auto border-t border-obsidian-900/60 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-550 tracking-wider font-bold uppercase">
        <span>
          © 2026 Sagrada Família BJJ. Todos os direitos reservados.
        </span>
        <span className="tracking-widest">
          Brasília, DF • Orgulho e Tradição • #myfaithismyshield
        </span>
      </div>
      </div>
    </footer>
  );
};
export default Footer;
