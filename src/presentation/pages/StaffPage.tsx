import React, { useState, useEffect } from 'react';
import { teacherService } from '@/application/services/teacherService';
import { adminService } from '@/application/services/adminService';
import type { Professor } from '@/domain/models/teacher';
import type { Administrador } from '@/domain/models/admin';
import { useAuth } from '@/application/hooks/useAuth';
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

type TabType = 'teachers' | 'admins';

export const StaffPage: React.FC = () => {
  const { loggedUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('teachers');

  // Estados de Professores
  const [teachers, setTeachers] = useState<Professor[]>([]);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherPage, setTeacherPage] = useState(1);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Professor | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<Professor | null>(null);

  // Campos do formulário de Professor
  const [teacherNome, setTeacherNome] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherSenha, setTeacherSenha] = useState('');
  const [teacherTelefone, setTeacherTelefone] = useState('');
  const [teacherCbjj, setTeacherCbjj] = useState('');
  const [teacherFoto, setTeacherFoto] = useState('');

  // Estados de Administradores
  const [admins, setAdmins] = useState<Administrador[]>([]);
  const [adminSearch, setAdminSearch] = useState('');
  const [adminPage, setAdminPage] = useState(1);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Administrador | null>(null);
  const [adminToDelete, setAdminToDelete] = useState<Administrador | null>(null);

  // Campos do formulário de Administrador
  const [adminNome, setAdminNome] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminSenha, setAdminSenha] = useState('');
  const [adminFoto, setAdminFoto] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 10;

  // Carrega os dados ao montar ou mudar a aba
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'teachers') {
        const data = await teacherService.getTeachers();
        setTeachers(data);
      } else {
        const data = await adminService.getAdmins();
        setAdmins(data);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Erro ao carregar dados.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.substring(0, 11);
    if (val.length > 2) val = `(${val.substring(0, 2)}) ${val.substring(2)}`;
    if (val.length > 9) val = `${val.substring(0, 10)}-${val.substring(10)}`;
    setTeacherTelefone(val);
  };

  // --- CONTROLES DE PROFESSORES ---
  const handleOpenCreateTeacher = () => {
    setEditingTeacher(null);
    setTeacherNome('');
    setTeacherEmail('');
    setTeacherSenha('');
    setTeacherTelefone('');
    setTeacherCbjj('');
    setTeacherFoto('');
    setShowPassword(false);
    setShowTeacherModal(true);
  };

  const handleOpenEditTeacher = (t: Professor) => {
    setEditingTeacher(t);
    setTeacherNome(t.nome);
    setTeacherEmail(t.email);
    setTeacherSenha(t.senha || '');
    setTeacherTelefone(t.telefone || '');
    setTeacherCbjj(t.cbjj || '');
    setTeacherFoto(t.foto_perfil || '');
    setShowPassword(false);
    setShowTeacherModal(true);
  };

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherNome || !teacherEmail || !teacherSenha) {
      alert('Preencha os campos obrigatórios (Nome, Email e Senha).');
      return;
    }

    const payload = {
      nome: teacherNome,
      email: teacherEmail.trim().toLowerCase(),
      senha: teacherSenha,
      telefone: teacherTelefone,
      cbjj: teacherCbjj,
      foto_perfil: teacherFoto
    };

    try {
      if (editingTeacher) {
        await teacherService.updateTeacher(editingTeacher.id, payload);
        alert('Professor atualizado com sucesso!');
      } else {
        await teacherService.createTeacher(payload);
        alert('Professor cadastrado com sucesso!');
      }
      setShowTeacherModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar professor.');
    }
  };

  const handleDeleteTeacher = async () => {
    if (!teacherToDelete) return;
    try {
      await teacherService.deleteTeacher(teacherToDelete.id);
      alert('Professor removido com sucesso!');
      setTeacherToDelete(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao remover professor.');
    }
  };

  // --- CONTROLES DE ADMINISTRADORES ---
  const handleOpenCreateAdmin = () => {
    setEditingAdmin(null);
    setAdminNome('');
    setAdminEmail('');
    setAdminSenha('');
    setAdminFoto('');
    setShowPassword(false);
    setShowAdminModal(true);
  };

  const handleOpenEditAdmin = (a: Administrador) => {
    setEditingAdmin(a);
    setAdminNome(a.nome);
    setAdminEmail(a.email);
    setAdminSenha(a.senha || '');
    setAdminFoto(a.foto_perfil || '');
    setShowPassword(false);
    setShowAdminModal(true);
  };

  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminNome || !adminEmail || !adminSenha) {
      alert('Preencha os campos obrigatórios (Nome, Email e Senha).');
      return;
    }

    const payload = {
      nome: adminNome,
      email: adminEmail.trim().toLowerCase(),
      senha: adminSenha,
      foto_perfil: adminFoto
    };

    try {
      if (editingAdmin) {
        await adminService.updateAdmin(editingAdmin.id, payload);
        alert('Administrador atualizado com sucesso!');
      } else {
        await adminService.createAdmin(payload);
        alert('Administrador cadastrado com sucesso!');
      }
      setShowAdminModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar administrador.');
    }
  };

  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return;
    
    if (loggedUser && loggedUser.role === 'admin' && loggedUser.adminId === adminToDelete.id) {
      alert('Ação bloqueada! Você não pode excluir a sua própria conta de administrador enquanto estiver logado.');
      setAdminToDelete(null);
      return;
    }

    try {
      await adminService.deleteAdmin(adminToDelete.id);
      alert('Administrador removido com sucesso!');
      setAdminToDelete(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao remover administrador.');
    }
  };

  // --- FILTROS E PAGINAÇÃO ---
  const filteredTeachers = teachers.filter(t =>
    t.nome.toLowerCase().includes(teacherSearch.toLowerCase()) ||
    t.email.toLowerCase().includes(teacherSearch.toLowerCase()) ||
    (t.cbjj || '').toLowerCase().includes(teacherSearch.toLowerCase())
  );
  const totalTeacherPages = Math.ceil(filteredTeachers.length / itemsPerPage) || 1;
  const teacherStartIndex = (teacherPage - 1) * itemsPerPage;
  const paginatedTeachers = filteredTeachers.slice(teacherStartIndex, teacherStartIndex + itemsPerPage);

  const filteredAdmins = admins.filter(a =>
    a.nome.toLowerCase().includes(adminSearch.toLowerCase()) ||
    a.email.toLowerCase().includes(adminSearch.toLowerCase())
  );
  const totalAdminPages = Math.ceil(filteredAdmins.length / itemsPerPage) || 1;
  const adminStartIndex = (adminPage - 1) * itemsPerPage;
  const paginatedAdmins = filteredAdmins.slice(adminStartIndex, adminStartIndex + itemsPerPage);

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <Shield className="text-slate-400 w-6 h-6 animate-pulse" /> Gestão de Equipe
          </h1>
          <p className="text-slate-450 text-xs mt-1">Gerencie os acessos de administradores e professores no sistema.</p>
        </div>
        {!(activeTab === 'admins' && loggedUser?.role !== 'admin') && (
          <button
            onClick={activeTab === 'teachers' ? handleOpenCreateTeacher : handleOpenCreateAdmin}
            className="btn-gold text-[10px] uppercase font-black tracking-widest px-4 py-2.5 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> Novo {activeTab === 'teachers' ? 'Professor' : 'Administrador'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-obsidian-850/80">
        <button
          onClick={() => setActiveTab('teachers')}
          className={`px-6 py-3 font-bold text-xs uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'teachers'
              ? 'border-gold-550 text-slate-100 bg-obsidian-900/10'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          Professores ({teachers.length})
        </button>
        <button
          onClick={() => setActiveTab('admins')}
          className={`px-6 py-3 font-bold text-xs uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'admins'
              ? 'border-gold-550 text-slate-100 bg-obsidian-900/10'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          Administradores ({admins.length})
        </button>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder={activeTab === 'teachers' ? 'Buscar professor por nome, e-mail ou CBJJ...' : 'Buscar administrador por nome ou e-mail...'}
          value={activeTab === 'teachers' ? teacherSearch : adminSearch}
          onChange={(e) => {
            if (activeTab === 'teachers') {
              setTeacherSearch(e.target.value);
              setTeacherPage(1);
            } else {
              setAdminSearch(e.target.value);
              setAdminPage(1);
            }
          }}
          className="input-premium pl-10 w-full sm:w-96"
        />
      </div>

      {/* Tabela */}
      <div className="bg-obsidian-900/20 border border-obsidian-900/60 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
        {isLoading ? (
          <div className="text-center py-12 text-slate-500 font-bold uppercase text-xs tracking-wider">
            Carregando dados da equipe...
          </div>
        ) : activeTab === 'teachers' ? (
          <>
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-obsidian-850/80 text-[10px] font-bold uppercase tracking-widest text-slate-455 bg-obsidian-950/40">
                  <th className="px-6 py-4">Foto / Avatar</th>
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">CBJJ</th>
                  <th className="px-6 py-4">Email / Login</th>
                  <th className="px-6 py-4">Contato</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-obsidian-900/40 text-xs text-slate-305">
                {paginatedTeachers.map(t => (
                  <tr key={t.id} className="hover:bg-obsidian-800/15 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="w-8 h-8 rounded-xl overflow-hidden border border-gold-550/20 bg-obsidian-950 flex items-center justify-center text-base shadow-inner shrink-0 select-none">
                        {t.foto_perfil ? (
                          t.foto_perfil.length <= 2 ? (
                            <span>{t.foto_perfil}</span>
                          ) : (
                            <img src={t.foto_perfil} alt={t.nome} className="w-full h-full object-cover" />
                          )
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">{t.nome.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-200 group-hover:text-slate-100 transition-colors">
                      {t.nome}
                    </td>
                    <td className="px-6 py-4 font-mono">{t.cbjj || '-'}</td>
                    <td className="px-6 py-4 font-mono">{t.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-mono">{t.telefone || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditTeacher(t)}
                          className="p-2 rounded bg-obsidian-950/80 hover:bg-obsidian-900 border border-obsidian-900 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all"
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setTeacherToDelete(t)}
                          className="p-2 rounded bg-obsidian-950/80 hover:bg-red-500/10 border border-obsidian-900 hover:border-red-500/20 text-slate-400 hover:text-red-400 transition-all"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedTeachers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500 font-semibold uppercase tracking-wider">
                      Nenhum professor encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {totalTeacherPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-obsidian-850/80 bg-obsidian-950/20">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Página {teacherPage} de {totalTeacherPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setTeacherPage(p => Math.max(1, p - 1))} disabled={teacherPage === 1} className="btn-obsidian py-1.5 px-3 text-[10px] uppercase font-black tracking-widest"><ChevronLeft className="w-3.5 h-3.5" /> Ant</button>
                  <button onClick={() => setTeacherPage(p => Math.min(totalTeacherPages, p + 1))} disabled={teacherPage === totalTeacherPages} className="btn-obsidian py-1.5 px-3 text-[10px] uppercase font-black tracking-widest">Próx <ChevronRight className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-obsidian-850/80 text-[10px] font-bold uppercase tracking-widest text-slate-455 bg-obsidian-950/40">
                  <th className="px-6 py-4">Foto / Avatar</th>
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">Email / Login</th>
                  {loggedUser?.role === 'admin' && <th className="px-6 py-4 text-right">Ações</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-obsidian-900/40 text-xs text-slate-305">
                {paginatedAdmins.map(a => {
                  const isSelf = loggedUser && loggedUser.role === 'admin' && loggedUser.adminId === a.id;
                  return (
                    <tr key={a.id} className="hover:bg-obsidian-800/15 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="w-8 h-8 rounded-xl overflow-hidden border border-gold-550/20 bg-obsidian-950 flex items-center justify-center text-base shadow-inner shrink-0 select-none">
                          {a.foto_perfil ? (
                            a.foto_perfil.length <= 2 ? (
                              <span>{a.foto_perfil}</span>
                            ) : (
                              <img src={a.foto_perfil} alt={a.nome} className="w-full h-full object-cover" />
                            )
                          ) : (
                            <span className="text-slate-550">🛡️</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-200 group-hover:text-slate-100 transition-colors">
                        <div className="flex items-center gap-2">
                          <span>{a.nome}</span>
                          {isSelf && (
                            <span className="text-[9px] bg-gold-550/15 text-gold-450 border border-gold-500/20 px-2 py-0.5 rounded font-black tracking-widest uppercase">
                              Você
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono">{a.email}</td>
                      {loggedUser?.role === 'admin' && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditAdmin(a)}
                              className="p-2 rounded bg-obsidian-950/80 hover:bg-obsidian-900 border border-obsidian-900 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all"
                              title="Editar"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setAdminToDelete(a)}
                              className={`p-2 rounded bg-obsidian-950/80 hover:bg-red-500/10 border border-obsidian-900 hover:border-red-500/20 text-slate-400 hover:text-red-400 transition-all ${
                                isSelf ? 'opacity-40 cursor-not-allowed' : ''
                              }`}
                              title={isSelf ? 'Você não pode se excluir' : 'Excluir'}
                              disabled={!!isSelf}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
                {paginatedAdmins.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-slate-500 font-semibold uppercase tracking-wider">
                      Nenhum administrador encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {totalAdminPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-obsidian-850/80 bg-obsidian-950/20">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Página {adminPage} de {totalAdminPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setAdminPage(p => Math.max(1, p - 1))} disabled={adminPage === 1} className="btn-obsidian py-1.5 px-3 text-[10px] uppercase font-black tracking-widest"><ChevronLeft className="w-3.5 h-3.5" /> Ant</button>
                  <button onClick={() => setAdminPage(p => Math.min(totalAdminPages, p + 1))} disabled={adminPage === totalAdminPages} className="btn-obsidian py-1.5 px-3 text-[10px] uppercase font-black tracking-widest">Próx <ChevronRight className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* --- MODAL FORMULÁRIO PROFESSOR --- */}
      {showTeacherModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-obsidian-900/90 border border-obsidian-850 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold text-slate-100">{editingTeacher ? 'Editar Professor' : 'Novo Professor'}</h2>
              <button onClick={() => setShowTeacherModal(false)} className="text-slate-400 hover:text-slate-200"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSaveTeacher} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Nome Completo *</label>
                <input type="text" value={teacherNome} onChange={e => setTeacherNome(e.target.value)} className="input-premium w-full" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Email (Login) *</label>
                <input type="email" value={teacherEmail} onChange={e => setTeacherEmail(e.target.value)} className="input-premium w-full" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Senha *</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={teacherSenha} onChange={e => setTeacherSenha(e.target.value)} className="input-premium w-full pr-10" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-350 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Telefone</label>
                  <input type="text" value={teacherTelefone} onChange={handleTelefoneChange} placeholder="(00) 00000-0000" className="input-premium w-full" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Cadastro CBJJ</label>
                  <input type="text" value={teacherCbjj} onChange={e => setTeacherCbjj(e.target.value.replace(/\D/g, ''))} placeholder="Ex: 123456" className="input-premium w-full" />
                </div>
              </div>

              {/* Avatar Selector para Professor */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Avatar / Foto de Perfil</label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-gold-550/20 bg-obsidian-950 flex items-center justify-center text-xl shadow-inner select-none shrink-0">
                    {teacherFoto ? (
                      teacherFoto.length <= 2 ? (
                        <span>{teacherFoto}</span>
                      ) : (
                        <img src={teacherFoto} alt="Preview" className="w-full h-full object-cover" />
                      )
                    ) : (
                      <span className="text-slate-600">🥋</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-1.5">
                      <button type="button" onClick={() => setTeacherFoto('🥋')} className={`p-1 border rounded hover:bg-obsidian-750 ${teacherFoto === '🥋' ? 'border-gold-550 bg-gold-550/10' : 'border-obsidian-700'}`}>🥋</button>
                      <button type="button" onClick={() => setTeacherFoto('👨‍🏫')} className={`p-1 border rounded hover:bg-obsidian-750 ${teacherFoto === '👨‍🏫' ? 'border-gold-550 bg-gold-550/10' : 'border-obsidian-700'}`}>👨‍🏫</button>
                      <button type="button" onClick={() => setTeacherFoto('👤')} className={`p-1 border rounded hover:bg-obsidian-750 ${teacherFoto === '👤' ? 'border-gold-550 bg-gold-550/10' : 'border-obsidian-700'}`}>👤</button>
                      <button type="button" onClick={() => setTeacherFoto('⭐')} className={`p-1 border rounded hover:bg-obsidian-750 ${teacherFoto === '⭐' ? 'border-gold-550 bg-gold-550/10' : 'border-obsidian-700'}`}>⭐</button>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setTeacherFoto(event.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-[10px] text-slate-400 file:mr-2 file:py-0.5 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:bg-obsidian-800 file:text-slate-200 hover:file:bg-obsidian-750 file:cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-obsidian-850/55">
                <button type="button" onClick={() => setShowTeacherModal(false)} className="btn-obsidian text-[10px] uppercase font-black tracking-widest px-4 py-2">Cancelar</button>
                <button type="submit" className="btn-gold text-[10px] uppercase font-black tracking-widest px-4 py-2">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL FORMULÁRIO ADMINISTRADOR --- */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-obsidian-900/90 border border-obsidian-850 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold text-slate-100">{editingAdmin ? 'Editar Administrador' : 'Novo Administrador'}</h2>
              <button onClick={() => setShowAdminModal(false)} className="text-slate-400 hover:text-slate-200"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSaveAdmin} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Nome Completo *</label>
                <input type="text" value={adminNome} onChange={e => setAdminNome(e.target.value)} className="input-premium w-full" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Email (Login) *</label>
                <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} className="input-premium w-full" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Senha *</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={adminSenha} onChange={e => setAdminSenha(e.target.value)} className="input-premium w-full pr-10" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-350 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Avatar Selector para Admin */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Avatar / Foto de Perfil</label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-gold-550/20 bg-obsidian-950 flex items-center justify-center text-xl shadow-inner select-none shrink-0">
                    {adminFoto ? (
                      adminFoto.length <= 2 ? (
                        <span>{adminFoto}</span>
                      ) : (
                        <img src={adminFoto} alt="Preview" className="w-full h-full object-cover" />
                      )
                    ) : (
                      <span className="text-slate-650">🛡️</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-1.5">
                      <button type="button" onClick={() => setAdminFoto('🛡️')} className={`p-1 border rounded hover:bg-obsidian-750 ${adminFoto === '🛡️' ? 'border-gold-550 bg-gold-550/10' : 'border-obsidian-700'}`}>🛡️</button>
                      <button type="button" onClick={() => setAdminFoto('🥋')} className={`p-1 border rounded hover:bg-obsidian-750 ${adminFoto === '🥋' ? 'border-gold-550 bg-gold-550/10' : 'border-obsidian-700'}`}>🥋</button>
                      <button type="button" onClick={() => setAdminFoto('👤')} className={`p-1 border rounded hover:bg-obsidian-750 ${adminFoto === '👤' ? 'border-gold-550 bg-gold-550/10' : 'border-obsidian-700'}`}>👤</button>
                      <button type="button" onClick={() => setAdminFoto('⭐')} className={`p-1 border rounded hover:bg-obsidian-750 ${adminFoto === '⭐' ? 'border-gold-550 bg-gold-550/10' : 'border-obsidian-700'}`}>⭐</button>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setAdminFoto(event.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-[10px] text-slate-400 file:mr-2 file:py-0.5 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:bg-obsidian-800 file:text-slate-200 hover:file:bg-obsidian-750 file:cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-obsidian-850/55">
                <button type="button" onClick={() => setShowAdminModal(false)} className="btn-obsidian text-[10px] uppercase font-black tracking-widest px-4 py-2">Cancelar</button>
                <button type="submit" className="btn-gold text-[10px] uppercase font-black tracking-widest px-4 py-2">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL CONFIRMAÇÃO EXCLUSÃO PROFESSOR --- */}
      {teacherToDelete && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-obsidian-900/90 border border-obsidian-850 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-base font-bold text-slate-100">Excluir Professor?</h3>
            <p className="text-xs text-slate-400 mt-2">Deseja remover o professor <span className="text-gold-550 font-bold">{teacherToDelete.nome}</span>? Esta ação é irreversível.</p>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setTeacherToDelete(null)} className="btn-obsidian text-[10px] uppercase font-black tracking-widest px-4 py-2">Cancelar</button>
              <button onClick={handleDeleteTeacher} className="bg-red-650 hover:bg-red-500 text-white text-[10px] uppercase font-black tracking-widest px-4 py-2 rounded-lg">Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL CONFIRMAÇÃO EXCLUSÃO ADMINISTRADOR --- */}
      {adminToDelete && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-obsidian-900/90 border border-obsidian-850 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-base font-bold text-slate-100">Excluir Administrador?</h3>
            <p className="text-xs text-slate-400 mt-2">Deseja remover o administrador <span className="text-gold-550 font-bold">{adminToDelete.nome}</span>? Esta ação é irreversível.</p>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setAdminToDelete(null)} className="btn-obsidian text-[10px] uppercase font-black tracking-widest px-4 py-2">Cancelar</button>
              <button onClick={handleDeleteAdmin} className="bg-red-650 hover:bg-red-500 text-white text-[10px] uppercase font-black tracking-widest px-4 py-2 rounded-lg">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default StaffPage;
