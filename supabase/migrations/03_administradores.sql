-- 1. Remove a tabela administradores se ela já tiver sido criada por engano
DROP TABLE IF EXISTS public.administradores;

-- 2. Adiciona colunas de controle (role, cpf, foto_perfil) na tabela professores
ALTER TABLE public.professores ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'teacher';
ALTER TABLE public.professores ADD COLUMN IF NOT EXISTS cpf TEXT UNIQUE;
ALTER TABLE public.professores ADD COLUMN IF NOT EXISTS foto_perfil TEXT;

-- 3. Insere ou atualiza o administrador padrão na tabela professores
INSERT INTO public.professores (nome, email, senha, cpf, role)
VALUES ('Lucas dos Anjos', 'admin@sfbjj.com', '#sfbjj2026', '013.343.141-01', 'admin')
ON CONFLICT (email) 
DO UPDATE SET 
    nome = EXCLUDED.nome,
    senha = EXCLUDED.senha,
    cpf = EXCLUDED.cpf,
    role = EXCLUDED.role;

-- 4. Remove as colunas redundantes de compatibilidade na tabela alunos
ALTER TABLE public.alunos DROP COLUMN IF EXISTS faixa_atual;
ALTER TABLE public.alunos DROP COLUMN IF EXISTS graus_atuais;
