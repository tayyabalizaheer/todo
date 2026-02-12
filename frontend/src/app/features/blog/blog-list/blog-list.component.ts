import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { BlogService } from '../../../core/services/blog.service';
import { Blog } from '../../../core/models/blog.model';
import { HttpErrorService } from '../../../core/services/http-error.service';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule],
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogListComponent implements OnInit, OnDestroy {
  // Signals for reactive state management
  blogs = signal<Blog[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  
  searchTerm = '';
  currentPage = 1;
  totalPages = 1;
  totalBlogs = 0;
  perPage = 12;
  
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  constructor(
    private blogService: BlogService,
    private httpErrorService: HttpErrorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setupSearchSubscription();
    this.loadBlogs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchSubscription(): void {
    this.searchSubject$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchQuery => {
        if (searchQuery.length >= 2 || searchQuery.length === 0) {
          this.currentPage = 1;
          this.loadBlogs();
        }
      });
  }

  loadBlogs(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    const params: Record<string, number | string> = {
      page: this.currentPage,
      per_page: this.perPage
    };

    if (this.searchTerm.trim().length >= 2) {
      params['search'] = this.searchTerm.trim();
    }

    this.blogService.getPublicPosts(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.blogs.set(response.data);
            
            if (response.pagination) {
              this.currentPage = response.pagination.current_page;
              this.totalPages = response.pagination.last_page;
              this.totalBlogs = response.pagination.total;
            }
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          const apiError = this.httpErrorService.mapError(error);
          console.error('Error loading blogs:', apiError.message);
          this.error.set(apiError.message);
          this.isLoading.set(false);
        }
      });
  }

  onSearchChange(): void {
    this.searchSubject$.next(this.searchTerm);
  }

  viewBlog(slug: string): void {
    this.router.navigate(['/blog', slug]);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadBlogs();
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
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

  truncateText(text: string | null, maxLength: number): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}
