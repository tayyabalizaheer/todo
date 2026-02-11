import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, switchMap, of } from 'rxjs';
import { UserService, UserSearchResult } from '../../../../core/services/user.service';

@Component({
  selector: 'app-share-todo-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './share-todo-modal.component.html',
  styleUrls: ['./share-todo-modal.component.css']
})
export class ShareTodoModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() todoTitle = '';
  @Input() isSubmitting = false;
  @Output() close = new EventEmitter<void>();
  @Output() share = new EventEmitter<{ emails: string[], permission: string }>();

  searchQuery = '';
  searchResults: UserSearchResult[] = [];
  selectedUsers: UserSearchResult[] = [];
  isSearching = false;
  permission: 'view' | 'edit' = 'view';
  
  private searchSubject$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.setupSearchSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchSubscription(): void {
    this.searchSubject$
      .pipe(
        debounceTime(300), // Wait 300ms after user stops typing
        distinctUntilChanged(), // Only emit if value changed
        switchMap(query => {
          // Only search if query is 2+ characters
          if (query.trim().length >= 2) {
            this.isSearching = true;
            return this.userService.searchUsers(query.trim());
          } else {
            this.isSearching = false;
            return of({ success: true, data: [] });
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          this.isSearching = false;
          // Filter out already selected users
          const selectedEmails = this.selectedUsers.map(u => u.email);
          this.searchResults = response.data.filter(
            user => !selectedEmails.includes(user.email)
          );
        },
        error: () => {
          this.isSearching = false;
          this.searchResults = [];
        }
      });
  }

  onSearchQueryChange(): void {
    this.searchSubject$.next(this.searchQuery);
  }

  onSelectUser(user: UserSearchResult): void {
    // Add user to selected list
    if (!this.selectedUsers.find(u => u.email === user.email)) {
      this.selectedUsers = [...this.selectedUsers, user];
      // Remove from search results
      this.searchResults = this.searchResults.filter(u => u.email !== user.email);
    }
  }

  onRemoveUser(user: UserSearchResult): void {
    // Remove user from selected list
    this.selectedUsers = this.selectedUsers.filter(u => u.email !== user.email);
  }

  onShare(): void {
    if (this.selectedUsers.length > 0) {
      const emails = this.selectedUsers.map(u => u.email);
      this.share.emit({ emails, permission: this.permission });
    }
  }

  onClose(): void {
    if (!this.isSubmitting) {
      this.resetModal();
      this.close.emit();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    // Close only if clicking the backdrop, not the modal content
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  private resetModal(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.selectedUsers = [];
    this.permission = 'view';
  }
}
