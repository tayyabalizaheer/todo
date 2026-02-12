import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';


@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  private readonly TOKEN_KEY = 'auth_token';
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private parseSanctumToken(rawToken: string): string {
    const parts = rawToken.split('|');
    return parts.length === 2 ? parts[1] : rawToken;
  }


  setToken(rawToken: string): void {
    if (!this.isBrowser) return;
    
    const token = this.parseSanctumToken(rawToken);
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return null;
    }
  }


  removeToken(): void {
    if (!this.isBrowser) return;
    
    try {
      localStorage.removeItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token from localStorage:', error);
    }
  }

  hasToken(): boolean {
    if (!this.isBrowser) return false;
    
    try {
      const token = this.getToken();
      return !!token && token.length > 0;
    } catch (error) {
      console.error('Error checking token:', error);
      return false;
    }
  }
}
