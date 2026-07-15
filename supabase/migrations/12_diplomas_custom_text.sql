-- 12_diplomas_custom_text.sql
-- Adiciona colunas para textos customizados na tabela configuracoes_diploma
ALTER TABLE public.configuracoes_diploma 
    ADD COLUMN IF NOT EXISTS texto_linha1 TEXT DEFAULT 'A SAGRADA FAMILIA BRASÍLIA JIU-JITSU CONFERE A GRADUAÇÃO DE',
    ADD COLUMN IF NOT EXISTS texto_linha3 TEXT DEFAULT 'AO ALUNO',
    ADD COLUMN IF NOT EXISTS texto_data_prefix TEXT DEFAULT 'em graduação presencial realizada em';

-- Atualiza a linha existente com os valores padrão se estiverem nulos
UPDATE public.configuracoes_diploma 
SET 
    texto_linha1 = COALESCE(texto_linha1, 'A SAGRADA FAMILIA BRASÍLIA JIU-JITSU CONFERE A GRADUAÇÃO DE'),
    texto_linha3 = COALESCE(texto_linha3, 'AO ALUNO'),
    texto_data_prefix = COALESCE(texto_data_prefix, 'em graduação presencial realizada em')
WHERE id = 'default';
