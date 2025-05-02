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