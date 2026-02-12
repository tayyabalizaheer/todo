import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { tap, switchMap, startWith } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Notification,
  NotificationsResponse,
  UnreadCountResponse,
} from '../models/notification.model';
import { ApiResponse } from '../models/api.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/notifications`;

  // Signals for reactive state management
  unreadCount = signal<number>(0);
  notifications = signal<Notification[]>([]);

  /**
   * Get all notifications for the current user
   */
  getNotifications(
    unreadOnly: boolean = false,
    perPage: number = 15
  ): Observable<NotificationsResponse> {
    const params = new HttpParams()
      .set('unread_only', unreadOnly.toString())
      .set('per_page', perPage.toString());

    return this.http
      .get<NotificationsResponse>(this.apiUrl, { params })
      .pipe(
        tap((response) => {
          this.notifications.set(response.notifications);
          this.unreadCount.set(response.unread_count);
        })
      );
  }

  /**
   * Get unread notification count
   */
  getUnreadCount(): Observable<UnreadCountResponse> {
    return this.http
      .get<UnreadCountResponse>(`${this.apiUrl}/unread-count`)
      .pipe(
        tap((response) => {
          this.unreadCount.set(response.unread_count);
        })
      );
  }

  /**
   * Poll for unread count every 30 seconds
   */
  pollUnreadCount(intervalMs: number = 30000): Observable<UnreadCountResponse> {
    return interval(intervalMs).pipe(
      startWith(0),
      switchMap(() => this.getUnreadCount())
    );
  }

  /**
   * Mark a notification as read
   */
  markAsRead(notificationId: string): Observable<ApiResponse<void>> {
    return this.http
      .post<ApiResponse<void>>(`${this.apiUrl}/${notificationId}/mark-read`, {})
      .pipe(
        tap(() => {
          // Update local state
          const currentNotifications = this.notifications();
          const updatedNotifications = currentNotifications.map((n) =>
            n.id === notificationId
              ? { ...n, read_at: new Date().toISOString() }
              : n
          );
          this.notifications.set(updatedNotifications);
          
          // Decrease unread count
          const currentCount = this.unreadCount();
          if (currentCount > 0) {
            this.unreadCount.set(currentCount - 1);
          }
        })
      );
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): Observable<ApiResponse<void>> {
    return this.http
      .post<ApiResponse<void>>(`${this.apiUrl}/mark-all-read`, {})
      .pipe(
        tap(() => {
          // Update local state
          const currentNotifications = this.notifications();
          const updatedNotifications = currentNotifications.map((n) => ({
            ...n,
            read_at: new Date().toISOString(),
          }));
          this.notifications.set(updatedNotifications);
          this.unreadCount.set(0);
        })
      );
  }

  /**
   * Delete a notification
   */
  deleteNotification(notificationId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${notificationId}`).pipe(
      tap(() => {
        // Update local state
        const currentNotifications = this.notifications();
        const notification = currentNotifications.find((n) => n.id === notificationId);
        const filteredNotifications = currentNotifications.filter(
          (n) => n.id !== notificationId
        );
        this.notifications.set(filteredNotifications);
        
        // Decrease unread count if the deleted notification was unread
        if (notification && !notification.read_at) {
          const currentCount = this.unreadCount();
          if (currentCount > 0) {
            this.unreadCount.set(currentCount - 1);
          }
        }
      })
    );
  }

  /**
   * Get notification message icon based on type
   */
  getNotificationIcon(type: string): string {
    switch (type) {
      case 'todo_shared':
        return '🔗';
      case 'todo_share_accepted':
        return '✅';
      case 'todo_updated':
        return '✏️';
      case 'todo_deleted':
        return '🗑️';
      default:
        return '🔔';
    }
  }

  /**
   * Format relative time for notifications
   */
  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  }
}
