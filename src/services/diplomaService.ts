import { jsPDF } from 'jspdf';

/**
 * Converte a quantidade de graus (0 a 4) para algarismos romanos para exibição no diploma.
 */
export const getRomanDegrees = (graus: number): string => {
  switch (graus) {
    case 0:
      return 'GRAU INICIAL';
    case 1:
      return 'I GRAU';
    case 2:
      return 'II GRAUS';
    case 3:
      return 'III GRAUS';
    case 4:
      return 'IV GRAUS';
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

export const diplomaService = {
  /**
   * Gera o documento jsPDF formatado como diploma de graduação (orientação paisagem).
   */
  generateDiplomaPDF(
    studentName: string,
    novaFaixa: string,
    graus: number,
    dataGrad: string
  ): jsPDF {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const W = doc.internal.pageSize.getWidth(); // 297 mm
    const H = doc.internal.pageSize.getHeight(); // 210 mm

    // --- 1. Plano de Fundo Branco ---
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, W, H, 'F');

    // --- 2. Listras Decorativas nos Cantos (Laranja e Preto) ---
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

    // --- 3. Círculos de Marca D'água Concêntricos no Centro ---
    doc.setDrawColor(245, 245, 245);
    doc.setFillColor(252, 252, 252);
    doc.setLineWidth(1);
    doc.circle(W / 2, H / 2, 70, 'D');
    doc.circle(W / 2, H / 2, 60, 'D');

    // --- 4. Título Principal (SAGRADA FAMÍLIA) ---
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
    // Círculo Preto
    doc.setFillColor(30, 30, 30);
    doc.circle(badgeX, badgeY, badgeR, 'F');
    // Anel Laranja Interno
    doc.setDrawColor(230, 80, 40);
    doc.setLineWidth(0.8);
    doc.circle(badgeX, badgeY, badgeR - 1.5, 'D');
    // Sigla Central SF
    doc.setTextColor(255, 255, 255);
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.text('SF', badgeX, badgeY + 2.5, { align: 'center' });
    // Textos pequenininhos circulares
    doc.setFontSize(5);
    doc.text('LUCAS DOS ANJOS', badgeX, badgeY - 8, { align: 'center' });
    doc.text('BJJ BRASÍLIA', badgeX, badgeY + 9, { align: 'center' });

    // --- 6. Conteúdo Textual do Diploma ---
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(
      'A SAGRADA FAMÍLIA BRASÍLIA JIU-JITSU CONFERE A GRADUAÇÃO DE',
      W / 2,
      106,
      { align: 'center' }
    );

    // Graduação de Faixa e Graus
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    const beltText = `FAIXA ${novaFaixa.toUpperCase()} ${getRomanDegrees(graus)}`;
    doc.text(`${beltText}   AO ALUNO`, W / 2, 115, { align: 'center' });

    // Nome Completo do Graduado
    doc.setTextColor(15, 17, 23);
    doc.setFont('times', 'bold');
    doc.setFontSize(30);
    doc.text(studentName.toUpperCase(), W / 2, 132, { align: 'center' });

    // Divisor com Losango Centralizado
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.4);
    doc.line(W / 2 - 60, 138, W / 2 + 60, 138);

    doc.setFillColor(230, 80, 40); // Losango
    doc.triangle(W / 2, 136, W / 2 + 2, 138, W / 2, 140, 'F');
    doc.triangle(W / 2, 136, W / 2, 140, W / 2 - 2, 138, 'F');

    // Data de Outorga por extenso
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(
      `em graduação presencial realizada em ${formatDateLong(dataGrad)}`,
      W / 2,
      148,
      { align: 'center' }
    );

    // --- 7. Assinatura do Professor ---
    const sigY = 175;
    doc.setDrawColor(160, 160, 160);
    doc.setLineWidth(0.3);
    doc.line(W / 2 - 40, sigY, W / 2 + 40, sigY);

    // Assinatura Caligráfica do Professor
    doc.setTextColor(80, 80, 100);
    doc.setFont('times', 'italic');
    doc.setFontSize(14);
    doc.text('L. dos Anjos', W / 2, sigY - 2, { align: 'center' });

    // Nome e Registro
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('LUCAS SANTIAGO GONÇALVES DOS ANJOS', W / 2, sigY + 4, { align: 'center' });

    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('PROFESSOR', W / 2, sigY + 8, { align: 'center' });
    doc.text('Registro CBJJ - nº 41369', W / 2, sigY + 11, { align: 'center' });

    return doc;
  }
};
