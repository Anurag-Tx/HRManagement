import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { cvSubmissionService, CVSubmissionData } from '../services/cvSubmissionService';
import { 
  FileText, 
  Download, 
  CheckCircle, 
  XCircle, 
  User, 
  Mail, 
  Calendar, 
  Building, 
  MapPin, 
  Clock, 
  MessageSquare,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Eye,
  X,
  File,
  FileText as FileTextIcon
} from 'lucide-react';
import { motion } from 'framer-motion';

const CVReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cv, setCV] = useState<CVSubmissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'Approved' | 'Rejected' | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'pdf' | 'doc' | 'docx' | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchCV = async () => {
      if (!id) return;
      try {
        const data = await cvSubmissionService.getCVSubmission(Number(id));
        setCV(data);
      } catch (err) {
        setError('Failed to fetch CV details');
      } finally {
        setLoading(false);
      }
    };

    fetchCV();
  }, [id]);

  const handlePreviewCV = async () => {
    if (!id) return;
    
    try {
      setPreviewLoading(true);
      const blob = await cvSubmissionService.previewCV(Number(id));
      
      // Determine file type from blob
      const type = blob.type;
      let fileType: 'pdf' | 'doc' | 'docx' | null = null;
      
      if (type === 'application/pdf') {
        fileType = 'pdf';
      } else if (type === 'application/msword') {
        fileType = 'doc';
      } else if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        fileType = 'docx';
      }
      
      setPreviewType(fileType);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setIsPreviewOpen(true);
    } catch (err) {
      setError('Failed to preview CV');
      console.error('Error previewing CV:', err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setPreviewType(null);
  };

  const renderPreviewContent = () => {
    if (previewLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      );
    }

    if (!previewUrl || !previewType) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          Failed to load preview
        </div>
      );
    }

    if (previewType === 'pdf') {
      return (
        <iframe
          src={previewUrl}
          className="w-full h-full min-h-[60vh]"
          title="CV Preview"
        />
      );
    } else {
      // For DOC/DOCX files, we'll use Google Docs Viewer
      const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(previewUrl)}&embedded=true`;
      return (
        <iframe
          src={googleDocsUrl}
          className="w-full h-full min-h-[60vh]"
          title="CV Preview"
        />
      );
    }
  };

  const handleDownloadCV = async () => {
    if (!id) return;
    try {
      await cvSubmissionService.downloadCV(Number(id));
    } catch (err) {
      setError('Failed to download CV');
      console.error('Error downloading CV:', err);
    }
  };

  const handleReviewSubmit = async () => {
    if (!id || !reviewStatus) return;
    try {
      await cvSubmissionService.reviewCV(Number(id), {
        status: reviewStatus,
        comments: comments
      });
      // Show success message and stay on the same page
      setSuccess('Review submitted successfully');
      // Clear the form
      setComments('');
      setReviewStatus(null);
    } catch (err) {
      setError('Failed to submit review');
      console.error('Error submitting review:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !cv) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600">{error || 'CV not found'}</p>
          <Button
            onClick={() => navigate('/cv-submissions')}
            className="mt-4"
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to CV Submissions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">CV Review</h1>
          <Button
            onClick={() => navigate('/cv-submissions')}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to CV Submissions
          </Button>
        </div>

        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Candidate Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Candidate Information</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-600">{cv.candidateName}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-600">{cv.candidateEmail}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-600">
                  {new Date(cv.submissionDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <Building className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-600">{cv.jobDescription?.title}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-600">{cv.jobDescription?.location}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-600">
                  Posted: {new Date(cv.jobDescription?.postedDate || '').toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* CV Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">CV Actions</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handlePreviewCV}
                className="flex-1"
                variant="outline"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview CV
              </Button>
              <Button
                onClick={handleDownloadCV}
                className="flex-1"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Download CV
              </Button>
            </div>
          </div>

          {/* Review Decision */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Review Decision</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button
                  onClick={() => setReviewStatus('Approved')}
                  className={`flex-1 ${
                    reviewStatus === 'Approved'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-white hover:bg-green-50 text-green-600 border-green-600'
                  }`}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => setReviewStatus('Rejected')}
                  className={`flex-1 ${
                    reviewStatus === 'Rejected'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-white hover:bg-red-50 text-red-600 border-red-600'
                  }`}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments
                </label>
                <Textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Enter your comments here..."
                  className="min-h-[100px]"
                />
              </div>
              <Button
                onClick={handleReviewSubmit}
                disabled={!reviewStatus}
                className="w-full"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Submit Review
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
          >
            <div className="flex justify-between items-center p-4 border-b">
              <div className="flex items-center gap-2">
                {previewType === 'pdf' ? (
                  <FileTextIcon className="h-5 w-5 text-blue-600" />
                ) : (
                  <File className="h-5 w-5 text-blue-600" />
                )}
                <h3 className="text-lg font-semibold text-gray-900">Preview CV</h3>
              </div>
              <button
                onClick={closePreview}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {renderPreviewContent()}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CVReview;
