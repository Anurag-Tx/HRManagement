import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { uploadCV, CVReview as CVReviewType } from '../services/cvReviewService';
import { useNotifications } from '../context/NotificationContext';

const CVManagement: React.FC = () => {
  const { jdId } = useParams<{ jdId: string }>();
  const { createNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    candidateName: '',
    candidateEmail: '',
    cvFile: null as File | null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        cvFile: e.target.files![0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jdId || !formData.cvFile) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await uploadCV(
        jdId,
        formData.candidateName,
        formData.candidateEmail,
        formData.cvFile
      );

      // Create notification for manager
      await createNotification(
        'manager', // This should be the actual manager user ID
        `New CV uploaded for ${formData.candidateName}`,
        'cv_upload',
        jdId
      );

      setSuccess('CV uploaded successfully!');
      setFormData({
        candidateName: '',
        candidateEmail: '',
        cvFile: null
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload CV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl mt-16 md:mt-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Upload CV</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Candidate Name
          </label>
          <input
            type="text"
            name="candidateName"
            value={formData.candidateName}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Candidate Email
          </label>
          <input
            type="email"
            name="candidateEmail"
            value={formData.candidateEmail}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CV File (PDF or DOCX)
          </label>
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white ${
            loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Uploading...' : 'Upload CV'}
        </button>
      </form>
    </div>
  );
};

export default CVManagement;