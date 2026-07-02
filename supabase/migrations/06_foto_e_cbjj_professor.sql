-- 06_foto_e_cbjj_professor.sql
-- Adiciona a coluna cbjj e garante a existência da coluna foto_perfil na tabela professores

ALTER TABLE public.professores 
    ADD COLUMN IF NOT EXISTS cbjj TEXT,
    ADD COLUMN IF NOT EXISTS foto_perfil TEXT;
