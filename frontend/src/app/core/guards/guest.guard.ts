import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthStateService } from '../services/auth-state.service';


export const guestGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const platformId = inject(PLATFORM_ID);
  const authState = inject(AuthStateService);
  const router = inject(Router);
  
  // During SSR, allow access (will be checked again on client)
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (!authState.isAuthenticated()) {
    return true;
  }

  // Get the returnUrl from query params if it exists
  const returnUrl = route.queryParams['returnUrl'] || '/dashboard';
  
  // Redirect authenticated users to the return URL or dashboard
  return router.createUrlTree([returnUrl]);
};
