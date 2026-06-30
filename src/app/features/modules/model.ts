import { UserRole } from '../../core/auth/model';

export interface ICard {
  title: string;
  icon: string;
  description: string;
  link: string;
  roles: UserRole[];
}
