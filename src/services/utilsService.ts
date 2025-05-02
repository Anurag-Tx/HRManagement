import { format, parseISO, isValid } from 'date-fns';

// Token storage utils
export const setTokenToStorage = (token: string) => {
  localStorage.setItem('auth_token', token);
};

export const getTokenFromStorage = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const removeTokenFromStorage = () => {
  localStorage.removeItem('auth_token');
};

// Format date utility
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '--';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return '--';
    return format(date, 'MMMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return '--';
  }
};

export const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return '--';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return '--';
    return format(date, 'MMMM d, yyyy h:mm a');
  } catch (error) {
    console.error('Error formatting date time:', error);
    return '--';
  }
};

// Format relative time utility (e.g., "2 hours ago")
export const formatRelativeTime = (dateString: string | null | undefined): string => {
  if (!dateString) return '--';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return '--';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) {
      return `${diffSecs} second${diffSecs !== 1 ? 's' : ''} ago`;
    }
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    }
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
    
    return formatDate(dateString);
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '--';
  }
};

// File size formatter
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Generate a random ID (for mock data)
export const generateId = (prefix: string = ''): string => {
  return `${prefix}${Math.random().toString(36).substring(2, 9)}`;
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};