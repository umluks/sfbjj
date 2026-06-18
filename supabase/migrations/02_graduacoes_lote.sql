-- Adiciona colunas de compatibilidade na tabela alunos
ALTER TABLE public.alunos ADD COLUMN IF NOT EXISTS faixa_atual TEXT;
ALTER TABLE public.alunos ADD COLUMN IF NOT EXISTS graus_atuais INTEGER DEFAULT 0;

-- Sincroniza os valores atuais com os antigos
UPDATE public.alunos SET faixa_atual = faixa WHERE faixa_atual IS NULL;
UPDATE public.alunos SET graus_atuais = graus WHERE graus_atuais IS NULL;

-- Criação da tabela de Graduações em Lote/Diplomas
CREATE TABLE IF NOT EXISTS public.graduacoes (
    id SERIAL PRIMARY KEY,
    aluno_id INTEGER REFERENCES public.alunos(id) ON DELETE CASCADE,
    faixa_antiga TEXT,
    nova_faixa TEXT NOT NULL,
    quantidade_graus INTEGER NOT NULL DEFAULT 0,
    data_graduacao DATE NOT NULL DEFAULT CURRENT_DATE,
    professor_id INTEGER REFERENCES public.professores(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.graduacoes ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público para fins de teste no projeto local
CREATE POLICY "Acesso total publico graduacoes_lote" ON public.graduacoes FOR ALL USING (true);
