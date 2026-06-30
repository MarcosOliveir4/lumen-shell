import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';

export const noAuthGuard: CanActivateFn = async () => {
  const authService = inject(Auth);
  const router = inject(Router);

  const user = await authService.waitForUser();

  if (user) {
    router.navigate(['/modules']);
    return false;
  }
  return true;
};
