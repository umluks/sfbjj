import type { Belt, Degree } from '@/domain/models/student';
import type { GraduationRule } from '@/domain/models/graduation';
import { BELT_RANKS, getBeltRank } from '@/constants';
import { getBjjAge } from '@/application/services/diplomaService';

/**
 * Motor de Regras Oficiais de Graduação do Jiu-Jitsu (IBJJF / CBJJ + Metodologia SFBJJ)
 */
export class GraduationRulesEngine {
  /**
   * Tabela de regras de requisitos mínimos e limites por Faixa
   */
  private static readonly RULES_BY_BELT: Record<string, GraduationRule> = {
    // Adultos (a partir de 16 anos)
    'Branca': {
      faixa: 'Branca',
      idadeMinimaAnos: 4,
      tempoMinimoMeses: 0,
      quantidadeMinimaAulas: 30,
      frequenciaMinimaPercentual: 70,
      maxGraus: 4,
      faixasAnterioresPermitidas: []
    },
    'Azul': {
      faixa: 'Azul',
      idadeMinimaAnos: 16,
      tempoMinimoMeses: 24, // 2 anos na branca (ou transição kids)
      quantidadeMinimaAulas: 120,
      frequenciaMinimaPercentual: 75,
      maxGraus: 4,
      faixasAnterioresPermitidas: ['Branca', 'Verde', 'Verde e preta', 'Verde e branca', 'Laranja', 'Laranja e preta']
    },
    'Roxa': {
      faixa: 'Roxa',
      idadeMinimaAnos: 16,
      tempoMinimoMeses: 18, // 1.5 anos na azul (Artigo 3.1.3 IBJJF)
      quantidadeMinimaAulas: 180,
      frequenciaMinimaPercentual: 75,
      maxGraus: 4,
      faixasAnterioresPermitidas: ['Azul']
    },
    'Marrom': {
      faixa: 'Marrom',
      idadeMinimaAnos: 18, // elegível a partir dos 18 anos
      tempoMinimoMeses: 12, // 1 ano na roxa (Artigo 3.1.3 IBJJF)
      quantidadeMinimaAulas: 200,
      frequenciaMinimaPercentual: 80,
      maxGraus: 4,
      faixasAnterioresPermitidas: ['Roxa']
    },
    'Preta': {
      faixa: 'Preta',
      idadeMinimaAnos: 19,
      tempoMinimoMeses: 12, // 1 ano na marrom (Artigo 3.1.3 IBJJF)
      quantidadeMinimaAulas: 240,
      frequenciaMinimaPercentual: 80,
      maxGraus: 6,
      faixasAnterioresPermitidas: ['Marrom']
    },
    'Vermelha e preta': {
      faixa: 'Vermelha e preta',
      idadeMinimaAnos: 49, // Artigo 2.1.2 VI da IBJJF
      tempoMinimoMeses: 360, // 30 anos como faixa preta
      quantidadeMinimaAulas: 0,
      frequenciaMinimaPercentual: 0,
      maxGraus: 7,
      faixasAnterioresPermitidas: ['Preta']
    },
    'Vermelha e branca': {
      faixa: 'Vermelha e branca',
      idadeMinimaAnos: 56, // Artigo 2.1.2 VII da IBJJF
      tempoMinimoMeses: 84, // 7 anos na vermelha e preta
      quantidadeMinimaAulas: 0,
      frequenciaMinimaPercentual: 0,
      maxGraus: 8,
      faixasAnterioresPermitidas: ['Vermelha e preta']
    },
    'Vermelha': {
      faixa: 'Vermelha',
      idadeMinimaAnos: 66, // Artigo 2.1.2 VIII da IBJJF
      tempoMinimoMeses: 120, // 10 anos na vermelha e branca
      quantidadeMinimaAulas: 0,
      frequenciaMinimaPercentual: 0,
      maxGraus: 10,
      faixasAnterioresPermitidas: ['Vermelha e branca']
    },
    // Infantis (04 a 15 anos)
    'Cinza e branca': {
      faixa: 'Cinza e branca',
      idadeMinimaAnos: 4,
      tempoMinimoMeses: 6,
      quantidadeMinimaAulas: 24,
      frequenciaMinimaPercentual: 70,
      maxGraus: 4,
      faixasAnterioresPermitidas: ['Branca']
    },
    'Cinza': {
      faixa: 'Cinza',
      idadeMinimaAnos: 4,
      tempoMinimoMeses: 6,
      quantidadeMinimaAulas: 24,
      frequenciaMinimaPercentual: 70,
      maxGraus: 4,
      faixasAnterioresPermitidas: ['Branca', 'Cinza e branca']
    },
    'Cinza e preta': {
      faixa: 'Cinza e preta',
      idadeMinimaAnos: 4,
      tempoMinimoMeses: 6,
      quantidadeMinimaAulas: 24,
      frequenciaMinimaPercentual: 70,
      maxGraus: 4,
      faixasAnterioresPermitidas: ['Cinza', 'Cinza e branca']
    },
    'Amarela e branca': {
      faixa: 'Amarela e branca',
      idadeMinimaAnos: 7,
      tempoMinimoMeses: 6,
      quantidadeMinimaAulas: 30,
      frequenciaMinimaPercentual: 70,
      maxGraus: 4,
      faixasAnterioresPermitidas: ['Branca', 'Cinza e preta', 'Cinza']
    },
    'Amarela': {
      faixa: 'Amarela',
      idadeMinimaAnos: 7,
      tempoMinimoMeses: 6,
      quantidadeMinimaAulas: 30,
      frequenciaMinimaPercentual: 70,
      maxGraus: 4,
      faixasAnterioresPermitidas: ['Amarela e branca', 'Cinza e preta']
    },
    'Amarela e preta': {
      faixa: 'Amarela e preta',
      idadeMinimaAnos: 7,
      tempoMinimoMeses: 6,
      quantidadeMinimaAulas: 30,
      frequenciaMinimaPercentual: 70,
      maxGraus: 4,
      faixasAnterioresPermitidas: ['Amarela', 'Amarela e branca']
    },
    'Laranja e branca': {
      faixa: 'Laranja e branca',
      idadeMinimaAnos: 10,
      tempoMinimoMeses: 6,
      quantidadeMinimaAulas: 36,
      frequenciaMinimaPercentual: 75,
      maxGraus: 4,
      faixasAnterioresPermitidas: ['Amarela e preta', 'Amarela']
    },
    'Laranja': {
      faixa: 'Laranja',
      idadeMinimaAnos: 10,
      tempoMinimoMeses: 6,
      quantidadeMinimaAulas: 36,
      frequenciaMinimaPercentual: 75,
      maxGraus: 4,
      faixasAnterioresPermitidas: ['Laranja e branca', 'Amarela e preta']
    },
    'Laranja e preta': {
      faixa: 'Laranja e preta',
      idadeMinimaAnos: 10,
      tempoMinimoMeses: 6,
      quantidadeMinimaAulas: 36,
      frequenciaMinimaPercentual: 75,
      maxGraus: 4,
      faixasAnterioresPermitidas: ['Laranja', 'Laranja e branca']
    },
    'Verde e branca': {
      faixa: 'Verde e branca',
      idadeMinimaAnos: 13,
      tempoMinimoMeses: 6,
      quantidadeMinimaAulas: 40,
      frequenciaMinimaPercentual: 75,
      maxGraus: 4,
      faixasAnterioresPermitidas: ['Laranja e preta', 'Laranja']
    },
    'Verde': {
      faixa: 'Verde',
      idadeMinimaAnos: 13,
      tempoMinimoMeses: 6,
      quantidadeMinimaAulas: 40,
      frequenciaMinimaPercentual: 75,
      maxGraus: 4,
      faixasAnterioresPermitidas: ['Verde e branca', 'Laranja e preta']
    },
    'Verde e preta': {
      faixa: 'Verde e preta',
      idadeMinimaAnos: 13,
      tempoMinimoMeses: 6,
      quantidadeMinimaAulas: 40,
      frequenciaMinimaPercentual: 75,
      maxGraus: 4,
      faixasAnterioresPermitidas: ['Verde', 'Verde e branca']
    }
  };

