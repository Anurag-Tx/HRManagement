import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { DashboardStats, getDashboardStats } from '../services/dashboardService';
import { formatDate, formatDateTime } from '../services/utilsService';
import CVStatusSummary from '../components/CVStatusSummary';
import { Bell, FileText, User, CheckCircle, XCircle, Clock, RefreshCw, Eye, Search } from 'lucide-react';

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

interface RecentActivitiesProps {
  activities: Array<{
    id: number;
    notificationType: string;
    title: string;
    message: string;
    date: string;
  }>;
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities }) => {
  // Take only the first 5 activities
  const recentActivities = activities.slice(0, 5);

  const getActivityIcon = (notificationType: string) => {
    switch (notificationType) {
      case 'JD_Created':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'CV_Uploaded':
        return <User className="h-5 w-5 text-green-500" />;
      case 'CV_Reviewed':
        return <CheckCircle className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
      <div className="space-y-4">
        {recentActivities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {getActivityIcon(activity.notificationType)}
            </div>
            <div>
              <p className="font-medium">{activity.title}</p>
              <p className="text-sm text-gray-500">{activity.message}</p>
              <p className="text-xs text-gray-400">{formatDateTime(activity.date)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const { fetchNotifications } = useNotifications();
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    const now = Date.now();
    // Only fetch if cache is expired or no data exists
    if (now - lastFetchTime > CACHE_DURATION || !stats) {
      try {
        setLoading(true);
        setError(null);

        const statsData = await getDashboardStats();
        setStats(statsData);
        setLastFetchTime(now);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try refreshing.');
      } finally {
        setLoading(false);
      }
    }
  }, [lastFetchTime, stats]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Manual refresh handler
  const handleRefresh = () => {
    setLastFetchTime(0); // Force refresh by resetting last fetch time
    fetchData();
  };

  // Debounced notification fetch
  useEffect(() => {
    let timeoutId: number;
    
    const debouncedFetchNotifications = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        fetchNotifications();
      }, 1000); // 1 second debounce
    };

    // Initial fetch
    debouncedFetchNotifications();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [fetchNotifications]);

  if (loading && !stats) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={handleRefresh}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <RefreshCw className="h-5 w-5 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={loading}
          className={`flex items-center px-4 py-2 rounded-md ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <RefreshCw className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Job Descriptions and CVs Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Job Descriptions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Total Job Descriptions</h2>
            <Link 
              to="/job-descriptions" 
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <Eye className="h-4 w-4 mr-1" />
              View all
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-blue-500" />
              <span className="text-2xl font-bold">{stats?.totalJobDescriptions || 0}</span>
            </div>
          </div>
        </div>

        {/* Total CVs */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Total CVs</h2>
            {user?.role === 'manager' && (
              <Link 
                to="/cv-review" 
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <Search className="h-4 w-4 mr-1" />
                Review
              </Link>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="h-6 w-6 text-green-500" />
              <span className="text-2xl font-bold">{stats?.totalCVs || 0}</span>
            </div>
            {user?.role === 'manager' && (
              <span className="text-sm text-gray-500">
                {stats?.pendingReviews || 0} Pending Reviews
              </span>
            )}
          </div>
        </div>
      </div>

      {/* CV Status Summary and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CV Status Summary */}
        <CVStatusSummary
          accepted={stats?.cvStatusSummary?.accepted || 0}
          pending={stats?.cvStatusSummary?.pending || 0}
          rejected={stats?.cvStatusSummary?.rejected || 0}
          total={stats?.totalCVs || 0}
        />

        {/* Recent Activities */}
        <RecentActivities activities={stats?.recentActivities || []} />
      </div>
    </div>
  );
};

export default Dashboard;


