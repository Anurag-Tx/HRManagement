// Dashboard Service - Contains all dashboard-related API calls
import axios from 'axios';
import { JobDescription } from '../types/jobDescription';
import { CVSubmission } from '../types/cvSubmission';
import { Notification } from '../types/notification';

const API_BASE_URL = 'https://localhost:7138';

export interface DashboardStats {
  totalJobDescriptions: number;
  totalCVs: number;
  pendingReviews: number;
  cvStatusSummary: {
    pending: number;
    accepted: number;
    rejected: number;
  };
  recentActivities: Array<{
    id: number;
    notificationType: string;
    title: string;
    message: string;
    date: string;
  }>;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/Dashboard/Stats`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const getRecentJobDescriptions = async (): Promise<JobDescription[]> => {
  const response = await fetch(`${API_BASE_URL}/api/JobDescription/Recent`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch recent job descriptions');
  }

  return response.json();
};

export const getRecentCVSubmissions = async (): Promise<CVSubmission[]> => {
  const response = await fetch(`${API_BASE_URL}/api/CVSubmission/Recent`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch recent CV submissions');
  }

  return response.json();
};

export interface JobDescriptionData {
  id: number;
  title: string;
  description: string;
  requirements?: string;
  department?: string;
  location?: string;
  client?: string;
  postedDate: string;
  lastDate?: string;
  status: string;
  filePath?: string;
  createdByUserId?: number;
  createdByUser?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  cvCount: number;
  reviewedCount: number;
}

export const createJobDescription = async (
  data: Omit<JobDescriptionData, 'id' | 'cvCount' | 'reviewedCount'>,
  file?: File
): Promise<JobDescriptionData> => {
  try {
    const formData = new FormData();
    
    // Append the file if provided
    if (file) {
      formData.append('file', file);
    }
    
    // Append required job description fields
    formData.append('Title', data.title);
    formData.append('Description', data.description);
    formData.append('Requirements', data.requirements || '');
    formData.append('Department', data.department || '');
    formData.append('Location', data.location || '');
    formData.append('Client', data.client || '');
    formData.append('PostedDate', new Date().toISOString());
    formData.append('LastDate', data.lastDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
    formData.append('Status', 'Active');
    formData.append('CreatedByUserId', '4'); // Using fixed manager ID as per backend

    const response = await axios.post(`${API_BASE_URL}/api/JobDescription`, formData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating job description:', error);
    throw error;
  }
};

export const uploadCV = async (cvData: any) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/CVSubmission/Upload`, cvData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading CV:', error);
    throw error;
  }
};

export const reviewCV = async (cvId: string, status: 'accepted' | 'rejected', feedback: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/CVSubmission/${cvId}/Review`, { status, feedback }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error reviewing CV:', error);
    throw error;
  }
};

export const getJobDescriptions = async (): Promise<JobDescriptionData[]> => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/api/JobDescription`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching job descriptions:', error);
    throw error;
  }
};

export const updateJobDescription = async (
  id: number,
  data: Partial<JobDescriptionData>
): Promise<JobDescriptionData> => {
  try {
    const token = localStorage.getItem('token');
    // Only send the fields that can be updated
    const updateData = {
      title: data.title,
      description: data.description,
      requirements: data.requirements,
      department: data.department,
      location: data.location,
      status: data.status,
      lastDate: data.lastDate
    };
    
    const response = await axios.put(`${API_BASE_URL}/api/JobDescription/${id}`, updateData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating job description:', error);
    throw error;
  }
}; 