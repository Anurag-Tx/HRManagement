import axios from 'axios';

const BASE_URL = 'https://localhost:7138';
const API_URL = `${BASE_URL}/api/InterviewStatus`;

// Configure axios defaults
axios.defaults.baseURL = BASE_URL;

export interface InterviewStatusData {
  candidateName: string;
  jobDescriptionId: string;
  interviewDate: string;
  interviewTime: string;
  interviewType: string;
  assignedPersons: string[];
  status: string;
  feedback: string;
}

export const createInterviewStatus = async (data: InterviewStatusData) => {
  const response = await axios.post(API_URL, {
    ...data,
    assignedPersonIds: data.assignedPersons.map(id => parseInt(id))
  });
  return response.data;
};

export const getInterviewers = async () => {
  try {
    const response = await axios.get(`${API_URL}/interviewers`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching interviewers:', error);
    return [];
  }
};

export const getJobDescriptions = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/JobDescription`);
    console.log('Job Description API Response:', response.data); // Debug log
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching job descriptions:', error);
    return [];
  }
}; 