-- 05_melhorias_integridade.sql
-- Aplica regras de integridade física e lógica, índices de performance e chaves estrangeiras tardias

-- 1. Restrições CHECK na tabela Alunos
ALTER TABLE public.alunos 
    ADD CONSTRAINT chk_alunos_status CHECK (status IN ('Ativo', 'Inativo', 'Graduado')),
    ADD CONSTRAINT chk_alunos_turma CHECK (turma IN ('Kids', 'Adulto'));

-- 2. Restrições CHECK na tabela Pagamentos
ALTER TABLE public.pagamentos 
    ADD CONSTRAINT chk_pagamentos_status CHECK (status IN ('Pago', 'Pendente', 'Atrasado')),
    ADD CONSTRAINT chk_pagamentos_valor CHECK (valor >= 0.00);

-- 3. Índices Únicos Condicionais na tabela Alunos (evita duplicados mantendo flexibilidade para registros sem contato)
CREATE UNIQUE INDEX IF NOT EXISTS alunos_cpf_unique_idx 
    ON public.alunos (cpf) 
    WHERE (cpf IS NOT NULL AND cpf <> '' AND cpf <> 'N/A');

CREATE UNIQUE INDEX IF NOT EXISTS alunos_email_unique_idx 
    ON public.alunos (email) 
    WHERE (email IS NOT NULL AND email <> '' AND email <> 'N/A');

-- 4. Estabelecer Chave Estrangeira entre Aulas e Professores (tabela criada na migração 01)
ALTER TABLE public.aulas 
    ADD CONSTRAINT fk_aulas_professor FOREIGN KEY ("professorId") REFERENCES public.professores(id) ON DELETE SET NULL;

-- 5. Índices de Desempenho para Chaves Estrangeiras (otimiza JOINs frequentes)
CREATE INDEX IF NOT EXISTS idx_pagamentos_alunoId ON public.pagamentos("alunoId");
CREATE INDEX IF NOT EXISTS idx_graduacoes_historico_aluno_id ON public.graduacoes_historico(aluno_id);
CREATE INDEX IF NOT EXISTS idx_graduacoes_aluno_id ON public.graduacoes(aluno_id);
CREATE INDEX IF NOT EXISTS idx_graduacoes_professor_id ON public.graduacoes(professor_id);
CREATE INDEX IF NOT EXISTS idx_aulas_professorId ON public.aulas("professorId");
