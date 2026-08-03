import { GraduationRulesEngine } from '@/domain/services/GraduationRulesEngine';
import type { Belt, Degree } from '@/domain/models/student';

/**
 * Suite de testes para GraduationRulesEngine
 */
export function runGraduationRulesEngineTests() {
  const results: { name: string; passed: boolean; error?: any }[] = [];

  const assert = (condition: boolean, message: string) => {
    if (!condition) throw new Error(`Assertion Failed: ${message}`);
  };

  // Teste 1: Promoção válida
  try {
    const res = GraduationRulesEngine.validatePromotion(
      '2000-01-01',
      'Branca' as Belt,
      4 as Degree,
      'Azul' as Belt,
      0 as Degree
    );
    assert(res.isValid === true, 'Promoção deveria ser válida');
    results.push({ name: 'Promoção válida para faixa azul', passed: true });
  } catch (err) {
    results.push({ name: 'Promoção válida para faixa azul', passed: false, error: err });
  }

  // Teste 2: Idade insuficiente
  try {
    const res = GraduationRulesEngine.validatePromotion(
      '2015-01-01',
      'Branca' as Belt,
      4 as Degree,
      'Azul' as Belt,
      0 as Degree
    );
    assert(res.isValid === false, 'Deveria negar por idade mínima');
    results.push({ name: 'Rejeição por idade mínima na faixa azul', passed: true });
  } catch (err) {
    results.push({ name: 'Rejeição por idade mínima na faixa azul', passed: false, error: err });
  }

  // Teste 3: Rebaixamento proibido
  try {
    const res = GraduationRulesEngine.validatePromotion(
      '2000-01-01',
      'Azul' as Belt,
      2 as Degree,
      'Branca' as Belt,
      0 as Degree
    );
    assert(res.isValid === false, 'Deveria negar rebaixamento');
    results.push({ name: 'Proibição de rebaixamento de faixa', passed: true });
  } catch (err) {
    results.push({ name: 'Proibição de rebaixamento de faixa', passed: false, error: err });
  }

  // Teste 4: Impedir data no futuro
  try {
    const futureDate = '2099-01-01';
    const res = GraduationRulesEngine.validateGraduationTimeline(
      '2000-01-01',
      { faixa: 'Azul' as Belt, graus: 1 as Degree, dataGraduacao: futureDate },
      []
    );
    assert(res.isValid === false, 'Deveria rejeitar data no futuro');
    results.push({ name: 'Impedir data no futuro', passed: true });
  } catch (err) {
    results.push({ name: 'Impedir data no futuro', passed: false, error: err });
  }

  // Teste 5: Impedir data duplicada no mesmo mês
  try {
    const res = GraduationRulesEngine.validateGraduationTimeline(
      '2000-01-01',
      { faixa: 'Azul' as Belt, graus: 1 as Degree, dataGraduacao: '2024-05-15' },
      [{ id: 1, faixa: 'Azul' as Belt, graus: 0 as Degree, dataGraduacao: '2024-05-01' }]
    );
    assert(res.isValid === false, 'Deveria rejeitar data duplicada no mesmo mês');
    results.push({ name: 'Impedir data duplicada no mesmo mês', passed: true });
  } catch (err) {
    results.push({ name: 'Impedir data duplicada no mesmo mês', passed: false, error: err });
  }

  // Teste 6: Impedir regressão na linha do tempo
  try {
    const existing = [
      { id: 1, faixa: 'Branca' as Belt, graus: 0 as Degree, dataGraduacao: '2010-01-01' },
      { id: 2, faixa: 'Preta' as Belt, graus: 2 as Degree, dataGraduacao: '2024-12-01' }
    ];
    // Tentativa de colocar 1 grau na preta em 2026 (após ter atingido 2 graus em 2024)
    const res = GraduationRulesEngine.validateGraduationTimeline(
      '1990-01-01',
      { faixa: 'Preta' as Belt, graus: 1 as Degree, dataGraduacao: '2026-01-01' },
      existing
    );
    assert(res.isValid === false, 'Deveria rejeitar regressão de grau na faixa preta');
    results.push({ name: 'Impedir regressão de graus na linha do tempo', passed: true });
  } catch (err) {
    results.push({ name: 'Impedir regressão de graus na linha do tempo', passed: false, error: err });
  }

  // Teste 7: Carências oficiais IBJJF (Roxa 18m, Marrom 12m, Preta 1º-3º graus 36m)
  try {
    const minRoxa = GraduationRulesEngine.getMinPermanenceMonths('Roxa', 4, 'Marrom', 0);
    assert(minRoxa === 12, 'Marrom exige 12 meses de carência (Art. 3.1.3 IBJJF)');

    const minAzulComDesconto = GraduationRulesEngine.getMinPermanenceMonths('Branca', 4, 'Azul', 0, ['Cinza']);
    assert(minAzulComDesconto === 12, 'Azul com histórico infantil exige 12 meses (Art. 3.1.3 IBJJF)');

    const minPretaGrau1 = GraduationRulesEngine.getMinPermanenceMonths('Preta', 0, 'Preta', 1);
    assert(minPretaGrau1 === 36, '1º grau na preta exige 36 meses (3 anos)');

    results.push({ name: 'Validar carências oficiais IBJJF e descontos de faixa', passed: true });
  } catch (err) {
    results.push({ name: 'Validar carências oficiais IBJJF e descontos de faixa', passed: false, error: err });
  }

  return results;
}
