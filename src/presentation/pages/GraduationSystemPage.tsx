import React, { useState } from 'react';
import { Award, FileText, Scale, Skull, Calendar } from 'lucide-react';
import { GraduationPoster } from '@/presentation/components/graduation/GraduationPoster';
import { GraduationRules } from '@/presentation/components/graduation/GraduationRules';
import { BeltCalculator } from '@/presentation/components/graduation/BeltCalculator';
import { WeightCalculator } from '@/presentation/components/graduation/WeightCalculator';
import { WeightTables } from '@/presentation/components/graduation/WeightTables';
import { FoulsTable } from '@/presentation/components/graduation/FoulsTable';

type TabType = 'poster' | 'rules' | 'calculator-belts' | 'calculator-weights' | 'weights' | 'fouls';

export const GraduationSystemPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('poster');

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.open('https://ibjjf.com/sites/default/files/2024-02/IBJJF_Graduation_System_Poster_Port.pdf', '_blank');
  };

  const handleDownloadRulebook = () => {
    window.open('https://ibjjf.com/sites/default/files/2024-02/IBJJF_Rules_Book_v5.2_Port.pdf', '_blank');
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-16 print:bg-white print:text-black">
      
      {/* Header da Página */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-obsidian-850 pb-6 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-slate-100 tracking-tight uppercase flex items-center gap-3">
            <Award className="w-8 h-8 text-gold-550 animate-pulse" /> Sistema de Regras & Graduação
          </h1>
          <p className="text-slate-450 text-xs mt-1">
            Manual Consolidado das Regras Oficiais e Tabelas de Peso da IBJJF / CBJJ.
          </p>
        </div>
      </div>

      {/* Menu de Abas */}
      <div className="flex flex-wrap gap-2 border-b border-obsidian-850 pb-4 print:hidden">
        <button
          onClick={() => setActiveTab('poster')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'poster'
              ? 'border-gold-550 text-slate-100 bg-obsidian-900/40'
              : 'border-transparent text-slate-500 hover:text-slate-350'
          }`}
        >
          <Award className="w-4 h-4" /> Poster de Faixas
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'rules'
              ? 'border-gold-550 text-slate-100 bg-obsidian-900/40'
              : 'border-transparent text-slate-500 hover:text-slate-350'
          }`}
        >
          <FileText className="w-4 h-4" /> Regras Gerais
        </button>

        <button
          onClick={() => setActiveTab('fouls')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'fouls'
              ? 'border-gold-550 text-slate-100 bg-obsidian-900/40'
              : 'border-transparent text-slate-500 hover:text-slate-350'
          }`}
        >
          <Skull className="w-4 h-4" /> Golpes Ilegais
        </button>

        <button
          onClick={() => setActiveTab('weights')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'weights'
              ? 'border-gold-550 text-slate-100 bg-obsidian-900/40'
              : 'border-transparent text-slate-500 hover:text-slate-350'
          }`}
        >
          <Scale className="w-4 h-4" /> Tabela de Pesos
        </button>

        <button
          onClick={() => setActiveTab('calculator-belts')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'calculator-belts'
              ? 'border-gold-550 text-slate-100 bg-obsidian-900/40'
              : 'border-transparent text-slate-500 hover:text-slate-350'
          }`}
        >
          <Calendar className="w-4 h-4" /> Calculadora Faixas
        </button>

        <button
          onClick={() => setActiveTab('calculator-weights')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'calculator-weights'
              ? 'border-gold-550 text-slate-100 bg-obsidian-900/40'
              : 'border-transparent text-slate-500 hover:text-slate-350'
          }`}
        >
          <Scale className="w-4 h-4" /> Calculadora Categoria
        </button>
      </div>

      {/* Conteúdo Renderizado da Aba Ativa */}
      <div className="animate-fade-in text-left">
        {activeTab === 'poster' && (
          <GraduationPoster 
            handlePrint={handlePrint} 
            handleDownloadPDF={handleDownloadPDF} 
          />
        )}

        {activeTab === 'rules' && (
          <GraduationRules 
            handleDownloadRulebook={handleDownloadRulebook} 
          />
        )}

        {activeTab === 'fouls' && (
          <FoulsTable />
        )}

        {activeTab === 'weights' && (
          <WeightTables />
        )}

        {activeTab === 'calculator-belts' && (
          <BeltCalculator />
        )}

        {activeTab === 'calculator-weights' && (
          <WeightCalculator />
        )}
      </div>
    </div>
  );
};
export default GraduationSystemPage;
