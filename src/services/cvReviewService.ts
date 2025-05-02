import { getTokenFromStorage } from './utilsService';

export interface CVReview {
  id: string;
  jobDescriptionId: string;
  candidateName: string;
  candidateEmail: string;
  cvUrl: string;
  status: 'pending' | 'accepted' | 'rejected';
  reviewComment?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export const getCVReviews = async (jobDescriptionId?: string): Promise<CVReview[]> => {
  const token = getTokenFromStorage();
  const url = jobDescriptionId 
    ? `/api/cv-reviews?jobDescriptionId=${jobDescriptionId}`
    : '/api/cv-reviews';

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch CV reviews');
  }

  return response.json();
};

export const reviewCV = async (
  cvId: string, 
  status: 'accepted' | 'rejected', 
  comment?: string
): Promise<CVReview> => {
  const token = getTokenFromStorage();
  
  const response = await fetch(`/api/cv-reviews/${cvId}/review`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status, comment })
  });

  if (!response.ok) {
    throw new Error('Failed to submit CV review');
  }

  return response.json();
};

export const uploadCV = async (
  jobDescriptionId: string,
  candidateName: string,
  candidateEmail: string,
  cvFile: File
): Promise<CVReview> => {
  const token = getTokenFromStorage();
  const formData = new FormData();
  
  formData.append('jobDescriptionId', jobDescriptionId);
  formData.append('candidateName', candidateName);
  formData.append('candidateEmail', candidateEmail);
  formData.append('cvFile', cvFile);

  const response = await fetch('/api/cv-reviews/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error('Failed to upload CV');
  }

  return response.json();
}; 