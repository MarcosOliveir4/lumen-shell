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
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: 'modules',
    canActivate: [authGuard],
    loadComponent: () => import('./features/modules/modules').then((m) => m.Modules),
  },
  {
    path: 'admin-panel',
    canActivate: [authGuard],
    loadComponent: () => import('./features/admin/admin').then((m) => m.Admin),
    data: { breadcrumb: 'Administração' },
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
