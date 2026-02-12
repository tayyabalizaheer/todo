import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoListComponent } from '../../components/todo-list/todo-list.component';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, TodoListComponent],
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})
export class TodoComponent {
  appName = environment.appName;
}
