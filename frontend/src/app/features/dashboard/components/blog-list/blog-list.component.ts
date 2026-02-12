import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Blog, BlogStatus } from '../../../../core/models/blog.model';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, DatePipe, IconComponent, MatIconModule],
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogListComponent {
  @Input() blogs: Blog[] = [];
  @Input() loading = false;
  @Output() blogSelected = new EventEmitter<Blog>();
  @Output() blogEdit = new EventEmitter<Blog>();
  @Output() blogDeleted = new EventEmitter<number>();
  @Output() blogPublish = new EventEmitter<number>();
  @Output() blogUnpublish = new EventEmitter<number>();
  @Output() blogArchive = new EventEmitter<number>();

  onSelectBlog(blog: Blog, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.blogSelected.emit(blog);
  }

  onEditBlog(blog: Blog, event: Event): void {
    event.stopPropagation();
    this.blogEdit.emit(blog);
  }

  onDeleteBlog(blogId: number, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      this.blogDeleted.emit(blogId);
    }
  }

  onPublishBlog(blogId: number, event: Event): void {
    event.stopPropagation();
    if (confirm('Publish this blog post?')) {
      this.blogPublish.emit(blogId);
    }
  }

  onUnpublishBlog(blogId: number, event: Event): void {
    event.stopPropagation();
    if (confirm('Unpublish this blog post?')) {
      this.blogUnpublish.emit(blogId);
    }
  }

  onArchiveBlog(blogId: number, event: Event): void {
    event.stopPropagation();
    if (confirm('Archive this blog post?')) {
      this.blogArchive.emit(blogId);
    }
  }

  getStatusClass(status: BlogStatus): string {
    switch (status) {
      case 'published':
        return 'status-published';
      case 'draft':
        return 'status-draft';
      case 'archived':
        return 'status-archived';
      default:
        return '';
    }
  }

  getStatusLabel(status: BlogStatus): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  truncateContent(content: string, maxLength: number = 150): string {
    const textContent = this.stripHtml(content);
    return textContent.length > maxLength 
      ? textContent.substring(0, maxLength) + '...' 
      : textContent;
  }

  private stripHtml(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  trackByBlogId(index: number, blog: Blog): number {
    return blog.id;
  }
}