  /**
   * Retorna a regra cadastrada para determinada faixa.
   */
  public static getRuleForBelt(faixa: Belt): GraduationRule {
    return this.RULES_BY_BELT[faixa] || {
      faixa,
      idadeMinimaAnos: 4,
      tempoMinimoMeses: 6,
      quantidadeMinimaAulas: 30,
      frequenciaMinimaPercentual: 70,
      maxGraus: 4,
      faixasAnterioresPermitidas: []
    };
  }

  /**
   * Retorna o próximo passo natural de evolução (próxima faixa ou próximo grau na faixa atual).
   */
  public static getNextStep(faixaAtual: Belt, grauAtual: Degree): { novaFaixa: Belt; novoGrau: Degree } {
    if (faixaAtual === 'Preta') {
      if (grauAtual < 6) {
        return { novaFaixa: 'Preta', novoGrau: (grauAtual + 1) as Degree };
      }
      return { novaFaixa: 'Vermelha e preta', novoGrau: 7 as Degree };
    }

    if (faixaAtual === 'Vermelha e preta') {
      return { novaFaixa: 'Vermelha e branca', novoGrau: 8 as Degree };
    }

    if (faixaAtual === 'Vermelha e branca') {
      return { novaFaixa: 'Vermelha', novoGrau: 9 as Degree };
    }

    if (faixaAtual === 'Vermelha') {
      return { novaFaixa: 'Vermelha', novoGrau: 10 as Degree };
    }

    const rule = this.getRuleForBelt(faixaAtual);
    if (grauAtual < rule.maxGraus) {
      return { novaFaixa: faixaAtual, novoGrau: (grauAtual + 1) as Degree };
    }

    // Se já atingiu o máximo de graus da faixa atual, calcula a próxima faixa na hierarquia
    const currentRank = BELT_RANKS[faixaAtual] || 1;
    const allBelts = Object.keys(BELT_RANKS) as Belt[];
    const nextBelt = allBelts.find(b => BELT_RANKS[b] > currentRank) || faixaAtual;

    return { novaFaixa: nextBelt, novoGrau: 0 as Degree };
  }

