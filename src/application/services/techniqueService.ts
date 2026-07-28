import { TechniqueRepository } from '@/infrastructure/repositories/techniqueRepository';
import type { Technique } from '@/domain/models/technique';
import { notificationService } from './notificationService';
import { emailService } from './emailService';
import { studentService } from './studentService';

export class TechniqueService {
  private techniqueRepo = new TechniqueRepository();

  async getTechniques(statusFilter?: 'aprovado' | 'pendente' | 'rejeitado' | 'todos'): Promise<Technique[]> {
    return this.techniqueRepo.getTechniques(statusFilter);
  }

  async createTechnique(technique: Omit<Technique, 'id' | 'created_at'>): Promise<Technique> {
    return this.techniqueRepo.createTechnique(technique);
  }

  async validateTechnique(
    id: number,
    status: 'aprovado' | 'rejeitado',
    feedback?: string,
    adminName?: string
  ): Promise<Technique> {
    const validatedTech = await this.techniqueRepo.validateTechnique(id, status, feedback, adminName);

    // Se a posição pertencer a um aluno, gera a notificação (in-app e por e-mail)
    if (validatedTech.aluno_id) {
      const isApproved = status === 'aprovado';
      const titulo = isApproved ? 'Posição Aprovada! 🎉' : 'Atualização sobre sua Posição 🥋';
      const mensagem = isApproved
        ? `Sua sugestão de posição "${validatedTech.titulo}" foi APROVADA e já está disponível na biblioteca!`
        : `Sua sugestão de posição "${validatedTech.titulo}" não foi aprovada. ${feedback ? `Motivo: ${feedback}` : ''}`;

      // 1. Notificação In-App
      try {
        await notificationService.createNotification({
          aluno_id: validatedTech.aluno_id,
          titulo,
          mensagem,
          tipo: isApproved ? 'posicao_aprovada' : 'posicao_rejeitada',
          tecnica_id: validatedTech.id
        });
      } catch (notifErr) {
        console.error('[TechniqueService] Erro ao criar notificação in-app:', notifErr);
      }

      // 2. Notificação por E-mail (assíncrona para não travar a UI)
      try {
        const student = await studentService.getStudentById(validatedTech.aluno_id);
        if (student && student.email) {
          emailService.sendTechniqueValidationEmail(
            { id: student.id, nome: student.nome, email: student.email },
            validatedTech.titulo,
            isApproved,
            feedback,
            adminName
          ).catch(err => console.error('[TechniqueService] Erro ao enviar e-mail de validação:', err));
        }
      } catch (emailErr) {
        console.error('[TechniqueService] Erro ao carregar dados do aluno para e-mail:', emailErr);
      }
    }

    return validatedTech;
  }

  async updateTechnique(id: number, technique: Partial<Technique>): Promise<void> {
    return this.techniqueRepo.updateTechnique(id, technique);
  }

  async deleteTechnique(id: number): Promise<void> {
    return this.techniqueRepo.deleteTechnique(id);
  }
}

export const techniqueService = new TechniqueService();
export default techniqueService;
