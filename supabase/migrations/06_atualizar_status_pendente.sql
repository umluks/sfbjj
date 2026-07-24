-- 06_atualizar_status_pendente.sql
-- Atualiza a restrição CHECK da tabela alunos para permitir o status 'Pendente' e 'Aguardando'

ALTER TABLE public.alunos 
    DROP CONSTRAINT IF EXISTS chk_alunos_status;

ALTER TABLE public.alunos 
    ADD CONSTRAINT chk_alunos_status 
    CHECK (status IN ('Ativo', 'Inativo', 'Pendente', 'Aguardando', 'Graduado'));
