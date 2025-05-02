import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FileText, 
  Upload, 
  Users, 
  Calendar, 
  Building, 
  MapPin, 
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  X
} from 'lucide-react';
import { getJobDescription } from '../services/jobDescriptionService';
import { JobDescription } from '../types/jobDescription';
import { formatDate } from '../services/utilsService';

interface CV {
  id: number;
  candidateName: string;
  candidateEmail: string;
  submissionDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  fileName: string;
  reviewDate?: string;
  reviewComment?: string;
}

const JobDescriptionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [jobDescription, setJobDescription] = useState<JobDescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedCV, setSelectedCV] = useState<CV | null>(null);
  const [reviewStatus, setReviewStatus] = useState('pending');
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    const fetchJobDescription = async () => {
      try {
        if (!id) return;
        const data = await getJobDescription(id);
        setJobDescription(data);
      } catch (err) {
        setError('Failed to load job description');
        console.error('Error fetching job description:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDescription();
  }, [id]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(event.target.files);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles) return;

    setUploading(true);
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setUploading(false);
    setSelectedFiles(null);

    // Reset file input
    const fileInput = document.getElementById('cv-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const handleReviewClick = (cv: CV) => {
    setSelectedCV(cv);
    setReviewStatus(cv.status);
    setReviewComment(cv.reviewComment || '');
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = () => {
    if (!selectedCV) return;

    const updatedCVs = jobDescription?.cvSubmissions.map(cv => 
      cv.id === selectedCV.id 
        ? {
            ...cv,
            status: reviewStatus,
            reviewComment: reviewComment,
            reviewDate: new Date().toISOString()
          }
        : cv
    ) || [];

    setJobDescription({
      ...jobDescription,
      cvSubmissions: updatedCVs
    });
    setIsReviewModalOpen(false);
    setSelectedCV(null);
    setReviewComment('');
    setReviewStatus('pending');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !jobDescription) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error || 'Job description not found'}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl mt-16 md:mt-0">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <Link to="/job-descriptions" className="hover:text-blue-600">
              Job Descriptions
            </Link>
          </li>
          <li>
            <span className="mx-2">/</span>
          </li>
          <li className="text-gray-900 font-medium">{jobDescription.title}</li>
        </ol>
      </nav>

      {/* Header section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{jobDescription.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Building className="w-4 h-4 mr-1" />
                <span>{jobDescription.department}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{jobDescription.location}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Posted {formatDate(jobDescription.postedDate)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              jobDescription.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {jobDescription.status}
            </span>
          </div>
        </div>
      </div>

      {/* Description and Requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Job Description</h2>
          <div className="prose max-w-none">
            <p className="whitespace-pre-line">{jobDescription.description}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Requirements</h2>
          <ul className="list-disc list-inside space-y-2">
            {jobDescription.requirements?.split('\n').map((req, index) => (
              <li key={index} className="text-gray-700">{req.trim()}</li>
            ))}
          </ul>
        </div>
      </div>


      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-medium">Review CV</h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Candidate
                </label>
                <p className="text-gray-900">{selectedCV?.candidateName}</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                  placeholder="Add your review comments here..."
                />
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3 rounded-b-lg">
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDescriptionDetail;