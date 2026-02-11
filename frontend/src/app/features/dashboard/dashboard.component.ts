import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, BehaviorSubject, Observable, takeUntil, debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs';
import { TodoService } from '../../core/services/todo.service';
import { Todo, CreateTodoRequest, UpdateTodoRequest } from '../../core/models/todo.model';
import { TodoModalComponent } from './components/todo-modal/todo-modal.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, TodoModalComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {
  appName = environment.appName;
  
  // Use BehaviorSubject for reactive state management
  private todosSubject$ = new BehaviorSubject<Todo[]>([]);
  todos$ = this.todosSubject$.asObservable();
  
  private isLoadingSubject$ = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject$.asObservable();
  
  private errorSubject$ = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject$.asObservable();
  
  private isSubmittingTodoSubject$ = new BehaviorSubject<boolean>(false);
  isSubmittingTodo$ = this.isSubmittingTodoSubject$.asObservable();
  
  searchQuery = '';
  filterStatus: 'all' | 'active' | 'completed' = 'all';
  isModalOpen = false;
  editingTodo?: Todo;
  
  // Computed observables
  activeTodosCount$ = this.todos$.pipe(
    map(todos => todos.filter(todo => todo.status === 'open').length)
  );
  
  completedTodosCount$ = this.todos$.pipe(
    map(todos => todos.filter(todo => todo.status === 'completed').length)
  );
  
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
        debounceTime(300), // Wait 300ms after user stops typing
        distinctUntilChanged(), // Only emit if value changed
        takeUntil(this.destroy$)
      )
      .subscribe(searchQuery => {
        // Only search if query is 2+ characters or empty (to clear search)
        if (searchQuery.length >= 2 || searchQuery.length === 0) {
          this.loadTodos();
        }
      });
  }

  loadTodos(): void {
    this.isLoadingSubject$.next(true);
    this.errorSubject$.next(null);

    const params: any = { per_page: 100 };

    // Add status filter if not 'all'
    if (this.filterStatus === 'active') {
      params.status = 'open';
    } else if (this.filterStatus === 'completed') {
      params.status = 'completed';
    }

    // Add search query if it's 2+ characters
    if (this.searchQuery.trim().length >= 2) {
      params.search = this.searchQuery.trim();
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
            // Create new array with immutable update
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
    if (!confirm(`Are you sure you want to delete "${todo.title}"?`)) {
      return;
    }

    this.todoService.deleteTodo(todo.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Remove the todo from the list immutably
          const currentTodos = this.todosSubject$.value;
          const newTodos = currentTodos.filter(t => t.id !== todo.id);
          this.todosSubject$.next(newTodos);
        },
        error: (error) => {
          console.error('Error deleting todo:', error);
          this.errorSubject$.next(error.error?.message || 'Failed to delete todo');
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
          // Add new todo immutably at the beginning
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
            // Update todo immutably
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
}
