import { JobDescription, CVSubmission, CVSubmissionResponse } from '../types/jobDescription';
import axios from 'axios';
import { CVSubmissionResponse as OldCVSubmissionResponse } from '../types/jobDescription';
import { API_BASE_URL } from '../config';

export const getJobDescriptions = async (): Promise<JobDescription[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/JobDescription`);
    return response.data;
  } catch (error) {
    console.error('Error fetching job descriptions:', error);
    throw error;
  }
};

export const getCVSubmissions = async (): Promise<CVSubmission[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/CVSubmission/recent`);
    return response.data;
  } catch (error) {
    console.error('Error fetching CV submissions:', error);
    throw error;
  }
};

export const getCVSubmissionsForJobDescription = async (jobDescriptionId: number): Promise<CVSubmission[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/CVSubmission/jd/${jobDescriptionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching CV submissions for job description:', error);
    throw error;
  }
};

export interface CVSubmissionData {
  id: number;
  candidateName: string;
  candidateEmail: string;
  submissionDate: string;
  status: string;
  comments?: string;
  jobDescription?: {
    id: number;
    title: string;
    location: string;
    postedDate: string;
    client: string;
  };
  cvFilePath: string;
}

export interface CVReviewModel {
  status: string;
  comments: string;
}

export const cvSubmissionService = {
  async getCVSubmissions(): Promise<CVSubmissionData[]> {
    const response = await fetch(`${API_BASE_URL}/cvsubmission/recent`);
    if (!response.ok) {
      throw new Error('Failed to fetch CV submissions');
    }
    return response.json();
  },

  async getCVSubmission(id: number): Promise<CVSubmissionData> {
    const response = await fetch(`${API_BASE_URL}/cvsubmission/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch CV submission');
    }
    return response.json();
  },

  async getPendingCVSubmissions(): Promise<CVSubmissionData[]> {
    const response = await fetch(`${API_BASE_URL}/cvsubmission/pending`);
    if (!response.ok) {
      throw new Error('Failed to fetch pending CV submissions');
    }
    return response.json();
  },

  async getCVSubmissionsForJD(jobDescriptionId: number): Promise<CVSubmissionData[]> {
    const response = await fetch(`${API_BASE_URL}/cvsubmission/jd/${jobDescriptionId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch CV submissions for job description');
    }
    return response.json();
  },

  async uploadCV(file: File, submission: Omit<CVSubmissionData, 'id' | 'submissionDate' | 'status'>): Promise<CVSubmissionData> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('submission', JSON.stringify(submission));

    const response = await fetch(`${API_BASE_URL}/cvsubmission`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload CV');
    }
    return response.json();
  },

  async downloadCV(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/cvsubmission/${id}/downloadCV`);
    if (!response.ok) {
      throw new Error('Failed to download CV');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CV_${id}.${blob.type.split('/')[1]}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  async previewCV(id: number): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/cvsubmission/${id}/previewCV`);
    if (!response.ok) {
      throw new Error('Failed to preview CV');
    }

    const contentType = response.headers.get('Content-Type');
    if (!contentType) {
      throw new Error('No content type received');
    }

    return response.blob();
  },

  async reviewCV(id: number, review: CVReviewModel): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/cvsubmission/${id}/review`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(review),
    });

    if (!response.ok) {
      throw new Error('Failed to submit review');
    }
  },

  async deleteCVSubmission(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/cvsubmission/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete CV submission');
    }
  },
};

export const uploadCVForJobDescription = async (data: CVSubmissionData) => {
  const formData = new FormData();
  formData.append('JobDescriptionId', data.jobDescriptionId.toString());
  formData.append('CandidateName', data.candidateName);
  formData.append('CandidateEmail', data.candidateEmail);
  formData.append('CVFile', data.cvFilePath);

  const response = await axios.post(`${API_BASE_URL}/cv-submissions`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const uploadCV = async (
  jobDescriptionId: number,
  file: File,
  candidateName: string,
  candidateEmail: string
): Promise<CVSubmissionResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('CandidateName', candidateName);
    formData.append('CandidateEmail', candidateEmail);
    formData.append('jobDescriptionID', jobDescriptionId.toString());

    const response = await axios.post(
      `${API_BASE_URL}/CVSubmission`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error uploading CV:', error);
    throw error;
  }
};

export const getCVMatchScore = async (jobDescriptionId: number, cvId: number): Promise<number> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/CVSubmission/${cvId}/review`
    );
    return response.data.matchScore;
  } catch (error) {
    console.error('Error getting CV match score:', error);
    throw error;
  }
};

export const reviewCV = async (id: number, review: { status: string; comments: string }): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/CVSubmission/${id}/review`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(review),
  });

  if (!response.ok) {
    throw new Error('Failed to submit review');
  }
}; 