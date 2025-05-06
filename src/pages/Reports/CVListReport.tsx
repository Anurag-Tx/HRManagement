import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Select } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Loader2 } from 'lucide-react';
import { formatDate } from '../../services/utilsService';

interface Candidate {
  id: number;
  candidateName: string;
  candidateEmail: string;
  jobDescriptionId: number;
  submissionDate: string;
  status: string;
  cvFilePath: string;
  jobDescription?: {
    id: number;
    title: string;
  };
}

interface JobDescription {
  id: number;
  title: string;
}

const CVListReport: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJD, setSelectedJD] = useState('');
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

      // Fetch candidates
      const candidatesRes = await fetch('https://localhost:7138/api/CVSubmission/recent');
      if (!candidatesRes.ok) {
        throw new Error(`Failed to fetch candidates: ${candidatesRes.statusText}`);
      }
      const candidatesData = await candidatesRes.json();
      
      // Fetch job descriptions
      const jdsRes = await fetch('https://localhost:7138/api/JobDescription');
      if (!jdsRes.ok) {
        throw new Error(`Failed to fetch job descriptions: ${jdsRes.statusText}`);
      }
      const jdsData = await jdsRes.json();

      // Transform the data if needed
      const transformedCandidates = Array.isArray(candidatesData) ? candidatesData : [];
      const transformedJDs = Array.isArray(jdsData) ? jdsData : [];

      setCandidates(transformedCandidates);
      setJobDescriptions(transformedJDs);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Filter candidates based on selected JD and date range
  const filteredCandidates = candidates.filter(candidate => {
    const matchesJD = !selectedJD || candidate.jobDescriptionId.toString() === selectedJD;
    const submissionDate = new Date(candidate.submissionDate);
    const matchesStartDate = !startDate || submissionDate >= new Date(startDate);
    const matchesEndDate = !endDate || submissionDate <= new Date(endDate);
    return matchesJD && matchesStartDate && matchesEndDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getJDTitle = (jdId: number) => {
    const jd = jobDescriptions.find(jd => jd.id === jdId);
    return jd?.title || 'Unknown JD';
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
          <CardTitle className="text-2xl font-bold">CV List Report</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied JD</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submission Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No candidates found
                    </td>
                  </tr>
                ) : (
                  paginatedCandidates.map(candidate => (
                    <tr key={candidate.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{candidate.candidateName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{candidate.candidateEmail}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getJDTitle(candidate.jobDescriptionId)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(candidate.submissionDate)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          candidate.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          candidate.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {candidate.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{candidate.cvFilePath}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredCandidates.length > 0 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCandidates.length)} of {filteredCandidates.length} results
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

export default CVListReport; 