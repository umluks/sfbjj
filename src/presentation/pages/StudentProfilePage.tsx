import React, { useState } from 'react';
import { User, ArrowLeft } from 'lucide-react';
import { useStudentProfilePage } from '@/presentation/hooks/useStudentProfilePage';
import { ProfileHeaderCard } from '@/presentation/components/profile/ProfileHeaderCard';
import { ProfileNavigationTabs, type ProfileTabType } from '@/presentation/components/profile/ProfileNavigationTabs';
import { PersonalInfoForm } from '@/presentation/components/profile/PersonalInfoForm';
import { SecurityCard } from '@/presentation/components/profile/SecurityCard';
import { GraduationTimelineView } from '@/presentation/components/profile/GraduationTimelineView';

interface StudentProfilePageProps {
  alunoId?: number;
  initialSubTab?: 'profile' | 'password' | 'graduacoes';
  hideSidebarMenu?: boolean;
}

export const StudentProfilePage: React.FC<StudentProfilePageProps> = ({
  alunoId,
  initialSubTab,
  hideSidebarMenu
}) => {
  const {
    student,
    effectiveStudent,
    historyEvents,
    loading,
    loggedUser,
    isEditingOtherStudent,
    isProfileOfStudent,
    profileName,
    profileAvatar,
    profileRole,
    ibjjfCategory,
    eligibility,
    lastTeacherName,
    getInitialFormData,
    handleSaveInfo,
    handleSavePassword,
    handleAddGraduacao,
    handleUpdateGraduacao,
    handleDeleteGraduacao
  } = useStudentProfilePage({ alunoId, initialSubTab });

  // Mapeamento das abas
  const mapInitialTab = (tab?: 'profile' | 'password' | 'graduacoes'): ProfileTabType => {
    if (tab === 'password') return 'security';
    if (tab === 'graduacoes') return 'graduacoes';
    return 'personal';
  };

  const [activeTab, setActiveTab] = useState<ProfileTabType>(mapInitialTab(initialSubTab));

  const handleEditClick = () => {
    setActiveTab('personal');
    const el = document.getElementById('section-profile-content');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3 min-h-[50vh]">
        <div className="w-9 h-9 border-3 border-gold-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-xs font-extrabold uppercase tracking-wider">Carregando perfil...</p>
      </div>
    );
  }

  const initialData = getInitialFormData();
  const ibjjfCategoryText = ibjjfCategory ? `${ibjjfCategory.category} • ${ibjjfCategory.weightClass.name}` : null;

  return (
    <div className="w-full max-w-[1200px] mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 animate-fade-in text-left pb-16 min-w-0 overflow-x-hidden">
      
      {/* Barra de Topo com Botão Voltar & Título */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 text-xs font-bold uppercase tracking-wider min-h-[44px] px-2 rounded-lg focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:outline-none transition-colors"
            aria-label="Voltar para a página anterior"
          >
            <ArrowLeft className="w-4 h-4 text-gold-500 shrink-0" />
            <span>Voltar</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-obsidian-850 pb-3">
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-slate-100 tracking-tight flex items-center gap-2.5">
              <User className="w-6 h-6 sm:w-8 sm:h-8 text-gold-500 shrink-0" />
              {hideSidebarMenu && activeTab === 'graduacoes' 
                ? 'Histórico de Graduações' 
                : isEditingOtherStudent 
                  ? 'Ficha do Aluno' 
                  : 'Meu Perfil'}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
              {isEditingOtherStudent 
                ? `Gerenciando ficha cadastral e situação de ${student?.nome || ''}` 
                : 'Gerencie seus dados pessoais, informações da academia e segurança.'}
            </p>
          </div>
        </div>
      </div>

      {/* Header Compacto Mobile First / Hero */}
      <ProfileHeaderCard
        student={student}
        effectiveStudent={effectiveStudent}
        profileName={profileName}
        profileAvatar={profileAvatar}
        profileRole={profileRole}
        onEditClick={handleEditClick}
      />

      {/* Navegação por Abas Limpa */}
      {!hideSidebarMenu && (
        <ProfileNavigationTabs
          activeSubTab={activeTab}
          onTabChange={setActiveTab}
          showGraduacoesTab={isProfileOfStudent && !!student}
        />
      )}

      {/* Conteúdo Central Responsivo */}
      <div id="section-profile-content" className="w-full max-w-full min-w-0 space-y-6">
        
        {/* Aba 1: Dados Pessoais (com Dados da Academia agrupados) */}
        {activeTab === 'personal' && (
          <div className="w-full space-y-6">
            <PersonalInfoForm
              initialData={initialData}
              role={loggedUser?.role || 'student'}
              isEditingOtherStudent={isEditingOtherStudent}
              onSave={handleSaveInfo}
              student={effectiveStudent || student || undefined}
              eligibility={eligibility}
              lastTeacherName={lastTeacherName}
              ibjjfCategoryText={ibjjfCategoryText}
            />
          </div>
        )}

        {/* Aba 4: Segurança & Senha */}
        {activeTab === 'security' && (
          <div className="w-full space-y-6">
            <SecurityCard
              onSavePassword={handleSavePassword}
              isAdminOverride={loggedUser?.role === 'admin'}
            />
          </div>
        )}

        {/* Aba 5: Linha do Tempo de Graduações */}
        {activeTab === 'graduacoes' && student && (
          <div className="bg-obsidian-900/60 border border-obsidian-850 p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl">
            <GraduationTimelineView
              student={student}
              history={historyEvents}
              canEdit={isProfileOfStudent}
              onAddGraduacao={handleAddGraduacao}
              onUpdateGraduacao={handleUpdateGraduacao}
              onDeleteGraduacao={handleDeleteGraduacao}
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentProfilePage;
