import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../core/auth';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FirebaseError } from 'firebase/app';
import { getFirebaseAuthErrorMessage } from '../../core/utils';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.scss',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Auth);

  public readonly isLoginMode = signal<boolean>(true);
  public readonly hidePassword = signal<boolean>(true);
  public readonly errorMessage = signal<string | null>(null);
  public readonly isLoading = signal<boolean>(false);

  public authForm = this.fb.group({
    name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  public toggleMode(): void {
    this.isLoginMode.update((mode) => !mode);
    this.errorMessage.set(null);
    this.authForm.reset();

    // 🔮 TRUQUE SÊNIOR: Acessar pelo 'controls' evita o optional chaining ('?.')
    // Isso mata os "branches fantasmas" no relatório de coverage.
    const nameControl = this.authForm.controls.name;

    if (this.isLoginMode()) {
      nameControl.clearValidators();
    } else {
      nameControl.setValidators([Validators.required, Validators.minLength(3)]);
    }
    nameControl.updateValueAndValidity();
  }

  async onSubmit(): Promise<void> {
    // if (this.authForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { name, email, password } = this.authForm.value;

    try {
      if (this.isLoginMode()) {
        await this.auth.loginWithEmail(email!, password!);
      } else {
        await this.auth.registerWithEmail(email!, password!, name!);
      }
    } catch (error) {
      if (error instanceof FirebaseError) {
        const friendlyMessage = getFirebaseAuthErrorMessage(error);
        this.errorMessage.set(friendlyMessage);
      } else {
        // 🔮 Cobre a ramificação falsa do IF (erros genéricos de Javascript/Rede)
        this.errorMessage.set('Ocorreu um erro inesperado.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}
