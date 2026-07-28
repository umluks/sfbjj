-- Migration 16: Adiciona a coluna 'peso' na tabela de alunos para controle de categorias IBJJF
ALTER TABLE public.alunos 
ADD COLUMN IF NOT EXISTS peso NUMERIC(5,2);

-- Comentário para identificação da coluna
COMMENT ON COLUMN public.alunos.peso IS 'Peso atual do aluno em kg para cálculo automático de categoria e divisão IBJJF';
