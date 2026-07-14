import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  X,
  Shield,
  Activity,
  Sparkles,
  Menu,
  ChevronDown,
  ChevronUp,
  Award
} from 'lucide-react';
import logoSFBJJ from '@/assets/logo-sfbjj.png';
import logoLucas from '@/assets/logo-lucas.png';
import type { Aviso } from '@/domain/models/announcement';
import { ContactPage } from './ContactPage';
import { GraduationSystemPage } from './GraduationSystemPage';
import { classService } from '@/application/services/classService';
import { usePWAInstall } from '@/application/hooks/usePWAInstall';
import { PWAInstallPrompt } from '@/presentation/components/shared/PWAInstallPrompt';
import { useAuthContext } from '@/application/contexts/AuthContext';

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
  const { loggedUser } = useAuthContext();
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
      try {
        const data = await classService.getClasses();
        if (data) {
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
      } catch (err) {
        console.error('Erro ao carregar horários na Landing Page:', err);
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
                alt="Logo SFBJJ"
                className="w-12 h-12 rounded-full border border-obsidian-800 object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-wider text-slate-100 uppercase transition-colors duration-300 group-hover:text-white leading-none">
                Sagrada Família <span className="text-zinc-400 font-black">BJJ</span>
              </span>
              <span className="text-[7.5px] text-slate-500 font-bold uppercase tracking-widest mt-1">Brasília - Asa Sul</span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {announcements && announcements.length > 0 && (
              <a href="#avisos" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-100 transition-colors">Avisos</a>
            )}
            <a href="#regras" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-100 transition-colors">Regras</a>
            <a href="#faq" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-100 transition-colors">FAQ</a>
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
                className="btn-obsidian text-[10px] font-black uppercase tracking-wider px-5 py-2.5 flex items-center gap-2 border border-obsidian-800"
              >
                Instalar App
              </button>
            )}
            <button
              onClick={onAccessLogin}
              className="btn-gold text-[10px] font-black uppercase tracking-wider px-5 py-2.5"
            >
              {loggedUser ? `Painel (${loggedUser.nome.split(' ')[0]})` : 'Entrar no Portal'}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-slate-100 transition-colors"
            aria-label="Menu"
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
              className="p-2 text-slate-455 hover:text-slate-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex-1 flex flex-col justify-center items-center gap-6 py-12">
            {announcements && announcements.length > 0 && (
              <a href="#avisos" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-bold uppercase tracking-wider text-slate-350 hover:text-white">Avisos</a>
            )}
            <a href="#regras" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-bold uppercase tracking-wider text-slate-350 hover:text-white">Regras do Tatame</a>
            <a href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-bold uppercase tracking-wider text-slate-350 hover:text-white">Perguntas Frequentes</a>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setShowGraduationModal(true);
              }}
              className="text-base font-bold uppercase tracking-wider text-slate-350 hover:text-white flex items-center gap-2"
            >
              <Award className="w-5 h-5" /> Regras IBJJF
            </button>
            <a href="#horarios" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-bold uppercase tracking-wider text-slate-350 hover:text-white">Grade de Treinos</a>
            <a href="#contato" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-bold uppercase tracking-wider text-slate-350 hover:text-white">Fale Conosco</a>
          </nav>
          <div className="space-y-3 pt-6 border-t border-obsidian-900">
            {showInstallButton && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleInstallClick();
                }}
                className="w-full btn-obsidian py-3.5 font-bold uppercase text-xs text-center border border-obsidian-800"
              >
                Instalar Aplicativo (PWA)
              </button>
            )}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onAccessLogin();
              }}
              className="w-full btn-gold py-3.5 font-bold uppercase text-xs text-center"
            >
              {loggedUser ? `Acessar Painel (${loggedUser.nome.split(' ')[0]})` : 'Acessar Painel / Login'}
            </button>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative pt-36 pb-24 md:pt-48 md:pb-40 px-4 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Glow */}
        <div className="absolute top-[-10%] w-[500px] h-[500px] rounded-full bg-slate-500/5 blur-[120px] pointer-events-none" />

        <div className="space-y-6 max-w-7xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-obsidian-900 border border-obsidian-850/80 rounded-none text-slate-400 text-[9px] font-black uppercase tracking-widest shadow-md">
            <Sparkles className="w-3 h-3 text-gold-550 animate-pulse" /> Sagrada Família BJJ • Asa Sul
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-100 tracking-tight leading-none uppercase">
            <span className="block">Fé que fortalece a alma.</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-550 font-black block mt-2 sm:mt-4">
              Disciplina que molda o caráter.
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Nossa missão é formar faixas pretas dentro e fora do tatame. Respeito, lealdade, excelência técnica e disciplina espiritual como pilares da nossa jornada marcial.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <button
              onClick={onAccessLogin}
              className="w-full sm:w-auto btn-gold px-8 py-3.5 font-black text-xs uppercase tracking-wider"
            >
              {loggedUser ? 'Acessar Painel' : 'Área do Aluno'}
            </button>
            <a
              href="#horarios"
              className="w-full sm:w-auto btn-obsidian px-8 py-3.5 font-black text-xs uppercase tracking-wider border border-obsidian-850 text-center"
            >
              Grade de Aulas
            </a>
          </div>
        </div>
      </section>

      {/* SEÇÃO DE AVISOS MURAL */}
      {announcements && announcements.length > 0 && (
        <section id="avisos" className="py-24 px-4 bg-obsidian-900/10 border-t border-b border-obsidian-900/60 scroll-mt-20">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <Megaphone className="w-8 h-8 text-gold-500 mx-auto" />
              <h2 className="text-2xl font-black text-slate-100 uppercase tracking-wider">
                Mural de Comunicados
              </h2>
              <p className="text-xs text-slate-450">
                Acompanhe os avisos e comunicados importantes do nosso tatame.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.slice(0, 6).map((ann) => (
                <div
                  key={ann.id}
                  className={`card-premium p-6 border relative overflow-hidden transition-all duration-300 ${ann.fixado
                      ? 'border-gold-500/20 bg-gradient-to-br from-obsidian-800/60 to-obsidian-850/60'
                      : 'border-obsidian-800 bg-obsidian-800/20 hover:border-obsidian-750'
                    }`}
                >
                  {ann.fixado && (
                    <div className="absolute top-0 right-0 px-2 py-0.5 bg-gold-500 text-obsidian-950 text-[8px] font-black uppercase tracking-wider">
                      Fixado
                    </div>
                  )}
                  <span className="text-[9px] font-mono text-slate-500 block mb-2">{ann.data}</span>
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide mb-2 leading-snug">{ann.titulo}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">{ann.conteudo}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SEÇÃO DE REGRAS DO TATAME */}
      <section id="regras" className="py-24 px-4 max-w-7xl mx-auto scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-slate-100 uppercase tracking-tight">
              Regras Básicas<br />
              <span className="text-gold-550">Do Nosso Tatame</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              O jiu-jitsu começa no respeito. Cumprimentar o dojo ao entrar e sair, zelar pela higiene pessoal e apoiar a evolução do seu irmão de treino são condutas obrigatórias.
            </p>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="card-premium p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-obsidian-800 flex items-center justify-center border border-obsidian-750">
                <Shield className="w-5 h-5 text-gold-500" />
              </div>
              <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Higiene e Uniforme</h3>
              <p className="text-xs text-slate-450 leading-relaxed">
                Kimono e rashguard limpos, unhas cortadas e ausência de adornos metálicos para evitar cortes e lesões em si e no colega.
              </p>
            </div>

            <div className="card-premium p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-obsidian-800 flex items-center justify-center border border-obsidian-750">
                <Activity className="w-5 h-5 text-gold-500" />
              </div>
              <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Pontualidade e Foco</h3>
              <p className="text-xs text-slate-455 leading-relaxed">
                Chegue pelo menos 10 minutos antes. Preste atenção total nas instruções do professor e evite conversas paralelas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GRADE DE HORÁRIOS / AULAS */}
      <section id="horarios" className="py-24 px-4 bg-obsidian-900/10 border-t border-b border-obsidian-900/60 scroll-mt-20">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-black text-slate-100 uppercase tracking-tight">
              Grade de Treinos
            </h2>
            <p className="text-xs text-slate-450">
              Encontre o melhor horário para evoluir sua arte marcial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedule.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-500 text-xs">
                Grade de horários sendo carregada...
              </div>
            ) : (
              schedule.map((aula, idx) => (
                <div key={idx} className="card-premium p-5 border border-obsidian-800/90 flex flex-col justify-between gap-4">
                  <div className="flex items-center justify-between border-b border-obsidian-750 pb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-obsidian-800 px-2 py-0.5 rounded">
                      {aula.categoria}
                    </span>
                    <span className="text-xs font-mono font-bold text-gold-500">{aula.hora}</span>
                  </div>
                  <div className="text-xs space-y-1 text-slate-350">
                    <p>📅 {aula.dias}</p>
                    <p>👨‍🏫 Professor: {aula.professor}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 px-4 max-w-4xl mx-auto scroll-mt-20">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-3xl font-black text-slate-100 uppercase tracking-tight">
            Perguntas Frequentes
          </h2>
          <p className="text-xs text-slate-450">
            Dúvidas mais comuns sobre o tatame e matrículas.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'Qual o valor da mensalidade e planos?',
              a: 'Temos planos mensais, trimestrais e semestrais. Entre em contato conosco pelo WhatsApp no rodapé da página para consultar os valores vigentes e formas de pagamento.'
            },
            {
              q: 'Preciso ter experiência ou condicionamento prévio?',
              a: 'Não. O jiu-jitsu é para todos. Temos aulas específicas para iniciantes onde você aprenderá os fundamentos básicos em um ambiente seguro e controlado.'
            },
            {
              q: 'Quais equipamentos preciso no início?',
              a: 'Para as primeiras aulas experimentais, você pode treinar de roupa de ginástica leve (calça de moletom e camiseta). Para prosseguir, será obrigatório o uso de kimono oficial e rashguard.'
            }
          ].map((item, idx) => (
            <div key={idx} className="card-premium p-4 border border-obsidian-800/90">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left font-bold text-xs uppercase tracking-wider text-slate-200 focus:outline-none"
              >
                <span>{item.q}</span>
                {openFaq === idx ? <ChevronUp className="w-4 h-4 text-gold-500" /> : <ChevronDown className="w-4 h-4 text-gold-500" />}
              </button>
              {openFaq === idx && (
                <p className="text-xs text-slate-400 mt-3.5 leading-relaxed border-t border-obsidian-800 pt-3">
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>



      {/* CONTATO */}
      <section id="contato" className="py-24 px-4 max-w-7xl mx-auto border-t border-obsidian-850 scroll-mt-20">
        <ContactPage />
      </section>

      {/* FOOTER */}
      <footer className="bg-obsidian-950 border-t border-obsidian-850 py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">

          <div className="space-y-4">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-3 group text-left focus:outline-none"
            >
              <img
                src={logoSFBJJ}
                alt="Logo SFBJJ"
                className="w-12 h-12 rounded-full border border-obsidian-750 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="font-black text-sm tracking-wider text-slate-100 uppercase">
                Sagrada Família <span className="text-zinc-400">BJJ</span>
              </span>
            </button>
            <p className="text-xs text-slate-450 max-w-sm leading-relaxed">
              Dojo tradicional focado no desenvolvimento marcial, evolução técnica de excelência e formação humana através do Jiu-Jitsu.
            </p>
          </div>

          <div>
            <h5 className="font-extrabold text-xs text-slate-200 uppercase tracking-widest mb-4">
              Navegação
            </h5>
            <ul className="space-y-2 text-xs text-slate-450 font-bold">
              {announcements && announcements.length > 0 && (
                <li><a href="#avisos" className="hover:text-slate-200 transition-colors">Avisos</a></li>
              )}
              <li><a href="#regras" className="hover:text-slate-200 transition-colors">Regras do Tatame</a></li>
              <li><a href="#faq" className="hover:text-slate-200 transition-colors">FAQ</a></li>
              <li><button onClick={() => setShowGraduationModal(true)} className="hover:text-slate-250 transition-colors text-left uppercase">Regras IBJJF</button></li>
              <li><a href="#horarios" className="hover:text-slate-200 transition-colors">Horários</a></li>
              <li><a href="#contato" className="hover:text-slate-200 transition-colors">Contato</a></li>
              <li><button onClick={onAccessLogin} className="hover:text-slate-200 transition-colors text-left">Acessar Painel</button></li>
            </ul>
          </div>

          <div>
            <h5 className="font-extrabold text-xs text-slate-200 uppercase tracking-widest mb-4">
              Plataforma
            </h5>
            <div className="flex items-start gap-3">
              <img
                src={logoLucas}
                alt="Logo Lucas"
                className="w-10 h-10 rounded-full border border-obsidian-750 object-cover mt-0.5"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="space-y-2">
                <p className="text-xs text-slate-455 leading-relaxed">
                  Exclusivo para membros e gestão interna da Sagrada Família BJJ. Desenvolvido por Lucas dos Anjos.
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  {import.meta.env.VITE_APP_VERSION || '1.0.0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-obsidian-850/60 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 tracking-wide font-medium">
          <span>
            © 2026 Sagrada Família BJJ. Todos os direitos reservados.
          </span>
          <span>
            Brasília, DF • Orgulho e Tradição • #myfaithismyshield
          </span>
        </div>
      </footer>

      {/* MODAL SISTEMA DE GRADUAÇÃO IBJJF */}
      {showGraduationModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-obsidian-950/95 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-7xl bg-obsidian-900 border border-obsidian-800 p-6 md:p-8 shadow-2xl my-8">
            <button
              onClick={() => setShowGraduationModal(false)}
              className="absolute right-4 top-4 text-zinc-455 hover:text-zinc-200 transition-colors p-2 bg-obsidian-950 border border-obsidian-800 rounded-none z-10"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="max-h-[80vh] overflow-y-auto pr-2 mt-4">
              <GraduationSystemPage />
            </div>
          </div>
        </div>
      )}

      {/* Modal PWA para iOS */}
      <PWAInstallPrompt isOpen={showIOSPrompt} onClose={closeIOSPrompt} />
    </div>
  );
};
export default LandingPage;
