import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { UserService } from './services';
import { IUser } from './services/model';

@Component({
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
  imports: [MatTableModule, MatCardModule, MatProgressSpinnerModule],
})
export class Admin {
  private readonly userService = inject(UserService);

  protected readonly displayedColumns = ['displayName', 'email', 'roles'];
  protected readonly dataSource = signal<IUser[]>([]);
  protected readonly isLoadingDataSource = signal<boolean>(true);

  constructor() {
    this.userService
      .listUsers()
      .pipe(
        takeUntilDestroyed(),
        finalize(() => {
          this.isLoadingDataSource.set(false);
        }),
      )
      .subscribe(({ data }) => {
        this.dataSource.set(data);
      });
  }
}
