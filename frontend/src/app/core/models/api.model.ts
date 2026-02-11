// Core API Response and error models
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Validation error response from Backend 
export interface ValidationErrorResponse {
  message: string;
  errors: Record<string, string[]>;
}

// Generic API error model for frontend error handling
export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

// User model
export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}