  /**
   * Retorna a carência mínima em meses exigida pela IBJJF para a próxima etapa (grau ou faixa),
   * considerando faixas anteriores do atleta para concessão de descontos oficiais (Artigo 3.1.3 da IBJJF).
   */
  public static getMinPermanenceMonths(
    faixaAtual: Belt,
    _grauAtual: Degree,
    proximaFaixa: Belt,
    proximoGrau: Degree,
    historicoFaixas: Belt[] = []
  ): number {
    // 1. Promoção de Grau na mesma Faixa
    if (faixaAtual === proximaFaixa) {
      if (faixaAtual === 'Preta') {
        // Graus na Faixa Preta (Artigo 4.1.5 IBJJF):
        // 1º, 2º e 3º graus: 3 anos (36 meses) por grau
        // 4º, 5º e 6º graus: 5 anos (60 meses) por grau
        if (proximoGrau <= 3) return 36;
        if (proximoGrau <= 6) return 60;
        return 60;
      }
      if (faixaAtual === 'Vermelha e preta') return 84; // 7 anos (84 meses)
      if (faixaAtual === 'Vermelha e branca') return 84; // 7 anos (84 meses)
      if (faixaAtual === 'Vermelha') return 120; // 10 anos (120 meses)

      // Faixas regulares (Branca, Azul, Roxa, Marrom, Infantis)
      const rule = this.getRuleForBelt(faixaAtual);
      const totalMesesFaixa = this.getBeltBasePermanenceMonths(faixaAtual, historicoFaixas);
      return Math.max(3, Math.round(totalMesesFaixa / (rule.maxGraus || 4)));
    }

    // 2. Mudança de Faixa (Mudar de faixaAtual para proximaFaixa)
    return this.getBeltBasePermanenceMonths(proximaFaixa, historicoFaixas);
  }

