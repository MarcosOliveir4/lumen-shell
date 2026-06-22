import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(Auth);
  const router = inject(Router);
  const user = await authService.waitForUser();

  if (user) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
