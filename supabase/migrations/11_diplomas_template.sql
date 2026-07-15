-- 11_diplomas_template.sql
-- Adiciona a coluna assinatura na tabela professores
ALTER TABLE public.professores ADD COLUMN IF NOT EXISTS assinatura TEXT;

-- Cria a tabela de configurações do diploma
CREATE TABLE IF NOT EXISTS public.configuracoes_diploma (
    id TEXT PRIMARY KEY,
    background_template TEXT,
    keep_default_titles BOOLEAN DEFAULT true,
    keep_default_decor BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.configuracoes_diploma ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público para fins de teste no projeto local
DROP POLICY IF EXISTS "Acesso total publico configuracoes_diploma" ON public.configuracoes_diploma;
CREATE POLICY "Acesso total publico configuracoes_diploma" ON public.configuracoes_diploma FOR ALL USING (true);

-- Insere as configurações padrão
INSERT INTO public.configuracoes_diploma (id, keep_default_titles, keep_default_decor)
VALUES ('default', true, false)
ON CONFLICT (id) DO NOTHING;
