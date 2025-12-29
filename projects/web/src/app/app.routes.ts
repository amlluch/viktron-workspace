import { Routes } from '@angular/router';

import { AuthCallbackComponent, LoginRedirectComponent, authGuard, adminGuard } from 'shared';
import { ShellComponent } from './shell.component';

export const routes: Routes = [
  // Always start at login
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  // Public routes
  { path: 'login', component: LoginRedirectComponent },
  { path: 'auth/callback', component: AuthCallbackComponent },

  // Logged user routes
// Logged area (Shell wraps these)
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: 'hello',
        canActivate: [authGuard],
        loadComponent: () => import('feature-hello').then((m) => m.HelloComponent),
      },
      {
        path: 'admin/users',
        canActivate: [authGuard, adminGuard],
        loadComponent: () => import('feature-admin').then((m) => m.UsersComponent),
      },
    ],
  },

  // Fallback
  { path: '**', redirectTo: 'login' },
];
