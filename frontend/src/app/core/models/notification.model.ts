export interface Notification {
  id: string;
  type: string;
  data: NotificationData;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationData {
  message: string;
  todo_id?: string;
  todo_title?: string;
  shared_by?: string;
  shared_by_id?: number;
  permission?: string;
  share_id?: string;
  updated_by?: string;
  updated_by_id?: number;
  deleted_by?: string;
  deleted_by_id?: number;
  accepted_by?: string;
  accepted_by_id?: number;
}

export interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
  unread_count: number;
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number | null;
    to: number | null;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  unread_count: number;
}
