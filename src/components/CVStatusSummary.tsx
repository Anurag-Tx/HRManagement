import React from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface CVStatusSummaryProps {
  accepted: number;
  pending: number;
  rejected: number;
  total: number;
}

const CVStatusSummary: React.FC<CVStatusSummaryProps> = ({
  accepted,
  pending,
  rejected,
  total
}) => {
  const getPercentage = (value: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">CV Status Summary</h2>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-green-600">Accepted</span>
            <span className="text-sm font-medium text-green-600">{getPercentage(accepted)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-600 h-2.5 rounded-full"
              style={{ width: `${getPercentage(accepted)}%` }}
            ></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-yellow-600">Pending</span>
            <span className="text-sm font-medium text-yellow-600">{getPercentage(pending)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-yellow-600 h-2.5 rounded-full"
              style={{ width: `${getPercentage(pending)}%` }}
            ></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-red-600">Rejected</span>
            <span className="text-sm font-medium text-red-600">{getPercentage(rejected)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-red-600 h-2.5 rounded-full"
              style={{ width: `${getPercentage(rejected)}%` }}
            ></div>
          </div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">Accepted</span>
            </div>
            <span className="text-2xl font-bold text-green-600">{accepted}</span>
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-600">Pending</span>
            </div>
            <span className="text-2xl font-bold text-yellow-600">{pending}</span>
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-red-600">Rejected</span>
            </div>
            <span className="text-2xl font-bold text-red-600">{rejected}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVStatusSummary; 