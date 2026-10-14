export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  actionUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface Announcement {
  id: string;
  authorId: string;
  title: string;
  content: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  targetAudience: string;
  isPinned: boolean;
  expiresAt?: string | null;
  createdAt: string;
  author?: {
    name: string;
    email?: string;
  };
}

export interface NotificationsResponse {
  unreadCount: number;
  notifications: InAppNotification[];
}
