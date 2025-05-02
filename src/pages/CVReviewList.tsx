import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cvSubmissionService, CVSubmissionData } from '../services/cvSubmissionService';
import { format, parseISO } from 'date-fns';
import { FileText, Eye, Download, Loader2, AlertCircle } from 'lucide-react';

const CVReviewList: React.FC = () => {
  const navigate = useNavigate();
  const [cvs, setCVs] = useState<CVSubmissionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchCVs = async () => {
      try {
        const data = await cvSubmissionService.getCVSubmissions();
        setCVs(data);
      } catch (err) {
        setError('Failed to fetch CVs');
        console.error('Error fetching CVs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCVs();
  }, []);

  const handleDownloadCV = async (cvId: number) => {
    try {
      setDownloading(prev => ({ ...prev, [cvId]: true }));
      await cvSubmissionService.downloadCV(cvId);
    } catch (err) {
      console.error('Error downloading CV:', err);
    } finally {
      setDownloading(prev => ({ ...prev, [cvId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">CVs for Review</h1>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resume</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cvs.map((cv) => (
                <tr key={cv.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{cv.candidateName}</div>
                    <div className="text-sm text-gray-500">{cv.candidateEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{cv.jobDescription?.client || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{cv.jobDescription?.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{cv.jobDescription?.location || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {cv.submissionDate ? format(parseISO(cv.submissionDate), 'PPP') : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDownloadCV(cv.id)}
                      disabled={downloading[cv.id]}
                      className={`flex items-center text-blue-600 hover:text-blue-900 ${
                        downloading[cv.id] ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      {downloading[cv.id] ? 'Downloading...' : 'Download'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      cv.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      cv.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {cv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => navigate(`/cv-review/${cv.id}`)}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CVReviewList; 