-- seed.sql
-- Dados de teste/semente para inicialização rápida do ambiente local do Supabase SFBJJ

-- 1. Inserir Alunos iniciais de teste (mapeando campos camelCase)
INSERT INTO public.alunos (
    nome, cpf, "dataNascimento", telefone, email, genero, "dataMatricula", bairro, faixa, graus, "dataUltimaGraduacao", "contatoEmergenciaNome", "contatoEmergenciaTel", status, turma, "modalidadePagamento"
) VALUES 
('Alice Naves dos Santos', '111.000.001.01', '2019-03-13', '(61) 98431-2386', 'alice.naves@exemplo.com', 'Feminino', '2026-03-16', 'Asa Sul', 'Branca', 0, '2026-03-16', 'Felipe', '(61) 98431-6561', 'Ativo', 'Kids', 'Mensal'),
('Andrigo Rodrigues Ramos', '111.000.001.02', '1983-11-22', '(61) 98427-7376', 'andrigo.ramos@exemplo.com', 'Masculino', '2016-01-01', 'Guará', 'Preta', 0, '2016-01-01', 'Nitielma', '(61) 98427-6823', 'Ativo', 'Adulto', 'Mensal'),
('Breno Carlos Soares Fernandes', '111.000.001.06', '1995-02-10', '(61) 98258-4490', 'breno.carlos@exemplo.com', 'Masculino', '2021-05-10', 'Asa Sul', 'Azul', 2, '2025-08-23', 'Vanessa', '(61) 98290-7784', 'Ativo', 'Adulto', 'Mensal'),
('Lucas Santiago Gonçalves dos Anjos', '111.000.001.29', '1987-03-18', '(61) 98158-0353', 'lucas.sga@gmail.com', 'Masculino', '2024-12-22', 'Guará', 'Preta', 2, '2024-12-22', 'Eduarda', '(61) 98226-2607', 'Ativo', 'Adulto', 'Mensal')
ON CONFLICT DO NOTHING;

-- 2. Inserir Histórico de Graduação Inicial para os alunos inseridos
INSERT INTO public.graduacoes_historico (aluno_id, faixa, graus, data_graduacao, avaliador)
SELECT id, faixa, graus, COALESCE("dataUltimaGraduacao", "dataMatricula")::date, 'Admin Master'
FROM public.alunos
ON CONFLICT DO NOTHING;

-- 3. Inserir Pagamentos iniciais simulados para teste financeiro
INSERT INTO public.pagamentos ("alunoId", "mesRef", valor, status, "dataVencimento", "dataPagamento")
SELECT 
    id, 
    'Junho/2026', 
    150.00, 
    CASE WHEN nome LIKE 'Lucas%' OR nome LIKE 'Breno%' THEN 'Pago'::text ELSE 'Pendente'::text END,
    '2026-06-10',
    CASE WHEN nome LIKE 'Lucas%' OR nome LIKE 'Breno%' THEN '2026-06-08'::text ELSE NULL END
FROM public.alunos
ON CONFLICT DO NOTHING;

-- 4. Inserir Aulas padrão de Jiu-Jitsu no cronograma
INSERT INTO public.aulas (hora, categoria, professor, "diasSemana") VALUES
('18:00 - 19:15', 'Adulto', 'Andrigo Rodrigues Ramos', ARRAY[1, 3, 5]),
('19:15 - 20:30', 'Avançado', 'Lucas Santiago Gonçalves dos Anjos', ARRAY[1, 3, 5]),
('09:00 - 10:15', 'Infantil', 'Admin Master', ARRAY[2, 4]),
('19:00 - 20:15', 'No-Gi', 'Lucas Santiago Gonçalves dos Anjos', ARRAY[2, 4])
ON CONFLICT DO NOTHING;

-- 5. Inserir Avisos institucionais iniciais para a dashboard
INSERT INTO public.avisos (titulo, conteudo, data, fixado) VALUES
('Exame de Faixa - Julho 2026', 'Atenção alunos, nosso próximo exame de graduação e entrega de graus ocorrerá no dia 25 de Julho de 2026. Estejam com os kimonos oficiais limpos e a carência em dia!', '2026-06-25', true),
('Novo Horário de No-Gi Terças e Quintas', 'A partir da próxima semana, a aula de No-Gi das terças e quintas passará a ser às 19:00. Contamos com a presença de todos.', '2026-06-26', false)
ON CONFLICT DO NOTHING;
