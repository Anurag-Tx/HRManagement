import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  UserCheck, 
  Upload,
  User,
  PlusCircle,
  FileUp,
  Calendar
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isHR = user?.role === 'hr';
  const isManager = user?.role === 'manager';

  return (
    <div className="bg-white h-full w-64 fixed left-0 top-0 shadow-lg">
      <div className="p-6 flex items-center space-x-4">
        <div className="flex-shrink-0 h-[40px] flex items-center">
          <img
            src="/TX.png"
            alt="Company Logo"
            className="max-h-[40px] w-auto object-contain"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.opacity = '0.5';
              img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTMgMTNINHYtMmg5VjRoMnY3aDd2MmgtN3Y3aC0ydi03eiIgZmlsbD0iY3VycmVudENvbG9yIi8+PC9zdmc+';
            }}
          />
        </div>
        <h1 className="text-2xl font-bold text-blue-600">JD Portal</h1>
      </div>
      
      <nav className="mt-6">
        <div className="px-4 space-y-2">
          <Link
            to="/dashboard"
            className={`flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 ${
              location.pathname === '/dashboard' ? 'bg-gray-100' : ''
            }`}
          >
            <LayoutDashboard className="h-5 w-5 mr-3" />
            Dashboard
          </Link>

          <Link
            to="/job-descriptions"
            className={`flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 ${
              location.pathname === '/job-descriptions' ? 'bg-gray-100' : ''
            }`}
          >
            <FileText className="h-5 w-5 mr-3" />
            Job Descriptions
          </Link>

          {isManager && (
            <Link
              to="/job-descriptions/new"
              className={`flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 ${
                location.pathname === '/job-descriptions/new' ? 'bg-gray-100' : ''
              }`}
            >
              <PlusCircle className="h-5 w-5 mr-3" />
              Create New JD
            </Link>
          )}

          {isHR && (
            <>
              <Link
                to="/cv-submission"
                className={`flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 ${
                  location.pathname === '/cv-submission' ? 'bg-gray-100' : ''
                }`}
              >
                <FileUp className="h-5 w-5 mr-3" />
                Submit CV
              </Link>
              <Link
                to="/interview-status"
                className={`flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 ${
                  location.pathname === '/interview-status' ? 'bg-gray-100' : ''
                }`}
              >
                <Calendar className="h-5 w-5 mr-3" />
                Interview Status
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="absolute bottom-0 w-full p-4 border-t">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="h-5 w-5 text-gray-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;