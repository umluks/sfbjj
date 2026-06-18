import React, { useState } from 'react';
import {
  MapPin,
  Megaphone,
  X
} from 'lucide-react';
import logoSFBJJ from '../assets/logo-sfbjj.jpg';
import bjjKidsClass from '../assets/bjj_kids_class.png';
import bjjAdultsSparring from '../assets/bjj_adults_sparring.png';
import bjjTeamGroup from '../assets/bjj_team_group.png';
import type { Aviso } from '../types';
import { Contact } from './Contact';
import { GraduationSystem } from './GraduationSystem';

interface LandingPageProps {
  announcements?: Aviso[];
  onAccessLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ announcements = [], onAccessLogin }) => {
  const [showGraduationModal, setShowGraduationModal] = useState(false);

  // Horários customizados para exibição
  const quickSchedule = [
    { hora: '18:30 - 19:30', categoria: 'Infantil', dias: 'Segunda & Quarta', professor: 'Lucas dos Anjos' },
    { hora: '19:30 - 21:00', categoria: 'Adulto', dias: 'Segunda & Quarta', professor: 'Lucas dos Anjos' },
    { hora: '19:00 - 21:00', categoria: 'Open Match', dias: 'Sexta-feira', professor: 'Lucas dos Anjos' },
  ];

  return (
    <div className="bg-obsidian-950 text-slate-100 min-h-screen font-sans selection:bg-slate-200/25 selection:text-white overflow-x-hidden">

      {/* HEADER / NAVIGATION */}
      <header className="fixed w-full top-0 z-50 bg-obsidian-950/65 backdrop-blur-2xl border-b border-obsidian-850/45 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative p-[1px] bg-gradient-to-br from-gold-500/30 to-transparent rounded-full">
              <img
                src={logoSFBJJ}
                alt="Sagrada Família BJJ"
                className="w-11 h-11 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div>
              <span className="font-extrabold tracking-wider text-base uppercase text-slate-100 block leading-none">
                Sagrada Família <span className="text-gold-500 font-black">BJJ</span>
              </span>
              <span className="text-[9px] tracking-widest text-slate-450 uppercase font-semibold mt-1 block">
                Brasília - DF
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {announcements && announcements.length > 0 && (
              <a href="#avisos" className="hover:text-slate-100 transition-colors duration-300">Avisos</a>
            )}
            <a href="#horarios" className="hover:text-slate-100 transition-colors duration-300">Horários & Localização</a>
            <button
              onClick={() => setShowGraduationModal(true)}
              className="hover:text-slate-100 transition-colors duration-300 uppercase"
            >
              Graduação IBJJF
            </button>
            <a href="#contato" className="hover:text-slate-100 transition-colors duration-300">Contato</a>
            <button
              onClick={onAccessLogin}
              className="btn-gold text-[10px] tracking-widest uppercase font-black px-4 py-2"
            >
              Entrar
            </button>
          </nav>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative min-h-[95vh] flex items-center justify-center pt-24 pb-20 px-4 overflow-hidden border-b border-obsidian-850/60">
        {/* Background stylized tatame and glow */}
        <div className="absolute inset-0 z-0 bg-radial-gradient">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gold-500/5 blur-[160px] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian-950/10 via-obsidian-950/70 to-obsidian-950 pointer-events-none" />
        </div>

        {/* Outer subtle Flor de Lis silhouette */}
        <div className="absolute right-[-5%] top-[10%] opacity-[0.015] text-slate-200 pointer-events-none select-none">
          <svg width="600" height="600" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 0 C48 15, 35 25, 35 45 C35 60, 50 65, 50 80 C50 65, 65 60, 65 45 C65 25, 52 15, 50 0 Z" />
            <path d="M20 50 C30 50, 40 45, 45 40 C35 35, 25 38, 20 50 Z" />
            <path d="M80 50 C70 50, 60 45, 55 40 C65 35, 75 38, 80 50 Z" />
            <path d="M30 65 C40 68, 50 68, 70 65 C60 75, 40 75, 30 65 Z" />
          </svg>
        </div>

        <div className="max-w-5xl mx-auto z-10 text-center flex flex-col items-center">
          {/* Logo element center */}
          <div className="relative mb-10 animate-float">
            <div className="absolute -inset-2 bg-gradient-to-r from-gold-500/20 to-gold-500/5 rounded-full blur-xl opacity-40" />
            <div className="relative p-1.5 bg-obsidian-900 border border-obsidian-850/80 rounded-full shadow-2xl">
              <img
                src={logoSFBJJ}
                alt="Logo Sagrada Família BJJ"
                className="w-24 h-24 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-100 max-w-4xl leading-[1.15]">
            A evolução do seu Jiu-Jitsu <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-slate-200 via-slate-100 to-slate-400 bg-clip-text text-transparent">
              começa fora do tatame.
            </span>
          </h1>

          <p className="mt-6 text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl leading-relaxed">
            O sistema de gestão interna da Sagrada Família BJJ que conecta administração eficiente ao desenvolvimento do atleta.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button
              onClick={onAccessLogin}
              className="w-full sm:w-auto btn-gold px-10 py-4 text-sm font-bold shadow-2xl tracking-wider uppercase"
            >
              Acessar Painel (Login)
            </button>
            <button
              onClick={() => setShowGraduationModal(true)}
              className="w-full sm:w-auto btn-obsidian px-10 py-4 text-sm font-bold tracking-wider uppercase border border-obsidian-800"
            >
              Sistema de Graduação
            </button>
          </div>
        </div>
      </section>

      {/* SEÇÃO DE AVISOS */}
      {announcements && announcements.length > 0 && (
        <section id="avisos" className="py-20 px-4 max-w-7xl mx-auto border-b border-obsidian-850 scroll-mt-20">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs uppercase font-black tracking-widest text-slate-400 flex items-center justify-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-gold-500" /> Comunicados e Eventos
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-100 mt-2">
              Avisos Recentes
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((aviso) => (
              <div 
                key={aviso.id} 
                className={`card-premium p-6 flex flex-col justify-between border-l-4 relative overflow-hidden bg-obsidian-800/40 hover:bg-obsidian-800/70 transition-all ${
                  aviso.fixado ? 'border-l-gold-500' : 'border-l-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(aviso.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </span>
                    {aviso.fixado && (
                      <span className="text-[9px] uppercase font-black tracking-wider bg-gold-500/10 text-gold-450 border border-gold-500/20 px-2 py-0.5 rounded-full">
                        Destaque
                      </span>
                    )}
                  </div>
                  <h4 className="text-md font-bold text-slate-200 mb-2 leading-snug">
                    {aviso.titulo}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">
                    {aviso.conteudo}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* GALERIA DE FOTOS DO DOJO */}
      <section id="galeria" className="py-24 px-4 max-w-7xl mx-auto border-b border-obsidian-850 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-100 mt-2">
            Galeria da Família SFBJJ
          </p>
          <p className="text-slate-400 mt-4">
            Acompanhe o dia a dia de treinos, a evolução de nossos alunos (Kids e Adultos) e a união da nossa equipe nos tatames da Sagrada Família BJJ.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Item 1 - Kids */}
          <div className="group relative rounded-xl overflow-hidden border border-obsidian-800 bg-obsidian-900 shadow-xl transition-all duration-300 hover:border-gold-500/20 hover:shadow-gold-glow">
            <div className="aspect-square w-full overflow-hidden">
              <img
                src={bjjKidsClass}
                alt="Treino Infantil (Kids)"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/40 to-transparent opacity-90 p-6 flex flex-col justify-end">
              <span className="text-[10px] font-bold text-gold-400 uppercase tracking-widest">Treino Infantil</span>
              <h4 className="text-lg font-bold text-slate-100 mt-1">Turma Kids</h4>
            </div>
          </div>

          {/* Item 2 - Adults Sparring */}
          <div className="group relative rounded-xl overflow-hidden border border-obsidian-800 bg-obsidian-900 shadow-xl transition-all duration-300 hover:border-gold-500/20 hover:shadow-gold-glow">
            <div className="aspect-square w-full overflow-hidden">
              <img
                src={bjjAdultsSparring}
                alt="Treino de Sparring Adulto"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/40 to-transparent opacity-90 p-6 flex flex-col justify-end">
              <span className="text-[10px] font-bold text-gold-400 uppercase tracking-widest">Treino Adulto</span>
              <h4 className="text-lg font-bold text-slate-100 mt-1">Técnica e Sparring</h4>
            </div>
          </div>

          {/* Item 3 - Team Photo */}
          <div className="group relative rounded-xl overflow-hidden border border-obsidian-800 bg-obsidian-900 shadow-xl transition-all duration-300 hover:border-gold-500/20 hover:shadow-gold-glow">
            <div className="aspect-square w-full overflow-hidden">
              <img
                src={bjjTeamGroup}
                alt="Equipe Sagrada Família BJJ"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/40 to-transparent opacity-90 p-6 flex flex-col justify-end">
              <span className="text-[10px] font-bold text-gold-400 uppercase tracking-widest">União e Tradição</span>
              <h4 className="text-lg font-bold text-slate-100 mt-1">Equipe SFBJJ</h4>
            </div>
          </div>
        </div>
      </section>

      {/* HORÁRIOS E LOCALIZAÇÃO */}
      <section id="horarios" className="py-24 px-4 max-w-7xl mx-auto scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

      {/* Horários Semanal Grid */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xs uppercase font-black tracking-widest text-slate-400">
            Treinos da semana
          </h2>
          <h3 className="text-3xl font-extrabold text-slate-100 mt-2">
            Grade de Horários
          </h3>
          <p className="text-slate-450 text-sm mt-3 leading-relaxed">
            Nossos treinos regulares acontecem ao longo da semana sob a supervisão do professor Lucas dos Anjos. Verifique a divisão abaixo:
          </p>
        </div>

        <div className="space-y-3">
          {quickSchedule.map((item, index) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-obsidian-900 border border-obsidian-800 flex items-center justify-between gap-4 hover:border-gold-500/10 transition-colors"
            >
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {item.dias}
                </span>
                <h5 className="font-extrabold text-slate-200 text-sm mt-0.5">
                  Jiu-Jitsu {item.categoria}
                </h5>
                <span className="text-xs text-slate-400 mt-1 block">
                  Prof: {item.professor}
                </span>
              </div>

              <div className="text-right shrink-0">
                <span className="px-2.5 py-1 rounded bg-gold-500/5 text-gold-400 border border-gold-500/15 text-[11px] font-bold font-mono">
                  {item.hora}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-obsidian-900/50 border border-obsidian-850 text-xs text-slate-400 leading-relaxed">
          <span className="font-bold text-slate-300 block mb-1">🥋 Regras do Tatame:</span>
          Aulas tradicionais exigem o uso de Kimono limpo. Para treinos de Submission (No-Gi), é obrigatório o uso de rashguard oficial e bermuda apropriada.
        </div>
      </div>

      {/* Localização e Endereço */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xs uppercase font-black tracking-widest text-slate-400">
            Venha treinar conosco
          </h2>
          <h3 className="text-3xl font-extrabold text-slate-100 mt-2">
            Nossa Localização
          </h3>
          <p className="text-slate-455 text-sm mt-3 leading-relaxed">
            Estamos localizados em Brasília - DF. Visite nosso dojo para uma aula experimental e conheça nossa estrutura profissional.
          </p>
        </div>

        {/* Address Details */}
        <div className="p-5 rounded-xl bg-obsidian-900 border border-obsidian-800 flex items-start gap-4">
          <div className="p-3 bg-gold-500/5 border border-gold-500/15 rounded-lg text-slate-200">
            <MapPin className="w-5 h-5 text-slate-350" />
          </div>
          <div>
            <h5 className="font-extrabold text-slate-200 text-sm">
              Sagrada Família Brasilia Jiu-Jitsu
            </h5>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              SGAS II SGAS 615/ Asa Sul, Brasília - DF
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              Horário de funcionamento: Seg a Sex das 18h30m às 21h.
            </p>
          </div>
        </div>

        {/* Map Container Mockup */}
        <div className="relative rounded-2xl border border-obsidian-800 bg-obsidian-900 h-64 overflow-hidden group shadow-lg shadow-black/40">
          <div className="absolute inset-0 bg-obsidian-950/60 z-10 flex flex-col items-center justify-center p-6 text-center">
            <MapPin className="w-10 h-10 text-gold-500 animate-bounce mb-3" />
            <span className="font-extrabold text-sm text-slate-250 block">Asa Sul / Brasília, DF</span>
            <span className="text-[11px] text-slate-455 max-w-xs mt-1 block">
              Clique para traçar rota no Google Maps
            </span>
            <a
              href="https://maps.app.goo.gl/sw8fVwJyQWXAyJPf9"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold text-[10px] font-black uppercase tracking-wider px-4 py-2 mt-4 inline-flex items-center gap-1 shadow-md"
            >
              Abrir Mapa Externo
            </a>
          </div>

          {/* Graphic Representation of Map Grid styling */}
          <div className="absolute inset-0 bg-obsidian-950 opacity-20 bg-[linear-gradient(to_right,#3d3d40_1px,transparent_1px),linear-gradient(to_bottom,#3d3d40_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        </div>
      </div>
    </div>
  </section>

      {/* SEÇÃO DE CONTATO */}
      <section id="contato" className="py-24 px-4 max-w-7xl mx-auto border-t border-obsidian-850 scroll-mt-20">
        <Contact />
      </section>

      {/* FOOTER */}
      <footer className="bg-obsidian-950 border-t border-obsidian-850 py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">

      {/* Brand Col */}
      <div className="md:col-span-2 space-y-4">
        <div className="flex items-center gap-3">
          <img
            src={logoSFBJJ}
            alt="Logo Sagrada Família BJJ"
            className="w-10 h-10 rounded-full border border-obsidian-750 object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="font-black text-sm tracking-wider text-slate-100 uppercase">
            Sagrada Família <span className="text-gold-500">BJJ</span>
          </span>
        </div>

        <p className="text-xs text-slate-450 max-w-sm leading-relaxed">
          Dojo tradicional focado no desenvolvimento marcial, evolução técnica de excelência e formação humana através do Jiu-Jitsu.
        </p>

        {/* Social Icons */}
        <div className="flex items-center gap-4 pt-2">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-obsidian-900 border border-obsidian-800 text-slate-400 hover:text-slate-200 transition-colors" aria-label="Instagram">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-obsidian-900 border border-obsidian-800 text-slate-400 hover:text-slate-200 transition-colors" aria-label="Facebook">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-obsidian-900 border border-obsidian-800 text-slate-400 hover:text-slate-200 transition-colors" aria-label="YouTube">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
              <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
            </svg>
          </a>
        </div>
      </div>

      {/* Links rápidos */}
      <div>
        <h5 className="font-extrabold text-xs text-slate-200 uppercase tracking-widest mb-4">
          Navegação
        </h5>
        <ul className="space-y-2 text-xs text-slate-450">
          {announcements && announcements.length > 0 && (
            <li><a href="#avisos" className="hover:text-slate-200 transition-colors">Avisos</a></li>
          )}
          <li><a href="#horarios" className="hover:text-slate-200 transition-colors">Horários Semanal</a></li>
          <li><button onClick={() => setShowGraduationModal(true)} className="hover:text-slate-250 transition-colors text-left uppercase">Graduação IBJJF</button></li>
          <li><a href="#contato" className="hover:text-slate-200 transition-colors">Contato</a></li>
          <li><button onClick={onAccessLogin} className="hover:text-slate-200 transition-colors text-left">Acessar Painel</button></li>
        </ul>
      </div>

      {/* Suporte */}
      <div>
        <h5 className="font-extrabold text-xs text-slate-200 uppercase tracking-widest mb-4">
          Plataforma
        </h5>
        <p className="text-xs text-slate-450 leading-relaxed">
          Exclusivo para membros e gestão interna da Sagrada Família BJJ. Desenvolvido por Lucas dos Anjos.
        </p>
        <p className="text-[10px] text-slate-500 mt-2 font-mono">
          v3.1.2-stable
        </p>
      </div>
    </div>

    {/* Bottom Copyright */}
        <div className="max-w-7xl mx-auto border-t border-obsidian-850/60 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 tracking-wide font-medium">
          <span>
            © 2026 Sagrada Família BJJ. Todos os direitos reservados.
          </span>
          <span className="flex items-center gap-1">
            Brasília, DF • Orgulho e Tradição
          </span>
        </div>
      </footer>

      {/* MODAL SISTEMA DE GRADUAÇÃO IBJJF */}
      {showGraduationModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-obsidian-950/95 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-7xl bg-obsidian-900 border border-obsidian-800 p-6 md:p-8 shadow-2xl my-8">
            <button
              onClick={() => setShowGraduationModal(false)}
              className="absolute right-4 top-4 text-zinc-450 hover:text-zinc-200 transition-colors p-2 bg-obsidian-950 border border-obsidian-800 rounded-none z-10"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="max-h-[80vh] overflow-y-auto pr-2 mt-4">
              <GraduationSystem />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
