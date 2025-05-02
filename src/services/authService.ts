import { User } from '../context/AuthContext';

// Mock data for users
const mockUsers = [
  {
    id: "u1",
    email: "hr@example.com",
    name: "HR User",
    password: "password123",
    role: "hr"
  },
  {
    id: "u2",
    email: "manager@example.com",
    name: "Manager User",
    password: "password123",
    role: "manager"
  }
];

// Simulating token storage
const setTokenToStorage = (token: string) => {
  localStorage.setItem('auth_token', token);
};

const getTokenFromStorage = (): string | null => {
  return localStorage.getItem('auth_token');
};

const removeTokenFromStorage = () => {
  localStorage.removeItem('auth_token');
};

// Mock login function
export const loginUser = async (email: string, password: string): Promise<User> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const user = mockUsers.find(u => u.email === email && u.password === password);
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  // Generate a fake token
  const token = `token_${user.id}_${Date.now()}`;
  setTokenToStorage(token);
  
  // Return user data without password
  const { password: _, ...userData } = user;
  return userData as User;
};

// Mock register function
export const registerUser = async (name: string, email: string, password: string, role: string): Promise<User> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check if user already exists
  if (mockUsers.some(u => u.email === email)) {
    throw new Error('User with this email already exists');
  }
  
  // Create new user
  const newUser = {
    id: `u${mockUsers.length + 1}`,
    email,
    name,
    password,
    role
  };
  
  // In a real app, this would add to a database
  mockUsers.push(newUser);
  
  // Generate a fake token
  const token = `token_${newUser.id}_${Date.now()}`;
  setTokenToStorage(token);
  
  // Return user data without password
  const { password: _, ...userData } = newUser;
  return userData as User;
};

// Mock check auth status function
export const checkAuthStatus = async (): Promise<User> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const token = getTokenFromStorage();
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  // Extract user ID from token
  // In a real app, the token would be validated on the server
  const userId = token.split('_')[1];
  const user = mockUsers.find(u => u.id === userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Return user data without password
  const { password: _, ...userData } = user;
  return userData as User;
};

// Mock logout function
export const logoutUser = async (): Promise<void> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  removeTokenFromStorage();
};