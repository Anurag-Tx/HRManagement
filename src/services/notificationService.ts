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
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      throw new Error('User ID not found');
    }

    const response = await fetch(`${API_BASE_URL}/Notification?userId=${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    const notifications = await response.json();
    
    // Format dates
    return notifications.map((notification: Notification) => ({
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

export const createNotification = async (
  title: string,
  message: string,
  type: 'success' | 'error' | 'info',
  jobDescriptionId?: number
): Promise<Notification> => {
  try {
    const response = await fetch(`${API_BASE_URL}/Notification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        message,
        notificationType: type === 'success' ? 'JD_Created' : type === 'error' ? 'CV_Uploaded' : 'CV_Reviewed',
        jobDescriptionId
      })
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