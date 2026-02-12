import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateTodoRequest, UpdateTodoRequest, TodoApiResponse } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private apiUrl = `${environment.apiUrl}/todos`;

  constructor(private http: HttpClient) {}

  /**
   * Get all todos (owned and shared with user)
   */
  getTodos(params?: { status?: 'open' | 'completed'; search?: string; per_page?: number }): Observable<TodoApiResponse> {
    let httpParams = new HttpParams();
    
    if (params?.status) {
      httpParams = httpParams.set('status', params.status);
    }
    
    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }

    if (params?.per_page) {
      httpParams = httpParams.set('per_page', params.per_page.toString());
    }

    return this.http.get<TodoApiResponse>(this.apiUrl, { params: httpParams });
  }

  /**
   * Get a single todo by ID
   */
  getTodo(id: number): Observable<TodoApiResponse> {
    return this.http.get<TodoApiResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new todo
   */
  createTodo(todo: CreateTodoRequest): Observable<TodoApiResponse> {
    return this.http.post<TodoApiResponse>(this.apiUrl, todo);
  }

  /**
   * Update an existing todo
   */
  updateTodo(id: number, todo: UpdateTodoRequest): Observable<TodoApiResponse> {
    return this.http.put<TodoApiResponse>(`${this.apiUrl}/${id}`, todo);
  }

  /**
   * Delete a todo
   */
  deleteTodo(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Mark todo as completed
   */
  markAsCompleted(id: number): Observable<TodoApiResponse> {
    return this.http.post<TodoApiResponse>(`${this.apiUrl}/${id}/complete`, {});
  }

  /**
   * Reopen a completed todo
   */
  markAsOpen(id: number): Observable<TodoApiResponse> {
    return this.http.post<TodoApiResponse>(`${this.apiUrl}/${id}/reopen`, {});
  }

  /**
   * Share a todo with one or more users
   */
  shareTodo(todoId: number, emails: string[], permission: 'view' | 'edit' | 'owner' = 'view'): Observable<{ success: boolean; message: string; data?: any; errors?: any }> {
    return this.http.post<{ success: boolean; message: string; data?: any; errors?: any }>(`${this.apiUrl}/${todoId}/share`, {
      emails,
      permission
    });
  }

  /**
   * Accept a shared todo
   */
  acceptSharedTodo(todoId: number): Observable<{ success: boolean; message: string; data?: any }> {
    return this.http.post<{ success: boolean; message: string; data?: any }>(`${this.apiUrl}/${todoId}/accept`, {});
  }
}
