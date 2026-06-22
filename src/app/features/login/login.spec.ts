import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { FirebaseError } from 'firebase/app';
import { UserCredential } from 'firebase/auth';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Login } from './login';

import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Auth } from '../../core/auth';

const mocks = vi.hoisted(() => ({
  mockLogin: vi.fn<(email: string, pass: string) => Promise<UserCredential>>(),
  mockRegister: vi.fn<(email: string, pass: string, name: string) => Promise<UserCredential>>(),
}));

describe('Login Component', () => {
  // 2. FÁBRICA DE SETUP (Prepara o ambiente para cada teste)
  const setup = async () => {
    const user = userEvent.setup();

    // Injeta os mocks estritos substituindo o Auth Service verdadeiro
    const authServiceMock = {
      loginWithEmail: mocks.mockLogin,
      registerWithEmail: mocks.mockRegister,
    };

    await render(Login, {
      imports: [
        ReactiveFormsModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
      ],
      providers: [{ provide: Auth, useValue: authServiceMock }],
    });

    return { user };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderização e UI', () => {
    it('deve inicializar no modo Login (sem campo de nome)', async () => {
      await setup();

      expect(screen.getByTestId('login-title')).toHaveTextContent('Entrar no Lumen 🔮');
      expect(screen.queryByTestId('name-input')).not.toBeInTheDocument();

      // O botão deve começar desabilitado por causa da validação nativa do Angular
      expect(screen.getByTestId('submit-btn')).toBeDisabled();
    });

    it('deve alternar para o modo Registo e exibir o campo de nome', async () => {
      const { user } = await setup();

      const toggleBtn = screen.getByTestId('toggle-mode-btn');
      await user.click(toggleBtn);

      // Agora a tela mudou para o modo de criar conta
      expect(screen.getByTestId('login-title')).toHaveTextContent('Criar sua Conta ✨');
      expect(screen.getByTestId('name-input')).toBeInTheDocument();
    });

    it('deve alternar a visibilidade da senha ao clicar no ícone do olho', async () => {
      const { user } = await setup();

      const passwordInput = screen.getByTestId('password-input');
      const togglePasswordBtn = screen.getByTestId('toggle-password-btn');

      // Começa como 'password'
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Clica no olho
      await user.click(togglePasswordBtn);

      // Muda para 'text'
      expect(passwordInput).toHaveAttribute('type', 'text');
    });
    it('deve alternar para Cadastro e depois voltar para Login perfeitamente', async () => {
      const { user } = await setup();
      const toggleBtn = screen.getByTestId('toggle-mode-btn');

      // 1º Clique: Vai para cadastro (Cobre a linha do 'else')
      await user.click(toggleBtn);
      expect(screen.getByTestId('name-input')).toBeInTheDocument();

      // 2º Clique: Volta para login (Cobre a linha do 'if')
      await user.click(toggleBtn);
      expect(screen.queryByTestId('name-input')).not.toBeInTheDocument();
    });
  });

  describe('Submissão de Formulário (Integração com Auth)', () => {
    it('deve chamar loginWithEmail no modo Login ao preencher corretamente', async () => {
      const { user } = await setup();
      mocks.mockLogin.mockResolvedValue({} as UserCredential);

      // Preenche os dados
      await user.type(screen.getByTestId('email-input'), 'test@lumen.com');
      await user.type(screen.getByTestId('password-input'), '123456');

      // Clica em Entrar
      await user.click(screen.getByTestId('submit-btn'));

      expect(mocks.mockLogin).toHaveBeenCalledTimes(1);
      expect(mocks.mockLogin).toHaveBeenCalledWith('test@lumen.com', '123456');
    });

    it('deve chamar registerWithEmail no modo Cadastro ao preencher corretamente', async () => {
      const { user } = await setup();
      mocks.mockRegister.mockResolvedValue({} as UserCredential);

      // Alterna para Registo
      await user.click(screen.getByTestId('toggle-mode-btn'));

      // Preenche os dados
      await user.type(screen.getByTestId('name-input'), 'Marcos Lumen');
      await user.type(screen.getByTestId('email-input'), 'test@lumen.com');
      await user.type(screen.getByTestId('password-input'), '123456');

      // Clica em Concluir Cadastro
      await user.click(screen.getByTestId('submit-btn'));

      expect(mocks.mockRegister).toHaveBeenCalledTimes(1);
      expect(mocks.mockRegister).toHaveBeenCalledWith('test@lumen.com', '123456', 'Marcos Lumen');
    });

    it('NÃO deve chamar o authService se o formulário for submetido inválido (Enter key)', async () => {
      // Simula o caso em que o usuário aperta a tecla "Enter" ignorando o [disabled] do botão
      const { user } = await setup();

      // Digita apenas e-mail (formulário continua inválido por causa da senha)
      await user.type(screen.getByTestId('email-input'), 'test@lumen.com{enter}');

      expect(mocks.mockLogin).not.toHaveBeenCalled();
    });
  });

  describe('Tratamento de Erros e Firebase', () => {
    it('deve exibir mensagem amigável ao receber um FirebaseError', async () => {
      const { user } = await setup();

      // 1. Criamos um erro real do Firebase (usando um código que existe na nossa utility)
      const fakeFirebaseError = new FirebaseError('auth/invalid-credential', 'Invalid login');
      mocks.mockLogin.mockRejectedValue(fakeFirebaseError);

      // ❌ APAGADO: Não forçamos mais o retorno do Mock. Vamos deixar a utility real trabalhar!

      // 2. Preenchemos e disparamos a tentativa de login
      await user.type(screen.getByTestId('email-input'), 'test@lumen.com');
      await user.type(screen.getByTestId('password-input'), 'senha-errada');
      await user.click(screen.getByTestId('submit-btn'));

      // 3. Verificamos a mensagem REAL que a nossa utility cospe para 'invalid-credential'
      await waitFor(() => {
        const alert = screen.getByTestId('error-alert');
        expect(alert).toBeInTheDocument();
        // 🔮 A MÁGICA AQUI: Usamos a string exata que está lá no seu firebase-errors.util.ts
        expect(alert).toHaveTextContent('E-mail ou senha incorretos.');
      });
    });

    it('deve exibir mensagem genérica ao receber um erro desconhecido (Não-Firebase)', async () => {
      const { user } = await setup();

      // Simulamos um erro nativo do Javascript (e não do Firebase)
      mocks.mockLogin.mockRejectedValue(new Error('Erro interno de memória'));

      await user.type(screen.getByTestId('email-input'), 'test@lumen.com');
      await user.type(screen.getByTestId('password-input'), '123456');
      await user.click(screen.getByTestId('submit-btn'));

      await waitFor(() => {
        const alert = screen.getByTestId('error-alert');
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveTextContent('Ocorreu um erro inesperado.');
      });
    });
  });
});
