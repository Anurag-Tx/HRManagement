import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-900">
                JD Portal
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <Link
              to="/job-descriptions"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Job Descriptions
            </Link>
            <Link
              to="/cv-review"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              CV Review
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;