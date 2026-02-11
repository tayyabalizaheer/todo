import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserSearchResult {
  id: number;
  name: string;
  email: string;
}

export interface UserSearchResponse {
  success: boolean;
  data: UserSearchResult[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Search users by email
   */
  searchUsers(email: string, limit: number = 10): Observable<UserSearchResponse> {
    return this.http.get<UserSearchResponse>(`${this.apiUrl}/search`, {
      params: { email, limit: limit.toString() }
    });
  }
}
