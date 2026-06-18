import type { Aluno, Aula, Aviso, Presenca } from './types';

export const INITIAL_SCHEDULE: Aula[] = [
  {
    id: 1,
    hora: '18:30 - 19:30',
    categoria: 'Infantil',
    professor: 'Lucas dos Anjos',
    diasSemana: [1, 3] // Seg, Qua
  },
  {
    id: 2,
    hora: '19:30 - 21:00',
    categoria: 'Adulto',
    professor: 'Lucas dos Anjos',
    diasSemana: [1, 3] // Seg, Qua
  },
  {
    id: 3,
    hora: '19:00 - 21:00',
    categoria: 'Open Match',
    professor: 'Lucas dos Anjos',
    diasSemana: [5] // Sex
  }
];

export const INITIAL_ANNOUNCEMENTS: Aviso[] = [
  {
    id: 1,
    titulo: '🥋 Graduação / Confraternização',
    conteudo: 'No dia 04 de junho, teremos a nossa grande cerimônia de graduação e confraternização! Para celebrar este momento especial!',
    data: '2026-05-18',
    fixado: true
  }
];

export const INITIAL_STUDENTS: Aluno[] = [
  {
    "id": 2,
    "nome": "Arthur (Cremilda)",
    "cpf": "111.000.002-22",
    "dataNascimento": "1991-09-21",
    "telefone": "61 98441-2626",
    "email": "arthur.antonoff@sfbjj.com.br",
    "genero": "Masculino",
    "dataMatricula": "2020-01-01",
    "faixa": "Preta",
    "graus": 0,
    "status": "Ativo",
    "bairro": "Guará",
    "dataUltimaGraduacao": "2020",
    "contatoEmergenciaNome": "Isadora",
    "contatoEmergenciaTel": "61 99649-0326",
    "pagamentos": [
      {
        "id": 1,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-03-10",
        "dataPagamento": null
      },
      {
        "id": 2,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-04-10",
        "dataPagamento": "2026-04-10"
      },
      {
        "id": 3,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-05-10",
        "dataPagamento": "2026-05-10"
      }
    ],
    "turma": "Adulto"
  },
  {
    "id": 3,
    "nome": "Breno Carlos Soares Fernandes",
    "cpf": "111.000.003-33",
    "dataNascimento": "1995-02-10",
    "telefone": "(61) 98258-4490",
    "email": "breno.fernandes@sfbjj.com.br",
    "genero": "Masculino",
    "dataMatricula": "2021-05-10",
    "faixa": "Azul",
    "graus": 2,
    "status": "Ativo",
    "bairro": "Asa Sul",
    "dataUltimaGraduacao": "23/08/2025",
    "contatoEmergenciaNome": "Vanessa",
    "contatoEmergenciaTel": "(61) 98290-7784",
    "pagamentos": [
      {
        "id": 4,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-03-10",
        "dataPagamento": "2026-03-10"
      },
      {
        "id": 5,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-04-10",
        "dataPagamento": "2026-04-10"
      },
      {
        "id": 6,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-05-10",
        "dataPagamento": "2026-05-10"
      }
    ],
    "turma": "Adulto"
  },
  {
    "id": 4,
    "nome": "Bruno Moreira Galvão Bello",
    "cpf": "111.000.004-44",
    "dataNascimento": "1993-12-19",
    "telefone": "(61) 98297-7016",
    "email": "bruno.bello@sfbjj.com.br",
    "genero": "Masculino",
    "dataMatricula": "2023-01-15",
    "faixa": "Branca",
    "graus": 4,
    "status": "Ativo",
    "bairro": "Park Way",
    "dataUltimaGraduacao": "11/12/2025",
    "contatoEmergenciaNome": "Ana Luísa",
    "contatoEmergenciaTel": "(61) 99672-8888",
    "pagamentos": [
      {
        "id": 7,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-03-10",
        "dataPagamento": null
      },
      {
        "id": 8,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-04-10",
        "dataPagamento": null
      },
      {
        "id": 9,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pendente",
        "dataVencimento": "2026-05-10",
        "dataPagamento": null
      }
    ],
    "turma": "Adulto"
  },
  {
    "id": 6,
    "nome": "Carlos Miranda Barbosa Soares",
    "cpf": "111.000.006-66",
    "dataNascimento": "1986-03-29",
    "telefone": "(61)98154-0523",
    "email": "carlos.soares@sfbjj.com.br",
    "genero": "Masculino",
    "dataMatricula": "2018-02-10",
    "faixa": "Preta",
    "graus": 0,
    "status": "Ativo",
    "bairro": "Vicente Pires",
    "dataUltimaGraduacao": "23/8/2025",
    "contatoEmergenciaNome": "Carlos",
    "contatoEmergenciaTel": "(61)99999-5075",
    "pagamentos": [
      {
        "id": 10,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-03-10",
        "dataPagamento": null
      },
      {
        "id": 11,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-04-10",
        "dataPagamento": null
      },
      {
        "id": 12,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pendente",
        "dataVencimento": "2026-05-10",
        "dataPagamento": null
      }
    ],
    "turma": "Adulto"
  },
  {
    "id": 7,
    "nome": "Daniel Costa Corrêa Leite Muniz",
    "cpf": "111.000.007-77",
    "dataNascimento": "1982-01-05",
    "telefone": "61 99912-9694",
    "email": "daniel.muniz@sfbjj.com.br",
    "genero": "Masculino",
    "dataMatricula": "2022-08-15",
    "faixa": "Azul",
    "graus": 0,
    "status": "Ativo",
    "bairro": "Águas Claras",
    "dataUltimaGraduacao": "23/08/2025",
    "contatoEmergenciaNome": "Jacqueline",
    "contatoEmergenciaTel": "61 99800-2550",
    "pagamentos": [
      {
        "id": 13,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-03-10",
        "dataPagamento": "2026-03-10"
      },
      {
        "id": 14,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-04-10",
        "dataPagamento": "2026-04-10"
      },
      {
        "id": 15,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-05-10",
        "dataPagamento": "2026-05-10"
      }
    ],
    "turma": "Adulto"
  },
  {
    "id": 8,
    "nome": "Daniel de Assis Nascimento",
    "cpf": "111.000.008-88",
    "dataNascimento": "2002-11-21",
    "telefone": "(61) 99962-5435",
    "email": "daniel.nascimento@sfbjj.com.br",
    "genero": "Masculino",
    "dataMatricula": "2023-01-10",
    "faixa": "Azul",
    "graus": 0,
    "status": "Ativo",
    "bairro": "Asa Sul",
    "dataUltimaGraduacao": "23/08/2025",
    "contatoEmergenciaNome": "Angela",
    "contatoEmergenciaTel": "(61) 99649-8901",
    "pagamentos": [
      {
        "id": 16,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-03-10",
        "dataPagamento": null
      },
      {
        "id": 17,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-04-10",
        "dataPagamento": null
      },
      {
        "id": 18,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pendente",
        "dataVencimento": "2026-05-10",
        "dataPagamento": null
      }
    ],
    "turma": "Adulto"
  },
  {
    "id": 9,
    "nome": "Daniel dos Santos",
    "cpf": "111.000.009-99",
    "dataNascimento": "2007-05-25",
    "telefone": "61981929046",
    "email": "daniel.santos@sfbjj.com.br",
    "genero": "Masculino",
    "dataMatricula": "2025-01-10",
    "faixa": "Branca",
    "graus": 0,
    "status": "Ativo",
    "bairro": "Asa sul",
    "dataUltimaGraduacao": "",
    "contatoEmergenciaNome": "Diego(pai)",
    "contatoEmergenciaTel": "61983669077",
    "pagamentos": [
      {
        "id": 19,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-03-10",
        "dataPagamento": null
      },
      {
        "id": 20,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-04-10",
        "dataPagamento": null
      },
      {
        "id": 21,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pendente",
        "dataVencimento": "2026-05-10",
        "dataPagamento": null
      }
    ],
    "turma": "Adulto"
  },
  {
    "id": 10,
    "nome": "David de Souza Ferrer dos Santos",
    "cpf": "111.000.010-10",
    "dataNascimento": "1989-06-06",
    "telefone": "61 98505-7222",
    "email": "david.santos@sfbjj.com.br",
    "genero": "Masculino",
    "dataMatricula": "2022-03-15",
    "faixa": "Azul",
    "graus": 2,
    "status": "Ativo",
    "bairro": "Guará",
    "dataUltimaGraduacao": "23/08/2025",
    "contatoEmergenciaNome": "Carol",
    "contatoEmergenciaTel": "61 98210-7184",
    "pagamentos": [
      {
        "id": 22,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-03-10",
        "dataPagamento": null
      },
      {
        "id": 23,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-04-10",
        "dataPagamento": "2026-04-10"
      },
      {
        "id": 24,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pendente",
        "dataVencimento": "2026-05-10",
        "dataPagamento": null
      }
    ],
    "turma": "Adulto"
  },
  {
    "id": 11,
    "nome": "Diogo Ferreira de Sousa",
    "cpf": "111.000.011-11",
    "dataNascimento": "1990-12-16",
    "telefone": "61982759727",
    "email": "diogo.sousa@sfbjj.com.br",
    "genero": "Masculino",
    "dataMatricula": "2021-01-10",
    "faixa": "Azul",
    "graus": 2,
    "status": "Ativo",
    "bairro": "Asa Sul",
    "dataUltimaGraduacao": "02/10/2021",
    "contatoEmergenciaNome": "Ellen",
    "contatoEmergenciaTel": "61981572367",
    "pagamentos": [
      {
        "id": 25,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-03-10",
        "dataPagamento": null
      },
      {
        "id": 26,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-04-10",
        "dataPagamento": null
      },
      {
        "id": 27,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pendente",
        "dataVencimento": "2026-05-10",
        "dataPagamento": null
      }
    ],
    "turma": "Adulto"
  },
  {
    "id": 12,
    "nome": "Ériclis Douglas dos Santos Araújo Carneiro",
    "cpf": "111.000.012-12",
    "dataNascimento": "1999-04-22",
    "telefone": "(061) 99354-5902",
    "email": "ericlis.carneiro@sfbjj.com.br",
    "genero": "Masculino",
    "dataMatricula": "2023-05-11",
    "faixa": "Azul",
    "graus": 0,
    "status": "Ativo",
    "bairro": "Setor Policial Sul",
    "dataUltimaGraduacao": "26/11/2023",
    "contatoEmergenciaNome": "Larissa",
    "contatoEmergenciaTel": "(061) 99184-2003",
    "pagamentos": [
      {
        "id": 28,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-03-10",
        "dataPagamento": null
      },
      {
        "id": 29,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-04-10",
        "dataPagamento": null
      },
      {
        "id": 30,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-05-10",
        "dataPagamento": "2026-05-10"
      }
    ],
    "turma": "Adulto"
  },
  {
    "id": 13,
    "nome": "Fabrício Jaime Saraiva do Nascimento",
    "cpf": "111.000.013-13",
    "dataNascimento": "1990-10-09",
    "telefone": "",
    "email": "fabricio.nascimento@sfbjj.com.br",
    "genero": "Masculino",
    "dataMatricula": "2023-01-10",
    "faixa": "Branca",
    "graus": 4,
    "status": "Ativo",
    "bairro": "Candangolândia",
    "dataUltimaGraduacao": "29/10/2023",
    "contatoEmergenciaNome": "",
    "contatoEmergenciaTel": "",
    "pagamentos": [
      {
        "id": 31,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-03-10",
        "dataPagamento": null
      },
      {
        "id": 32,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-04-10",
        "dataPagamento": null
      },
      {
        "id": 33,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pendente",
        "dataVencimento": "2026-05-10",
        "dataPagamento": null
      }
    ],
    "turma": "Adulto"
  },
  {
    "id": 16,
    "nome": "Flávio de Arruda Ribeiro",
    "cpf": "111.000.016-66",
    "dataNascimento": "1976-01-09",
    "telefone": "(61) 993335893",
    "email": "flavio.ribeiro@sfbjj.com.br",
    "genero": "Masculino",
    "dataMatricula": "2025-10-10",
    "faixa": "Branca",
    "graus": 2,
    "status": "Ativo",
    "bairro": "Taguatinga Norte",
    "dataUltimaGraduacao": "",
    "contatoEmergenciaNome": "Vanessa",
    "contatoEmergenciaTel": "(61) 993348343",
    "pagamentos": [
      {
        "id": 34,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-03-10",
        "dataPagamento": "2026-03-10"
      },
      {
        "id": 35,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-04-10",
        "dataPagamento": "2026-04-10"
      },
      {
        "id": 36,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-05-10",
        "dataPagamento": "2026-05-10"
      }
    ],
    "turma": "Adulto"
  },
  {
    "id": 17,
    "nome": "Georsolei Loredo de Faria",
    "cpf": "111.000.017-77",
    "dataNascimento": "1983-04-29",
    "telefone": "61-983002420",
    "email": "georsolei.faria@sfbjj.com.br",
    "genero": "Masculino",
    "dataMatricula": "2022-01-15",
    "faixa": "Roxa",
    "graus": 2,
    "status": "Ativo",
    "bairro": "Asa Sul",
    "dataUltimaGraduacao": "23/08/2025",
    "contatoEmergenciaNome": "Francine",
    "contatoEmergenciaTel": "61-99949-9775",
    "pagamentos": [
      {
        "id": 37,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-03-10",
        "dataPagamento": "2026-03-10"
      },
      {
        "id": 38,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-04-10",
        "dataPagamento": "2026-04-10"
      },
      {
        "id": 39,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-05-10",
        "dataPagamento": "2026-05-10"
      }
    ],
    "turma": "Adulto"
  },
  {
    "id": 19,
    "nome": "Gustavo Santos das Neves",
    "cpf": "111.000.019-99",
    "dataNascimento": "1986-01-25",
    "telefone": "(61)99272-9559",
    "email": "gustavo.neves@sfbjj.com.br",
    "genero": "Masculino",
    "dataMatricula": "2024-01-10",
    "faixa": "Branca",
    "graus": 4,
    "status": "Ativo",
    "bairro": "Cruzeiro Novo",
    "dataUltimaGraduacao": "23/08/2025",
    "contatoEmergenciaNome": "Thaiana",
    "contatoEmergenciaTel": "(61)99522-3223",
    "pagamentos": [
      {
        "id": 40,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-03-10",
        "dataPagamento": null
      },
      {
        "id": 41,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-04-10",
        "dataPagamento": null
      },
      {
        "id": 42,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pendente",
        "dataVencimento": "2026-05-10",
        "dataPagamento": null
      }
    ],
    "turma": "Adulto"
  },
  {
    "id": 21,
    "nome": "Ícaro Bernardes Barbosa",
    "cpf": "111.000.021-11",
    "dataNascimento": "2010-05-02",
    "telefone": "61 981858105",
    "email": "icaro.barbosa@sfbjj.com.br",
    "genero": "Masculino",
    "dataMatricula": "2025-03-15",
    "faixa": "Branca",
    "graus": 2,
    "status": "Ativo",
    "bairro": "Asa sul",
    "dataUltimaGraduacao": "",
    "contatoEmergenciaNome": "thais santos",
    "contatoEmergenciaTel": "61 981464448",
    "pagamentos": [
      {
        "id": 43,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-03-10",
        "dataPagamento": null
      },
      {
        "id": 44,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-04-10",
        "dataPagamento": null
      },
      {
        "id": 45,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pendente",
        "dataVencimento": "2026-05-10",
        "dataPagamento": null
      }
    ],
    "turma": "Kids"
  },
  {
    "id": 26,
    "nome": "Lucas Santos Lima do Nascimento",
    "cpf": "111.000.026-66",
    "dataNascimento": "1989-05-05",
    "telefone": "61 98167-6724",
    "email": "lucas.nascimento@sfbjj.com.br",
    "genero": "Masculino",
    "dataMatricula": "2022-06-15",
    "faixa": "Azul",
    "graus": 3,
    "status": "Ativo",
    "bairro": "Cruzeiro Novo",
    "dataUltimaGraduacao": "23/08/2025",
    "contatoEmergenciaNome": "Tássia",
    "contatoEmergenciaTel": "61 98181-1799",
    "pagamentos": [
      {
        "id": 46,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-03-10",
        "dataPagamento": "2026-03-10"
      },
      {
        "id": 47,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-04-10",
        "dataPagamento": "2026-04-10"
      },
      {
        "id": 48,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-05-10",
        "dataPagamento": "2026-05-10"
      }
    ],
    "turma": "Adulto"
  },
  {
    "id": 27,
    "nome": "Miguel Meireles Oliveira de Almeida",
    "cpf": "111.000.012-12",
    "dataNascimento": "2000-10-04",
    "telefone": "(61) 99174-1111",
    "email": "miguel.almeida@sfbjj.com",
    "genero": "Masculino",
    "dataMatricula": "2019-12-14",
    "faixa": "Azul",
    "graus": 2,
    "status": "Ativo",
    "bairro": "Taguatinga",
    "dataUltimaGraduacao": "2019-12-14",
    "contatoEmergenciaNome": "Débora",
    "contatoEmergenciaTel": "(61) 98191-1859",
    "pagamentos": [
      {
        "id": 49,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-03-10",
        "dataPagamento": null
      },
      {
        "id": 50,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-04-10",
        "dataPagamento": null
      },
      {
        "id": 51,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pendente",
        "dataVencimento": "2026-05-10",
        "dataPagamento": null
      }
    ],
    "turma": "Adulto"
  },
  {
    "id": 28,
    "nome": "Paulo Marcilio Almeida de Carvalho",
    "cpf": "111.000.013-13",
    "dataNascimento": "1988-01-05",
    "telefone": "(61) 98132-3186",
    "email": "paulo.carvalho@sfbjj.com",
    "genero": "Masculino",
    "dataMatricula": "2023-01-15",
    "faixa": "Roxa",
    "graus": 2,
    "status": "Ativo",
    "bairro": "Asa Sul",
    "dataUltimaGraduacao": "2025-08-23",
    "contatoEmergenciaNome": "Aline",
    "contatoEmergenciaTel": "(61) 98306-4082",
    "pagamentos": [
      {
        "id": 52,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-03-10",
        "dataPagamento": null
      },
      {
        "id": 53,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-04-10",
        "dataPagamento": null
      },
      {
        "id": 54,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-05-10",
        "dataPagamento": "2026-05-10"
      }
    ],
    "turma": "Adulto"
  },
  {
    "id": 29,
    "nome": "Pedro Henrique Barbosa Brandão",
    "cpf": "111.000.014-44",
    "dataNascimento": "1996-10-24",
    "telefone": "(22) 98104-2161",
    "email": "pedro.brandao@sfbjj.com",
    "genero": "Masculino",
    "dataMatricula": "2024-05-10",
    "faixa": "Branca",
    "graus": 4,
    "status": "Ativo",
    "bairro": "Sudoeste",
    "dataUltimaGraduacao": "2025-08-23",
    "contatoEmergenciaNome": "Taíse",
    "contatoEmergenciaTel": "(68) 99230-7358",
    "pagamentos": [
      {
        "id": 55,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-03-10",
        "dataPagamento": "2026-03-10"
      },
      {
        "id": 56,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-04-10",
        "dataPagamento": "2026-04-10"
      },
      {
        "id": 57,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-05-10",
        "dataPagamento": "2026-05-10"
      }
    ],
    "turma": "Adulto"
  },
  {
    "id": 30,
    "nome": "Pedro Kauã Veloso de Sousa",
    "cpf": "111.000.015-55",
    "dataNascimento": "2007-06-05",
    "telefone": "(61) 99425-0806",
    "email": "pedro.sousa@sfbjj.com",
    "genero": "Masculino",
    "dataMatricula": "2025-01-10",
    "faixa": "Branca",
    "graus": 2,
    "status": "Ativo",
    "bairro": "Asa Sul",
    "dataUltimaGraduacao": "2025-12-12",
    "contatoEmergenciaNome": "Camila (Mãe)",
    "contatoEmergenciaTel": "(61) 98443-1616",
    "pagamentos": [
      {
        "id": 58,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-03-10",
        "dataPagamento": null
      },
      {
        "id": 59,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-04-10",
        "dataPagamento": null
      },
      {
        "id": 60,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-05-10",
        "dataPagamento": "2026-05-10"
      }
    ],
    "turma": "Adulto"
  },
  {
    "id": 31,
    "nome": "Pedro Suhet Justino",
    "cpf": "111.000.016-66",
    "dataNascimento": "2003-03-08",
    "telefone": "(61) 99973-0803",
    "email": "pedro.justino@sfbjj.com",
    "genero": "Masculino",
    "dataMatricula": "2023-05-20",
    "faixa": "Azul",
    "graus": 3,
    "status": "Ativo",
    "bairro": "Asa Sul",
    "dataUltimaGraduacao": "2025-12-15",
    "contatoEmergenciaNome": "Adriana",
    "contatoEmergenciaTel": "(61) 99967-0271",
    "pagamentos": [
      {
        "id": 61,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-03-10",
        "dataPagamento": null
      },
      {
        "id": 62,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-04-10",
        "dataPagamento": null
      },
      {
        "id": 63,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pendente",
        "dataVencimento": "2026-05-10",
        "dataPagamento": null
      }
    ],
    "turma": "Adulto"
  },
  {
    "id": 32,
    "nome": "Rafael Goulart do Nascimento",
    "cpf": "111.000.017-77",
    "dataNascimento": "1988-02-23",
    "telefone": "(61) 98221-2496",
    "email": "rafael.nascimento@sfbjj.com",
    "genero": "Masculino",
    "dataMatricula": "2024-01-15",
    "faixa": "Azul",
    "graus": 0,
    "status": "Ativo",
    "bairro": "Asa Sul",
    "dataUltimaGraduacao": "2024-09-13",
    "contatoEmergenciaNome": "Ana",
    "contatoEmergenciaTel": "(61) 98148-2424",
    "pagamentos": [
      {
        "id": 64,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-03-10",
        "dataPagamento": null
      },
      {
        "id": 65,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-04-10",
        "dataPagamento": null
      },
      {
        "id": 66,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pendente",
        "dataVencimento": "2026-05-10",
        "dataPagamento": null
      }
    ],
    "turma": "Adulto"
  },
  {
    "id": 33,
    "nome": "Raul Gonçalves de Moura",
    "cpf": "111.000.018-88",
    "dataNascimento": "1993-07-10",
    "telefone": "(61) 98311-0730",
    "email": "raul.moura@sfbjj.com",
    "genero": "Masculino",
    "dataMatricula": "2022-05-10",
    "faixa": "Azul",
    "graus": 0,
    "status": "Ativo",
    "bairro": "Itapoã Parque",
    "dataUltimaGraduacao": "2022-12-03",
    "contatoEmergenciaNome": "Isadora",
    "contatoEmergenciaTel": "(61) 98214-9073",
    "pagamentos": [
      {
        "id": 67,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-03-10",
        "dataPagamento": null
      },
      {
        "id": 68,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-04-10",
        "dataPagamento": null
      },
      {
        "id": 69,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-05-10",
        "dataPagamento": "2026-05-10"
      }
    ],
    "turma": "Adulto"
  },
  {
    "id": 34,
    "nome": "Rodrigo Rocha Mendonça",
    "cpf": "111.000.019-99",
    "dataNascimento": "1982-04-15",
    "telefone": "(61) 99999-0019",
    "email": "rodrigo.mendonca@sfbjj.com",
    "genero": "Masculino",
    "dataMatricula": "2020-03-10",
    "faixa": "Roxa",
    "graus": 0,
    "status": "Ativo",
    "bairro": "Águas Claras",
    "dataUltimaGraduacao": "2020-11-01",
    "contatoEmergenciaNome": "Não Informado",
    "contatoEmergenciaTel": "",
    "pagamentos": [
      {
        "id": 70,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-03-10",
        "dataPagamento": null
      },
      {
        "id": 71,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-04-10",
        "dataPagamento": null
      },
      {
        "id": 72,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pendente",
        "dataVencimento": "2026-05-10",
        "dataPagamento": null
      }
    ],
    "turma": "Adulto"
  },
  {
    "id": 36,
    "nome": "Thales da Paz",
    "cpf": "111.000.021-11",
    "dataNascimento": "1992-12-07",
    "telefone": "(61) 99185-4342",
    "email": "thalles.moreira@sfbjj.com",
    "genero": "Masculino",
    "dataMatricula": "2024-01-10",
    "faixa": "Azul",
    "graus": 2,
    "status": "Ativo",
    "bairro": "Cruzeiro",
    "dataUltimaGraduacao": "2024-02-15",
    "contatoEmergenciaNome": "Glauber (Irmão)",
    "contatoEmergenciaTel": "(61) 98190-6570",
    "pagamentos": [
      {
        "id": 73,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-03-10",
        "dataPagamento": null
      },
      {
        "id": 74,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-04-10",
        "dataPagamento": null
      },
      {
        "id": 75,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-05-10",
        "dataPagamento": "2026-05-10"
      }
    ],
    "turma": "Adulto"
  },
  {
    "id": 37,
    "nome": "Thiago Augusto Rodrigues",
    "cpf": "111.000.022-22",
    "dataNascimento": "1982-04-07",
    "telefone": "(61) 99622-7769",
    "email": "thiago.rodrigues@sfbjj.com",
    "genero": "Masculino",
    "dataMatricula": "2015-05-10",
    "faixa": "Preta",
    "graus": 0,
    "status": "Ativo",
    "bairro": "Guará",
    "dataUltimaGraduacao": "2025-08-23",
    "contatoEmergenciaNome": "Thassia Costa",
    "contatoEmergenciaTel": "(61) 99168-5854",
    "pagamentos": [
      {
        "id": 76,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-03-10",
        "dataPagamento": null
      },
      {
        "id": 77,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-04-10",
        "dataPagamento": null
      },
      {
        "id": 78,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pendente",
        "dataVencimento": "2026-05-10",
        "dataPagamento": null
      }
    ],
    "turma": "Adulto"
  },
  {
    "id": 38,
    "nome": "Vinícius Gabriel Rodrigues da Silva Brito",
    "cpf": "111.000.023-33",
    "dataNascimento": "2001-02-15",
    "telefone": "(61) 99104-5590",
    "email": "vinicius.brito@sfbjj.com",
    "genero": "Masculino",
    "dataMatricula": "2023-03-20",
    "faixa": "Roxa",
    "graus": 0,
    "status": "Ativo",
    "bairro": "Núcleo Bandeirante",
    "dataUltimaGraduacao": "2025-08-23",
    "contatoEmergenciaNome": "Luana",
    "contatoEmergenciaTel": "(61) 98480-2535",
    "pagamentos": [
      {
        "id": 79,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-03-10",
        "dataPagamento": null
      },
      {
        "id": 80,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-04-10",
        "dataPagamento": "2026-04-10"
      },
      {
        "id": 81,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-05-10",
        "dataPagamento": "2026-05-10"
      }
    ],
    "turma": "Adulto"
  },
  {
    "id": 39,
    "nome": "Vinicius Tadeu Uliana Cavalcante",
    "cpf": "111.000.024-44",
    "dataNascimento": "1990-08-04",
    "telefone": "(61) 98353-9584",
    "email": "vinicius.cavalcante@sfbjj.com",
    "genero": "Masculino",
    "dataMatricula": "2023-05-12",
    "faixa": "Azul",
    "graus": 0,
    "status": "Ativo",
    "bairro": "Cruzeiro",
    "dataUltimaGraduacao": "2025-08-23",
    "contatoEmergenciaNome": "Lidmylla",
    "contatoEmergenciaTel": "(62) 99297-9178",
    "pagamentos": [
      {
        "id": 82,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-03-10",
        "dataPagamento": "2026-03-10"
      },
      {
        "id": 83,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-04-10",
        "dataPagamento": "2026-04-10"
      },
      {
        "id": 84,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-05-10",
        "dataPagamento": "2026-05-10"
      }
    ],
    "turma": "Adulto"
  },
  {
    "id": 40,
    "nome": "Vitor Patrick Alves Tavares",
    "cpf": "111.000.025-55",
    "dataNascimento": "2004-09-05",
    "telefone": "(61) 99120-0140",
    "email": "vitor.tavares@sfbjj.com",
    "genero": "Masculino",
    "dataMatricula": "2024-02-10",
    "faixa": "Azul",
    "graus": 0,
    "status": "Ativo",
    "bairro": "Asa Sul",
    "dataUltimaGraduacao": "2025-12-15",
    "contatoEmergenciaNome": "Valdemar (Avô)",
    "contatoEmergenciaTel": "(61) 99115-5476",
    "pagamentos": [
      {
        "id": 85,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-03-10",
        "dataPagamento": null
      },
      {
        "id": 86,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-04-10",
        "dataPagamento": "2026-04-10"
      },
      {
        "id": 87,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-05-10",
        "dataPagamento": "2026-05-10"
      }
    ],
    "turma": "Adulto"
  },
  {
    "id": 41,
    "nome": "Willian (Wally)",
    "cpf": "111.000.026-66",
    "dataNascimento": "1988-05-23",
    "telefone": "(61) 99168-8002",
    "email": "willian.stambassi@sfbjj.com",
    "genero": "Masculino",
    "dataMatricula": "2025-06-01",
    "faixa": "Branca",
    "graus": 0,
    "status": "Inativo",
    "bairro": "Sudoeste",
    "dataUltimaGraduacao": "2025-06-01",
    "contatoEmergenciaNome": "Não Informado",
    "contatoEmergenciaTel": "",
    "pagamentos": [
      {
        "id": 88,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-03-10",
        "dataPagamento": "2026-03-10"
      },
      {
        "id": 89,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-04-10",
        "dataPagamento": null
      },
      {
        "id": 90,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pendente",
        "dataVencimento": "2026-05-10",
        "dataPagamento": null
      }
    ],
    "turma": "Adulto"
  },
  {
    "id": 42,
    "nome": "Alice Naves dos Santos",
    "cpf": "",
    "dataNascimento": "2019-03-13",
    "telefone": "(61) 98431-2386",
    "email": "mluiza.naves@gmail.com",
    "genero": "Feminino",
    "dataMatricula": "2026-03-16",
    "faixa": "Branca",
    "graus": 0,
    "status": "Ativo",
    "bairro": "",
    "dataUltimaGraduacao": "2026-03-16",
    "contatoEmergenciaNome": "Felipe (Pai)",
    "contatoEmergenciaTel": "(61) 98431-6561",
    "pagamentos": [
      {
        "id": 91,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-03-10",
        "dataPagamento": null
      },
      {
        "id": 92,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-04-10",
        "dataPagamento": "2026-04-10"
      },
      {
        "id": 93,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-05-10",
        "dataPagamento": "2026-05-10"
      }
    ],
    "turma": "Kids"
  },
  {
    "id": 43,
    "nome": "Bento Naves dos Santos",
    "cpf": "",
    "dataNascimento": "2022-01-30",
    "telefone": "(61) 98431-2386",
    "email": "mluiza.naves@gmail.com",
    "genero": "Masculino",
    "dataMatricula": "2026-03-16",
    "faixa": "Branca",
    "graus": 0,
    "status": "Ativo",
    "bairro": "",
    "dataUltimaGraduacao": "2026-03-16",
    "contatoEmergenciaNome": "Felipe (Pai)",
    "contatoEmergenciaTel": "(61) 98431-6561",
    "pagamentos": [
      {
        "id": 94,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-03-10",
        "dataPagamento": null
      },
      {
        "id": 95,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-04-10",
        "dataPagamento": "2026-04-10"
      },
      {
        "id": 96,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-05-10",
        "dataPagamento": "2026-05-10"
      }
    ],
    "turma": "Kids"
  },
  {
    "id": 45,
    "nome": "JOÃO MARCELO IZAGA COUTINHO DE OLIVEIRA",
    "cpf": "",
    "dataNascimento": "2016-08-14",
    "telefone": "(61) 99119-9554",
    "email": "mccouti@yahoo.com.br",
    "genero": "Masculino",
    "dataMatricula": "2026-03-15",
    "faixa": "Branca",
    "graus": 0,
    "status": "Ativo",
    "bairro": "",
    "dataUltimaGraduacao": "2026-03-15",
    "contatoEmergenciaNome": "Não Informado",
    "contatoEmergenciaTel": "(61) 99221-1223",
    "pagamentos": [
      {
        "id": 97,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-03-10",
        "dataPagamento": null
      },
      {
        "id": 98,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-04-10",
        "dataPagamento": "2026-04-10"
      },
      {
        "id": 99,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-05-10",
        "dataPagamento": "2026-05-10"
      }
    ],
    "turma": "Kids"
  },
  {
    "id": 46,
    "nome": "Laura Araújo Luz",
    "cpf": "",
    "dataNascimento": "2017-03-13",
    "telefone": "(61) 98245-3389",
    "email": "kmila_araujo89@hotmail.com",
    "genero": "Feminino",
    "dataMatricula": "2026-03-06",
    "faixa": "Branca",
    "graus": 0,
    "status": "Ativo",
    "bairro": "",
    "dataUltimaGraduacao": "2026-03-06",
    "contatoEmergenciaNome": "Reberty Pereira Luz (Pai)",
    "contatoEmergenciaTel": "(61) 99643-5138",
    "pagamentos": [
      {
        "id": 100,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-03-10",
        "dataPagamento": "2026-03-10"
      },
      {
        "id": 101,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-04-10",
        "dataPagamento": "2026-04-10"
      },
      {
        "id": 102,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-05-10",
        "dataPagamento": "2026-05-10"
      }
    ],
    "turma": "Kids"
  },
  {
    "id": 47,
    "nome": "Moises",
    "cpf": "",
    "dataNascimento": "2015-06-15",
    "telefone": "(61) 99999-0047",
    "email": "moises@sfbjj.com",
    "genero": "Masculino",
    "dataMatricula": "2026-03-10",
    "faixa": "Branca",
    "graus": 0,
    "status": "Ativo",
    "bairro": "",
    "dataUltimaGraduacao": "2026-03-10",
    "contatoEmergenciaNome": "Responsável",
    "contatoEmergenciaTel": "(61) 99999-0047",
    "pagamentos": [
      {
        "id": 103,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-03-10",
        "dataPagamento": null
      },
      {
        "id": 104,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-04-10",
        "dataPagamento": null
      },
      {
        "id": 105,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-05-10",
        "dataPagamento": "2026-05-10"
      }
    ],
    "turma": "Kids"
  },
  {
    "id": 48,
    "nome": "Ezequiel",
    "cpf": "",
    "dataNascimento": "2016-08-20",
    "telefone": "(61) 99999-0048",
    "email": "ezequiel@sfbjj.com",
    "genero": "Masculino",
    "dataMatricula": "2026-03-10",
    "faixa": "Branca",
    "graus": 0,
    "status": "Ativo",
    "bairro": "",
    "dataUltimaGraduacao": "2026-03-10",
    "contatoEmergenciaNome": "Responsável",
    "contatoEmergenciaTel": "(61) 99999-0048",
    "pagamentos": [
      {
        "id": 106,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-03-10",
        "dataPagamento": null
      },
      {
        "id": 107,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-04-10",
        "dataPagamento": null
      },
      {
        "id": 108,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-05-10",
        "dataPagamento": "2026-05-10"
      }
    ],
    "turma": "Kids"
  },
  {
    "id": 136,
    "nome": "Noah",
    "cpf": "",
    "dataNascimento": "2018-05-10",
    "telefone": "",
    "email": "",
    "genero": "Masculino",
    "dataMatricula": "2026-03-10",
    "faixa": "Branca",
    "graus": 0,
    "status": "Ativo",
    "bairro": "",
    "dataUltimaGraduacao": "2026-03-10",
    "contatoEmergenciaNome": "Responsável",
    "contatoEmergenciaTel": "",
    "turma": "Kids",
    "pagamentos": [
      {
        "id": 109,
        "mesRef": "Março/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-03-10",
        "dataPagamento": null
      },
      {
        "id": 110,
        "mesRef": "Abril/2026",
        "valor": 100,
        "status": "Atrasado",
        "dataVencimento": "2026-04-10",
        "dataPagamento": null
      },
      {
        "id": 111,
        "mesRef": "Maio/2026",
        "valor": 100,
        "status": "Pago",
        "dataVencimento": "2026-05-10",
        "dataPagamento": "2026-05-10"
      }
    ]
  }
];

export const INITIAL_ATTENDANCES: Presenca[] = [
  {
    id: 1,
    data: '2026-05-20',
    aulaId: 3,
    alunosPresentes: [1, 2, 4, 5]
  },
  {
    id: 2,
    data: '2026-05-19',
    aulaId: 4,
    alunosPresentes: [1, 2, 3]
  }
];