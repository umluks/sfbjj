import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Professor } from '../types';
import {
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  UserPlus,
  Shield,
  Phone,
  Eye,
  EyeOff
} from 'lucide-react';

export const TeacherManager: React.FC = () => {
  const [teachers, setTeachers] = useState<Professor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Professor | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<Professor | null>(null);

  const [formNome, setFormNome] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSenha, setFormSenha] = useState('');
  const [formTelefone, setFormTelefone] = useState('');
  const [formCbjj, setFormCbjj] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.substring(0, 11);
    if (val.length > 2) val = `(${val.substring(0, 2)}) ${val.substring(2)}`;
    if (val.length > 9) val = `${val.substring(0, 10)}-${val.substring(10)}`;
    setFormTelefone(val);
  };

  const handleCbjjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormCbjj(e.target.value.replace(/\D/g, ''));
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    const { data, error } = await supabase.from('professores').select('*').order('nome');
    if (!error && data) {
      setTeachers(data);
    }
  };

  const handleOpenCreate = () => {
    setEditingTeacher(null);
    setFormNome('');
    setFormEmail('');
    setFormSenha('');
    setFormTelefone('');
    setFormCbjj('');
    setShowFormModal(true);
  };

  const handleOpenEdit = (t: Professor) => {
    setEditingTeacher(t);
    setFormNome(t.nome);
    setFormEmail(t.email);
    setFormSenha(t.senha || '');
    setFormTelefone(t.telefone);
    setFormCbjj(t.cbjj || '');
    setShowFormModal(true);
  };

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome || !formEmail || !formSenha) return;

    const teacherData = {
      nome: formNome,
      email: formEmail,
      senha: formSenha,
      telefone: formTelefone,
      cbjj: formCbjj
    };

    if (editingTeacher) {
      const { error } = await supabase.from('professores').update(teacherData).eq('id', editingTeacher.id);
      if (!error) {
        setTeachers(prev => prev.map(t => t.id === editingTeacher.id ? { ...t, ...teacherData } as Professor : t));
      } else {
        alert('Erro ao atualizar professor.');
      }
    } else {
      const { data, error } = await supabase.from('professores').insert(teacherData).select().single();
      if (!error && data) {
        setTeachers(prev => [...prev, data]);
      } else {
        alert('Erro ao cadastrar professor.');
      }
    }
    setShowFormModal(false);
  };

  const confirmDelete = async () => {
    if (!teacherToDelete) return;
    const { error } = await supabase.from('professores').delete().eq('id', teacherToDelete.id);
    if (!error) {
      setTeachers(prev => prev.filter(t => t.id !== teacherToDelete.id));
    }
    setShowDeleteModal(false);
  };

  const filtered = teachers.filter(t => t.nome.toLowerCase().includes(searchQuery.toLowerCase()) || t.email.toLowerCase().includes(searchQuery.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-2">
            <Shield className="text-gold-500 w-8 h-8" /> Gestão de Professores
          </h1>
          <p className="text-slate-400 text-sm mt-1">Gerencie os professores e acessos ao sistema.</p>
        </div>
        <button onClick={handleOpenCreate} className="btn-gold flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Novo Professor
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
        <input type="text" placeholder="Buscar professor..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-premium pl-9 w-full sm:w-80" />
      </div>

      <div className="bg-obsidian-800/50 border border-obsidian-800/90 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-obsidian-750 text-xs font-bold uppercase tracking-wider text-slate-400 bg-obsidian-850/40">
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4">CBJJ</th>
              <th className="px-6 py-4">Email / Login</th>
              <th className="px-6 py-4">Contato</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-obsidian-750 text-sm text-slate-300">
            {paginated.map(t => (
              <tr key={t.id} className="hover:bg-obsidian-700/20">
                <td className="px-6 py-4 font-bold text-slate-100">{t.nome}</td>
                <td className="px-6 py-4">{t.cbjj || '-'}</td>
                <td className="px-6 py-4">{t.email}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-gold-500"/> {t.telefone || '-'}</div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleOpenEdit(t)} className="p-1.5 rounded bg-obsidian-850 hover:bg-obsidian-750 border border-obsidian-700 text-slate-300 hover:text-gold-500 transition-all mr-2"><Edit className="w-3.5 h-3.5" /></button>
                  <button onClick={() => { setTeacherToDelete(t); setShowDeleteModal(true); }} className="p-1.5 rounded bg-obsidian-850 hover:bg-red-500/10 border border-obsidian-700 hover:text-red-500 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-slate-500">Nenhum professor encontrado.</td></tr>}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-obsidian-750 bg-obsidian-850/20">
            <span className="text-xs text-slate-400">Página {currentPage} de {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn-obsidian py-1.5 px-2.5 text-xs"><ChevronLeft className="w-3.5 h-3.5" /> Ant</button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn-obsidian py-1.5 px-2.5 text-xs">Próx <ChevronRight className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        )}
      </div>

      {showFormModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-obsidian-850 border border-obsidian-700 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-100">{editingTeacher ? 'Editar Professor' : 'Novo Professor'}</h2>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-gold-500"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSaveTeacher} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase">Nome</label>
                <input type="text" value={formNome} onChange={e => setFormNome(e.target.value)} className="input-premium w-full" required />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase">Email (Login)</label>
                <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="input-premium w-full" required />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-bold uppercase">Senha</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={formSenha} onChange={e => setFormSenha(e.target.value)} className="input-premium w-full pr-10" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-slate-400 hover:text-gold-500 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 font-bold uppercase">Telefone</label>
                  <input type="text" value={formTelefone} onChange={handleTelefoneChange} placeholder="(00) 00000-0000" className="input-premium w-full" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-bold uppercase">Número de Cadastro CBJJ</label>
                  <input type="text" value={formCbjj} onChange={handleCbjjChange} placeholder="Ex: 123456" className="input-premium w-full" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowFormModal(false)} className="btn-obsidian">Cancelar</button>
                <button type="submit" className="btn-gold">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-obsidian-850 border border-obsidian-700 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-slate-100">Excluir Professor?</h3>
            <p className="text-sm text-slate-400 mt-2">Deseja remover {teacherToDelete?.nome}? Esta ação é irreversível.</p>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowDeleteModal(false)} className="btn-obsidian">Cancelar</button>
              <button onClick={confirmDelete} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-semibold text-xs">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
