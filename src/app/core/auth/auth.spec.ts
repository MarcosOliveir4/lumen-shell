import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Procedure } from '@vitest/spy';
import { Auth as FirebaseAuth, User, UserCredential } from 'firebase/auth';
import { Mock, vi } from 'vitest';
import { Auth as AuthService } from './auth';

const mocks = vi.hoisted(() => ({
  mockCreateUser:
    vi.fn<(auth: FirebaseAuth, email: string, pass: string) => Promise<UserCredential>>(),
  mockSignIn: vi.fn<(auth: FirebaseAuth, email: string, pass: string) => Promise<UserCredential>>(),
  mockSignOut: vi.fn<(auth: FirebaseAuth) => Promise<void>>(),
  mockUpdateProfile: vi.fn<(user: User, data: { displayName?: string | null }) => Promise<void>>(),
  mockGetAuth: vi.fn<() => FirebaseAuth>().mockReturnValue({} as FirebaseAuth),
  mockGetIdTokenResult: vi.fn<() => FirebaseAuth>().mockReturnValue({} as FirebaseAuth),
}));

type AuthStateCallback = (user: User | null) => void;
let authStateCallback: AuthStateCallback;

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  getAuth: mocks.mockGetAuth,
  onAuthStateChanged: vi.fn((auth: FirebaseAuth, callback: AuthStateCallback) => {
    authStateCallback = callback;
    return vi.fn();
  }),
  createUserWithEmailAndPassword: mocks.mockCreateUser,
  signInWithEmailAndPassword: mocks.mockSignIn,
  signOut: mocks.mockSignOut,
  updateProfile: mocks.mockUpdateProfile,
  getIdTokenResult: mocks.mockGetIdTokenResult,
}));

describe('Auth Service', () => {
  let service: AuthService;

  let routerSpy: { navigate: Mock<Procedure> };

  const partialMockUser: Partial<User> = {
    uid: '123',
    email: 'test@lumen.com',
    getIdToken: vi
      .fn<(forceRefresh?: boolean) => Promise<string>>()
      .mockResolvedValue('fake-jwt-token'),
    getIdTokenResult: vi.fn().mockResolvedValue({
      token: 'fake-jwt-token',
      claims: {},
    }),
  };

  const fullMockUser = partialMockUser as User;

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(Storage.prototype, 'setItem');
    vi.spyOn(Storage.prototype, 'removeItem');

    vi.spyOn(console, 'error').mockImplementation(() => {
      return;
    });

    routerSpy = {
      navigate: vi.fn<(commands: string[]) => Promise<boolean>>().mockResolvedValue(true),
    };

    TestBed.configureTestingModule({
      providers: [AuthService, { provide: Router, useValue: routerSpy }],
    });

    service = TestBed.inject(AuthService);
  });

  describe('Constructor (onAuthStateChanged)', () => {
    it('deve guardar o token no sessionStorage se houver utilizador logado', async () => {
      await authStateCallback(fullMockUser);

      expect(fullMockUser.getIdTokenResult).toHaveBeenCalled();
      expect(sessionStorage.setItem).toHaveBeenCalledWith('lumen_token', 'fake-jwt-token');

      service.getUser().subscribe((user: User | null) => {
        expect(user).toEqual(fullMockUser);
      });
    });

    it('deve remover o token do sessionStorage se o utilizador for deslogado (null)', async () => {
      await authStateCallback(null);
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('lumen_token');
    });
  });

  describe('registerWithEmail', () => {
    it('deve registar, atualizar perfil, atualizar signal e navegar para o modules em caso de sucesso', async () => {
      const mockCredential: Partial<UserCredential> = { user: fullMockUser };

      mocks.mockCreateUser.mockResolvedValue(mockCredential as UserCredential);
      mocks.mockUpdateProfile.mockResolvedValue(undefined);

      const result = await service.registerWithEmail('test@test.com', '123456', 'Marcos');

      expect(mocks.mockCreateUser).toHaveBeenCalledWith(
        mocks.mockGetAuth(),
        'test@test.com',
        '123456',
      );
      expect(mocks.mockUpdateProfile).toHaveBeenCalledWith(fullMockUser, { displayName: 'Marcos' });
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/modules']);
      expect(result).toEqual(mockCredential as UserCredential);
    });

    it('deve lançar o erro se o registo falhar', async () => {
      const mockError = new Error('Email já em uso');
      mocks.mockCreateUser.mockRejectedValue(mockError);

      await expect(service.registerWithEmail('t@t.com', '123', 'Marcos')).rejects.toThrow(
        'Email já em uso',
      );
      expect(console.error).toHaveBeenCalledWith('Erro no cadastro:', mockError);
    });
  });

  describe('loginWithEmail', () => {
    it('deve fazer login e navegar para o modules em caso de sucesso', async () => {
      const mockCredential: Partial<UserCredential> = { user: fullMockUser };
      mocks.mockSignIn.mockResolvedValue(mockCredential as unknown as UserCredential);

      const result = await service.loginWithEmail('test@test.com', '123456');

      expect(mocks.mockSignIn).toHaveBeenCalledWith(mocks.mockGetAuth(), 'test@test.com', '123456');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/modules']);
      expect(result).toEqual(mockCredential as UserCredential);
    });

    it('deve lançar o erro se o login falhar', async () => {
      const mockError = new Error('Senha incorreta');
      mocks.mockSignIn.mockRejectedValue(mockError);

      await expect(service.loginWithEmail('t@t.com', '123')).rejects.toThrow('Senha incorreta');
      expect(console.error).toHaveBeenCalledWith('Erro no login:', mockError);
    });
  });

  describe('waitForUser', () => {
    it('deve retornar uma promise que resolve com a instância do utilizador', async () => {
      setTimeout(() => authStateCallback(fullMockUser), 10);

      const result: User | null = await service.waitForUser();
      expect(result).toEqual(fullMockUser);
    });
  });

  describe('logout', () => {
    it('deve chamar signOut do Firebase e navegar para a raiz', async () => {
      mocks.mockSignOut.mockResolvedValue(undefined);

      await service.logout();

      expect(mocks.mockSignOut).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('Signals Reativos (userRole e isAdmin)', () => {
    it('deve retornar false para isAdmin por padrão (inicializado como "user")', () => {
      expect(service.isAdmin()).toBe(false);
    });

    it('deve retornar true para isAdmin quando userRole incluir "admin"', () => {
      service.userRole.set(['user', 'admin']);

      expect(service.isAdmin()).toBe(true);
    });

    it('deve retornar false para isAdmin se a role "admin" for removida', () => {
      service.userRole.set(['work-manager']);

      expect(service.isAdmin()).toBe(false);
    });
  });
});
