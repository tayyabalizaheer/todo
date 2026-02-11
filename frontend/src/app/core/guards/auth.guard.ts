import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';


export const authGuard: CanActivateFn = (route, state) => {
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);
  console.log("AuthGuard: Checking authentication for route:", tokenStorage.hasToken());
  
  if (tokenStorage.hasToken()) {
    return true;
  }else{
    // Redirect to login with return URL
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  
};
