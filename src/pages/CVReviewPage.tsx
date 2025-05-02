import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cvSubmissionService } from '../services/cvSubmissionService';
import { format, parseISO, isValid } from 'date-fns';
import { 
  CheckCircle, 
  XCircle, 
  Download, 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  FileText, 
  Building, 
  MapPin, 
  Clock, 
  MessageSquare,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { CVSubmission } from '../types/jobDescription';
import { motion } from 'framer-motion';

// Utility function to safely format dates
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Not Available';
  
  try {
    // Parse the ISO string with milliseconds
    const date = parseISO(dateString);
    if (isValid(date)) {
      return format(date, 'MMMM d, yyyy');
    }
    return 'Not Available';
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Not Available';
  }
};

const CVReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cv, setCV] = useState<CVSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [comments, setComments] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'Approved' | 'Rejected' | null>(null);

  useEffect(() => {
    const fetchCV = async () => {
      try {
        const cvData = await cvSubmissionService.getCVSubmission(Number(id));
        setCV(cvData);
      } catch (err) {
        setError('Failed to fetch CV details');
        console.error('Error fetching CV:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCV();
  }, [id]);

  const handleDownloadCV = async () => {
    try {
      await cvSubmissionService.downloadCV(Number(id));
    } catch (err) {
      setError('Failed to download CV');
      console.error('Error downloading CV:', err);
    }
  };

  const handleReview = async () => {
    if (!reviewStatus || !comments) {
      setError('Please select a status and provide comments');
      return;
    }

    try {
      await cvSubmissionService.reviewCV(Number(id), {
        status: reviewStatus,
        comments: comments
      });
      setSuccess('Review submitted successfully');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError('Failed to submit review');
      console.error('Error submitting review:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-4 w-4 mr-1" />
            Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="h-4 w-4 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
            <Clock className="h-4 w-4 mr-1" />
            Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!cv) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Not Found!</strong>
          <span className="block sm:inline"> CV not found.</span>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="h-8 w-8 text-blue-600 mr-3" />
            CV Review
          </h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
        </motion.div>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading CV details...</p>
          </motion.div>
        ) : (
          <>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-lg shadow-sm"
                role="alert"
                aria-live="polite"
              >
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <p className="text-green-700">{success}</p>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg shadow-sm"
                role="alert"
                aria-live="polite"
              >
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
              </motion.div>
            )}

            {cv && (
              <div className="space-y-6">
                {/* Candidate Information Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
                >
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="h-5 w-5 text-blue-600 mr-2" />
                      Candidate Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-600">{cv.candidateName}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-600">{cv.candidateEmail}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-600">{formatDate(cv.submissionDate)}</span>
                      </div>
                      <div className="flex items-center">
                        <Building className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-600">{cv.jobDescription.department}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Job Description Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
                >
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="h-5 w-5 text-blue-600 mr-2" />
                      Job Description
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-600 font-medium">{cv.jobDescription.title}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-600">{cv.jobDescription.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-600">Status: {getStatusBadge(cv.status)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Review Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
                >
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <MessageSquare className="h-5 w-5 text-blue-600 mr-2" />
                      Review Decision
                    </h2>
                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <button
                          onClick={() => setReviewStatus('Approved')}
                          className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg transition-all duration-200 ${
                            reviewStatus === 'Approved'
                              ? 'bg-green-50 text-green-800 border-2 border-green-500 shadow-sm'
                              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-500 hover:shadow-sm'
                          } focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
                        >
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Approve
                        </button>
                        <button
                          onClick={() => setReviewStatus('Rejected')}
                          className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg transition-all duration-200 ${
                            reviewStatus === 'Rejected'
                              ? 'bg-red-50 text-red-800 border-2 border-red-500 shadow-sm'
                              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-red-500 hover:shadow-sm'
                          } focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`}
                        >
                          <XCircle className="h-5 w-5 mr-2" />
                          Reject
                        </button>
                      </div>

                      <div>
                        <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
                          Comments
                        </label>
                        <textarea
                          id="comments"
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                            !comments && reviewStatus ? 'border-red-300' : 'border-gray-200'
                          }`}
                          rows={4}
                          placeholder="Enter your review comments..."
                          aria-invalid={!comments && reviewStatus ? 'true' : 'false'}
                        />
                        {!comments && reviewStatus && (
                          <p className="mt-1 text-sm text-red-600" role="alert">
                            Please provide comments for your review
                          </p>
                        )}
                      </div>

                      <div className="flex justify-between items-center">
                        <button
                          onClick={handleDownloadCV}
                          className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <Download className="h-5 w-5 mr-2" />
                          Download CV
                        </button>
                        <div className="flex gap-4">
                          <button
                            onClick={() => navigate('/dashboard')}
                            className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleReview}
                            disabled={!reviewStatus || !comments}
                            className={`px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                              !reviewStatus || !comments
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                            }`}
                          >
                            Submit Review
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CVReviewPage; 