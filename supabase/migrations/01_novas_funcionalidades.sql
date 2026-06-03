-- Criação da tabela de Professores
CREATE TABLE IF NOT EXISTS professores (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefone TEXT,
    especialidade TEXT,
    senha TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criação da tabela de Histórico de Graduações
CREATE TABLE IF NOT EXISTS graduacoes_historico (
    id SERIAL PRIMARY KEY,
    aluno_id INTEGER REFERENCES alunos(id) ON DELETE CASCADE,
    faixa TEXT NOT NULL,
    graus INTEGER NOT NULL DEFAULT 0,
    data_graduacao DATE NOT NULL,
    avaliador TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserir um professor administrador mock para permitir testes, já que o login usará a tabela professores
INSERT INTO professores (nome, email, telefone, especialidade, senha)
VALUES ('Admin Master', 'admin@sfbjj.com', '00000000000', 'Gestão', 'admin123')
ON CONFLICT (email) DO NOTHING;

-- Habilitar RLS (Row Level Security) - Políticas básicas (ajustáveis depois)
ALTER TABLE professores ENABLE ROW LEVEL SECURITY;
ALTER TABLE graduacoes_historico ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público para fins de teste no projeto local (como as demais tabelas)
CREATE POLICY "Acesso total publico professores" ON professores FOR ALL USING (true);
CREATE POLICY "Acesso total publico graduacoes" ON graduacoes_historico FOR ALL USING (true);
