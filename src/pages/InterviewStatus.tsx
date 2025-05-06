import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Calendar, Clock, User, Briefcase, Users, FileText, Loader2 } from 'lucide-react';
import { createInterviewStatus, getInterviewers, getJobDescriptions } from '../services/interviewStatusService';

interface JobDescription {
  id: number;
  title: string;
  description: string;
  requirements: string;
  department: string;
  location: string;
  client: string;
  postedDate: string;
  lastDate: string;
  status: string;
  isActive: boolean;
}

interface Interviewer {
  id: string;
  name: string;
  role: string;
}

const InterviewStatus: React.FC = () => {
  const [formData, setFormData] = useState({
    candidateName: '',
    jobDescriptionId: '',
    interviewDate: '',
    interviewTime: '',
    interviewType: '',
    assignedPersons: [] as string[],
    status: '',
    feedback: ''
  });

  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [selectedJD, setSelectedJD] = useState<JobDescription | null>(null);
  const [feedbackLength, setFeedbackLength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const interviewTypes = ['L1', 'L2', 'HR', 'Technical', 'Managerial'];
  const statusOptions = ['Shortlisted', 'Not Shortlisted','Scheduled' ,'Not Joined', 'Rescheduled', 'On Hold'];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('Fetching job descriptions...');
        const [jds, interviewersData] = await Promise.all([
          getJobDescriptions(),
          getInterviewers()
        ]);
        
        console.log('Raw API response:', jds);
        
        // Handle the API response - it's already an array
        if (Array.isArray(jds)) {
          console.log('Response is an array, length:', jds.length);
          // Filter only active job descriptions
          const validJDs = jds.filter((jd: JobDescription) => {
            console.log('Checking JD:', jd);
            // Check if the job description is active based on status or isActive field
            const isActive = jd.isActive === true || jd.status === 'Active';
            const isValid = isActive && jd.id && jd.title;
            console.log('Is valid:', isValid);
            return isValid;
          });
          
          console.log('Valid JDs:', validJDs);
          setJobDescriptions(validJDs);
        } else {
          console.log('Response is not an array:', typeof jds);
          setJobDescriptions([]);
          setError('Invalid job descriptions data received');
        }
        
        setInterviewers(interviewersData);
      } catch (error) {
        console.error('Error in fetchData:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
        setError(errorMessage);
        toast.error('Failed to fetch job descriptions. Please check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'feedback') {
      setFeedbackLength(value.length);
    }
  };

  const handleMultiSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      assignedPersons: selectedOptions
    }));
  };

  const handleJDSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    console.log('Selected JD value:', selectedValue); // Debug log
    console.log('Available JDs:', jobDescriptions); // Debug log
    
    const selectedJD = jobDescriptions.find(jd => jd.id === Number(selectedValue));
    console.log('Found selected JD:', selectedJD); // Debug log
    
    setSelectedJD(selectedJD || null);
    setFormData(prev => ({
      ...prev,
      jobDescriptionId: selectedValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createInterviewStatus(formData);
      toast.success('Interview status saved successfully!');
      
      // Reset form
      setFormData({
        candidateName: '',
        jobDescriptionId: '',
        interviewDate: '',
        interviewTime: '',
        interviewType: '',
        assignedPersons: [],
        status: '',
        feedback: ''
      });
      setSelectedJD(null);
      setFeedbackLength(0);

      // Refresh job descriptions list
      const updatedJDs = await getJobDescriptions();
      setJobDescriptions(updatedJDs.filter((jd: JobDescription) => jd.isActive));
    } catch (error) {
      toast.error('Failed to save interview status');
      console.error('Error saving interview status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Interview Status Form</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Candidate Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Candidate Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  name="candidateName"
                  value={formData.candidateName}
                  onChange={handleInputChange}
                  placeholder="Enter candidate full name"
                  className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Job Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Job Description
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                {isLoading ? (
                  <div className="flex items-center justify-center w-full h-10 border border-gray-300 rounded-md">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-500">Loading job descriptions...</span>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      name="jobDescriptionId"
                      value={formData.jobDescriptionId}
                      onChange={handleJDSelect}
                      className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                      required
                    >
                      <option value="">Select a job description</option>
                      {jobDescriptions && jobDescriptions.length > 0 ? (
                        jobDescriptions.map(jd => (
                          <option key={jd.id} value={jd.id}>
                            {jd.title} - {jd.department} ({jd.location})
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No active job descriptions found</option>
                      )}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                )}
                {error && (
                  <p className="mt-1 text-sm text-red-500">{error}</p>
                )}
              </div>
            </div>

            {/* JD Preview */}
            {selectedJD && (
              <div className="bg-gray-50 p-4 rounded-md space-y-3">
                <h3 className="font-semibold">{selectedJD.title}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Department:</span> {selectedJD.department}
                  </div>
                  <div>
                    <span className="font-medium">Location:</span> {selectedJD.location}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Summary:</span>
                  <p className="mt-1">{selectedJD.description}</p>
                </div>
                <div>
                  <span className="font-medium">Key Skills:</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {/* Add key skills rendering logic here */}
                  </div>
                </div>
              </div>
            )}

            {/* Interview Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Interview Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="date"
                    name="interviewDate"
                    value={formData.interviewDate}
                    onChange={handleInputChange}
                    className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Interview Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="time"
                    name="interviewTime"
                    value={formData.interviewTime}
                    onChange={handleInputChange}
                    className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Interview Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Interview Type
              </label>
              <select
                name="interviewType"
                value={formData.interviewType}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select interview type</option>
                {interviewTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Assigned Persons */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Assigned Persons
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  multiple
                  name="assignedPersons"
                  value={formData.assignedPersons}
                  onChange={handleMultiSelect}
                  className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {interviewers.map(interviewer => (
                    <option key={interviewer.id} value={interviewer.id}>
                      {interviewer.name} ({interviewer.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select status</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Feedback */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Feedback
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                <Textarea
                  name="feedback"
                  value={formData.feedback}
                  onChange={handleInputChange}
                  placeholder="Enter detailed feedback..."
                  className="pl-10 min-h-[120px]"
                  maxLength={1000}
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {feedbackLength}/1000 characters
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData({
                candidateName: '',
                jobDescriptionId: '',
                interviewDate: '',
                interviewTime: '',
                interviewType: '',
                assignedPersons: [],
                status: '',
                feedback: ''
              })}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Interview Status'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default InterviewStatus; 