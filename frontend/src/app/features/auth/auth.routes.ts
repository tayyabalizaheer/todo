import { Routes } from '@angular/router';
import { LayoutComponent } from '../../core/layout/layout.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { environment } from '../../../environments/environment';
import { guestGuard } from '../../core/guards/guest.guard';

/**
 * Auth module routes
 */
export const authRoutes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent,
        canActivate: [guestGuard],
        title: `Login - ${environment.appName}`
      },
      {
        path: 'register',
        component: RegisterComponent,
        canActivate: [guestGuard],
        title: `Register - ${environment.appName}`
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  }
];
