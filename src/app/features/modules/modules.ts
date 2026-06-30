import { Component, computed, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Auth } from '../../core/auth';
import { MODULES_CARDS } from './consts';

@Component({
  templateUrl: './modules.html',
  styleUrl: './modules.scss',
  imports: [MatCardModule, MatButton, MatIcon],
})
export class Modules {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  public readonly cards = computed(() => {
    const userRoles = this.auth.userRole();

    return MODULES_CARDS.filter((card) => card.roles.some((role) => userRoles.includes(role)));
  });

  redirectTo(path: string) {
    this.router.navigateByUrl(path);
  }
}
