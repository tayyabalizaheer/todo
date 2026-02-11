import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoModalComponent } from './todo-modal.component';
import { TodoFormComponent } from '../todo-form/todo-form.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('TodoModalComponent', () => {
  let component: TodoModalComponent;
  let fixture: ComponentFixture<TodoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoModalComponent, TodoFormComponent, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TodoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not be visible when isOpen is false', () => {
    component.isOpen = false;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.modal-backdrop')).toBeFalsy();
  });

  it('should be visible when isOpen is true', () => {
    component.isOpen = true;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.modal-backdrop')).toBeTruthy();
  });
});
