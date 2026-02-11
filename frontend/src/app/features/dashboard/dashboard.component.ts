import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TodoService } from '../../core/services/todo.service';
import { Todo } from '../../core/models/todo.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  appName = environment.appName;
  todos: Todo[] = [];
  filteredTodos: Todo[] = [];
  isLoading = false;
  error: string | null = null;
  searchQuery = '';
  filterStatus: 'all' | 'active' | 'completed' = 'all';
  private destroy$ = new Subject<void>();

  constructor(private todoService: TodoService) {}

  ngOnInit(): void {
    this.loadTodos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTodos(): void {
    this.isLoading = true;
    this.error = null;

    this.todoService.getTodos({ per_page: 1000 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response && response.data) {
            this.todos = Array.isArray(response.data) ? response.data : [response.data];
          } else {
            this.todos = [];
          }
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading todos:', error);
          this.error = error.error?.message || 'Failed to load todos';
          this.isLoading = false;
        },
        complete: () => {
          // Ensure loading state is always cleared
          this.isLoading = false;
        }
      });
  }

  applyFilters(): void {
    let filtered = [...this.todos];

    // Filter by status
    if (this.filterStatus === 'active') {
      filtered = filtered.filter(todo => todo.status === 'open');
    } else if (this.filterStatus === 'completed') {
      filtered = filtered.filter(todo => todo.status === 'completed');
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(todo =>
        todo.title.toLowerCase().includes(query) ||
        todo.description?.toLowerCase().includes(query)
      );
    }

    this.filteredTodos = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(status: 'all' | 'active' | 'completed'): void {
    this.filterStatus = status;
    this.applyFilters();
  }

  toggleComplete(todo: Todo): void {
    const serviceCall = todo.status === 'open' 
      ? this.todoService.markAsCompleted(todo.id)
      : this.todoService.markAsOpen(todo.id);

    serviceCall
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Update the todo in the list
          const index = this.todos.findIndex(t => t.id === todo.id);
          if (index !== -1) {
            const updatedTodo = Array.isArray(response.data) ? response.data[0] : response.data;
            this.todos[index] = updatedTodo as Todo;
            this.applyFilters();
          }
        },
        error: (error) => {
          console.error('Error toggling todo:', error);
          this.error = error.error?.message || 'Failed to update todo';
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
          // Remove the todo from the list
          this.todos = this.todos.filter(t => t.id !== todo.id);
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error deleting todo:', error);
          this.error = error.error?.message || 'Failed to delete todo';
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

  get activeTodosCount(): number {
    return this.todos.filter(todo => todo.status === 'open').length;
  }

  get completedTodosCount(): number {
    return this.todos.filter(todo => todo.status === 'completed').length;
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
