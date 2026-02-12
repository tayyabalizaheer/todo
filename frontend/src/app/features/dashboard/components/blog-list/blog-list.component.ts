import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Blog } from '../../../../core/models/blog.model';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogListComponent {
  @Input() blogs: Blog[] = [];
  @Input() loading = false;
  @Output() blogSelected = new EventEmitter<Blog>();
  @Output() blogDeleted = new EventEmitter<number>();

  onSelectBlog(blog: Blog): void {
    this.blogSelected.emit(blog);
  }

  onDeleteBlog(blogId: number, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this blog post?')) {
      this.blogDeleted.emit(blogId);
    }
  }

  getStatusClass(status: string): string {
    return status === 'published' ? 'status-published' : 'status-draft';
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
}
