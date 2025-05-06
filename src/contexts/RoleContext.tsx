import React, { createContext, useContext, useState, useEffect } from 'react';

type Role = 'Admin' | 'HR' | 'Interviewer';

interface RoleContextType {
  role: Role | null;
  setRole: (role: Role) => void;
  isAdmin: boolean;
  isHR: boolean;
  isInterviewer: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    // In a real application, you would fetch the user's role from your authentication system
    // For now, we'll use localStorage to persist the role
    const savedRole = localStorage.getItem('userRole') as Role;
    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  const handleSetRole = (newRole: Role) => {
    setRole(newRole);
    localStorage.setItem('userRole', newRole);
  };

  const value = {
    role,
    setRole: handleSetRole,
    isAdmin: role === 'Admin',
    isHR: role === 'HR',
    isInterviewer: role === 'Interviewer'
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}; 