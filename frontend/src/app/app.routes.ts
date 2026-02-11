import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';
import { environment } from '../environments/environment';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
        title: `Home - ${environment.appName}`
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard],
        title: `Dashboard - ${environment.appName}`
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
