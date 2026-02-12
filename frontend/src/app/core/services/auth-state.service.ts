import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean | null>(null);
  private isInitializedSubject = new BehaviorSubject<boolean>(false);
  private isBrowser: boolean;

  public isAuthenticated$: Observable<boolean | null> = this.isAuthenticatedSubject.asObservable();
  public isInitialized$: Observable<boolean> = this.isInitializedSubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private tokenStorage: TokenStorageService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Initialize immediately in constructor for browser
    if (this.isBrowser) {
      this.initializeSync();
    }
  }

  /**
   * Synchronous initialization for immediate use
   */
  private initializeSync(): void {
    try {
      const hasToken = this.tokenStorage.hasToken();
      this.isAuthenticatedSubject.next(hasToken);
      this.isInitializedSubject.next(true);
    } catch (error) {
      console.error('Error initializing auth state:', error);
      this.isAuthenticatedSubject.next(false);
      this.isInitializedSubject.next(true);
    }
  }

  /**
   * Initialize auth state - called by APP_INITIALIZER
   */
  initialize(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isBrowser) {
        this.isAuthenticatedSubject.next(false);
        this.isInitializedSubject.next(true);
        resolve();
        return;
      }

      // Already initialized in constructor, just resolve
      if (this.isInitializedSubject.value) {
        resolve();
        return;
      }

      // Initialize if not done yet
      this.initializeSync();
      resolve();
    });
  }

  /**
   * Wait for initialization to complete
   */
  async waitForInitialization(): Promise<void> {
    if (this.isInitializedSubject.value) {
      return Promise.resolve();
    }
    
    return firstValueFrom(
      this.isInitialized$.pipe(
        filter(initialized => initialized === true),
        take(1)
      )
    ).then(() => {});
  }

  /**
   * Check if user is authenticated (synchronous)
   */
  isAuthenticated(): boolean {
    const value = this.isAuthenticatedSubject.value;
    // If null (not initialized), check token directly
    if (value === null && this.isBrowser) {
      return this.tokenStorage.hasToken();
    }
    return value === true;
  }

  /**
   * Set authentication state (call after login)
   */
  setAuthenticated(value: boolean): void {
    this.isAuthenticatedSubject.next(value);
  }

  /**
   * Update auth state based on token presence
   */
  checkAuthState(): void {
    const hasToken = this.tokenStorage.hasToken();
    this.isAuthenticatedSubject.next(hasToken);
  }
}
