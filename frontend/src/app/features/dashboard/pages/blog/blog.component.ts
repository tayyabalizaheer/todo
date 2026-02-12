import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, BehaviorSubject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { BlogService } from '../../../../core/services/blog.service';
import { Blog } from '../../../../core/models/blog.model';
import { BlogListComponent } from '../../components/blog-list/blog-list.component';
import { HttpErrorService } from '../../../../core/services/http-error.service';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, FormsModule, BlogListComponent],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogComponent implements OnInit, OnDestroy {
  appName = environment.appName;
  
  // State management with BehaviorSubjects
  private blogsSubject$ = new BehaviorSubject<Blog[]>([]);
  blogs$ = this.blogsSubject$.asObservable();
  
  private isLoadingSubject$ = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject$.asObservable();
  
  private errorSubject$ = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject$.asObservable();
  
  searchTerm = '';
  statusFilter: 'all' | 'draft' | 'published' = 'all';
  currentPage = 1;
  totalPages = 1;
  totalBlogs = 0;
  
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  constructor(
    private blogService: BlogService,
    private httpErrorService: HttpErrorService,
    private cdr: ChangeDetectorRef
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
    this.isLoadingSubject$.next(true);
    this.errorSubject$.next(null);
    
    const params: any = {
      page: this.currentPage,
      per_page: 12
    };

    if (this.searchTerm.trim().length >= 2) {
      params.search = this.searchTerm.trim();
    }

    if (this.statusFilter !== 'all') {
      params.status = this.statusFilter;
    }

    this.blogService.getBlogs(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Blog API Response:', response);
          if (response.data) {
            console.log('Blog data array:', response.data);
            console.log('Number of blogs:', response.data?.length);
            this.blogsSubject$.next(response.data);
            
            if (response.pagination) {
              this.currentPage = response.pagination.current_page;
              this.totalPages = response.pagination.last_page;
              this.totalBlogs = response.pagination.total;
            }
          }
          this.isLoadingSubject$.next(false);
        },
        error: (error) => {
          const apiError = this.httpErrorService.mapError(error);
          console.error('Error loading blogs:', apiError.message);
          this.errorSubject$.next(apiError.message);
          this.isLoadingSubject$.next(false);
        }
      });
  }

  onSearch(): void {
    this.searchSubject$.next(this.searchTerm);
  }

  onSearchChange(): void {
    this.searchSubject$.next(this.searchTerm);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadBlogs();
  }

  onBlogSelected(blog: Blog): void {
    console.log('Blog selected:', blog);
    // TODO: Implement blog detail view or edit modal
  }

  onBlogDeleted(blogId: number): void {
    this.blogService.deleteBlog(blogId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const currentBlogs = this.blogsSubject$.value;
          const newBlogs = currentBlogs.filter(blog => blog.id !== blogId);
          this.blogsSubject$.next(newBlogs);
          this.totalBlogs--;
          
          // If current page is empty and not the first page, go to previous page
          if (newBlogs.length === 0 && this.currentPage > 1) {
            this.currentPage--;
            this.loadBlogs();
          }
        },
        error: (error) => {
          const apiError = this.httpErrorService.mapError(error);
          alert('Error: ' + apiError.message);
          this.errorSubject$.next(apiError.message);
        }
      });
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadBlogs();
    }
  }

  getPaginationArray(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
}
