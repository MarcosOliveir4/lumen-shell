import { FirebaseError } from 'firebase/app';

export function getFirebaseAuthErrorMessage(error: FirebaseError): string {
  const errorStr = String(error?.code || error?.message || '');

  if (errorStr.includes('INVALID_LOGIN_CREDENTIALS') || errorStr.includes('invalid-credential')) {
    return 'E-mail ou senha incorretos.';
  }

  if (errorStr.includes('email-already-in-use')) {
    return 'Este e-mail já está cadastrado no sistema Lumen.';
  }

  if (errorStr.includes('weak-password')) {
    return 'A senha informada é muito fraca (use pelo menos 6 caracteres).';
  }

  if (errorStr.includes('invalid-email')) {
    return 'O formato do e-mail é inválido.';
  }

  if (errorStr.includes('too-many-requests')) {
    return 'Muitas tentativas falhas. Por segurança, aguarde alguns minutos e tente novamente.';
  }

  if (errorStr.includes('network-request-failed')) {
    return 'Falha na conexão. Verifique sua internet e tente novamente.';
  }

  return 'Ocorreu um erro na autenticação. Verifique seus dados e tente novamente.';
}
