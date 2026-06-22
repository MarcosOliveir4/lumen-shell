import { loadRemoteModule } from '@angular-architects/native-federation';
import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/auth';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    canActivate: [noAuthGuard],
    loadComponent: () => import('./features/login').then((m) => m.Login),
  },
  {
    path: 'kanban',
    canActivate: [authGuard],
    loadChildren: () =>
      loadRemoteModule('lumen-kanban', './Routes')
        .then((m) => m.routes)
        .catch((err) => {
          console.error('Falha ao carregar o Micro-Frontend Lumen Kanban: ', err);
          return [];
        }),
  },
];
