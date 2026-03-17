import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, combineLatest, map, startWith } from 'rxjs';

import { UserFormComponent } from '../../components/user-form/user-form.component';
import { UserRoleChartComponent } from '../../components/user-role-chart/user-role-chart.component';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UserFormComponent, UserRoleChartComponent],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDashboardComponent {
  private readonly userService = inject(UserService);
  private readonly currentPageSubject = new BehaviorSubject(1);
  private readonly pageSize = 5;

  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly users$ = this.userService.users$;
  protected readonly filteredUsers$ = combineLatest([
    this.users$,
    this.searchControl.valueChanges.pipe(startWith(this.searchControl.value))
  ]).pipe(
    map(([users, query]) => {
      const normalizedQuery = query.trim().toLowerCase();

      if (!normalizedQuery) {
        return users;
      }

      return users.filter((user) =>
        [user.name, user.email, user.role].some((value) =>
          value.toLowerCase().includes(normalizedQuery)
        )
      );
    })
  );
  protected readonly currentPage$ = this.currentPageSubject.asObservable();
  protected readonly paginatedUsersView$ = combineLatest([
    this.filteredUsers$,
    this.currentPage$
  ]).pipe(
    map(([users, currentPage]) => {
      const totalItems = users.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / this.pageSize));
      const safePage = Math.min(currentPage, totalPages);
      const startIndex = totalItems === 0 ? 0 : (safePage - 1) * this.pageSize;
      const endIndex = Math.min(startIndex + this.pageSize, totalItems);

      return {
        users: users.slice(startIndex, endIndex),
        currentPage: safePage,
        totalPages,
        startItem: totalItems === 0 ? 0 : startIndex + 1,
        endItem: endIndex,
        totalItems
      };
    })
  );

  protected isFormOpen = false;

  constructor() {
    this.searchControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.currentPageSubject.next(1));

    this.filteredUsers$
      .pipe(takeUntilDestroyed())
      .subscribe((users) => {
        const totalPages = Math.max(1, Math.ceil(users.length / this.pageSize));

        if (this.currentPageSubject.value > totalPages) {
          this.currentPageSubject.next(totalPages);
        }
      });
  }

  protected openUserForm(): void {
    this.isFormOpen = true;
  }

  protected closeUserForm(): void {
    this.isFormOpen = false;
  }

  protected addUser(user: User): void {
    this.userService.addUser(user);
    this.currentPageSubject.next(1);
    this.closeUserForm();
  }

  protected goToPreviousPage(): void {
    this.currentPageSubject.next(Math.max(1, this.currentPageSubject.value - 1));
  }

  protected goToNextPage(totalPages: number): void {
    this.currentPageSubject.next(Math.min(totalPages, this.currentPageSubject.value + 1));
  }
}
