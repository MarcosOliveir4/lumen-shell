import { Component, inject, signal } from '@angular/core';
import { MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { User } from 'firebase/auth';
import { Auth } from '../../../core/auth';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.html',
  styleUrl: './avatar.scss',
  imports: [MatMenuModule, MatIcon, MatMiniFabButton],
})
export class Avatar {
  private readonly auth = inject(Auth);

  public readonly user = signal<User | null>(null);

  constructor() {
    this.auth.getUser().subscribe((user) => {
      this.user.set(user);
    });
  }

  async logout() {
    await this.auth.logout();
  }
}
