export interface Todo {
  id: number;
  title: string;
  description: string | null;
  status: 'open' | 'completed';
  due_at: string | null;
  completed_at: string | null;
  owner_id: number;
  owner: {
    id: number;
    name: string;
    email: string;
  };
  is_shared: boolean;
  permission: 'view' | 'edit' | 'owner';
  created_at: string;
  updated_at: string;
}

export interface TodoShare {
  id: number;
  todo_id: number;
  shared_with_user_id: number;
  shared_by_user_id: number;
  permission: 'view' | 'edit' | 'owner';
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
  shared_with_user?: {
    id: number;
    name: string;
    email: string;
  };
  shared_by_user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  due_at?: string;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  due_at?: string;
  status?: 'open' | 'completed';
}

export interface TodoCounts {
  all: number;
  completed: number;
  active: number;
}

export interface TodoApiResponse {
  success: boolean;
  data: Todo | Todo[];
  message?: string;
  counts?: TodoCounts;
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number | null;
    to: number | null;
  };
}
