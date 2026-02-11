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
    
    return localStorage.getItem(this.TOKEN_KEY);
  }


  removeToken(): void {
    if (!this.isBrowser) return;
    
    localStorage.removeItem(this.TOKEN_KEY);
  }

  hasToken(): boolean {
    return !!this.getToken();
  }
}
