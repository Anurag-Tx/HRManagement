import { formatDateTime } from './utilsService';
import { API_BASE_URL } from './apiConfig';

export type NotificationType = 'JD_Created' | 'CV_Uploaded' | 'CV_Reviewed';

export interface Notification {
  id: number;
  title: string;
  message: string;
  notificationType: NotificationType;
  jobDescriptionId?: number;
  cvSubmissionId?: number;
  userId: number;
  isRead: boolean;
  createdAt: string;
  createdByUserId: number;
  createdByUser: {
    id: number;
    role: string;
  };
}

export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/Notification`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    const notifications = await response.json();
    
    // Filter notifications based on user role
    const userRole = localStorage.getItem('userRole');
    const filteredNotifications = notifications.filter((notification: Notification) => {
      if (userRole === '3') { // HR
        return notification.createdByUser.role === '4'; // Only show notifications from Manager
      } else if (userRole === '4') { // Manager
        return notification.createdByUser.role === '3'; // Only show notifications from HR
      }
      return true; // Show all notifications for other roles
    });

    // Format dates
    return filteredNotifications.map((notification: Notification) => ({
      ...notification,
      createdAt: formatDateTime(notification.createdAt)
    }));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const getUnreadNotifications = async (): Promise<Notification[]> => {
  const response = await fetch(`${API_BASE_URL}/Notification/unread`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch unread notifications');
  }

  const notifications = await response.json();
  return notifications.map((notification: any) => ({
    ...notification,
    date: formatDateTime(notification.createdDate)
  }));
};

export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/Notification/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/Notification/read-all`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to mark all notifications as read');
  }
};

export const createNotification = async (notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> => {
  try {
    const response = await fetch(`${API_BASE_URL}/Notification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notification)
    });

    if (!response.ok) {
      throw new Error('Failed to create notification');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};