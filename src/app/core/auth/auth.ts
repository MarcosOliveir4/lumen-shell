import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
  UserCredential,
} from 'firebase/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserRole } from './model';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly router = inject(Router);
  private readonly firebaseApp = initializeApp(environment.firebase);
  private readonly auth = getAuth(this.firebaseApp);

  private readonly currentUser = new BehaviorSubject<User | null>(null);

  public readonly userRole = signal<UserRole[]>(['user']);
  public readonly isAdmin = computed(() => this.userRole().includes('admin'));

  constructor() {
    onAuthStateChanged(this.auth, async (user) => {
      this.currentUser.next(user);

      if (user) {
        const tokenResult = await user.getIdTokenResult();
        console.log(tokenResult);

        const role = (tokenResult.claims['roles'] as UserRole[]) || ['user'];
        this.userRole.set(role);
        sessionStorage.setItem('lumen_token', tokenResult.token);
      } else {
        this.userRole.set(['user']);
        sessionStorage.removeItem('lumen_token');
      }
    });
  }

  async registerWithEmail(
    email: string,
    pass: string,
    displayName: string,
  ): Promise<UserCredential> {
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, pass);

      await updateProfile(credential.user, { displayName });
      this.currentUser.next({ ...credential.user, displayName });

      this.router.navigate(['/modules']);
      return credential;
    } catch (error) {
      console.error('Erro no cadastro:', error);
      throw error;
    }
  }

  async loginWithEmail(email: string, pass: string): Promise<UserCredential> {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, pass);
      this.router.navigate(['/modules']);
      return credential;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  waitForUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }

  getUser(): Observable<User | null> {
    return this.currentUser.asObservable();
  }

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/']);
  }
}
