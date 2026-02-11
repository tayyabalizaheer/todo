import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  appName = environment.appName;
  features = [
    {
      icon: '✓',
      title: 'Task Management',
      description: 'Create, edit, and organize your todos with ease. Set due dates and track completion status.'
    },
    {
      icon: '👥',
      title: 'Collaborative',
      description: 'Share your todos with team members. Assign different permission levels for flexible collaboration.'
    },
    {
      icon: '🔔',
      title: 'Real-time Notifications',
      description: 'Stay updated with instant notifications when todos are shared, updated, or completed.'
    },
    {
      icon: '🔒',
      title: 'Secure',
      description: 'Your data is protected with Laravel Sanctum authentication and proper authorization policies.'
    }
  ];

  benefits = [
    'Intuitive and clean user interface',
    'Real-time collaboration features',
    'Flexible permission system (view, edit, owner)',
    'Efficient search and filtering',
    'Mobile-responsive design',
    'Instant notifications'
  ];
}
