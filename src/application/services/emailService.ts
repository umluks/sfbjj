import { supabase } from '@/infrastructure/lib/supabaseClient';

export interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
}

export interface EmailLogEntry {
  aluno_id?: number;
  email_destino: string;
  nome_usuario?: string;
  assunto: string;
  status: 'Sucesso' | 'Falha';
  erro?: string;
  enviado_por?: string;
}

export class EmailService {
  private senderEmail = 'nao-responder@sagradafamiliabjj.com.br';

  /**
   * Gera o template HTML simples, responsivo e profissional de e-mail de aprovação.
   */
  generateApprovalEmailHtml(nomeUsuario: string, platformUrl?: string): string {
    const baseUrl = platformUrl || import.meta.env.VITE_PLATFORM_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://sagradafamiliabjj.com.br');

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Conta Aprovada - Sagrada Família BJJ</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f17; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #0b0f17; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Container Principal -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #141b27; border-radius: 16px; border: 1px solid #243045; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          
          <!-- Header com Logo / Faixa Dourada -->
          <tr>
            <td align="center" style="padding: 32px 24px; background-color: #0f172a; border-bottom: 2px solid #d4af37;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="font-size: 24px; font-weight: 800; color: #f8fafc; letter-spacing: 2px; text-transform: uppercase;">
                    🥋 SAGRADA FAMÍLIA <span style="color: #d4af37;">BJJ</span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-size: 11px; color: #94a3b8; letter-spacing: 3px; text-transform: uppercase; margin-top: 4px;">
                    Jiu-Jitsu & High Performance
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Corpo da Mensagem -->
          <tr>
            <td style="padding: 36px 32px; color: #cbd5e1; font-size: 15px; line-height: 1.6;">
              <h1 style="font-size: 22px; font-weight: 700; color: #f8fafc; margin-top: 0; margin-bottom: 20px;">
                Olá, ${nomeUsuario}! 👋
              </h1>

              <p style="margin-top: 0; margin-bottom: 16px;">
                Temos o prazer de informar que a sua solicitação de cadastro no sistema da <strong>Sagrada Família BJJ</strong> foi analisada e <span style="color: #10b981; font-weight: 700;">APROVADA</span> com sucesso!
              </p>

              <div style="background-color: #1e293b; border-left: 4px solid #d4af37; border-radius: 8px; padding: 18px 20px; margin: 24px 0;">
                <p style="margin: 0; font-size: 14px; color: #e2e8f0; font-weight: 600;">
                  Seu status agora é <strong style="color: #10b981;">ATIVO</strong> e seu acesso à plataforma já está liberado.
                </p>
                <p style="margin: 8px 0 0 0; font-size: 13px; color: #94a3b8;">
                  Você pode fazer login utilizando seu <strong>CPF</strong> e a senha cadastrada no momento do registro.
                </p>
              </div>

              <!-- Botão de Ação CTA -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 32px; margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${baseUrl}" target="_blank" style="display: inline-block; padding: 16px 36px; background-color: #d4af37; color: #0f172a; text-decoration: none; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; border-radius: 10px; box-shadow: 0 4px 14px rgba(212, 175, 55, 0.35);">
                      Acessar a Plataforma
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-bottom: 0;">
                Caso tenha dúvidas ou precise de ajuda, entre em contato com a equipe de instrução ou administração da academia.
              </p>
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td align="center" style="padding: 24px; background-color: #0b0f17; border-top: 1px solid #1e293b; color: #64748b; font-size: 12px; line-height: 1.5;">
              <p style="margin: 0; margin-bottom: 6px; font-weight: 600; color: #94a3b8;">
                Sagrada Família Brasília Jiu-Jitsu
              </p>
              <p style="margin: 0;">
                Mensagem automática enviada por <span style="color: #cbd5e1;">${this.senderEmail}</span>.<br>
                Por favor, não responda diretamente a este e-mail.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Registra o log de envio (Sucesso ou Falha) na tabela `logs_envio_email` no Supabase.
   */
  private async recordLog(entry: EmailLogEntry): Promise<void> {
    try {
      const { error } = await supabase
        .from('logs_envio_email')
        .insert({
          aluno_id: entry.aluno_id || null,
          email_destino: entry.email_destino,
          nome_usuario: entry.nome_usuario || null,
          assunto: entry.assunto,
          status: entry.status,
          erro: entry.erro || null,
          enviado_por: entry.enviado_por || 'Sistema (Admin)'
        });

      if (error) {
        console.error('[EmailService] Erro ao gravar log de auditoria no Supabase:', error.message);
      }
    } catch (err: unknown) {
      console.error('[EmailService] Exceção ao gravar log de e-mail:', err);
    }
  }

  /**
   * Realiza o envio HTTP para o backend PHP da HostGator ou Supabase Edge Function.
   */
  async sendEmail(payload: SendEmailPayload): Promise<{ success: boolean; message?: string }> {
    const apiUrl = import.meta.env.VITE_EMAIL_API_URL || '/api/send-email.php';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || resData.message || `Erro HTTP ${response.status}`);
      }

