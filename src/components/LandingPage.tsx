import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Megaphone,
  X,
  Shield,
  Activity,
  Sparkles,
  Menu,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen
} from 'lucide-react';
import logoSFBJJ from '../assets/logo-sfbjj.jpg';
import type { Aviso } from '../types';
import { Contact } from './Contact';
import { GraduationSystem } from './GraduationSystem';
import { supabase } from '../lib/supabase';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallPrompt } from './PWAInstallPrompt';


interface LandingPageProps {
  announcements?: Aviso[];
  onAccessLogin: () => void;
}

const getDiasSemanaString = (diasSemana: number[]): string => {
  const nomesDias: Record<number, string> = {
    1: 'Segunda',
    2: 'Terça',
    3: 'Quarta',
    4: 'Quinta',
    5: 'Sexta',
    6: 'Sábado',
    7: 'Domingo'
  };
  if (!diasSemana || diasSemana.length === 0) return '';
  const dias = diasSemana.map(d => nomesDias[d]).filter(Boolean);
  if (dias.length === 1) return dias[0];
  if (dias.length === 2) return `${dias[0]} & ${dias[1]}`;
  return dias.join(', ');
};

export const LandingPage: React.FC<LandingPageProps> = ({ announcements = [], onAccessLogin }) => {
  const [showGraduationModal, setShowGraduationModal] = useState(false);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Hook do PWA
  const { isInstallable, isInstalled, showIOSPrompt, handleInstallClick, closeIOSPrompt } = usePWAInstall();
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const showInstallButton = isInstallable || (isIOS && !isInstalled);


  useEffect(() => {
    async function fetchSchedule() {
      const { data, error } = await supabase.from('aulas').select('*');
      if (!error && data) {
        const mapped = data.map((d: any) => {
          let dias = d.diasSemana;
          if (typeof dias === 'string') {
            try {
              dias = JSON.parse(dias);
            } catch {
              dias = [];
            }
          }
          return {
            hora: d.hora,
            categoria: d.categoria,
            dias: getDiasSemanaString(dias),
            professor: d.professor
          };
        });
        setSchedule(mapped);
      }
    }
    fetchSchedule();
  }, []);
  return (
    <div className="bg-obsidian-950 text-slate-100 min-h-screen font-sans selection:bg-slate-200/25 selection:text-white overflow-x-hidden">

      {/* HEADER / NAVIGATION */}
      <header className="fixed w-full top-0 z-50 bg-obsidian-950/65 backdrop-blur-2xl border-b border-obsidian-850/45 transition-all duration-300">
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
                alt="Sagrada Família BJJ"
                className="w-14 h-14 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div>
              <span className="font-extrabold tracking-wider text-base uppercase text-slate-100 block leading-none transition-colors duration-300 group-hover:text-white">
                Sagrada Família <span className="text-zinc-350 font-black">BJJ</span>
              </span>
              <span className="text-[9px] tracking-widest text-slate-450 uppercase font-semibold mt-1 block">
                Brasília - DF
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {announcements && announcements.length > 0 && (
              <a href="#avisos" className="hover:text-slate-100 transition-colors duration-300">Avisos</a>
            )}
            <a href="#regras" className="hover:text-slate-100 transition-colors duration-300">Regras do Tatame</a>
            <a href="#faq" className="hover:text-slate-100 transition-colors duration-300">FAQ</a>
            <button
              onClick={() => setShowGraduationModal(true)}
              className="hover:text-slate-100 transition-colors duration-300 uppercase animate-pulse-subtle"
            >
              Regras IBJJF
            </button>
            <a href="#horarios" className="hover:text-slate-100 transition-colors duration-300">Horários & Localização</a>
            <a href="#contato" className="hover:text-slate-100 transition-colors duration-300">Contato</a>
            
            {/* Botão de Instalação PWA */}
            {showInstallButton && (
              <button
                onClick={handleInstallClick}
                className="text-zinc-200 hover:text-white transition-colors duration-300 uppercase border border-zinc-700/50 px-3 py-1.5 bg-zinc-900/50 hover:bg-zinc-800/60"
                aria-label="Instalar aplicativo PWA"
              >
                Instalar App
              </button>
            )}

            <button
              onClick={onAccessLogin}
              className="btn-gold text-[10px] tracking-widest uppercase font-black px-4 py-2"
            >
              Entrar
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-slate-100 transition-colors"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-20 z-40 bg-obsidian-950/95 backdrop-blur-3xl border-b border-obsidian-850 animate-fade-in-up">
            <nav className="flex flex-col p-6 gap-5 text-xs font-bold uppercase tracking-wider text-slate-400">
              {announcements && announcements.length > 0 && (
                <a
                  href="#avisos"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:text-slate-100 transition-colors duration-200 py-2 border-b border-obsidian-900"
                >
                  Avisos
                </a>
              )}
              <a
                href="#regras"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-slate-100 transition-colors duration-200 py-2 border-b border-obsidian-900"
              >
                Regras do Tatame
              </a>
              <a
                href="#faq"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-slate-100 transition-colors duration-200 py-2 border-b border-obsidian-900"
              >
                FAQ
              </a>
              <button
                onClick={() => {
                  setShowGraduationModal(true);
                  setIsMobileMenuOpen(false);
                }}
                className="text-left hover:text-slate-100 transition-colors duration-200 py-2 border-b border-obsidian-900 uppercase"
              >
                Regras IBJJF
              </button>
              <a
                href="#horarios"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-slate-100 transition-colors duration-200 py-2 border-b border-obsidian-900"
              >
                Horários & Localização
              </a>
              <a
                href="#contato"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:text-slate-100 transition-colors duration-200 py-2 border-b border-obsidian-900"
              >
                Contato
              </a>

              {/* Botão PWA no Menu Mobile */}
              {showInstallButton && (
                <button
                  onClick={() => {
                    handleInstallClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-center text-[10px] tracking-widest uppercase font-black py-3 border border-zinc-700/60 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-200"
                  aria-label="Instalar aplicativo PWA"
                >
                  Instalar Aplicativo
                </button>
              )}

              <button
                onClick={() => {
                  onAccessLogin();
                  setIsMobileMenuOpen(false);
                }}
                className="btn-gold w-full text-center text-[10px] tracking-widest uppercase font-black py-3 mt-2"
              >
                Entrar
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 px-4 overflow-hidden border-b border-obsidian-850/60">
        {/* Background stylized grid and glow */}
        <div className="absolute inset-0 z-0">
          <svg className="w-full h-full opacity-10 pointer-events-none select-none" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(244, 244, 245, 0.2)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-zinc-200/5 blur-[150px] pointer-events-none animate-pulse-glow" />
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

        <div className="max-w-5xl mx-auto z-10 text-center flex flex-col items-center animate-fade-in-up">
          {/* Logo element center */}
          <div className="relative mb-8 animate-float">
            <div className="absolute -inset-3 bg-gradient-to-r from-zinc-200/10 to-transparent rounded-full blur-xl opacity-40" />
            <div className="relative p-1.5 bg-obsidian-900 border border-obsidian-850/80 rounded-full shadow-2xl">
              <img
                src={logoSFBJJ}
                alt="Logo Sagrada Família BJJ"
                className="w-32 h-32 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-100 max-w-4xl leading-[1.12]">
            A evolução do seu Jiu-Jitsu <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-slate-200 via-slate-100 to-slate-400 bg-clip-text text-transparent text-glow-silver">
              começa fora do tatame.
            </span>
          </h1>

          <p className="mt-6 text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl leading-relaxed">
            O sistema de gestão interna da Sagrada Família BJJ que conecta administração eficiente ao desenvolvimento do atleta.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button
              onClick={onAccessLogin}
              className="w-full sm:w-auto btn-gold px-10 py-4 text-sm font-bold shadow-2xl tracking-wider uppercase active:scale-[0.98]"
            >
              Acessar Painel (Login)
            </button>
            
            {showInstallButton && (
              <button
                onClick={handleInstallClick}
                className="w-full sm:w-auto btn-obsidian px-10 py-4 text-sm font-bold tracking-wider uppercase border border-zinc-500/40 text-zinc-200 hover:border-zinc-200 active:scale-[0.98] bg-zinc-950/40"
                aria-label="Instalar aplicativo PWA"
              >
                Instalar Aplicativo
              </button>
            )}

            <button
              onClick={() => setShowGraduationModal(true)}
              className="w-full sm:w-auto btn-obsidian px-10 py-4 text-sm font-bold tracking-wider uppercase border border-obsidian-800 active:scale-[0.98]"
            >
              Regras IBJJF
            </button>
          </div>
        </div>
      </section>


      {/* VALORES / PILARES SECTION */}
      <section className="py-24 px-4 max-w-7xl mx-auto border-b border-obsidian-850">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs uppercase font-black tracking-widest text-slate-450 flex items-center justify-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-zinc-400" /> Filosofia e Fundamentos
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-100 mt-2">
            Nossos Valores
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-glass border border-obsidian-800/80 flex flex-col items-center text-center group hover:border-slate-500/20 hover:bg-obsidian-900/60 transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-slate-100/5 flex items-center justify-center text-slate-200 mb-6 group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-6 h-6 text-slate-400" />
            </div>
            <h4 className="text-base font-bold text-slate-200 mb-3">Respeito & Tradição</h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              A base da convivência no dojo. Valorizamos e reverenciamos a hierarquia, os professores e o respeito mútuo em cada treino.
            </p>
          </div>

          <div className="p-8 bg-glass border border-obsidian-800/80 flex flex-col items-center text-center group hover:border-slate-500/20 hover:bg-obsidian-900/60 transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-slate-100/5 flex items-center justify-center text-slate-200 mb-6 group-hover:scale-110 transition-transform duration-300">
              <Activity className="w-6 h-6 text-slate-400" />
            </div>
            <h4 className="text-base font-bold text-slate-200 mb-3">Disciplina & Constância</h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              A maestria técnica surge do compromisso e da regularidade. Encaramos os treinos frequentes como degraus da evolução.
            </p>
          </div>

          <div className="p-8 bg-glass border border-obsidian-800/80 flex flex-col items-center text-center group hover:border-slate-500/20 hover:bg-obsidian-900/60 transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-slate-100/5 flex items-center justify-center text-slate-200 mb-6 group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="w-6 h-6 text-slate-400" />
            </div>
            <h4 className="text-base font-bold text-slate-200 mb-3">Metodologia Refinada</h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Orientação técnica qualificada com foco em detalhes de posicionamento e biomecânica para garantir uma prática segura e eficiente.
            </p>
          </div>
        </div>
      </section>

      {/* SEÇÃO DE AVISOS */}
      {announcements && announcements.length > 0 && (
        <section id="avisos" className="py-20 px-4 max-w-7xl mx-auto border-b border-obsidian-850 scroll-mt-20">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs uppercase font-black tracking-widest text-slate-450 flex items-center justify-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-zinc-400" /> Comunicados e Eventos
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-100 mt-2">
              Avisos Recentes
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((aviso) => (
              <div 
                key={aviso.id} 
                className={`card-premium p-6 flex flex-col justify-between border-l-4 relative overflow-hidden bg-obsidian-900/40 hover:bg-obsidian-800/60 transition-all duration-300 ${
                  aviso.fixado ? 'border-l-zinc-350 shadow-gold-glow' : 'border-l-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(aviso.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </span>
                    {aviso.fixado && (
                      <span className="text-[9px] uppercase font-black tracking-wider bg-slate-100/10 text-slate-200 border border-slate-750 px-2 py-0.5 rounded-full">
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

      {/* SEÇÃO REGRAS DO TATAME */}
      <section id="regras" className="py-24 px-4 max-w-7xl mx-auto border-b border-obsidian-850 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs uppercase font-black tracking-widest text-slate-455 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" /> Código de Conduta
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-100 mt-2">
            Regras do Tatame
          </p>
          <p className="text-slate-450 mt-4 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            Para garantir um ambiente seguro, respeitoso e propício para o aprendizado técnico, todos os atletas devem seguir nossas diretrizes de conduta.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {[
            "Cumprimente ao entrar e sair e os parceiros por ordem de faixa.",
            "Peça permissão ao professor antes de entrar ou sair.",
            "Mantenha o kimono limpo, amarrado e em bom estado.",
            "Use rash guard ou camiseta por baixo do kimono.",
            "Mantenha unhas aparadas e retire acessórios.",
            "Retire o calçado antes de entrar e não ande descalço fora do tatame.",
            "Evite palavrões e gestos obscenos.",
            "Não se vanglorie ao finalizar um colega.",
            "Siga as instruções do professor. Treine sempre.",
            "Trabalhe suas deficiências e busque evolução."
          ].map((regra, i) => (
            <div key={i} className="flex items-start gap-4 p-5 bg-glass border border-obsidian-800/80 hover:border-slate-500/20 transition-all duration-300">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100/5 border border-slate-800 flex items-center justify-center text-xs font-bold text-slate-455">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed pt-1.5">
                {regra}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SEÇÃO FAQ (PERGUNTAS FREQUENTES) */}
      <section id="faq" className="py-24 px-4 max-w-4xl mx-auto border-b border-obsidian-850 scroll-mt-20">
        <div className="text-center mb-16">
          <h2 className="text-xs uppercase font-black tracking-widest text-slate-455">
            Dúvidas Comuns
          </h2>
          <h3 className="text-3xl font-extrabold text-slate-100 mt-2">
            Perguntas Frequentes
          </h3>
        </div>

        <div className="space-y-3">
          {[
            {
              pergunta: "Preciso ter experiência prévia para começar?",
              resposta: "Não, de forma alguma! Nosso dojo está estruturado para acolher pessoas de todos os níveis, desde iniciantes que nunca vestiram um kimono até atletas experientes. Os treinos são focados na cooperação mútua."
            },
            {
              pergunta: "Como posso agendar uma aula experimental?",
              resposta: "A aula experimental é gratuita. Você pode fazer o agendamento enviando uma mensagem rápida no formulário de contato abaixo ou diretamente pelo nosso link do WhatsApp."
            },
            {
              pergunta: "Quais equipamentos são necessários para o primeiro treino?",
              resposta: "Para as primeiras aulas tradicionais de Jiu-Jitsu, podemos orientar ou conseguir um kimono para empréstimo. Para treinos de Submission (No-Gi), basta usar camiseta rashguard ou camisa colada e bermuda esportiva sem bolsos ou botões."
            },
            {
              pergunta: "Existem turmas infantis?",
              resposta: "Sim, oferecemos turmas exclusivas de Jiu-Jitsu Kids. Elas trabalham a coordenação motora, autodefesa, disciplina e o convívio saudável com outras crianças através de aulas lúdicas e seguras."
            }
          ].map((faq, index) => (
            <div key={index} className="border border-obsidian-850/80 bg-glass/60 transition-all duration-300">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full p-5 flex items-center justify-between text-left focus:outline-none"
              >
                <span className="text-xs sm:text-sm font-bold text-slate-200">{faq.pergunta}</span>
                {openFaq === index ? <ChevronUp className="w-4 h-4 text-slate-455" /> : <ChevronDown className="w-4 h-4 text-slate-455" />}
              </button>

              <div className={`overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-40 border-t border-obsidian-850/45' : 'max-h-0'}`}>
                <p className="p-5 text-xs text-slate-400 leading-relaxed">
                  {faq.resposta}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HORÁRIOS E LOCALIZAÇÃO */}
      <section id="horarios" className="py-24 px-4 max-w-7xl mx-auto border-b border-obsidian-850 scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Horários Semanal Grid */}
          <div className="space-y-6">
            <div>
              <span className="text-[10px] tracking-widest uppercase font-bold text-slate-455 bg-slate-100/5 px-2.5 py-1.5 border border-slate-800">
                Treinos da semana
              </span>
              <h3 className="text-3xl font-extrabold text-slate-100 mt-4">
                Grade de Horários
              </h3>
              <p className="text-slate-450 text-sm mt-3 leading-relaxed">
                Nossos treinos regulares acontecem ao longo da semana sob a supervisão do professor Lucas dos Anjos. Verifique a divisão abaixo:
              </p>
            </div>

            <div className="space-y-3">
              {schedule.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-obsidian-900/40 border border-obsidian-800/80 hover:border-slate-500/20 flex items-center justify-between gap-4 transition-colors duration-300"
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
                    <span className="px-2.5 py-1 rounded bg-zinc-100/5 text-slate-200 border border-slate-750 text-[11px] font-bold font-mono">
                      {item.hora}
                    </span>
                  </div>
                </div>
              ))}
              {schedule.length === 0 && (
                <p className="text-xs text-slate-500 uppercase tracking-wider py-4 font-bold font-mono">
                  NENHUM HORÁRIO CADASTRADO NO MOMENTO.
                </p>
              )}
            </div>

            <div className="p-4 bg-obsidian-900/50 border border-obsidian-850 text-xs text-slate-455 leading-relaxed">
              <span className="font-bold text-slate-350 block mb-1">🥋 Regras do Tatame:</span>
              Aulas tradicionais exigem o uso de Kimono limpo. Para treinos de Submission (No-Gi), é obrigatório o uso de rashguard oficial e bermuda apropriada.
            </div>
          </div>

          {/* Localização e Endereço */}
          <div className="space-y-6">
            <div>
              <span className="text-[10px] tracking-widest uppercase font-bold text-slate-455 bg-slate-100/5 px-2.5 py-1.5 border border-slate-800">
                Venha treinar conosco
              </span>
              <h3 className="text-3xl font-extrabold text-slate-100 mt-4">
                Nossa Localização
              </h3>
              <p className="text-slate-455 text-sm mt-3 leading-relaxed">
                Estamos localizados em Brasília - DF. Visite nosso dojo para uma aula experimental e conheça nossa estrutura profissional.
              </p>
            </div>

            {/* Address Details Card */}
            <div className="p-5 bg-obsidian-900/40 border border-obsidian-800 flex items-start gap-4 hover:border-slate-500/20 transition-all duration-300">
              <div className="p-3 bg-zinc-150/5 border border-zinc-200/10 rounded-none text-slate-200">
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
            <div className="relative rounded-none border border-obsidian-800 bg-obsidian-900 h-64 overflow-hidden group shadow-lg shadow-black/40">
              <div className="absolute inset-0 bg-obsidian-950/65 z-10 flex flex-col items-center justify-center p-6 text-center">
                <MapPin className="w-10 h-10 text-zinc-350 animate-bounce mb-3" />
                <span className="font-extrabold text-sm text-slate-250 block">Asa Sul / Brasília, DF</span>
                <span className="text-[11px] text-slate-455 max-w-xs mt-1 block">
                  Clique para traçar rota no Google Maps
                </span>
                <a
                  href="https://maps.app.goo.gl/sw8fVwJyQWXAyJPf9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold text-[10px] font-black uppercase tracking-wider px-6 py-3 mt-4 inline-flex items-center gap-1 shadow-md rounded-none"
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
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-3 group text-left focus:outline-none"
            >
              <img
                src={logoSFBJJ}
                alt="Logo Sagrada Família BJJ"
                className="w-14 h-14 rounded-full border border-obsidian-750 object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="font-black text-sm tracking-wider text-slate-100 uppercase transition-colors duration-300 group-hover:text-white">
                Sagrada Família <span className="text-zinc-350 group-hover:text-zinc-250 transition-colors">BJJ</span>
              </span>
            </button>

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
              <li><a href="#regras" className="hover:text-slate-200 transition-colors">Regras do Tatame</a></li>
              <li><a href="#faq" className="hover:text-slate-200 transition-colors">FAQ</a></li>
              <li><button onClick={() => setShowGraduationModal(true)} className="hover:text-slate-250 transition-colors text-left uppercase">Regras IBJJF</button></li>
              <li><a href="#horarios" className="hover:text-slate-200 transition-colors">Horários & Localização</a></li>
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

      {/* Modal PWA para iOS */}
      <PWAInstallPrompt isOpen={showIOSPrompt} onClose={closeIOSPrompt} />

    </div>
  );
};
