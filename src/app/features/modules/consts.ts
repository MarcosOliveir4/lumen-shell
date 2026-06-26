import { ICard } from './model';

export const MODULES_CARDS: ICard[] = [
  {
    title: 'Administração',
    icon: 'manage_accounts',
    description: 'Controle os membros, cargos e níveis de acesso ao sistema.',
    link: '/admin-panel',
    roles: ['admin'],
  },
  {
    title: 'Quadro de Trabalhos',
    icon: 'view_kanban',
    description: 'Visualize e movimente os trabalhos dos consulentes de forma interativa.',
    link: '/kanban',
    roles: ['admin', 'work-manager', 'work-view'],
  },
];
