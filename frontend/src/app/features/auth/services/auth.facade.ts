import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { AuthApiService } from './auth.api';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { HttpErrorService } from '../../../core/services/http-error.service';
import { LoginRequest, RegisterRequest, AuthState } from '../models/auth.model';
import { User } from '../../../core/models/api.model';
import { HttpErrorResponse } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class AuthFacade {
  // Internal state
  private readonly stateSubject = new BehaviorSubject<AuthState>({
    loading: false,
    error: null,
    user: null,
    isAuthenticated: false
  });

  // Public observables
  readonly state$: Observable<AuthState> = this.stateSubject.asObservable();
  readonly loading$: Observable<boolean> = new BehaviorSubject<boolean>(false);
  readonly error$: Observable<string | null> = new BehaviorSubject<string | null>(null);
  readonly user$: Observable<User | null> = new BehaviorSubject<User | null>(null);
  readonly isAuthenticated$: Observable<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private authApi: AuthApiService,
    private tokenStorage: TokenStorageService,
    private authStateService: AuthStateService,
    private httpErrorService: HttpErrorService
  ) {
    this.initializeAuthState();

    this.state$.subscribe(state => {
      (this.loading$ as BehaviorSubject<boolean>).next(state.loading);
      (this.error$ as BehaviorSubject<string | null>).next(state.error);
      (this.user$ as BehaviorSubject<User | null>).next(state.user);
      (this.isAuthenticated$ as BehaviorSubject<boolean>).next(state.isAuthenticated);
    });
  }


  private initializeAuthState(): void {
    const hasToken = this.tokenStorage.hasToken();
    this.updateState({
      isAuthenticated: hasToken
    });
  }

  login(credentials: LoginRequest): Observable<void> {
    this.updateState({ loading: true, error: null });

    return new Observable<void>(observer => {
      this.authApi.login(credentials).pipe(
        tap(response => {
          // Store token
          this.tokenStorage.setToken(response.access_token);
          
          // Update centralized auth state
          this.authStateService.setAuthenticated(true);

          // Update state
          this.updateState({
            user: response.user || null,
            isAuthenticated: true,
            error: null
          });
        }),
        catchError((error: HttpErrorResponse) => {
          const apiError = this.httpErrorService.mapError(error);
          this.updateState({
            error: apiError.message,
            isAuthenticated: false
          });
          return throwError(() => apiError);
        }),
        finalize(() => {
          this.updateState({ loading: false });
        })
      ).subscribe({
        next: () => {
          observer.next();
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        }
      });
    });
  }

  register(data: RegisterRequest): Observable<void> {
    this.updateState({ loading: true, error: null });

    return new Observable<void>(observer => {
      this.authApi.register(data).pipe(
        tap(response => {
          this.tokenStorage.setToken(response.access_token);
          
          // Update centralized auth state
          this.authStateService.setAuthenticated(true);

          this.updateState({
            user: response.user || null,
            isAuthenticated: true,
            error: null
          });
        }),
        catchError((error: HttpErrorResponse) => {
          const apiError = this.httpErrorService.mapError(error);
          this.updateState({
            error: apiError.message,
            isAuthenticated: false
          });
          return throwError(() => apiError);
        }),
        finalize(() => {
          this.updateState({ loading: false });
        })
      ).subscribe({
        next: () => {
          observer.next();
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        }
      });
    });
  }

  logout(): void {
    this.authApi.logout().subscribe();

    this.tokenStorage.removeToken();
    
    // Update centralized auth state
    this.authStateService.setAuthenticated(false);

    this.updateState({
      user: null,
      isAuthenticated: false,
      error: null,
      loading: false
    });
  }

  clearError(): void {
    this.updateState({ error: null });
  }

  private updateState(partial: Partial<AuthState>): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({ ...currentState, ...partial });
  }

  getStateSnapshot(): AuthState {
    return this.stateSubject.value;
  }
}
