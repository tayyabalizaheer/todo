import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../../../environments/environment';
import { Subject, BehaviorSubject, takeUntil, debounceTime, distinctUntilChanged, exhaustMap, finalize, tap } from 'rxjs';
import { BlogService } from '../../../../core/services/blog.service';
import { Blog, CreateBlogRequest, UpdateBlogRequest, BlogStatus } from '../../../../core/models/blog.model';
import { BlogListComponent } from '../../components/blog-list/blog-list.component';
import { BlogModalComponent } from '../../components/blog-modal/blog-modal.component';
import { HttpErrorService } from '../../../../core/services/http-error.service';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, FormsModule, BlogListComponent, BlogModalComponent, MatIconModule],
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
  statusFilter: 'all' | BlogStatus = 'all';
  currentPage = 1;
  totalPages = 1;
  totalBlogs = 0;
  perPage = 20;
  perPageOptions = [5, 10, 20, 50, 100];
  
  // Modal state
  isModalOpen = false;
  selectedBlog?: Blog;
  isSubmitting = false;
  
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();
  private submitSubject$ = new Subject<{ data: CreateBlogRequest | UpdateBlogRequest, blogId?: number }>();

  constructor(
    private blogService: BlogService,
    private httpErrorService: HttpErrorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setupSearchSubscription();
    this.setupSubmitSubscription();
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
  
  private setupSubmitSubscription(): void {
    this.submitSubject$
      .pipe(
        tap(() => this.isSubmitting = true),
        exhaustMap(({ data, blogId }) => {
          if (blogId) {
            // Update existing blog
            return this.blogService.updateBlog(blogId, data).pipe(
              tap(response => {
                if (response.data) {
                  const updatedBlogs = this.blogsSubject$.value.map(blog =>
                    blog.id === response.data!.id ? response.data! : blog
                  );
                  this.blogsSubject$.next(updatedBlogs);
                }
                this.closeModal();
                this.showSuccess('Blog post updated successfully!');
              })
            );
          } else {
            // Create new blog
            return this.blogService.createBlog(data as CreateBlogRequest).pipe(
              tap(response => {
                if (response.data) {
                  this.loadBlogs();
                }
                this.closeModal();
                this.showSuccess('Blog post created successfully!');
              })
            );
          }
        }),
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        error: (error) => {
          const apiError = this.httpErrorService.mapError(error);
          this.showError(apiError.message);
          this.cdr.markForCheck();
        }
      });
  }

  loadBlogs(): void {
    this.isLoadingSubject$.next(true);
    this.errorSubject$.next(null);
    
    const params: Record<string, number | string> = {
      page: this.currentPage,
      per_page: this.perPage
    };

    if (this.searchTerm.trim().length >= 2) {
      params['search'] = this.searchTerm.trim();
    }

    if (this.statusFilter !== 'all') {
      params['status'] = this.statusFilter;
    }

    this.blogService.getBlogs(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.blogsSubject$.next(response.data);
            
            if (response.pagination) {
              this.currentPage = response.pagination.current_page;
              this.totalPages = response.pagination.last_page;
              this.totalBlogs = response.pagination.total;
            }
          }
          this.isLoadingSubject$.next(false);
          this.cdr.markForCheck();
        },
        error: (error) => {
          const apiError = this.httpErrorService.mapError(error);
          console.error('Error loading blogs:', apiError.message);
          this.errorSubject$.next(apiError.message);
          this.isLoadingSubject$.next(false);
          this.cdr.markForCheck();
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

  onPerPageChange(): void {
    this.currentPage = 1;
    this.loadBlogs();
  }

  // Modal operations
  openCreateModal(): void {
    this.selectedBlog = undefined;
    this.isModalOpen = true;
    this.cdr.markForCheck();
  }

  openEditModal(blog: Blog): void {
    this.selectedBlog = blog;
    this.isModalOpen = true;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedBlog = undefined;
    this.isSubmitting = false;
    this.cdr.markForCheck();
  }

  onModalSubmit(blogData: CreateBlogRequest | UpdateBlogRequest): void {
    // exhaustMap will automatically ignore this if a submission is in progress
    this.submitSubject$.next({
      data: blogData,
      blogId: this.selectedBlog?.id
    });
  }

  onBlogSelected(_blog: Blog): void {
    // TODO: Navigate to blog detail view or open detail modal
  }

  onBlogEdit(blog: Blog): void {
    this.openEditModal(blog);
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
          
          this.showSuccess('Blog post deleted successfully!');
          this.cdr.markForCheck();
        },
        error: (error) => {
          const apiError = this.httpErrorService.mapError(error);
          this.showError(apiError.message);
        }
      });
  }

  onBlogPublish(blogId: number): void {
    this.blogService.publishBlog(blogId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.data) {
            const updatedBlogs = this.blogsSubject$.value.map(blog =>
              blog.id === response.data!.id ? response.data! : blog
            );
            this.blogsSubject$.next(updatedBlogs);
          }
          this.showSuccess('Blog post published successfully!');
          this.cdr.markForCheck();
        },
        error: (error) => {
          const apiError = this.httpErrorService.mapError(error);
          this.showError(apiError.message);
        }
      });
  }

  onBlogUnpublish(blogId: number): void {
    this.blogService.unpublishBlog(blogId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.data) {
            const updatedBlogs = this.blogsSubject$.value.map(blog =>
              blog.id === response.data!.id ? response.data! : blog
            );
            this.blogsSubject$.next(updatedBlogs);
          }
          this.showSuccess('Blog post unpublished successfully!');
          this.cdr.markForCheck();
        },
        error: (error) => {
          const apiError = this.httpErrorService.mapError(error);
          this.showError(apiError.message);
        }
      });
  }

  onBlogArchive(blogId: number): void {
    this.blogService.archiveBlog(blogId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.data) {
            const updatedBlogs = this.blogsSubject$.value.map(blog =>
              blog.id === response.data!.id ? response.data! : blog
            );
            this.blogsSubject$.next(updatedBlogs);
          }
          this.showSuccess('Blog post archived successfully!');
          this.cdr.markForCheck();
        },
        error: (error) => {
          const apiError = this.httpErrorService.mapError(error);
          this.showError(apiError.message);
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
    const endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  dismissError(): void {
    this.errorSubject$.next(null);
  }

  private showSuccess(message: string): void {
    // Simple alert for now - could be replaced with a toast notification service
    alert(message);
  }

  private showError(message: string): void {
    alert('Error: ' + message);
    this.errorSubject$.next(message);
  }
}
