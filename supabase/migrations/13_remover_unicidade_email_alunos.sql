-- 13_remover_unicidade_email_alunos.sql
-- Permite que múltiplos alunos compartilhem o mesmo e-mail (ex: famílias/dependentes)
-- O CPF permanece como identificador único obrigatório dos alunos.

DROP INDEX IF EXISTS public.alunos_email_unique_idx;
