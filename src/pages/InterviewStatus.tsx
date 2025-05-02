import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  Clock, 
  User, 
  Type, 
  MessageSquare, 
  CheckCircle,
  Save
} from 'lucide-react';

interface InterviewForm {
  interviewTime: string;
  interviewDate: string;
  type: 'L1' | 'L2';
  assignedPerson: string;
  feedback: string;
  status: 'Shortlisted' | 'Not Shortlisted' | 'Not Joined' | 'Pending' | 'On Hold' | 'Offer Extended' | 'Offer Accepted' | 'Offer Declined' | 'Interview Scheduled' | 'Rescheduled' | 'No Show' | 'Under Review';
}

const InterviewStatus: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<InterviewForm>({
    interviewTime: '',
    interviewDate: '',
    type: 'L1',
    assignedPerson: '',
    feedback: '',
    status: 'Pending'
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);
    // Reset form after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
      setFormData({
        interviewTime: '',
        interviewDate: '',
        type: 'L1',
        assignedPerson: '',
        feedback: '',
        status: 'Pending'
      });
    }, 3000);
  };

  if (user?.role !== 'hr') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">Access denied. Only HR users can access this page.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Interview Status</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Interview Time */}
            <div>
              <label htmlFor="interviewTime" className="block text-sm font-medium text-gray-700 mb-1">
                Interview Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="interviewTime"
                  name="interviewTime"
                  value={formData.interviewTime}
                  onChange={handleChange}
                  placeholder="e.g., 10:30 AM"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Interview Date */}
            <div>
              <label htmlFor="interviewDate" className="block text-sm font-medium text-gray-700 mb-1">
                Interview Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="datetime-local"
                  id="interviewDate"
                  name="interviewDate"
                  value={formData.interviewDate}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Interview Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="L1">L1</option>
                  <option value="L2">L2</option>
                </select>
              </div>
            </div>

            {/* Assigned Person */}
            <div>
              <label htmlFor="assignedPerson" className="block text-sm font-medium text-gray-700 mb-1">
                Assigned Person
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  id="assignedPerson"
                  name="assignedPerson"
                  value={formData.assignedPerson}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a person</option>
                  <option value="Rahul">Rahul</option>
                  <option value="Priya">Priya</option>
                  <option value="Arjun">Arjun</option>
                </select>
              </div>
            </div>

            {/* Feedback */}
            <div>
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                Feedback
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  id="feedback"
                  name="feedback"
                  value={formData.feedback}
                  onChange={handleChange}
                  rows={4}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter feedback..."
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="relative">
                <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Rescheduled">Rescheduled</option>
                  <option value="No Show">No Show</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Not Shortlisted">Not Shortlisted</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Offer Extended">Offer Extended</option>
                  <option value="Offer Accepted">Offer Accepted</option>
                  <option value="Offer Declined">Offer Declined</option>
                  <option value="Not Joined">Not Joined</option>
                </select>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Save className="h-5 w-5 mr-2" />
                Save
              </button>
            </div>

            {/* Success Message */}
            {showSuccess && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800">
                  Interview Type {formData.type} assigned to {formData.assignedPerson}
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default InterviewStatus; 