import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, MenuItem, Alert } from '@mui/material';
import { uploadCVForJobDescription } from '../../services/cvSubmissionService';
import { getJobDescriptions } from '../../services/dashboardService';

interface JobDescription {
  id: number;
  title: string;
  description: string;
}

const CVUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [selectedJobDescription, setSelectedJobDescription] = useState<number>(0);
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchJobDescriptions = async () => {
      try {
        const descriptions = await getJobDescriptions();
        setJobDescriptions(descriptions);
      } catch (err) {
        setError('Failed to fetch job descriptions');
      }
    };

    fetchJobDescriptions();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should not exceed 5MB');
        return;
      }
      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        setError('Only PDF, DOC, and DOCX files are allowed');
        return;
      }
      setCvFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!selectedJobDescription || !candidateName || !candidateEmail || !cvFile) {
      setError('Please fill in all fields and select a file');
      setLoading(false);
      return;
    }

    try {
      await uploadCVForJobDescription(
        selectedJobDescription,
        candidateName,
        candidateEmail,
        cvFile
      );
      setSuccess('CV uploaded successfully');
      // Reset form
      setSelectedJobDescription(0);
      setCandidateName('');
      setCandidateEmail('');
      setCvFile(null);
    } catch (err) {
      setError('Failed to upload CV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Upload CV for Job Description
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            select
            fullWidth
            label="Select Job Description"
            value={selectedJobDescription}
            onChange={(e) => setSelectedJobDescription(Number(e.target.value))}
            margin="normal"
            required
          >
            <MenuItem value={0}>Select a job description</MenuItem>
            {jobDescriptions.map((jd) => (
              <MenuItem key={jd.id} value={jd.id}>
                {jd.title}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Candidate Name"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Candidate Email"
            type="email"
            value={candidateEmail}
            onChange={(e) => setCandidateEmail(e.target.value)}
            margin="normal"
            required
          />

          <Box sx={{ mt: 2, mb: 2 }}>
            <input
              accept=".pdf,.doc,.docx"
              style={{ display: 'none' }}
              id="cv-upload"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="cv-upload">
              <Button variant="contained" component="span">
                Select CV File
              </Button>
            </label>
            {cvFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected file: {cvFile.name}
              </Typography>
            )}
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? 'Uploading...' : 'Upload CV'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default CVUploadPage; 