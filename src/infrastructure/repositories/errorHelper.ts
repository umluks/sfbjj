export function handleSupabaseError(error: any, defaultMessage: string): Error {
  if (!error) return new Error(defaultMessage);

  console.error("Supabase Error Log:", error);

  // Mapeia códigos de erros comuns do PostgreSQL
  const code = error.code;
  let userFriendlyMessage = defaultMessage;

  switch (code) {
    case '23505': // unique_violation
      if (error.message?.includes('cpf')) {
        userFriendlyMessage = 'Já existe um cadastro com este CPF.';
      } else if (error.message?.includes('email')) {
        userFriendlyMessage = 'Já existe um cadastro com este e-mail.';
      } else if (error.message?.includes('uniq_aluno_aula_data') || error.message?.includes('frequencias')) {
        userFriendlyMessage = 'Você já realizou check-in nesta aula hoje!';
      } else {
        userFriendlyMessage = 'Erro de duplicidade: Um registro com dados únicos informados já existe.';
      }
      break;
    case '23503': // foreign_key_violation
      userFriendlyMessage = 'Não é possível realizar esta operação pois o registro está vinculado a outras informações no sistema.';
      break;
    case '42501': // insufficient_privilege / RLS policy violation
      userFriendlyMessage = 'Você não possui permissão para realizar esta operação.';
      break;
    case 'P0001': // raise_exception (ex: validação via trigger)
      userFriendlyMessage = error.message || 'Erro de validação no banco de dados.';
      break;
    default:
      userFriendlyMessage = error.message || defaultMessage;
  }

  return new Error(userFriendlyMessage);
}
