import React from 'react';
import { Menu, X, Award } from 'lucide-react';
import type { Aviso } from '@/domain/models/announcement';

interface HeaderProps {
  announcements: Aviso[];
  showInstallButton: boolean;
  handleInstallClick: () => void;
  onAccessLogin: () => void;
  loggedUser: any;
  setShowGraduationModal: (show: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  logoSFBJJ: string;
}

export const Header: React.FC<HeaderProps> = ({
  announcements,
  showInstallButton,
  handleInstallClick,
  onAccessLogin,
  loggedUser,
  setShowGraduationModal,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  logoSFBJJ
}) => {
  return (
    <>
      <header className={`fixed w-full ${loggedUser ? 'top-9' : 'top-0'} z-50 bg-obsidian-950/70 backdrop-blur-md border-b border-obsidian-800/40 transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 group"
          >
            <div className="relative p-[1px] bg-gradient-to-br from-zinc-200/30 to-transparent rounded-full transition-transform duration-300 group-hover:scale-105">
              <img
                src={logoSFBJJ}
                alt="Logo SFBJJ"
                className="w-12 h-12 rounded-full border border-obsidian-800 object-cover"
                loading="eager"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-wider text-slate-100 uppercase transition-colors duration-300 group-hover:text-white leading-none">
                Sagrada Família <span className="text-zinc-400 font-black">BJJ</span>
              </span>
              <span className="text-[7.5px] text-slate-500 font-bold uppercase tracking-widest mt-1">Brasília • Asa Sul</span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {announcements && announcements.length > 0 && (
              <a href="#avisos" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-100 transition-colors">Avisos</a>
            )}
            <a href="#valores" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-100 transition-colors">Nossos Pilares</a>
            <a href="#regras" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-100 transition-colors">Regras</a>
            <button
              onClick={() => setShowGraduationModal(true)}
              className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-100 transition-colors flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5" />
              Regras IBJJF
            </button>
            <a href="#horarios" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-100 transition-colors">Horários</a>
            <a href="#contato" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-100 transition-colors">Contato</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {showInstallButton && (
              <button
                onClick={handleInstallClick}
                className="btn-obsidian text-[10px] font-black uppercase tracking-wider px-5 py-2.5 flex items-center gap-2 border border-obsidian-850 hover:border-obsidian-750 transition-all duration-300"
              >
                Instalar App
              </button>
            )}
            <button
              onClick={onAccessLogin}
              className="btn-gold text-[10px] font-black uppercase tracking-wider px-5 py-2.5 hover:shadow-gold-glow transition-all duration-300"
            >
              {loggedUser ? `Painel (${loggedUser.nome.split(' ')[0]})` : 'Entrar no Portal'}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-slate-100 transition-colors"
            aria-label="Menu Principal"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-obsidian-950 flex flex-col p-6 animate-fade-in">
          <div className="flex items-center justify-between pb-6 border-b border-obsidian-900">
            <span className="font-black text-sm tracking-wider uppercase text-slate-100">
              Menu Navegação
            </span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-100 transition-colors"
              aria-label="Fechar Menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex-1 flex flex-col justify-center items-center gap-6 py-12">
            {announcements && announcements.length > 0 && (
              <a href="#avisos" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors">Avisos</a>
            )}
            <a href="#valores" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors">Nossos Pilares</a>
            <a href="#regras" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors">Regras do Tatame</a>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setShowGraduationModal(true);
              }}
              className="text-base font-bold uppercase tracking-wider text-slate-300 hover:text-white flex items-center gap-2 transition-colors"
            >
              <Award className="w-5 h-5" /> Regras IBJJF
            </button>
            <a href="#horarios" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors">Grade de Treinos</a>
            <a href="#contato" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors">Fale Conosco</a>
          </nav>
          <div className="space-y-3 pt-6 border-t border-obsidian-900">
            {showInstallButton && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleInstallClick();
                }}
                className="w-full btn-obsidian py-3.5 font-bold uppercase text-xs text-center border border-obsidian-800 hover:border-obsidian-750 transition-all duration-300"
              >
                Instalar Aplicativo (PWA)
              </button>
            )}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onAccessLogin();
              }}
              className="w-full btn-gold py-3.5 font-bold uppercase text-xs text-center hover:shadow-gold-glow transition-all duration-300"
            >
              {loggedUser ? `Acessar Painel (${loggedUser.nome.split(' ')[0]})` : 'Acessar Painel / Login'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
export default Header;
