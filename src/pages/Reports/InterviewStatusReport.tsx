import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Select } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Loader2 } from 'lucide-react';
import { formatDate } from '../../services/utilsService';

interface Interview {
  id: number;
  candidateName: string;
  jobDescriptionId: number;
  interviewDate: string;
  interviewTime: string;
  interviewType: string;
  status: string;
  feedback: string;
  jobDescription?: {
    id: number;
    title: string;
  };
  interviewerAssignments?: {
    interviewer: {
      id: number;
      name: string;
      role: string;
    }
  }[];
}

interface JobDescription {
  id: number;
  title: string;
}

const INTERVIEW_STATUSES = [
  'Pending',
  'Completed',
  'Rejected',
  'Cancelled',
  'Rescheduled'
];

const InterviewStatusReport: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJD, setSelectedJD] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch interviews
      const interviewsRes = await fetch('https://localhost:7138/api/InterviewStatus');
      if (!interviewsRes.ok) {
        throw new Error(`Failed to fetch interviews: ${interviewsRes.statusText}`);
      }
      const interviewsData = await interviewsRes.json();
      
      // Fetch job descriptions
      const jdsRes = await fetch('https://localhost:7138/api/JobDescription');
      if (!jdsRes.ok) {
        throw new Error(`Failed to fetch job descriptions: ${jdsRes.statusText}`);
      }
      const jdsData = await jdsRes.json();

      // Transform the data if needed
      const transformedInterviews = Array.isArray(interviewsData) ? interviewsData : [];
      const transformedJDs = Array.isArray(jdsData) ? jdsData : [];

      setInterviews(transformedInterviews);
      setJobDescriptions(transformedJDs);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Filter interviews based on selected JD, status, and date range
  const filteredInterviews = interviews.filter(interview => {
    const matchesJD = !selectedJD || interview.jobDescriptionId.toString() === selectedJD;
    const matchesStatus = !selectedStatus || interview.status === selectedStatus;
    const interviewDate = new Date(interview.interviewDate);
    const matchesStartDate = !startDate || interviewDate >= new Date(startDate);
    const matchesEndDate = !endDate || interviewDate <= new Date(endDate);
    return matchesJD && matchesStatus && matchesStartDate && matchesEndDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredInterviews.length / itemsPerPage);
  const paginatedInterviews = filteredInterviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getJDTitle = (jdId: number) => {
    const jd = jobDescriptions.find(jd => jd.id === jdId);
    return jd?.title || 'Unknown JD';
  };

  const getInterviewers = (interview: Interview) => {
    if (!interview.interviewerAssignments) return 'Not assigned';
    return interview.interviewerAssignments
      .map(assignment => assignment.interviewer.name)
      .join(', ');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
            <Button 
              onClick={fetchData} 
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Interview Status Report</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Select
              value={selectedJD}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedJD(e.target.value)}
              className="w-full"
            >
              <option value="">All Job Descriptions</option>
              {jobDescriptions.map(jd => (
                <option key={jd.id} value={jd.id}>{jd.title}</option>
              ))}
            </Select>
            <Select
              value={selectedStatus}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedStatus(e.target.value)}
              className="w-full"
            >
              <option value="">All Statuses</option>
              {INTERVIEW_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </Select>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interview Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interview Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interviewers</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedInterviews.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No interviews found
                    </td>
                  </tr>
                ) : (
                  paginatedInterviews.map(interview => (
                    <tr key={interview.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{interview.candidateName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getJDTitle(interview.jobDescriptionId)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(interview.interviewDate)} {interview.interviewTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{interview.interviewType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getInterviewers(interview)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          interview.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          interview.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          interview.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          interview.status === 'Cancelled' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {interview.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{interview.feedback || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredInterviews.length > 0 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredInterviews.length)} of {filteredInterviews.length} results
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewStatusReport; 