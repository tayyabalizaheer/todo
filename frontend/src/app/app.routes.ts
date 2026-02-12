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
        path: 'blog',
        loadComponent: () => import('./features/blog/blog-list/blog-list.component').then(m => m.BlogListComponent),
        title: `Blog - ${environment.appName}`
      },
      {
        path: 'blog/:slug',
        loadComponent: () => import('./features/blog/blog-detail/blog-detail.component').then(m => m.BlogDetailComponent),
        title: `Blog Post - ${environment.appName}`
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard],
        title: `Dashboard - ${environment.appName}`
      },
      {
        path: 'dashboard/todo',
        loadComponent: () => import('./features/dashboard/pages/todo/todo.component').then(m => m.TodoComponent),
        canActivate: [authGuard],
        title: `My Todos - ${environment.appName}`
      },
      {
        path: 'dashboard/blog',
        loadComponent: () => import('./features/dashboard/pages/blog/blog.component').then(m => m.BlogComponent),
        canActivate: [authGuard],
        title: `Blog Management - ${environment.appName}`
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
