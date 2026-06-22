import { FirebaseError } from 'firebase/app';
import { getFirebaseAuthErrorMessage } from './firebase-errors';

const createMockFirebaseError = (code: string, message = ''): FirebaseError => {
  return {
    name: 'FirebaseError',
    code,
    message,
  } as FirebaseError;
};

describe('getFirebaseAuthErrorMessage', () => {
  const errorTestCases: [string, string][] = [
    ['auth/invalid-credential', 'E-mail ou senha incorretos.'],
    ['INVALID_LOGIN_CREDENTIALS', 'E-mail ou senha incorretos.'],
    ['auth/email-already-in-use', 'Este e-mail já está cadastrado no sistema Lumen.'],
    ['auth/weak-password', 'A senha informada é muito fraca (use pelo menos 6 caracteres).'],
    ['auth/invalid-email', 'O formato do e-mail é inválido.'],
    [
      'auth/too-many-requests',
      'Muitas tentativas falhas. Por segurança, aguarde alguns minutos e tente novamente.',
    ],
    ['auth/network-request-failed', 'Falha na conexão. Verifique sua internet e tente novamente.'],
    [
      'auth/codigo-novo-e-desconhecido',
      'Ocorreu um erro na autenticação. Verifique seus dados e tente novamente.',
    ],
  ];

  it.each(errorTestCases)(
    'deve retornar a mensagem correta para a chave de erro: %s',
    (errorCode: string, expectedMessage: string) => {
      const mockError = createMockFirebaseError(errorCode);
      const result = getFirebaseAuthErrorMessage(mockError);

      expect(result).toBe(expectedMessage);
    },
  );

  it('deve procurar a palavra-chave na propriedade "message" caso não esteja no "code"', () => {
    const mockError = createMockFirebaseError(
      'INVALID_LOGIN_CREDENTIALS',
      'The INVALID_LOGIN_CREDENTIALS error happened',
    );
    const result = getFirebaseAuthErrorMessage(mockError);

    expect(result).toBe('E-mail ou senha incorretos.');
  });

  it('deve retornar a mensagem de fallback (padrão) caso o objeto de erro seja malformado', () => {
    const malformedError = {} as FirebaseError;
    const result = getFirebaseAuthErrorMessage(malformedError);

    expect(result).toBe('Ocorreu um erro na autenticação. Verifique seus dados e tente novamente.');
  });
});
