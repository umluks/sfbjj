/**
 * Gerador de QR Code e código de validação pública de diplomas/certificados de graduação SFBJJ.
 */
export class QrValidationService {
  /**
   * Gera um hash único de validação para o certificado de graduação.
   */
  public static generateValidationCode(alunoId: number, faixa: string, graus: number, data: string): string {
    const raw = `SFBJJ-${alunoId}-${faixa.toUpperCase().replace(/\s+/g, '')}-${graus}-${data.replace(/-/g, '')}`;
    return raw;
  }

  /**
   * Gera a URL pública de validação de autenticidade.
   */
  public static getValidationUrl(validationCode: string): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://sagradafamiliabjj.com.br';
    return `${baseUrl}/validar-diploma?codigo=${encodeURIComponent(validationCode)}`;
  }
}
