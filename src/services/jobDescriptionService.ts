import { getTokenFromStorage } from './utilsService';
import { JobDescription } from '../types/jobDescription';

const API_BASE_URL = 'https://localhost:7138/api';

export const getJobDescriptions = async (): Promise<JobDescription[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobdescriptions`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch job descriptions');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching job descriptions:', error);
    throw error;
  }
};

export const getJobDescription = async (id: string): Promise<JobDescription> => {
  try {
    const response = await fetch(`${API_BASE_URL}/JobDescription/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch job description');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching job description:', error);
    throw error;
  }
};

export const createJobDescription = async (
  jobDescription: Omit<JobDescription, 'id' | 'createdAt' | 'updatedAt' | 'managerId' | 'managerName'>
): Promise<JobDescription> => {
  const token = getTokenFromStorage();
  
  const response = await fetch('/api/job-descriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(jobDescription)
  });

  if (!response.ok) {
    throw new Error('Failed to create job description');
  }

  return response.json();
};

export const updateJobDescription = async (
  id: string,
  jobDescription: Partial<JobDescription>
): Promise<JobDescription> => {
  const token = getTokenFromStorage();
  
  const response = await fetch(`/api/job-descriptions/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(jobDescription)
  });

  if (!response.ok) {
    throw new Error('Failed to update job description');
  }

  return response.json();
};

export const deleteJobDescription = async (id: number): Promise<void> => {
  const token = getTokenFromStorage();
  
  const response = await fetch(`${API_BASE_URL}/JobDescription/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to delete job description');
  }
}; 