      return { success: true, message: resData.message || 'E-mail enviado com sucesso' };
    } catch (err: unknown) {
      const primaryErrMessage = err instanceof Error ? err.message : String(err);
      // Tenta fallback para a Supabase Edge Function se o endpoint local/PHP não responder
      try {
        const { data: edgeData, error: edgeErr } = await supabase.functions.invoke('send-email', {
          body: payload
        });

        if (edgeErr || (edgeData && !edgeData.success)) {
          throw new Error(edgeErr?.message || edgeData?.error || primaryErrMessage);
        }

        return { success: true, message: 'E-mail enviado com sucesso via Supabase Edge Function' };
      } catch (fallbackErr: unknown) {
        const fallbackMsg = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
        throw new Error(fallbackMsg || primaryErrMessage || 'Falha ao conectar com o serviço de e-mail');
      }
    }
  }

  /**
   * Envia o e-mail de aprovação de cadastro para um aluno e registra a auditoria.
   */
  async sendApprovalEmail(
    aluno: { id: number; nome: string; email?: string },
    enviadoPor?: string
  ): Promise<{ success: boolean; message?: string }> {
    const targetEmail = aluno.email?.trim();
    const assunto = 'Sua conta foi aprovada! Bem-vindo à Sagrada Família BJJ 🥋';

    // Se o aluno não tiver e-mail cadastrado
    if (!targetEmail || !targetEmail.includes('@')) {
      const errorMsg = 'Aluno não possui e-mail de contato cadastrado ou e-mail é inválido.';
      console.warn(`[EmailService] Impossível enviar e-mail para o aluno ID ${aluno.id}: ${errorMsg}`);

      await this.recordLog({
        aluno_id: aluno.id,
        email_destino: targetEmail || 'não-cadastrado',
        nome_usuario: aluno.nome,
        assunto,
        status: 'Falha',
        erro: errorMsg,
        enviado_por: enviadoPor
      });

      return { success: false, message: errorMsg };
    }

    const htmlContent = this.generateApprovalEmailHtml(aluno.nome);

    try {
      const result = await this.sendEmail({
        to: targetEmail,
        subject: assunto,
        html: htmlContent
      });

      // Grava log de Sucesso
      await this.recordLog({
        aluno_id: aluno.id,
        email_destino: targetEmail,
        nome_usuario: aluno.nome,
        assunto,
        status: 'Sucesso',
        enviado_por: enviadoPor
      });

      console.log(`[EmailService] E-mail de aprovação enviado com sucesso para ${targetEmail} (Aluno: ${aluno.nome})`);
      return result;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`[EmailService] Falha ao enviar e-mail de aprovação para ${targetEmail}:`, errorMessage);

      // Grava log de Falha
      await this.recordLog({
        aluno_id: aluno.id,
        email_destino: targetEmail,
        nome_usuario: aluno.nome,
        assunto,
        status: 'Falha',
        erro: errorMessage,
        enviado_por: enviadoPor
      });

      return { success: false, message: errorMessage };
    }
  }

  /**
   * Gera o HTML para o e-mail de notificação de validação de técnica (aprovação ou rejeição).
   */
  generateTechniqueValidationEmailHtml(
    nomeUsuario: string,
    tituloPosicao: string,
    aprovada: boolean,
    feedback?: string
  ): string {
    const baseUrl = import.meta.env.VITE_PLATFORM_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://sagradafamiliabjj.com.br');

    const headerColor = aprovada ? '#10b981' : '#ef4444';
    const statusTag = aprovada
      ? '<span style="color: #10b981; font-weight: 800;">APROVADA</span>'
      : '<span style="color: #ef4444; font-weight: 800;">REJEITADA</span>';

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Validação de Posição - SFBJJ</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f17; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #0b0f17; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #141b27; border-radius: 16px; border: 1px solid #243045; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          <tr>
            <td align="center" style="padding: 32px 24px; background-color: #0f172a; border-bottom: 2px solid ${headerColor};">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="font-size: 22px; font-weight: 800; color: #f8fafc; letter-spacing: 2px; text-transform: uppercase;">
                    🥋 SAGRADA FAMÍLIA <span style="color: #d4af37;">BJJ</span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-size: 11px; color: #94a3b8; letter-spacing: 3px; text-transform: uppercase; margin-top: 4px;">
                    Biblioteca de Posições
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 32px; color: #cbd5e1; font-size: 15px; line-height: 1.6;">
              <h1 style="font-size: 20px; font-weight: 700; color: #f8fafc; margin-top: 0; margin-bottom: 20px;">
                Olá, ${nomeUsuario}! 👋
              </h1>
              <p style="margin-top: 0; margin-bottom: 16px;">
                Sua sugestão de posição "<strong>${tituloPosicao}</strong>" foi avaliada pela equipe de instrutores e foi ${statusTag}.
              </p>
              <div style="background-color: #1e293b; border-left: 4px solid ${headerColor}; border-radius: 8px; padding: 18px 20px; margin: 24px 0;">
                ${
                  aprovada
                    ? `<p style="margin: 0; font-size: 14px; color: #e2e8f0; font-weight: 600;">
                         🎉 Parabéns! Sua técnica foi validada e já está publicada na <strong>Biblioteca de Posições</strong> para todos os alunos.
                       </p>`
                    : `<p style="margin: 0; font-size: 14px; color: #e2e8f0; font-weight: 600;">
                         Sua posição não atendeu aos critérios para publicação no momento.
                       </p>
                       ${
                         feedback
                           ? `<p style="margin: 10px 0 0 0; font-size: 13px; color: #f87171; background-color: #451a1a; padding: 10px 12px; border-radius: 6px;">
                                💬 <strong>Motivo da equipe:</strong> ${feedback}
                              </p>`
                           : ''
                       }`
                }
              </div>
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 32px; margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${baseUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: #d4af37; color: #0f172a; text-decoration: none; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; border-radius: 10px;">
                      Acessar Biblioteca de Posições
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 24px; background-color: #0b0f17; border-top: 1px solid #1e293b; color: #64748b; font-size: 12px; line-height: 1.5;">
              <p style="margin: 0;">Sagrada Família Brasília Jiu-Jitsu • Notificação Automática</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Envia o e-mail de notificação de validação de posição para o aluno.
   */
  async sendTechniqueValidationEmail(
    aluno: { id: number; nome: string; email?: string },
    tituloPosicao: string,
    aprovada: boolean,
    feedback?: string,
    enviadoPor?: string
  ): Promise<{ success: boolean; message?: string }> {
    const targetEmail = aluno.email?.trim();
    const statusText = aprovada ? 'APROVADA ✅' : 'não aprovada ❌';
    const assunto = `Sua sugestão de posição "${tituloPosicao}" foi ${statusText}`;

    if (!targetEmail || !targetEmail.includes('@')) {
      const errorMsg = 'Aluno não possui e-mail de contato cadastrado ou e-mail é inválido.';
      await this.recordLog({
        aluno_id: aluno.id,
        email_destino: targetEmail || 'não-cadastrado',
        nome_usuario: aluno.nome,
        assunto,
        status: 'Falha',
        erro: errorMsg,
        enviado_por: enviadoPor
      });
      return { success: false, message: errorMsg };
    }

    const htmlContent = this.generateTechniqueValidationEmailHtml(
      aluno.nome,
      tituloPosicao,
      aprovada,
      feedback
    );

    try {
      const result = await this.sendEmail({
        to: targetEmail,
        subject: assunto,
        html: htmlContent
      });

      await this.recordLog({
        aluno_id: aluno.id,
        email_destino: targetEmail,
        nome_usuario: aluno.nome,
        assunto,
        status: 'Sucesso',
        enviado_por: enviadoPor
      });

      return result;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      await this.recordLog({
        aluno_id: aluno.id,
        email_destino: targetEmail,
        nome_usuario: aluno.nome,
        assunto,
        status: 'Falha',
        erro: errorMessage,
        enviado_por: enviadoPor
      });
      return { success: false, message: errorMessage };
    }
  }
}

export const emailService = new EmailService();
export default emailService;

