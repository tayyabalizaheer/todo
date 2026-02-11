import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateTodoRequest, UpdateTodoRequest, Todo } from '../../../../core/models/todo.model';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './todo-form.component.html',
  styleUrls: ['./todo-form.component.css']
})
export class TodoFormComponent implements OnInit {
  @Input() todo?: Todo;
  @Input() isSubmitting = false;
  @Output() submitForm = new EventEmitter<CreateTodoRequest | UpdateTodoRequest>();
  @Output() cancel = new EventEmitter<void>();

  todoForm!: FormGroup;
  minDate: string;

  constructor(private fb: FormBuilder) {
    // Set min date to today
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.todoForm = this.fb.group({
      title: [
        this.todo?.title || '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(255)]
      ],
      description: [
        this.todo?.description || '',
        [Validators.maxLength(1000)]
      ],
      due_at: [
        this.todo?.due_at ? this.formatDateForInput(this.todo.due_at) : '',
        []
      ]
    });
  }

  private formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.todoForm.invalid) {
      this.markFormGroupTouched(this.todoForm);
      return;
    }

    const formValue = this.todoForm.value;
    const todoData: CreateTodoRequest | UpdateTodoRequest = {
      title: formValue.title.trim(),
      description: formValue.description?.trim() || undefined,
      due_at: formValue.due_at || undefined
    };

    this.submitForm.emit(todoData);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Getters for form controls
  get title() {
    return this.todoForm.get('title');
  }

  get description() {
    return this.todoForm.get('description');
  }

  get dueAt() {
    return this.todoForm.get('due_at');
  }

  // Validation helper methods
  hasError(controlName: string, errorName: string): boolean {
    const control = this.todoForm.get(controlName);
    return !!(control && control.hasError(errorName) && (control.dirty || control.touched));
  }

  getErrorMessage(controlName: string): string {
    const control = this.todoForm.get(controlName);
    
    if (!control || !control.errors || (!control.dirty && !control.touched)) {
      return '';
    }

    const errors = control.errors;
    
    if (errors['required']) {
      return `${this.getFieldLabel(controlName)} is required`;
    }
    
    if (errors['minlength']) {
      return `${this.getFieldLabel(controlName)} must be at least ${errors['minlength'].requiredLength} characters`;
    }
    
    if (errors['maxlength']) {
      return `${this.getFieldLabel(controlName)} must not exceed ${errors['maxlength'].requiredLength} characters`;
    }
    
    return '';
  }

  private getFieldLabel(controlName: string): string {
    const labels: { [key: string]: string } = {
      title: 'Title',
      description: 'Description',
      due_at: 'Due date'
    };
    return labels[controlName] || controlName;
  }

  get isEditMode(): boolean {
    return !!this.todo;
  }
}
