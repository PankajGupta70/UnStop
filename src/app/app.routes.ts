import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/user-dashboard/user-dashboard.component').then(
        (module) => module.UserDashboardComponent
      )
  },
  {
    path: '**',
    redirectTo: ''
  }
];
