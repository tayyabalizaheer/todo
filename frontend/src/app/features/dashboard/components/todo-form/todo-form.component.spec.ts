import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TodoFormComponent } from './todo-form.component';

describe('TodoFormComponent', () => {
  let component: TodoFormComponent;
  let fixture: ComponentFixture<TodoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoFormComponent, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TodoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.todoForm.get('title')?.value).toBe('');
    expect(component.todoForm.get('description')?.value).toBe('');
    expect(component.todoForm.get('due_at')?.value).toBe('');
  });

  it('should validate title as required', () => {
    const titleControl = component.todoForm.get('title');
    expect(titleControl?.valid).toBeFalsy();
    expect(titleControl?.hasError('required')).toBeTruthy();
  });

  it('should validate title minimum length', () => {
    const titleControl = component.todoForm.get('title');
    titleControl?.setValue('ab');
    expect(titleControl?.hasError('minlength')).toBeTruthy();
  });

  it('should be valid with valid title', () => {
    component.todoForm.patchValue({
      title: 'Valid Todo Title'
    });
    expect(component.todoForm.valid).toBeTruthy();
  });

  it('should populate form with todo data in edit mode', () => {
    const mockTodo = {
      id: 1,
      title: 'Test Todo',
      description: 'Test Description',
      status: 'open' as const,
      due_at: '2024-12-31',
      completed_at: null,
      owner_id: 1,
      owner: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com'
      },
      is_shared: false,
      permission: 'owner' as const,
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    };
    
    component.todo = mockTodo;
    component.ngOnInit();
    
    expect(component.todoForm.get('title')?.value).toBe('Test Todo');
    expect(component.todoForm.get('description')?.value).toBe('Test Description');
    expect(component.isEditMode).toBeTruthy();
  });
});
