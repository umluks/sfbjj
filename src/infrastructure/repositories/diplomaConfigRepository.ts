import { supabase } from '@/infrastructure/lib/supabaseClient';
import type { IDiplomaConfigRepository } from '@/domain/repositories/diplomaConfigRepository';
import type { DiplomaConfig } from '@/domain/models/diplomaConfig';
import { handleSupabaseError } from './errorHelper';

export class DiplomaConfigRepository implements IDiplomaConfigRepository {
  async getConfig(): Promise<DiplomaConfig> {
    try {
      const { data, error } = await supabase
        .from('configuracoes_diploma')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        // Retorna configuração padrão se não existir no banco
        return {
          id: 'default',
          backgroundTemplate: null,
          keepDefaultTitles: true,
          keepDefaultDecor: false
        };
      }

      return {
        id: data.id,
        backgroundTemplate: data.background_template,
        keepDefaultTitles: data.keep_default_titles ?? true,
        keepDefaultDecor: data.keep_default_decor ?? false,
        textoLinha1: data.texto_linha1 ?? 'A SAGRADA FAMILIA BRASÍLIA JIU-JITSU CONFERE A GRADUAÇÃO DE',
        textoLinha3: data.texto_linha3 ?? 'AO ALUNO',
        textoDataPrefix: data.texto_data_prefix ?? 'em graduação presencial realizada em'
      };
    } catch (error: any) {
      throw handleSupabaseError(error, `Falha ao buscar configurações do diploma: ${error.message}`);
    }
  }

  async updateConfig(config: Partial<DiplomaConfig>): Promise<void> {
    const payload: any = {
      updated_at: new Date().toISOString()
    };

    if (config.backgroundTemplate !== undefined) {
      payload.background_template = config.backgroundTemplate;
    }
    if (config.keepDefaultTitles !== undefined) {
      payload.keep_default_titles = config.keepDefaultTitles;
    }
    if (config.keepDefaultDecor !== undefined) {
      payload.keep_default_decor = config.keepDefaultDecor;
    }
    if (config.textoLinha1 !== undefined) {
      payload.texto_linha1 = config.textoLinha1;
    }
    if (config.textoLinha3 !== undefined) {
      payload.texto_linha3 = config.textoLinha3;
    }
    if (config.textoDataPrefix !== undefined) {
      payload.texto_data_prefix = config.textoDataPrefix;
    }

    try {
      // Tenta atualizar a linha 'default'
      const { error } = await supabase
        .from('configuracoes_diploma')
        .update(payload)
        .eq('id', 'default');

      if (error) {
        throw error;
      }
    } catch (error: any) {
      throw handleSupabaseError(error, `Erro ao atualizar configurações do diploma: ${error.message}`);
    }
  }
}
