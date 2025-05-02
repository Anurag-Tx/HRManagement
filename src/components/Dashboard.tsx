import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FileText, 
  Upload, 
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { getJobDescriptions } from '../services/jobDescriptionService';
import { getCVSubmissions } from '../services/cvSubmissionService';
import { JobDescription, CVSubmission } from '../types/jobDescription';

interface DashboardStats {
  totalJobDescriptions: number;
  totalCVSubmissions: number;
  pendingReviews: number;
  approvedCVs: number;
  rejectedCVs: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalJobDescriptions: 0,
    totalCVSubmissions: 0,
    pendingReviews: 0,
    approvedCVs: 0,
    rejectedCVs: 0
  });
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [cvSubmissions, setCVSubmissions] = useState<CVSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jds, cvs] = await Promise.all([
          getJobDescriptions(),
          getCVSubmissions()
        ]);

        setJobDescriptions(jds);
        setCVSubmissions(cvs);

        setStats({
          totalJobDescriptions: jds.length,
          totalCVSubmissions: cvs.length,
          pendingReviews: cvs.filter(cv => cv.status === 'Pending').length,
          approvedCVs: cvs.filter(cv => cv.status === 'Approved').length,
          rejectedCVs: cvs.filter(cv => cv.status === 'Rejected').length
        });
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCVClick = (cvId: number) => {
    navigate(`/cv-review/${cvId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Total JDs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <p className="text-2xl font-bold">{stats.totalJobDescriptions}</p>
              <Link 
                to="/job-descriptions" 
                className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-flex items-center gap-1"
              >
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Total CVs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <p className="text-2xl font-bold">{stats.totalCVSubmissions}</p>
              <Link 
                to="/upload-cv" 
                className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-flex items-center gap-1"
              >
                Upload CV <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.pendingReviews}</p>
          </CardContent>
        </Card>
      </div>

      {/* CV Status Summary */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900">CV Status Summary</h3>
          <div className="mt-6">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                    Accepted
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-green-600">
                    {stats.approvedCVs}
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                <div 
                  style={{ width: `${(stats.approvedCVs / stats.totalCVSubmissions) * 100}%` }} 
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                ></div>
              </div>
            </div>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-yellow-600 bg-yellow-200">
                    Pending
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-yellow-600">
                    {stats.pendingReviews}
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-yellow-200">
                <div 
                  style={{ width: `${(stats.pendingReviews / stats.totalCVSubmissions) * 100}%` }} 
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-500"
                ></div>
              </div>
            </div>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-red-600 bg-red-200">
                    Rejected
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-red-600">
                    {stats.rejectedCVs}
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 text-xs flex rounded bg-red-200">
                <div 
                  style={{ width: `${(stats.rejectedCVs / stats.totalCVSubmissions) * 100}%` }} 
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
                ></div>
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-md p-4 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.approvedCVs}</p>
              <p className="text-sm text-gray-500">Accepted</p>
            </div>
            <div className="border border-gray-200 rounded-md p-4 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-red-100 rounded-full mb-4">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.rejectedCVs}</p>
              <p className="text-sm text-gray-500">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent CV Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Candidate</th>
                  <th className="text-left py-2">Job Title</th>
                  <th className="text-left py-2">Submitted Date</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {cvSubmissions.map((cv) => (
                  <tr 
                    key={cv.id} 
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleCVClick(cv.id)}
                  >
                    <td className="py-2">{cv.candidateName}</td>
                    <td className="py-2">{cv.jobDescription?.title}</td>
                    <td className="py-2">
                      {new Date(cv.submittedDate).toLocaleDateString()}
                    </td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        cv.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        cv.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {cv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard; 