import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  private readonly TOKEN_KEY = 'auth_token';


  private parseSanctumToken(rawToken: string): string {
    const parts = rawToken.split('|');
    return parts.length === 2 ? parts[1] : rawToken;
  }


  setToken(rawToken: string): void {
    const token = this.parseSanctumToken(rawToken);
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }


  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  hasToken(): boolean {
    return !!this.getToken();
  }
}
