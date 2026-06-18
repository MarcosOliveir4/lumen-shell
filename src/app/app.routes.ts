import { loadRemoteModule } from '@angular-architects/native-federation';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'kanban',
    loadChildren: () =>
      loadRemoteModule('lumen-kanban', './Routes')
        .then((m) => m.routes)
        .catch((err) => {
          console.error('Falha ao carregar o Micro-Frontend Lumen Kanban: ', err);
          return [];
        }),
  },
];
