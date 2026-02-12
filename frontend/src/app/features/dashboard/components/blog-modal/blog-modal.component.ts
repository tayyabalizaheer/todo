import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BlogFormComponent } from '../blog-form/blog-form.component';
import { CreateBlogRequest, UpdateBlogRequest, Blog } from '../../../../core/models/blog.model';

@Component({
  selector: 'app-blog-modal',
  standalone: true,
  imports: [CommonModule, BlogFormComponent, MatIconModule],
  templateUrl: './blog-modal.component.html',
  styleUrls: ['./blog-modal.component.css']
})
export class BlogModalComponent {
  @Input() isOpen = false;
  @Input() blog?: Blog;
  @Input() isSubmitting = false;
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<CreateBlogRequest | UpdateBlogRequest>();

  get modalTitle(): string {
    return this.blog ? 'Edit Blog Post' : 'Create New Blog Post';
  }

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

  onSubmit(blogData: CreateBlogRequest | UpdateBlogRequest): void {
    this.submit.emit(blogData);
  }

  onCancel(): void {
    this.onClose();
  }
}
