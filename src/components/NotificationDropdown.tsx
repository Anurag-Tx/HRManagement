import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, FileCheck, FileText, UserCheck } from 'lucide-react';
import { useNotifications, Notification } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { notifications, markNotificationAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [notifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'jd_upload':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'cv_upload':
        return <FileCheck className="w-5 h-5 text-green-500" />;
      case 'cv_review':
        return <UserCheck className="w-5 h-5 text-orange-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markNotificationAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.type === 'jd_upload' && notification.relatedId) {
      navigate(`/job-descriptions/${notification.relatedId}`);
    } else if (notification.type === 'cv_upload' && notification.relatedId) {
      navigate(`/cv-review`);
    } else if (notification.type === 'cv_review' && notification.relatedId) {
      navigate(`/job-descriptions/${notification.relatedId}`);
    }

    onClose();
  };

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-end"
      onClick={handleClickOutside}
    >
      <div className="absolute right-4 top-16 w-80 max-h-[500px] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
        <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
          <h3 className="font-medium text-gray-800">Notifications</h3>
          <button 
            className="text-sm text-blue-600 hover:text-blue-800"
            onClick={() => {
              markAllAsRead();
              onClose();
            }}
          >
            Mark all as read
          </button>
        </div>

        <div className="overflow-y-auto flex-grow">
          {sortedNotifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No notifications
            </div>
          ) : (
            <ul>
              {sortedNotifications.map(notification => (
                <li 
                  key={notification.id}
                  className={`border-b border-gray-100 cursor-pointer transition-colors ${
                    notification.isRead ? 'bg-white' : 'bg-blue-50'
                  } hover:bg-gray-50`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="p-4 flex">
                    <div className="mr-3">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${notification.isRead ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full self-center"></div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDropdown;