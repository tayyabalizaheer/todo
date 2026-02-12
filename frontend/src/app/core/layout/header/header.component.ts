import { Component, OnInit, OnDestroy, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../../environments/environment';
import { TokenStorageService } from '../../services/token-storage.service';
import { AuthFacade } from '../../../features/auth/services/auth.facade';
import { NotificationService } from '../../services/notification.service';
import { Subscription } from 'rxjs';
import { Notification } from '../../models/notification.model';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  appName = environment.appName;
  isMenuOpen = false;
  isNotificationsOpen = false;
  
  private pollSubscription?: Subscription;

  // Computed signals
  unreadCount = computed(() => this.notificationService.unreadCount());
  notifications = computed(() => this.notificationService.notifications());
  hasUnreadNotifications = computed(() => this.unreadCount() > 0);

  constructor(
    private tokenStorage: TokenStorageService,
    private authFacade: AuthFacade,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    if (this.isLoggedIn) {
      // Load initial notifications
      this.loadNotifications();
      // Start polling for new notifications
      this.pollSubscription = this.notificationService.pollUnreadCount(30000).subscribe();
    }
  }

  ngOnDestroy(): void {
    this.pollSubscription?.unsubscribe();
  }

  get isLoggedIn(): boolean {
    return this.tokenStorage.hasToken();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) {
      this.isNotificationsOpen = false;
    }
  }

  toggleNotifications(): void {
    this.isNotificationsOpen = !this.isNotificationsOpen;
    if (this.isNotificationsOpen) {
      this.isMenuOpen = false;
      this.loadNotifications();
    }
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  closeNotifications(): void {
    this.isNotificationsOpen = false;
  }

  loadNotifications(): void {
    this.notificationService.getNotifications(false, 10).subscribe();
  }

  markAsRead(notification: Notification, event: Event): void {
    event.stopPropagation();
    if (!notification.read_at) {
      this.notificationService.markAsRead(notification.id).subscribe();
    }
  }

  markAllAsRead(event: Event): void {
    event.stopPropagation();
    this.notificationService.markAllAsRead().subscribe();
  }

  deleteNotification(notificationId: string, event: Event): void {
    event.stopPropagation();
    this.notificationService.deleteNotification(notificationId).subscribe();
  }

  getNotificationIcon(type: string): string {
    return this.notificationService.getNotificationIcon(type);
  }

  getRelativeTime(dateString: string): string {
    return this.notificationService.getRelativeTime(dateString);
  }

  navigateToTodo(notification: Notification): void {
    if (notification.data.todo_id) {
      this.router.navigate(['/dashboard'], { 
        queryParams: { todoId: notification.data.todo_id } 
      });
      this.closeNotifications();
    }
  }

  logout(): void {
    this.pollSubscription?.unsubscribe();
    this.authFacade.logout();
    this.router.navigate(['/']);
    this.closeMenu();
  }
}
