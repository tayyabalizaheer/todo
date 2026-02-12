// Blog models matching backend structure
export interface BlogAuthor {
  id: number;
  name: string;
  email: string;
}

export type BlogStatus = 'draft' | 'published' | 'archived';

export interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  status: BlogStatus;
  published_at: string | null;
  views_count: number;
  author: BlogAuthor;
  created_at: string;
  updated_at: string;
}

// API Response structure
export interface BlogApiResponse {
  success?: boolean;
  data?: Blog;
  message?: string;
  errors?: Record<string, string[]>;
}

// Paginated blog response
export interface BlogPagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

export interface BlogListApiResponse {
  success?: boolean;
  data?: Blog[];
  pagination?: BlogPagination;
  message?: string;
  errors?: Record<string, string[]>;
}

// Create blog request
export interface CreateBlogRequest {
  title: string;
  excerpt?: string;
  content: string;
  featured_image?: File | null;
  status?: BlogStatus;
  published_at?: string | null;
}

// Update blog request
export interface UpdateBlogRequest {
  title?: string;
  excerpt?: string | null;
  content?: string;
  featured_image?: File | null;
  status?: BlogStatus;
  published_at?: string | null;
}

// Blog form data (for internal component use)
export interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  status: BlogStatus;
  published_at: string | null;
  featured_image: File | null;
  featured_image_preview?: string | null;
}
