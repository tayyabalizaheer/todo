// Blog models matching backend structure
export interface BlogAuthor {
  id: number;
  name: string;
  email: string;
}

export interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  status: 'draft' | 'published';
  published_at: string | null;
  views_count: number;
  author: BlogAuthor;
  created_at: string;
  updated_at: string;
}

// API Response structure
export interface BlogApiResponse {
  success?: boolean;
  data?: Blog | Blog[];
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
  excerpt: string;
  content: string;
  featured_image?: File;
  status: 'draft' | 'published';
  published_at?: string;
}

// Update blog request
export interface UpdateBlogRequest {
  title?: string;
  excerpt?: string;
  content?: string;
  featured_image?: File;
  status?: 'draft' | 'published';
  published_at?: string;
}
