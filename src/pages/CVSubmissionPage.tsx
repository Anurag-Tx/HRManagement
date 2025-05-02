import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { JobDescription, CVSubmission } from '../types/jobDescription';
import { getJobDescriptions, uploadCV, getCVSubmissions, getCVMatchScore } from '../services/cvSubmissionService';
import { FileUp, Eye, RefreshCw, AlertCircle, Upload, Briefcase, Calendar, User, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDateTime } from '../services/utilsService';

const CVSubmissionPage: React.FC = () => {
  const { user } = useAuth();
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [cvSubmissions, setCVSubmissions] = useState<CVSubmission[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [matchScores, setMatchScores] = useState<Record<string, number>>({});
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  const [candidateDetails, setCandidateDetails] = useState<Record<string, { name: string; email: string }>>({});

  useEffect(() => {
    if (user?.role === 'hr') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [jds, submissions] = await Promise.all([
        getJobDescriptions(),
        getCVSubmissions()
      ]);
      setJobDescriptions(jds);
      setCVSubmissions(submissions);
    } catch (err) {
      setError('Failed to fetch data');
    }
  };

  const handleCandidateDetailsChange = (jobDescriptionId: number, field: 'name' | 'email', value: string) => {
    setCandidateDetails(prev => ({
      ...prev,
      [jobDescriptionId]: {
        ...prev[jobDescriptionId],
        [field]: value
      }
    }));
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleFileUpload = async (jobDescriptionId: number, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const details = candidateDetails[jobDescriptionId];
    if (!details?.name?.trim()) {
      setError('Please enter candidate name');
      return;
    }
    if (!details?.email?.trim()) {
      setError('Please enter candidate email');
      return;
    }
    if (!validateEmail(details.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(prev => ({ ...prev, [jobDescriptionId.toString()]: true }));
    setError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type !== 'application/pdf' && 
            file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          throw new Error('Only PDF and DOCX files are allowed');
        }
        await uploadCV(jobDescriptionId, file, details.name, details.email);
      }
      // Refresh submissions after upload
      const updatedSubmissions = await getCVSubmissions();
      setCVSubmissions(updatedSubmissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload CV');
    } finally {
      setLoading(prev => ({ ...prev, [jobDescriptionId.toString()]: false }));
    }
  };

  const handlePreviewMatch = async (jobDescriptionId: number, cvId: number) => {
    try {
      const score = await getCVMatchScore(jobDescriptionId, cvId);
      setMatchScores(prev => ({
        ...prev,
        [`${jobDescriptionId}-${cvId}`]: score
      }));
    } catch (err) {
      console.error('Failed to get match score:', err);
    }
  };

  const getSubmissionsForJD = (jobDescriptionId: number) => {
    return cvSubmissions.filter(sub => sub.jobDescriptionId === jobDescriptionId);
  };

  const toggleDescription = (jdId: number) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [jdId.toString()]: !prev[jdId.toString()]
    }));
  };

  const extractSkills = (description: string): string[] => {
    // Common technical skills to look for
    const commonSkills = [
      '.NET', 'Java', 'React', 'Angular', 'Python', 'SQL', 'JavaScript', 
      'TypeScript', 'AWS', 'Azure', 'Node.js', 'Spring', 'Docker', 
      'Kubernetes', 'MongoDB', 'PostgreSQL', 'HTML', 'CSS', 'Vue.js',
      'C#', 'C++', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin'
    ];
    
    // Find matching skills in the description
    const foundSkills = commonSkills.filter(skill => 
      description.toLowerCase().includes(skill.toLowerCase())
    );
    
    // Return up to 4 skills, sorted by relevance (position in the description)
    return foundSkills
      .sort((a, b) => {
        const aIndex = description.toLowerCase().indexOf(a.toLowerCase());
        const bIndex = description.toLowerCase().indexOf(b.toLowerCase());
        return aIndex - bIndex;
      })
      .slice(0, 4);
  };

  if (user?.role !== 'hr') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md w-full">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-900">CV Submissions</h1>
            <p className="mt-1 text-sm text-gray-500">Manage and review CV submissions for job descriptions</p>
          </div>
          <button
            onClick={fetchData}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Job Descriptions Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobDescriptions.map((jd) => (
            <div key={jd.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
              {/* Job Description Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">{jd.title}</h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Briefcase className="h-3 w-3 mr-1" />
                    {jd.location}
                  </span>
                </div>
                
                {/* Skills Tags */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {['.NET', 'React', 'Java', 'SQL'].map((skill, index) => {
                    // Define color classes for each skill
                    const getSkillColor = (skill: string) => {
                      switch (skill.toLowerCase()) {
                        case '.net':
                          return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200';
                        case 'react':
                          return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
                        case 'java':
                          return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
                        case 'sql':
                          return 'bg-teal-100 text-teal-800 hover:bg-teal-200';
                        default:
                          return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
                      }
                    };

                    return (
                      <span
                        key={index}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors duration-200 ${getSkillColor(skill)}`}
                      >
                        {skill}
                      </span>
                    );
                  })}
                </div>

                {/* Description with Expand/Collapse */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700">Description</h3>
                    <button
                      onClick={() => toggleDescription(jd.id)}
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      {expandedDescriptions[jd.id.toString()] ? (
                        <>
                          Show Less <ChevronUp className="h-4 w-4 ml-1" />
                        </>
                      ) : (
                        <>
                          Show More <ChevronDown className="h-4 w-4 ml-1" />
                        </>
                      )}
                    </button>
                  </div>
                  <div className="space-y-4">
                    <p className={`text-sm text-gray-600 ${expandedDescriptions[jd.id.toString()] ? '' : 'line-clamp-2'}`}>
                      {jd.description}
                    </p>
                    {jd.requirements && (
                      <div className={`${expandedDescriptions[jd.id.toString()] ? '' : 'hidden'}`}>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Requirements</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {jd.requirements.split('\n').map((req, index) => (
                            <li key={index}>{req.trim()}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Upload Section */}
              <div className="p-6">
                <div className="mb-4">
                  {/* Candidate Details Inputs */}
                  <div className="space-y-4 mb-4">
                    <div>
                      <label htmlFor={`name-${jd.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Candidate Name *
                      </label>
                      <input
                        type="text"
                        id={`name-${jd.id}`}
                        value={candidateDetails[jd.id]?.name || ''}
                        onChange={(e) => handleCandidateDetailsChange(jd.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter candidate name"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor={`email-${jd.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Candidate Email *
                      </label>
                      <input
                        type="email"
                        id={`email-${jd.id}`}
                        value={candidateDetails[jd.id]?.email || ''}
                        onChange={(e) => handleCandidateDetailsChange(jd.id, 'email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter candidate email"
                        required
                      />
                    </div>
                  </div>

                  <label className="block">
                    <span className="sr-only">Upload CV</span>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors duration-200">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor={`file-upload-${jd.id}`}
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span>Upload CV</span>
                            <input
                              id={`file-upload-${jd.id}`}
                              type="file"
                              multiple
                              accept=".pdf,.docx"
                              onChange={(e) => handleFileUpload(jd.id, e.target.files)}
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PDF, DOCX up to 5MB</p>
                      </div>
                    </div>
                  </label>
                  {loading[jd.id.toString()] && (
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                      Uploading...
                    </div>
                  )}
                </div>

                {/* CV Submissions Table */}
                {getSubmissionsForJD(jd.id).length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded CVs</h3>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Candidate
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Match
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {getSubmissionsForJD(jd.id).map((cv, index) => (
                            <tr key={cv.id} className="hover:bg-gray-50 transition-colors duration-150">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100">
                                    <User className="h-5 w-5 text-blue-600" />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{cv.candidateName}</div>
                                    <div className="text-sm text-gray-500">{cv.candidateEmail}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                  {formatDateTime(cv.submissionDate)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {matchScores[`${jd.id}-${cv.id}`] !== undefined ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {matchScores[`${jd.id}-${cv.id}`]}%
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handlePreviewMatch(jd.id, cv.id)}
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Preview
                                  </button>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <button
                                  onClick={() => handlePreviewMatch(jd.id, cv.id)}
                                  className="text-blue-600 hover:text-blue-900 font-medium transition-colors duration-200"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CVSubmissionPage; 