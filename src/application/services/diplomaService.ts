import { jsPDF } from 'jspdf';
import type { Belt } from '@/domain/models/student';

/**
 * Converte a quantidade de graus (0 a 4) para algarismos romanos para exibição no diploma.
 */
export const getRomanDegrees = (graus: number): string => {
  switch (graus) {
    case 1:
      return ' I GRAU';
    case 2:
      return ' II GRAUS';
    case 3:
      return ' III GRAUS';
    case 4:
      return ' IV GRAUS';
    default:
      return '';
  }
};

/**
 * Converte data ISO (YYYY-MM-DD) para formato extenso (ex: 26 de junho de 2026).
 */
export const formatDateLong = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const day = parseInt(parts[2], 10);
  const monthIndex = parseInt(parts[1], 10) - 1;
  const year = parts[0];
  const months = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro'
  ];
  return `${day.toString().padStart(2, '0')} de ${months[monthIndex]} de ${year}`;
};

export interface DiplomaPrintOptions {
  backgroundTemplate?: string | null;
  keepDefaultTitles?: boolean;
  keepDefaultDecoration?: boolean;
  textoLinha1?: string;
  textoLinha3?: string;
  textoDataPrefix?: string;
  signatories?: Array<{
    nome: string;
    cbjj?: string;
    role?: string;
    assinatura?: string;
  }>;
}

