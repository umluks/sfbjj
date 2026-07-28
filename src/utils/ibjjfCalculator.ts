import { 
  weightsMascGi, 
  weightsMascNoGi, 
  weightsFemGi, 
  weightsFemNoGi, 
  type WeightDivision 
} from '@/constants/ibjjfRules';

export interface IbjjfCalcParams {
  birthYear?: number | string;
  dataNascimento?: string;
  gender: 'masculino' | 'feminino' | 'Masculino' | 'Feminino';
  modality: 'gi' | 'nogi';
  weightKg: number | string;
  beltColor: string;
}

export interface IbjjfCalcResult {
  currentYear: number;
  calculatedAge: number;
  birthYear: number;
  category: string;
  fightTime: string;
  weightClass: {
    name: string;
    limit: string;
  };
}

export function calculateIbjjfCategory(params: IbjjfCalcParams): IbjjfCalcResult {
  const currentYear = new Date().getFullYear();

  let birthYearNum = currentYear - 25; // default fallback
  if (params.dataNascimento) {
    const yearStr = params.dataNascimento.substring(0, 4);
    const parsed = parseInt(yearStr, 10);
    if (!isNaN(parsed) && parsed > 1900 && parsed <= currentYear) {
      birthYearNum = parsed;
    }
  } else if (params.birthYear !== undefined && params.birthYear !== '') {
    const parsed = typeof params.birthYear === 'number' ? params.birthYear : parseInt(String(params.birthYear), 10);
    if (!isNaN(parsed) && parsed > 1900 && parsed <= currentYear) {
      birthYearNum = parsed;
    }
  }

  const calculatedAge = Math.max(0, currentYear - birthYearNum);

  // Categoria de idade e tempo de luta
  let category = '';
  let fightTime = '';

  const belt = params.beltColor || 'Branca';

  if (calculatedAge === 4) {
    category = 'PRÉ-MIRIM I';
    fightTime = '02 minutos';
  } else if (calculatedAge === 5) {
    category = 'PRÉ-MIRIM II';
    fightTime = '02 minutos';
  } else if (calculatedAge === 6) {
    category = 'PRÉ-MIRIM III';
    fightTime = '02 minutos';
  } else if (calculatedAge === 7) {
    category = 'MIRIM I';
    fightTime = '03 minutos';
  } else if (calculatedAge === 8) {
    category = 'MIRIM II';
    fightTime = '03 minutos';
  } else if (calculatedAge === 9) {
    category = 'MIRIM III';
    fightTime = '03 minutos';
  } else if (calculatedAge === 10) {
    category = 'INFANTIL I';
    fightTime = '04 minutos';
  } else if (calculatedAge === 11) {
    category = 'INFANTIL II';
    fightTime = '04 minutos';
  } else if (calculatedAge === 12) {
    category = 'INFANTIL III';
    fightTime = '04 minutos';
  } else if (calculatedAge === 13) {
    category = 'INFANTO-JUVENIL I';
    fightTime = '04 minutos';
  } else if (calculatedAge === 14) {
    category = 'INFANTO-JUVENIL II';
    fightTime = '04 minutos';
  } else if (calculatedAge === 15) {
    category = 'INFANTO-JUVENIL III';
    fightTime = '04 minutos';
  } else if (calculatedAge === 16) {
    category = 'JUVENIL I';
    fightTime = '05 minutos';
  } else if (calculatedAge === 17) {
    category = 'JUVENIL II';
    fightTime = '05 minutos';
  } else if (calculatedAge >= 18 && calculatedAge < 30) {
    category = 'ADULTO';
    if (belt.includes('Branca')) fightTime = '05 minutos';
    else if (belt.includes('Azul')) fightTime = '06 minutos';
    else if (belt.includes('Roxa')) fightTime = '07 minutos';
    else if (belt.includes('Marrom')) fightTime = '08 minutos';
    else fightTime = '10 minutos'; // Preta
  } else if (calculatedAge >= 30 && calculatedAge < 36) {
    category = 'MASTER 1';
    if (belt.includes('Branca') || belt.includes('Azul')) fightTime = '05 minutos';
    else fightTime = '06 minutos';
  } else if (calculatedAge >= 36 && calculatedAge < 41) {
    category = 'MASTER 2';
    fightTime = '05 minutos';
  } else if (calculatedAge >= 41 && calculatedAge < 46) {
    category = 'MASTER 3';
    fightTime = '05 minutos';
  } else if (calculatedAge >= 46 && calculatedAge < 51) {
    category = 'MASTER 4';
    fightTime = '05 minutos';
  } else if (calculatedAge >= 51 && calculatedAge < 56) {
    category = 'MASTER 5';
    fightTime = '05 minutos';
  } else if (calculatedAge >= 56 && calculatedAge < 61) {
    category = 'MASTER 6';
    fightTime = '05 minutos';
  } else if (calculatedAge >= 61) {
    category = 'MASTER 7';
    fightTime = '05 minutos';
  } else {
    category = 'Não elegível (Idade inferior a 4 anos)';
    fightTime = '0 minutos';
  }

  // Divisão de peso
  const weightNum = typeof params.weightKg === 'number' 
    ? params.weightKg 
    : parseFloat(String(params.weightKg)) || 70;
    
  const normalizedGender = (params.gender || '').toLowerCase();
  const isMale = normalizedGender.includes('masc');

  let activeList: WeightDivision[] = [];
  if (isMale) {
    activeList = params.modality === 'gi' ? weightsMascGi : weightsMascNoGi;
  } else {
    activeList = params.modality === 'gi' ? weightsFemGi : weightsFemNoGi;
  }

  const parseLimit = (limitStr: string): number => {
    if (limitStr.includes('Sem limite') || limitStr.includes('Sem limite de peso')) return 999;
    const match = limitStr.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 999;
  };

  let divisionFound = activeList[activeList.length - 1];
  for (const div of activeList) {
    let limitStr = div.adultLimit;
    if (calculatedAge >= 30) {
      limitStr = div.masterLimit;
    } else if (calculatedAge === 16 || calculatedAge === 17) {
      limitStr = div.juvenilLimit || div.adultLimit;
    }

    const limitVal = parseLimit(limitStr);
    if (weightNum <= limitVal) {
      divisionFound = div;
      break;
    }
  }

  let limitText = divisionFound.adultLimit;
  if (calculatedAge >= 30) {
    limitText = divisionFound.masterLimit;
  } else if (calculatedAge === 16 || calculatedAge === 17) {
    limitText = divisionFound.juvenilLimit || divisionFound.adultLimit;
  }

  return {
    currentYear,
    calculatedAge,
    birthYear: birthYearNum,
    category,
    fightTime,
    weightClass: {
      name: divisionFound.class,
      limit: limitText
    }
  };
}
