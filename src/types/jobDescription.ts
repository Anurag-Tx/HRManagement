export interface JobDescription {
  id: number;
  title: string;
  location: string;
  department: string;
  description: string;
  requirements: string;
  postedDate: string;
  status: string;
  isActive: boolean;
  filePath: string;
  createdByUserId: number;
  createdByUser: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  cvSubmissions: CVSubmission[];
}

export interface CVSubmission {
  id: number;
  candidateName: string;
  candidateEmail: string;
  cvFilePath: string;
  submissionDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  comments?: string;
  reviewedDate?: string;
  reviewedByUserId?: number;
  reviewedByUser?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  submittedByUserId: number;
  submittedByUser: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  jobDescriptionId: number;
  jobDescription: {
    id: number;
    title: string;
    department: string;
    location: string;
  };
}

export interface CVSubmissionResponse {
  success: boolean;
  message: string;
  data?: CVSubmission;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
} 