import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';
import { BlogService } from '../../../core/services/blog.service';
import { Blog } from '../../../core/models/blog.model';
import { HttpErrorService } from '../../../core/services/http-error.service';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogDetailComponent implements OnInit, OnDestroy {
  // Signals for reactive state management
  blog = signal<Blog | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  
  // Computed signal for sanitized content
  sanitizedContent = computed<SafeHtml>(() => {
    const blogData = this.blog();
    return blogData ? this.sanitizer.sanitize(1, blogData.content) || '' : '';
  });
  
  private destroy$ = new Subject<void>();
  private slug = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService,
    private httpErrorService: HttpErrorService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.slug = params['slug'];
      this.loadBlog();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBlog(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.blogService.getPublicPost(this.slug)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.blog.set(response.data);
          } else {
            this.error.set('Blog post not found');
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          const apiError = this.httpErrorService.mapError(error);
          console.error('Error loading blog:', apiError.message);
          this.error.set(apiError.message);
          this.isLoading.set(false);
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/blog']);
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'Not published';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  getReadingTime(content: string): string {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  }
}