  /**
   * Calcula o tempo base de permanência exigido em uma nova faixa considerando o histórico prévio (Artigo 3.1.3).
   */
  private static getBeltBasePermanenceMonths(novaFaixa: Belt, historicoFaixas: Belt[] = []): number {
    const normHistory = historicoFaixas.map(f => f.toLowerCase());
    const tinhaInfantil = normHistory.some(f => 
      f.includes('cinza') || f.includes('amarela') || f.includes('laranja')
    );
    const tinhaVerde = normHistory.some(f => f.includes('verde'));

    if (novaFaixa === 'Azul') {
      // Artigo 3.1.3 II:
      // a. 2 anos (24 meses) padrão.
      // b. 1 ano (12 meses) se teve cadastro em Cinza, Amarela ou Laranja.
      // c. 0 meses se teve cadastro em Verde ou Azul Juvenil.
      if (tinhaVerde) return 0;
      if (tinhaInfantil) return 12;
      return 24;
    }

    if (novaFaixa === 'Roxa') {
      // Artigo 3.1.3 III:
      // a. 18 meses (1.5 anos) padrão.
      // b. 12 meses se teve cadastro em Azul Juvenil.
      // c. 0 meses se teve Laranja/Verde E Azul Juvenil.
      return 18;
    }

    if (novaFaixa === 'Marrom') {
      // Artigo 3.1.3 IV: 1 ano (12 meses)
      return 12;
    }

    if (novaFaixa === 'Preta') {
      // Artigo 3.1.3 V / 4.1.5: 1 ano na marrom para preta
      return 12;
    }

    if (novaFaixa === 'Vermelha e preta') return 360; // 30 anos como preta total (ou 7 anos no 6º grau)
    if (novaFaixa === 'Vermelha e branca') return 84; // 7 anos na vermelha e preta
    if (novaFaixa === 'Vermelha') return 120; // 10 anos na vermelha e branca

    const rule = this.getRuleForBelt(novaFaixa);
    return rule.tempoMinimoMeses;
  }

  /**
   * Validação estrita de promoção de faixa e graus.
   * Lança exceção com mensagem amigável em caso de violação das regras.
   */
  public static validatePromotion(
    dataNascimento: string,
    faixaAtual: Belt,
    grauAtual: Degree,
    novaFaixa: Belt,
    novoGrau: Degree
  ): { isValid: boolean; error?: string } {
    const idade = getBjjAge(dataNascimento);
    const ruleNovaFaixa = this.getRuleForBelt(novaFaixa);

    // 1. Validar idade mínima da nova faixa
    if (idade < ruleNovaFaixa.idadeMinimaAnos) {
      return {
        isValid: false,
        error: `A faixa ${novaFaixa} exige idade mínima de ${ruleNovaFaixa.idadeMinimaAnos} anos (aluno possui ${idade} anos).`
      };
    }

    // 2. Validar limite de graus
    if (novoGrau < 0 || novoGrau > ruleNovaFaixa.maxGraus) {
      return {
        isValid: false,
        error: `A faixa ${novaFaixa} permite no máximo ${ruleNovaFaixa.maxGraus} graus (tentativa de atribuir ${novoGrau}º grau).`
      };
    }

    // 3. Validar rebaixamento de faixa
    const rankAtual = getBeltRank(faixaAtual);
    const rankNovo = getBeltRank(novaFaixa);
    if (rankNovo < rankAtual) {
      return {
        isValid: false,
        error: `Não é permitido rebaixar a faixa do aluno de ${faixaAtual} para ${novaFaixa}.`
      };
    }

    // 4. Validar diminuição de grau na mesma faixa
    if (novaFaixa === faixaAtual && novoGrau < grauAtual) {
      return {
        isValid: false,
        error: `Não é permitido reduzir a quantidade de graus da faixa atual (${grauAtual}º -> ${novoGrau}º).`
      };
    }

    // 5. Validar grau duplicado exato
    if (novaFaixa === faixaAtual && novoGrau === grauAtual) {
      return {
        isValid: false,
        error: `O aluno já possui o ${grauAtual}º grau na faixa ${faixaAtual}.`
      };
    }

    return { isValid: true };
  }

