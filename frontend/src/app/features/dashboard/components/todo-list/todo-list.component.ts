import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, BehaviorSubject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { TodoService } from '../../../../core/services/todo.service';
import { Todo, CreateTodoRequest, UpdateTodoRequest, TodoCounts } from '../../../../core/models/todo.model';
import { TodoModalComponent } from '../todo-modal/todo-modal.component';
import { ShareTodoModalComponent } from '../share-todo-modal/share-todo-modal.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TodoModalComponent, ShareTodoModalComponent, IconComponent],
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoListComponent implements OnInit, OnDestroy {
  // State management
  private todosSubject$ = new BehaviorSubject<Todo[]>([]);
  todos$ = this.todosSubject$.asObservable();
  
  private countsSubject$ = new BehaviorSubject<TodoCounts>({ all: 0, completed: 0, active: 0 });
  counts$ = this.countsSubject$.asObservable();
  
  private isLoadingSubject$ = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject$.asObservable();
  
  private errorSubject$ = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject$.asObservable();
  
  private isSubmittingTodoSubject$ = new BehaviorSubject<boolean>(false);
  isSubmittingTodo$ = this.isSubmittingTodoSubject$.asObservable();
  
  private isSubmittingShareSubject$ = new BehaviorSubject<boolean>(false);
  isSubmittingShare$ = this.isSubmittingShareSubject$.asObservable();
  
  searchQuery = '';
  filterStatus: 'all' | 'active' | 'completed' = 'all';
  perPage = 20;
  perPageOptions = [5, 10, 20, 50, 100];
  isModalOpen = false;
  editingTodo?: Todo;
  
  isShareModalOpen = false;
  sharingTodo?: Todo;
  
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  constructor(
    private todoService: TodoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setupSearchSubscription();
    this.loadTodos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchSubscription(): void {
    this.searchSubject$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchQuery => {
        if (searchQuery.length >= 2 || searchQuery.length === 0) {
          this.loadTodos();
        }
      });
  }

  loadTodos(): void {
    this.isLoadingSubject$.next(true);
    this.errorSubject$.next(null);

    const params: Record<string, number | string> = { per_page: this.perPage };

    if (this.filterStatus === 'active') {
      params['status'] = 'open';
    } else if (this.filterStatus === 'completed') {
      params['status'] = 'completed';
    }

    if (this.searchQuery.trim().length >= 2) {
      params['search'] = this.searchQuery.trim();
    }

    this.todoService.getTodos(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response && response.data) {
            const todos = Array.isArray(response.data) ? response.data : [response.data];
            this.todosSubject$.next(todos);
          } else {
            this.todosSubject$.next([]);
          }
          
          // Update counts from API response
          if (response && response.counts) {
            this.countsSubject$.next(response.counts);
          }
          
          this.isLoadingSubject$.next(false);
        },
        error: (error) => {
          console.error('Error loading todos:', error);
          this.errorSubject$.next(error.error?.message || 'Failed to load todos');
          this.isLoadingSubject$.next(false);
        }
      });
  }

  onSearchChange(): void {
    this.searchSubject$.next(this.searchQuery);
  }

  onFilterChange(status: 'all' | 'active' | 'completed'): void {
    this.filterStatus = status;
    this.loadTodos();
  }

  onPerPageChange(): void {
    this.loadTodos();
  }

  toggleComplete(todo: Todo): void {
    const serviceCall = todo.status === 'open' 
      ? this.todoService.markAsCompleted(todo.id)
      : this.todoService.markAsOpen(todo.id);

    serviceCall
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const currentTodos = this.todosSubject$.value;
          const index = currentTodos.findIndex(t => t.id === todo.id);
          if (index !== -1) {
            const updatedTodo = Array.isArray(response.data) ? response.data[0] : response.data;
            const newTodos = [
              ...currentTodos.slice(0, index),
              updatedTodo as Todo,
              ...currentTodos.slice(index + 1)
            ];
            this.todosSubject$.next(newTodos);
          }
        },
        error: (error) => {
          console.error('Error toggling todo:', error);
          this.errorSubject$.next(error.error?.message || 'Failed to update todo');
        }
      });
  }

  deleteTodo(todo: Todo): void {
    Swal.fire({
      title: 'Delete Todo?',
      text: `Are you sure you want to delete "${todo.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.todoService.deleteTodo(todo.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              const currentTodos = this.todosSubject$.value;
              const newTodos = currentTodos.filter(t => t.id !== todo.id);
              this.todosSubject$.next(newTodos);
              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Todo has been deleted.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
              });
            },
            error: (error) => {
              console.error('Error deleting todo:', error);
              this.errorSubject$.next(error.error?.message || 'Failed to delete todo');
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.error?.message || 'Failed to delete todo',
                confirmButtonColor: '#d33'
              });
            }
          });
      }
    });
  }

  openCreateModal(): void {
    this.editingTodo = undefined;
    this.isModalOpen = true;
  }

  openEditModal(todo: Todo): void {
    this.editingTodo = todo;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.editingTodo = undefined;
    this.isSubmittingTodoSubject$.next(false);
    this.cdr.markForCheck();
  }

  onSubmitTodo(todoData: CreateTodoRequest | UpdateTodoRequest): void {
    if (this.editingTodo) {
      this.updateTodo(this.editingTodo.id, todoData as UpdateTodoRequest);
    } else {
      this.createTodo(todoData as CreateTodoRequest);
    }
  }

  private createTodo(todoData: CreateTodoRequest): void {
    this.isSubmittingTodoSubject$.next(true);
    this.errorSubject$.next(null);

    this.todoService.createTodo(todoData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const newTodo = Array.isArray(response.data) ? response.data[0] : response.data;
          const currentTodos = this.todosSubject$.value;
          this.todosSubject$.next([newTodo as Todo, ...currentTodos]);
          this.isSubmittingTodoSubject$.next(false);
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating todo:', error);
          this.errorSubject$.next(error.error?.message || 'Failed to create todo');
          this.isSubmittingTodoSubject$.next(false);
        }
      });
  }

  private updateTodo(id: number, todoData: UpdateTodoRequest): void {
    this.isSubmittingTodoSubject$.next(true);
    this.errorSubject$.next(null);

    this.todoService.updateTodo(id, todoData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const updatedTodo = Array.isArray(response.data) ? response.data[0] : response.data;
          const currentTodos = this.todosSubject$.value;
          const index = currentTodos.findIndex(t => t.id === id);
          if (index !== -1) {
            const newTodos = [
              ...currentTodos.slice(0, index),
              updatedTodo as Todo,
              ...currentTodos.slice(index + 1)
            ];
            this.todosSubject$.next(newTodos);
          }
          this.isSubmittingTodoSubject$.next(false);
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating todo:', error);
          this.errorSubject$.next(error.error?.message || 'Failed to update todo');
          this.isSubmittingTodoSubject$.next(false);
        }
      });
  }
  
  openShareModal(todo: Todo): void {
    this.sharingTodo = todo;
    this.isShareModalOpen = true;
  }
  
  closeShareModal(): void {
    this.isShareModalOpen = false;
    this.sharingTodo = undefined;
    this.isSubmittingShareSubject$.next(false);
    this.cdr.markForCheck();
  }
  
  onShareTodo(data: { emails: string[], permission: string }): void {
    if (!this.sharingTodo) return;
    
    this.isSubmittingShareSubject$.next(true);
    this.errorSubject$.next(null);

    this.todoService.shareTodo(this.sharingTodo.id, data.emails, data.permission as 'view' | 'edit')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isSubmittingShareSubject$.next(false);
          this.closeShareModal();
          
          if (response.errors && response.errors.length > 0) {
            Swal.fire({
              icon: 'warning',
              title: response.message,
              html: `<div style="text-align: left;"><strong>Failed to share with:</strong><ul>${response.errors.map((e: { email: string; message: string }) => `<li>${e.email}: ${e.message}</li>`).join('')}</ul></div>`,
              confirmButtonColor: '#3085d6'
            });
          } else {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: response.message || 'Todo shared successfully!',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true
            });
          }
        },
        error: (error) => {
          console.error('Error sharing todo:', error);
          this.errorSubject$.next(error.error?.message || 'Failed to share todo');
          this.isSubmittingShareSubject$.next(false);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.error?.message || 'Failed to share todo',
            confirmButtonColor: '#d33'
          });
        }
      });
  }

  getPermissionBadge(todo: Todo): string {
    return todo.permission;
  }

  canEdit(todo: Todo): boolean {
    return todo.permission === 'owner' || todo.permission === 'edit';
  }

  canDelete(todo: Todo): boolean {
    return todo.permission === 'owner';
  }

  formatDate(date: string | null): string {
    if (!date) return 'No due date';
    
    const todoDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Reset time parts for comparison
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    todoDate.setHours(0, 0, 0, 0);

    if (todoDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (todoDate.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else if (todoDate < today) {
      return 'Overdue';
    } else {
      return todoDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: todoDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  }

  isDueToday(date: string | null): boolean {
    if (!date) return false;
    const todoDate = new Date(date);
    const today = new Date();
    todoDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return todoDate.getTime() === today.getTime();
  }

  isOverdue(date: string | null): boolean {
    if (!date) return false;
    const todoDate = new Date(date);
    const today = new Date();
    todoDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return todoDate < today;
  }
}
