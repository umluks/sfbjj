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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <Shield className="text-slate-400 w-6 h-6" /> Gestão de Professores
          </h1>
          <p className="text-slate-450 text-xs mt-1">Gerencie os professores e acessos ao sistema.</p>
        </div>
        <button onClick={handleOpenCreate} className="btn-gold text-[10px] uppercase font-black tracking-widest px-4 py-2 flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Novo Professor
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
        <input type="text" placeholder="Buscar professor..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input-premium pl-10 w-full sm:w-80" />
      </div>

      <div className="bg-obsidian-900/20 border border-obsidian-900/60 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-obsidian-850/80 text-[10px] font-bold uppercase tracking-widest text-slate-455 bg-obsidian-950/40">
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4">CBJJ</th>
              <th className="px-6 py-4">Email / Login</th>
              <th className="px-6 py-4">Contato</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-obsidian-900/40 text-xs text-slate-305">
            {paginated.map(t => (
              <tr key={t.id} className="hover:bg-obsidian-800/15 transition-colors group">
                <td className="px-6 py-4 font-bold text-slate-200 group-hover:text-slate-100 transition-colors">{t.nome}</td>
                <td className="px-6 py-4">{t.cbjj || '-'}</td>
                <td className="px-6 py-4 font-mono">{t.email}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-500"/> <span className="font-mono">{t.telefone || '-'}</span></div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button onClick={() => handleOpenEdit(t)} className="p-2 rounded bg-obsidian-950/80 hover:bg-obsidian-900 border border-obsidian-900 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => { setTeacherToDelete(t); setShowDeleteModal(true); }} className="p-2 rounded bg-obsidian-950/80 hover:bg-red-500/10 border border-obsidian-900 hover:border-red-500/20 text-slate-400 hover:text-red-400 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-slate-500 font-semibold uppercase tracking-wider">Nenhum professor encontrado.</td></tr>}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-obsidian-850/80 bg-obsidian-950/20">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Página {currentPage} de {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn-obsidian py-1.5 px-3 text-[10px] uppercase font-black tracking-widest"><ChevronLeft className="w-3.5 h-3.5" /> Ant</button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn-obsidian py-1.5 px-3 text-[10px] uppercase font-black tracking-widest">Próx <ChevronRight className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        )}
      </div>

      {showFormModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-obsidian-900/90 border border-obsidian-850 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold text-slate-100">{editingTeacher ? 'Editar Professor' : 'Novo Professor'}</h2>
              <button onClick={() => setShowFormModal(false)} className="text-slate-400 hover:text-slate-200"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSaveTeacher} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Nome</label>
                <input type="text" value={formNome} onChange={e => setFormNome(e.target.value)} className="input-premium w-full" required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Email (Login)</label>
                <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="input-premium w-full" required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Senha</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={formSenha} onChange={e => setFormSenha(e.target.value)} className="input-premium w-full pr-10" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-350 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Telefone</label>
                  <input type="text" value={formTelefone} onChange={handleTelefoneChange} placeholder="(00) 00000-0000" className="input-premium w-full" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Cadastro CBJJ</label>
                  <input type="text" value={formCbjj} onChange={handleCbjjChange} placeholder="Ex: 123456" className="input-premium w-full" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowFormModal(false)} className="btn-obsidian text-[10px] uppercase font-black tracking-widest px-4 py-2">Cancelar</button>
                <button type="submit" className="btn-gold text-[10px] uppercase font-black tracking-widest px-4 py-2">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-obsidian-900/90 border border-obsidian-850 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-base font-bold text-slate-100">Excluir Professor?</h3>
            <p className="text-xs text-slate-400 mt-2">Deseja remover {teacherToDelete?.nome}? Esta ação é irreversível.</p>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowDeleteModal(false)} className="btn-obsidian text-[10px] uppercase font-black tracking-widest px-4 py-2">Cancelar</button>
              <button onClick={confirmDelete} className="bg-red-650 hover:bg-red-500 text-white text-[10px] uppercase font-black tracking-widest px-4 py-2 rounded-lg">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