  /**
   * Valida integralmente um evento de graduação (novo ou em edição) contra todo o histórico do aluno.
   * Impede:
   * 1. Graduações em datas futuras em relação ao dia de hoje.
   * 2. Graduações duplicadas na mesma data ou mês.
   * 3. Inconsistência na linha do tempo (regressão de faixa/graus ou graduação que não evolua cronologicamente).
   */
  public static validateGraduationTimeline(
    dataNascimento: string,
    candidate: { faixa: Belt; graus: Degree; dataGraduacao: string },
    existingEvents: Array<{ id?: number; faixa: Belt; graus: Degree; dataGraduacao: string }>,
    editingEventId?: number | null
  ): { isValid: boolean; error?: string } {
    const todayStr = new Date().toISOString().substring(0, 10);
    const todayYm = todayStr.substring(0, 7);

    const candDateStr = candidate.dataGraduacao.length === 7 ? `${candidate.dataGraduacao}-01` : candidate.dataGraduacao;
    const candYm = candidate.dataGraduacao.substring(0, 7);

    // 1. Impedir data no futuro em relação ao dia de hoje
    if (candDateStr > todayStr || candYm > todayYm) {
      return {
        isValid: false,
        error: `Não é permitido cadastrar uma graduação com data no futuro (${candidate.dataGraduacao}).`
      };
    }

    // 2. Validar idade mínima e quantidade máxima de graus para a faixa
    const idade = getBjjAge(dataNascimento);
    const ruleNovaFaixa = this.getRuleForBelt(candidate.faixa);
    if (idade < ruleNovaFaixa.idadeMinimaAnos) {
      return {
        isValid: false,
        error: `A faixa ${candidate.faixa} exige idade mínima de ${ruleNovaFaixa.idadeMinimaAnos} anos (aluno possui ${idade} anos).`
      };
    }
    if (candidate.graus < 0 || candidate.graus > ruleNovaFaixa.maxGraus) {
      return {
        isValid: false,
        error: `A faixa ${candidate.faixa} permite no máximo ${ruleNovaFaixa.maxGraus} graus (tentativa de atribuir ${candidate.graus}º grau).`
      };
    }

    // Filtra outros eventos da história (exclui o que está sendo editado se for edição, e registros sintéticos -999)
    const otherEvents = existingEvents.filter(e => {
      if ((e as any).is_deleted) return false;
      if (e.id === -999 || String(e.id) === '-999') return false;
      if (editingEventId != null && e.id != null) {
        if (String(e.id) === String(editingEventId)) {
          return false; // Exclui o próprio registro que está sendo editado!
        }
      }
      return true;
    });

    // 3. Impedir data/mês duplicado com outro registro existente
    const duplicateDate = otherEvents.find(e => {
      const eDateRaw = (e as any).dataGraduacao || (e as any).data || '';
      const eYm = eDateRaw.substring(0, 7);
      return eYm === candYm;
    });

    if (duplicateDate) {
      return {
        isValid: false,
        error: `Já existe um registro de graduação cadastrado na mesma data/mês (${duplicateDate.dataGraduacao.substring(0, 7)}).`
      };
    }

    // 4. Monta a linha do tempo cronológica com a nova graduação inserida
    const virtualTimeline = [
      ...otherEvents,
      {
        faixa: candidate.faixa,
        graus: candidate.graus,
        dataGraduacao: candDateStr
      }
    ].sort((a, b) => {
      const ymA = a.dataGraduacao.substring(0, 7);
      const ymB = b.dataGraduacao.substring(0, 7);
      if (ymA !== ymB) return ymA.localeCompare(ymB);
      return (a.dataGraduacao || '').localeCompare(b.dataGraduacao || '');
    });

    // 5. Valida a coerência da linha do tempo do evento inicial ao final
    for (let i = 1; i < virtualTimeline.length; i++) {
      const prev = virtualTimeline[i - 1];
      const curr = virtualTimeline[i];

      const prevRank = getBeltRank(prev.faixa);
      const currRank = getBeltRank(curr.faixa);

      // Rebaixamento de faixa em data posterior
      if (currRank < prevRank) {
        return {
          isValid: false,
          error: `Inconsistência cronológica: Na data ${curr.dataGraduacao.substring(0, 7)}, a faixa ${curr.faixa} é inferior à faixa ${prev.faixa} registrada anteriormente em ${prev.dataGraduacao.substring(0, 7)}.`
        };
      }

      // Mesma faixa: graus devem aumentar estritamente
      if (currRank === prevRank) {
        if (curr.graus <= prev.graus) {
          return {
            isValid: false,
            error: `Inconsistência cronológica: Na data ${curr.dataGraduacao.substring(0, 7)}, a quantidade de graus (${curr.graus}º grau) deve ser superior aos ${prev.graus}º grau registrados em ${prev.dataGraduacao.substring(0, 7)}.`
          };
        }
      }
    }

    return { isValid: true };
  }
}
