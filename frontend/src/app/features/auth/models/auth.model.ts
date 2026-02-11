import { User } from '../../../core/models/api.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user?: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface RegisterResponse {
  access_token: string;
  user?: User;
}

export interface AuthState {
  loading: boolean;
  error: string | null;
  user: User | null;
  isAuthenticated: boolean;
}
