import React, { useState } from 'react';
import { Layers, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import type { Turma } from '../../types';

interface ClassManagerProps {
  turmas: Turma[];
  setTurmas: React.Dispatch<React.SetStateAction<Turma[]>>;
}

const CATEGORIES = ['Infantil', 'Adulto Iniciante', 'Adulto', 'Avançado', 'Open Match', 'No-Gi'] as const;

export const ClassManager: React.FC<ClassManagerProps> = ({ turmas, setTurmas }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState<Turma['categoria']>('Adulto');

  const openModal = (t?: Turma) => {
    if (t) {
      setEditingId(t.id);
      setNome(t.nome);
      setCategoria(t.categoria);
    } else {
      setEditingId(null);
      setNome('');
      setCategoria('Adulto');
    }
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setTurmas(prev => prev.map(t => 
        t.id === editingId ? { ...t, nome, categoria } : t
      ));
    } else {
      setTurmas(prev => [...prev, {
        id: Date.now(),
        nome,
        categoria
      }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja remover esta turma? Aulas associadas podem ser afetadas.')) {
      setTurmas(prev => prev.filter(t => t.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Gerenciar Turmas
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Cadastre as turmas.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-gold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Turma
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {turmas.map(t => (
          <div key={t.id} className="card-premium p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-obsidian-750 pb-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-obsidian-800 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-gold-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-200">{t.nome}</h3>
                    <span className="text-xs text-slate-400 block font-black uppercase tracking-wider">{t.categoria}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-obsidian-800 pt-3">
              <button onClick={() => openModal(t)} className="p-2 bg-obsidian-850 hover:bg-obsidian-800 text-slate-300 rounded transition-colors">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(t.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        {turmas.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500">
            Nenhuma turma cadastrada ainda.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-obsidian-850 border border-obsidian-700 rounded-2xl w-full max-w-md shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-obsidian-750 bg-obsidian-850 rounded-t-2xl">
              <h2 className="text-md font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-gold-500" />
                {editingId ? 'Editar Turma' : 'Nova Turma'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-gold-500 p-1 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Nome da Turma</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Adulto Terça e Quinta"
                  className="input-premium w-full bg-obsidian-950"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Categoria</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as Turma['categoria'])}
                  className="input-premium w-full bg-obsidian-950"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="mt-4 pt-4 border-t border-obsidian-750 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-obsidian px-4 py-2 text-xs">Cancelar</button>
                <button type="submit" className="btn-gold px-4 py-2 text-xs flex items-center gap-2">
                  <Check className="w-3.5 h-3.5" />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
