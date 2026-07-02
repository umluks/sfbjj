-- 07_ajuste_categorias_grade.sql
-- Atualiza as categorias existentes de aulas e turmas para as novas opções (Adulto, Kids, Open Match)

-- 1. Atualizar categorias na tabela de aulas
UPDATE public.aulas 
SET categoria = 'Kids' 
WHERE categoria = 'Infantil';

UPDATE public.aulas 
SET categoria = 'Adulto' 
WHERE categoria IN ('Adulto Iniciante', 'Avançado', 'No-Gi');

-- 2. Atualizar categorias na tabela de turmas (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'turmas') THEN
        UPDATE public.turmas SET categoria = 'Kids' WHERE categoria = 'Infantil';
        UPDATE public.turmas SET categoria = 'Adulto' WHERE categoria IN ('Adulto Iniciante', 'Avançado', 'No-Gi');
    END IF;
END $$;
