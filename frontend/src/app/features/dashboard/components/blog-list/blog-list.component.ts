import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Blog, BlogStatus } from '../../../../core/models/blog.model';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import Swal from 'sweetalert2';

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
    Swal.fire({
      title: 'Delete Blog Post?',
      text: 'Are you sure you want to delete this blog post? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.blogDeleted.emit(blogId);
      }
    });
  }

  onPublishBlog(blogId: number, event: Event): void {
    event.stopPropagation();
    Swal.fire({
      title: 'Publish Blog Post?',
      text: 'This will make the blog post visible to everyone.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, publish it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.blogPublish.emit(blogId);
      }
    });
  }

  onUnpublishBlog(blogId: number, event: Event): void {
    event.stopPropagation();
    Swal.fire({
      title: 'Unpublish Blog Post?',
      text: 'This will hide the blog post from public view.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, unpublish it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.blogUnpublish.emit(blogId);
      }
    });
  }

  onArchiveBlog(blogId: number, event: Event): void {
    event.stopPropagation();
    Swal.fire({
      title: 'Archive Blog Post?',
      text: 'This will move the blog post to archived status.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, archive it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.blogArchive.emit(blogId);
      }
    });
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
