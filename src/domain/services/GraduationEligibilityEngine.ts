import type { Aluno } from '@/domain/models/student';
import type { Frequencia } from '@/domain/models/attendance';
import type { GraduationEligibility, GraduationRequirementStatus, EligibilityStatus } from '@/domain/models/graduation';
import { GraduationRulesEngine } from './GraduationRulesEngine';
import { parseSafeDate } from '@/utils/formatters';

export class GraduationEligibilityEngine {
  /**
   * Avalia integralmente a elegibilidade do aluno combinando histórico de graduações e registro de presenças.
   */
  public static calculateEligibility(
    student: Aluno,
    attendances: Frequencia[] = []
  ): GraduationEligibility {
    const today = new Date();
    const nextStep = GraduationRulesEngine.getNextStep(student.faixa, student.graus);
    const rule = GraduationRulesEngine.getRuleForBelt(nextStep.novaFaixa);

    // 1. Extrai histórico de faixas passadas para concessão de descontos oficiais IBJJF
    const pastBelts = (student.historicoGraduacoes || []).map(g => g.faixa);
    if (student.faixa && !pastBelts.includes(student.faixa)) {
      pastBelts.push(student.faixa);
    }

    // 2. Tempo de Academia (meses desde a matrícula)
    const matriculaDate = parseSafeDate(student.dataMatricula || today.toISOString());
    const tempoAcademiaMeses = Math.max(0, Math.floor((today.getTime() - matriculaDate.getTime()) / (1000 * 60 * 60 * 24 * 30.4375)));

    // 3. Tempo na Faixa Atual (meses desde a última graduação)
    const ultimaGradDate = parseSafeDate(student.dataUltimaGraduacao || student.dataMatricula || today.toISOString());
    const tempoFaixaAtualMeses = Math.max(0, Math.floor((today.getTime() - ultimaGradDate.getTime()) / (1000 * 60 * 60 * 24 * 30.4375)));

    // 4. Métricas de Frequência e Treinos do Aluno
    const studentAttendances = attendances.filter(a => Number(a.alunoId) === Number(student.id));
    const totalTreinos = studentAttendances.length;

    // Check-ins no mês atual
    const currentYearMonthStr = today.toISOString().substring(0, 7);
    const checkinsMesAtual = studentAttendances.filter(a => a.data && a.data.startsWith(currentYearMonthStr)).length;

    // Frequência percentual (baseada na estimativa de 12 aulas/mês no período de faixa)
    const aulasEsperadas = Math.max(1, tempoFaixaAtualMeses * 12);
    const frequenciaPercentual = Math.min(100, Math.round((totalTreinos / aulasEsperadas) * 100));

    // Data da última presença
    const sortedAttendances = [...studentAttendances].sort((a, b) => (b.data || '').localeCompare(a.data || ''));
    const ultimaPresencaData = sortedAttendances.length > 0 ? sortedAttendances[0].data : null;

    // 5. Carência mínima oficial calculada (Artigos 3.1.3 e 4.1.5 IBJJF)
    const tempoNecessarioMeses = GraduationRulesEngine.getMinPermanenceMonths(
      student.faixa,
      student.graus,
      nextStep.novaFaixa,
      nextStep.novoGrau,
      pastBelts
    );
    const tempoCumprido = tempoFaixaAtualMeses >= tempoNecessarioMeses;

    // 6. Trava de Idade Mínima Exigida pela IBJJF (Ano Corrente - Ano Nascimento >= Idade Mínima)
    const birthDate = parseSafeDate(student.dataNascimento || '2000-01-01');
    const birthYear = birthDate.getFullYear();
    const minAgeRequired = rule.idadeMinimaAnos;
    const currentYear = today.getFullYear();
    const ageInCurrentYear = Math.max(0, currentYear - birthYear);
    const ageCumprida = ageInCurrentYear >= minAgeRequired;

    const aulasNecessarias = Math.max(15, Math.round(rule.quantidadeMinimaAulas / (rule.maxGraus || 4)));
    const treinosCumpridos = totalTreinos >= aulasNecessarias;

    const freqCumprida = frequenciaPercentual >= (rule.frequenciaMinimaPercentual || 70);

    // Avaliação Técnica / Disciplina
    const avaliacaoTecnicaOk = student.status === 'Ativo';

    const requisitos: GraduationRequirementStatus[] = [];

    if (!ageCumprida) {
      requisitos.push({
        id: 'idade_minima',
        label: 'Idade Mínima Exigida',
        cumprido: ageCumprida,
        detalhe: `${ageInCurrentYear} de ${minAgeRequired} anos exigidos para a faixa ${nextStep.novaFaixa}`,
        obrigatorio: true
      });
    }

    requisitos.push(
      {
        id: 'tempo_minimo',
        label: 'Tempo Mínimo Cumprido',
        cumprido: tempoCumprido,
        detalhe: `${tempoFaixaAtualMeses} de ${tempoNecessarioMeses} meses cumpridos na graduação atual`,
        obrigatorio: true
      },
      {
        id: 'frequencia_suficiente',
        label: 'Frequência Mínima',
        cumprido: freqCumprida,
        detalhe: `${frequenciaPercentual}% (Mínimo exigido: ${rule.frequenciaMinimaPercentual}%)`,
        obrigatorio: true
      },
      {
        id: 'quantidade_aulas',
        label: 'Quantidade de Treinos/Aulas',
        cumprido: treinosCumpridos,
        detalhe: `${totalTreinos} de ${aulasNecessarias} treinos registrados`,
        obrigatorio: true
      },
      {
        id: 'avaliacao_tecnica',
        label: 'Avaliação Técnica & Disciplina',
        cumprido: avaliacaoTecnicaOk,
        detalhe: avaliacaoTecnicaOk ? 'Aprovado pelo corpo docente' : 'Avaliação técnica pendente',
        obrigatorio: true
      }
    );

    // 7. Cálculo do Percentual de Evolução
    const propTempo = tempoNecessarioMeses > 0 ? Math.min(1, tempoFaixaAtualMeses / tempoNecessarioMeses) : 1;
    const propTreinos = Math.min(1, totalTreinos / aulasNecessarias);
    const propFreq = Math.min(1, frequenciaPercentual / (rule.frequenciaMinimaPercentual || 70));

    let percentualEvolucao = Math.min(100, Math.round(((propTempo * 0.4) + (propTreinos * 0.4) + (propFreq * 0.2)) * 100));

    if (!ageCumprida) {
      // Se ainda não atingiu a idade mínima para a próxima faixa, trava o percentual máximo
      percentualEvolucao = Math.min(95, percentualEvolucao);
    }

    // 8. Definição do Status Global e Motivos Faltantes
    const motivosPendentes: string[] = [];
    requisitos.forEach(req => {
      if (!req.cumprido) {
        motivosPendentes.push(`${req.label}: ${req.detalhe}`);
      }
    });

    let status: EligibilityStatus = 'Em andamento';
    if (motivosPendentes.length === 0) {
      status = 'Apto';
    } else if (percentualEvolucao < 50) {
      status = 'Requisitos pendentes';
    }

    // 9. Estimativa da Data da Próxima Graduação (Previsão por Tempo e por Idade Mínima)
    const mesesRestantesTempo = Math.max(0, tempoNecessarioMeses - tempoFaixaAtualMeses);
    const dataEstimadaPorTempo = new Date(today);
    dataEstimadaPorTempo.setMonth(dataEstimadaPorTempo.getMonth() + mesesRestantesTempo);

    let dataEstimadaFinal = dataEstimadaPorTempo;
    if (!ageCumprida) {
      const targetYearForAge = birthYear + minAgeRequired;
      const dataIdadeMinima = new Date(targetYearForAge, 0, 1);
      if (dataIdadeMinima.getTime() > dataEstimadaFinal.getTime()) {
        dataEstimadaFinal = dataIdadeMinima;
      }
    }
    const dataEstimadaProximaGraduacao = dataEstimadaFinal.toISOString().substring(0, 10);

    return {
      alunoId: student.id,
      status,
      percentualEvolucao,
      dataEstimadaProximaGraduacao,
      proximaFaixa: nextStep.novaFaixa,
      proximoGrau: nextStep.novoGrau,
      requisitos,
      motivosPendentes,
      totalTreinos,
      frequenciaPercentual,
      checkinsMesAtual,
      tempoAcademiaMeses,
      tempoFaixaAtualMeses,
      ultimaPresencaData,
      competicoesContador: 0
    };
  }
}
