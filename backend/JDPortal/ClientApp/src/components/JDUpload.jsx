import React, { useState } from 'react';

const JDUpload = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState({
    title: '',
    description: '',
    requirements: '',
    department: '',
    location: '',
    lastDate: ''
  });

  const allowedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setError('');
    setSuccess('');

    if (selectedFile) {
      if (allowedFileTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setSuccess('File selected successfully!');
      } else {
        setError('Please upload a PDF or Word document only.');
        setFile(null);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJobDescription(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !jobDescription.title || !jobDescription.description) {
      setError('Please fill in all required fields and select a file');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', jobDescription.title);
    formData.append('description', jobDescription.description);
    formData.append('requirements', jobDescription.requirements);
    formData.append('department', jobDescription.department);
    formData.append('location', jobDescription.location);
    formData.append('lastDate', jobDescription.lastDate);
    formData.append('postedDate', new Date().toISOString());

    try {
      const response = await fetch('https://localhost:7138/api/JobDescription', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:5173'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload job description');
      }

      const data = await response.json();
      setSuccess('Job description uploaded successfully!');
      setFile(null);
      setJobDescription({
        title: '',
        description: '',
        requirements: '',
        department: '',
        location: '',
        lastDate: ''
      });
    } catch (err) {
      setError(err.message || 'An error occurred while uploading the job description');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 h-auto">
      <div className="bg-black text-slate-100 rounded-lg shadow-lg p-6 min-h-[50vh]">
        <h1 className="text-2xl font-semibold text-white mb-2">
          Upload Job Description
        </h1>
        
        <p className="text-sm text-white mb-6">
          Supported formats: PDF, DOC, DOCX
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-white mb-1">Title *</label>
            <input
              type="text"
              name="title"
              value={jobDescription.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">Description *</label>
            <textarea
              name="description"
              value={jobDescription.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              rows="3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">Requirements</label>
            <textarea
              name="requirements"
              value={jobDescription.requirements}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">Department</label>
              <input
                type="text"
                name="department"
                value={jobDescription.department}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={jobDescription.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">Last Date (Optional)</label>
            <input
              type="date"
              name="lastDate"
              value={jobDescription.lastDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
            />
          </div>
        </div>

        <div className="border-2 bg-[#2f4f4f] border-dashed border-gray-300 rounded-lg p-6 text-center mb-6 hover:bg-[#81a7a7] transition-colors">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Choose File
          </label>
          
          {file && (
            <p className="mt-4 text-sm text-white">
              Selected file: {file.name}
            </p>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500 border border-red-500 text-white rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-500 border border-green-400 text-white rounded">
            {success}
          </div>
        )}

        <div>
          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors border-white border-1 ${
              file && !loading
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-[#161010] cursor-not-allowed'
            }`}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JDUpload; 