export class DiplomaService {
  /**
   * Desenha uma única página de diploma no documento fornecido.
   */
  private drawDiplomaPage(
    doc: jsPDF,
    studentName: string,
    novaFaixa: string,
    graus: number,
    dataGrad: string,
    options?: DiplomaPrintOptions
  ): void {
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();

    const bgTemplate = options?.backgroundTemplate ?? null;
    const keepTitles = options?.keepDefaultTitles ?? true;
    const keepDecor = options?.keepDefaultDecoration ?? false;

    // --- 1. Plano de Fundo ---
    if (bgTemplate) {
      try {
        // Desenha o template customizado
        doc.addImage(bgTemplate, 'JPEG', 0, 0, W, H);
      } catch (err) {
        console.error('Erro ao adicionar imagem de fundo ao PDF:', err);
        // Fallback para plano de fundo branco
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, W, H, 'F');
      }
    } else {
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, W, H, 'F');
    }

    // --- 2. Listras Decorativas nos Cantos e Marcas d'água ---
    if (!bgTemplate || keepDecor) {
      // Canto Superior Esquerdo
      doc.setFillColor(30, 30, 30);
      doc.triangle(0, 0, 45, 0, 0, 45, 'F');
      doc.setFillColor(230, 80, 40);
      doc.triangle(49, 0, 58, 0, 0, 58, 'F');
      doc.triangle(49, 0, 0, 58, 0, 49, 'F');
      doc.triangle(63, 0, 66, 0, 0, 66, 'F');
      doc.triangle(63, 0, 0, 66, 0, 63, 'F');

      // Canto Inferior Direito
      doc.setFillColor(30, 30, 30);
      doc.triangle(W, H, W - 45, H, W, H - 45, 'F');
      doc.setFillColor(230, 80, 40);
      doc.triangle(W - 49, H, W - 58, H, W, H - 58, 'F');
      doc.triangle(W - 49, H, W, H - 58, W, H - 49, 'F');
      doc.triangle(W - 63, H, W - 66, H, W, H - 66, 'F');
      doc.triangle(W - 63, H, W, H - 66, W, H - 63, 'F');

      // Concentric circles
      doc.setDrawColor(245, 245, 245);
      doc.setFillColor(252, 252, 252);
      doc.setLineWidth(1);
      doc.circle(W / 2, H / 2, 70, 'D');
      doc.circle(W / 2, H / 2, 60, 'D');
    }

    // --- 4. Título Principal (SAGRADA FAMÍLIA) ---
    if (!bgTemplate || keepTitles) {
      doc.setTextColor(30, 30, 30);
      doc.setFont('times', 'bold');
      doc.setFontSize(32);
      doc.text('SAGRADA FAMÍLIA', W / 2, 36, { align: 'center' });

      // Sub-título JIU-JITSU
      doc.setTextColor(230, 80, 40);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('— JIU-JITSU —', W / 2, 45, { align: 'center' });

      // --- 5. Emblema Circular Central ---
      const badgeX = W / 2;
      const badgeY = 74;
      const badgeR = 15;
      doc.setFillColor(30, 30, 30);
      doc.circle(badgeX, badgeY, badgeR, 'F');
      doc.setDrawColor(230, 80, 40);
      doc.setLineWidth(0.8);
      doc.circle(badgeX, badgeY, badgeR - 1.5, 'D');
      doc.setTextColor(255, 255, 255);
      doc.setFont('times', 'bold');
      doc.setFontSize(14);
      doc.text('SF', badgeX, badgeY + 2.5, { align: 'center' });
      doc.setFontSize(5);
      doc.text('LUCAS DOS ANJOS', badgeX, badgeY - 8, { align: 'center' });
      doc.text('BJJ BRASÍLIA', badgeX, badgeY + 9, { align: 'center' });
    }

    // --- 6. Conteúdo Textual do Diploma ---
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    const line1Text = options?.textoLinha1 ?? 'A SAGRADA FAMILIA BRASÍLIA JIU-JITSU CONFERE A GRADUAÇÃO DE';
    doc.text(line1Text, W / 2, 103, { align: 'center' });

    // Graduação de Faixa e Graus
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    const beltText = `FAIXA ${novaFaixa.toUpperCase()}${getRomanDegrees(graus)}`;
    doc.text(beltText, W / 2, 112, { align: 'center' });

    // AO ALUNO
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    const line3Text = options?.textoLinha3 ?? 'AO ALUNO';
    doc.text(line3Text, W / 2, 120, { align: 'center' });

    // Nome Completo do Graduado
    doc.setTextColor(15, 17, 23);
    doc.setFont('times', 'bold');
    doc.setFontSize(30);
    doc.text(studentName.toUpperCase(), W / 2, 134, { align: 'center' });

    // Divisor com Losango Centralizado
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.4);
    doc.line(W / 2 - 60, 139, W / 2 + 60, 139);

    doc.setFillColor(230, 80, 40); // Losango
    doc.triangle(W / 2, 137, W / 2 + 2, 139, W / 2, 141, 'F');
    doc.triangle(W / 2, 137, W / 2, 141, W / 2 - 2, 139, 'F');

    // Data de Outorga por extenso
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    const datePrefix = options?.textoDataPrefix ?? 'em graduação presencial realizada em';
    doc.text(
      `${datePrefix} ${formatDateLong(dataGrad)}`,
      W / 2,
      148,
      { align: 'center' }
    );

    // --- 7. Assinaturas ---
    const sigY = 175;
    const signatories = options?.signatories || [];

    const drawSignature = (
      sig: { nome: string; cbjj?: string; role?: string; assinatura?: string },
      xPos: number
    ) => {
      // Linha de assinatura
      doc.setDrawColor(160, 160, 160);
      doc.setLineWidth(0.3);
      doc.line(xPos - 40, sigY, xPos + 40, sigY);

      if (sig.assinatura) {
        try {
          doc.addImage(sig.assinatura, 'PNG', xPos - 20, sigY - 16, 40, 15);
        } catch (err) {
          console.error('Erro ao adicionar imagem de assinatura:', err);
          doc.setTextColor(80, 80, 100);
          doc.setFont('times', 'italic');
          doc.setFontSize(14);
          doc.text(sig.nome, xPos, sigY - 2, { align: 'center' });
        }
      } else {
        doc.setTextColor(80, 80, 100);
        doc.setFont('times', 'italic');
        doc.setFontSize(14);
        doc.text(sig.nome, xPos, sigY - 2, { align: 'center' });
      }

      doc.setTextColor(30, 30, 30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(sig.nome.toUpperCase(), xPos, sigY + 4, { align: 'center' });

      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const roleText = (sig.role || 'PROFESSOR').toUpperCase();
      doc.text(roleText, xPos, sigY + 8, { align: 'center' });

      if (sig.cbjj) {
        doc.text(`Registro CBJJ - nº ${sig.cbjj}`, xPos, sigY + 11, { align: 'center' });
      }
    };

    if (signatories.length > 0) {
      const N = signatories.length;
      signatories.forEach((sig, index) => {
        // index 0 = first signatory = rightmost
        const posIndex = N - index;
        const xPos = (posIndex * W) / (N + 1);
        drawSignature(sig, xPos);
      });
    } else {
      // Fallback padrão original (Lucas dos Anjos)
      doc.setDrawColor(160, 160, 160);
      doc.setLineWidth(0.3);
      doc.line(W / 2 - 40, sigY, W / 2 + 40, sigY);

      doc.setTextColor(80, 80, 100);
      doc.setFont('times', 'italic');
      doc.setFontSize(14);
      doc.text('L. dos Anjos', W / 2, sigY - 2, { align: 'center' });

      doc.setTextColor(30, 30, 30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('LUCAS SANTIAGO GONÇALVES DOS ANJOS', W / 2, sigY + 4, { align: 'center' });

      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('PROFESSOR', W / 2, sigY + 8, { align: 'center' });
      doc.text('Registro CBJJ - nº 41369', W / 2, sigY + 11, { align: 'center' });
    }
  }

  /**
   * Gera o documento jsPDF formatado como diploma de graduação (orientação paisagem).
   */
  generateDiplomaPDF(
    studentName: string,
    novaFaixa: string,
    graus: number,
    dataGrad: string,
    options?: DiplomaPrintOptions
  ): jsPDF {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    this.drawDiplomaPage(doc, studentName, novaFaixa, graus, dataGrad, options);
    return doc;
  }

  /**
   * Gera um PDF consolidado com múltiplas páginas de diplomas de alunos.
   */
  generateConsolidatedDiplomaPDF(
    studentsData: Array<{ nome: string; faixa: string; graus: number; data: string }>,
    options?: DiplomaPrintOptions
  ): jsPDF {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    studentsData.forEach((student, index) => {
      if (index > 0) {
        doc.addPage();
      }
      this.drawDiplomaPage(doc, student.nome, student.faixa, student.graus, student.data, options);
    });

    return doc;
  }
}

export const getBjjAge = (birthDateStr: string): number => {
  if (!birthDateStr) return 0;
  const birthYear = new Date(birthDateStr).getFullYear();
  return new Date().getFullYear() - birthYear;
};

export const getBeltsByAge = (birthDateStr: string): Belt[] => {
  const age = getBjjAge(birthDateStr);
  if (age < 16) {
    return ['Branca', 'Cinza', 'Amarela', 'Laranja', 'Verde'];
  }
  return ['Branca', 'Azul', 'Roxa', 'Marrom', 'Preta'];
};

export const diplomaService = new DiplomaService();

export default diplomaService;
