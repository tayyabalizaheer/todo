import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  BlogApiResponse, 
  BlogListApiResponse, 
  CreateBlogRequest, 
  UpdateBlogRequest,
  BlogStatus 
} from '../models/blog.model';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private apiUrl = `${environment.apiUrl}/blogs`;
  private publicApiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  /**
   * Get all blogs with optional filters (requires authentication)
   */
  getBlogs(params?: { 
    status?: BlogStatus; 
    search?: string; 
    per_page?: number;
    page?: number;
  }): Observable<BlogListApiResponse> {
    let httpParams = new HttpParams();
    
    if (params?.status) {
      httpParams = httpParams.set('status', params.status);
    }
    
    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }

    if (params?.per_page) {
      httpParams = httpParams.set('per_page', params.per_page.toString());
    }

    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }

    return this.http.get<BlogListApiResponse>(this.apiUrl, { params: httpParams });
  }

  /**
   * Get public published posts (no authentication required)
   */
  getPublicPosts(params?: { 
    search?: string; 
    per_page?: number;
    page?: number;
  }): Observable<BlogListApiResponse> {
    let httpParams = new HttpParams();
    
    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }

    if (params?.per_page) {
      httpParams = httpParams.set('per_page', params.per_page.toString());
    }

    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }

    return this.http.get<BlogListApiResponse>(`${this.publicApiUrl}/posts`, { params: httpParams });
  }

  /**
   * Get a single blog by ID (requires authentication)
   */
  getBlog(id: number): Observable<BlogApiResponse> {
    return this.http.get<BlogApiResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get a public blog post by slug (no authentication required)
   */
  getPublicPost(slug: string): Observable<BlogApiResponse> {
    return this.http.get<BlogApiResponse>(`${this.publicApiUrl}/post/${slug}`);
  }

  /**
   * Create a new blog
   */
  createBlog(blog: CreateBlogRequest): Observable<BlogApiResponse> {
    const formData = this.buildFormData(blog);
    return this.http.post<BlogApiResponse>(this.apiUrl, formData);
  }

  /**
   * Update an existing blog
   */
  updateBlog(id: number, blog: UpdateBlogRequest): Observable<BlogApiResponse> {
    const formData = this.buildFormData(blog);
    // Laravel doesn't support multipart PUT, so we use POST with _method override
    formData.append('_method', 'PUT');
    return this.http.post<BlogApiResponse>(`${this.apiUrl}/${id}`, formData);
  }

  /**
   * Delete a blog
   */
  deleteBlog(id: number): Observable<BlogApiResponse> {
    return this.http.delete<BlogApiResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Publish a blog post
   */
  publishBlog(id: number): Observable<BlogApiResponse> {
    return this.http.post<BlogApiResponse>(`${this.apiUrl}/${id}/publish`, {});
  }

  /**
   * Unpublish a blog post
   */
  unpublishBlog(id: number): Observable<BlogApiResponse> {
    return this.http.post<BlogApiResponse>(`${this.apiUrl}/${id}/unpublish`, {});
  }

  /**
   * Archive a blog post
   */
  archiveBlog(id: number): Observable<BlogApiResponse> {
    return this.http.post<BlogApiResponse>(`${this.apiUrl}/${id}/archive`, {});
  }

  /**
   * Build FormData for blog creation/update (handles file upload)
   */
  private buildFormData(blog: CreateBlogRequest | UpdateBlogRequest): FormData {
    const formData = new FormData();
    
    Object.keys(blog).forEach(key => {
      const value = (blog as any)[key];
      if (value !== undefined && value !== null) {
        if (key === 'featured_image' && value instanceof File) {
          formData.append(key, value);
        } else if (typeof value !== 'object') {
          formData.append(key, value.toString());
        }
      }
    });
    
    return formData;
  }
}
