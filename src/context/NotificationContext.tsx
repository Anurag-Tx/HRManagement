import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification } from '../types/notification';
import { 
  getNotifications, 
  getUnreadNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  createNotification as createNotificationService
} from '../services/notificationService';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  createNotification: (title: string, message: string, type: 'success' | 'error' | 'info', jobDescriptionId?: number) => Promise<void>;
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
      setError(null);
    } catch (err) {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? { ...notification, isRead: true } : notification
        )
      );
    } catch (err) {
      setError('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (err) {
      setError('Failed to mark all notifications as read');
    }
  };

  const createNotification = async (
    title: string, 
    message: string, 
    type: 'success' | 'error' | 'info',
    jobDescriptionId?: number
  ) => {
    try {
      const newNotification = await createNotificationService(
        title,
        message,
        type,
        jobDescriptionId
      );
      setNotifications(prev => [newNotification, ...prev]);
    } catch (err) {
      setError('Failed to create notification');
      throw err;
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    // For now, just log the notification
    console.log(`[${type.toUpperCase()}] ${message}`);
    // In a real app, you would show this in a toast or notification component
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        createNotification,
        showNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};