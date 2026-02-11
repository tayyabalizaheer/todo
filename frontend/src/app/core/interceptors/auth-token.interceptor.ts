import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStorageService } from '../services/token-storage.service';


const BYPASS_PATTERNS = [
  '/api/login',
  '/api/register'
];


export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);

  const shouldBypass = BYPASS_PATTERNS.some(pattern => 
    req.url.includes(pattern)
  );

  if (shouldBypass) {
    return next(req);
  }

  const token = tokenStorage.getToken();
  if (!token) {
    return next(req);
  }

  // Add Authorization header
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);
};
