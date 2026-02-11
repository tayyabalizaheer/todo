import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../models/auth.model';
import { environment } from '../../../../environments/environment';

/**
 * Auth API service - handles HTTP calls only
 * No state management - that's handled by AuthFacade
 */
@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private readonly apiUrl = environment?.apiUrl || 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}


  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials);
  }

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/auth/register`, data);
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/logout`, {});
  }
}
