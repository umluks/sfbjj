-- 14_checkin_externo.sql
-- Atualiza a tabela de frequencias para suportar check-ins em academias externas

-- Permitir que aula_id seja opcional em check-ins externos
ALTER TABLE public.frequencias ALTER COLUMN aula_id DROP NOT NULL;

-- Adicionar colunas para suporte a treino externo
ALTER TABLE public.frequencias ADD COLUMN IF NOT EXISTS is_externo BOOLEAN DEFAULT false;
ALTER TABLE public.frequencias ADD COLUMN IF NOT EXISTS local_externo TEXT;
ALTER TABLE public.frequencias ADD COLUMN IF NOT EXISTS observacao TEXT;
