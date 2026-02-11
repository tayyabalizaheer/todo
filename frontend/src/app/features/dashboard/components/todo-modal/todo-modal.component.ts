import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoFormComponent } from '../todo-form/todo-form.component';
import { CreateTodoRequest, UpdateTodoRequest, Todo } from '../../../../core/models/todo.model';

@Component({
  selector: 'app-todo-modal',
  standalone: true,
  imports: [CommonModule, TodoFormComponent],
  templateUrl: './todo-modal.component.html',
  styleUrls: ['./todo-modal.component.css']
})
export class TodoModalComponent {
  @Input() isOpen = false;
  @Input() todo?: Todo;
  @Input() isSubmitting = false;
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<CreateTodoRequest | UpdateTodoRequest>();

  onClose(): void {
    if (!this.isSubmitting) {
      this.close.emit();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    // Close only if clicking the backdrop, not the modal content
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  onSubmit(todoData: CreateTodoRequest | UpdateTodoRequest): void {
    this.submit.emit(todoData);
  }

  onCancel(): void {
    this.onClose();
  }
}
