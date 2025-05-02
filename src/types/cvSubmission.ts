export interface CVSubmission {
  id: number;
  candidateName: string;
  candidateEmail: string;
  submittedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  comments?: string;
  jobDescription?: {
    id: number;
    title: string;
    department: string;
    location: string;
  };
  submittedBy?: {
    id: number;
    name: string;
  };
  reviewedBy?: {
    id: number;
    name: string;
  };
} 