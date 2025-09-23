import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  Target,
  BarChart3
} from 'lucide-react';
import { useTasks } from '../contexts/TaskContext';
import { reportsAPI } from '../utils/api';
import DashboardChart from '../components/DashboardChart';
import TaskCard from '../components/TaskCard';
import LoadingSpinner from '../components/LoadingSpinner';
import useResponsive from '../hooks/useResponsive';

const Dashboard = () => {
  const { tasks, loading } = useTasks();
  const { isMobile, isTablet, getGridCols, getCardPadding, getTextSize } = useResponsive();
  const [dashboardData, setDashboardData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoadingData(true);
      const response = await reportsAPI.getDashboard();
      setDashboardData(response.data);
      
      // Prepare chart data
      const { distribution } = response.data;
      setChartData({
        statusDistribution: {
          labels: Object.keys(distribution.byStatus),
          data: Object.values(distribution.byStatus),
          colors: ['#3b82f6', '#f59e0b', '#10b981', '#6b7280']
        },
        categoryDistribution: {
          labels: Object.keys(distribution.byCategory),
          data: Object.values(distribution.byCategory),
          colors: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6b7280']
        },
        priorityDistribution: {
          labels: Object.keys(distribution.byPriority),
          data: Object.values(distribution.byPriority),
          colors: ['#10b981', '#f59e0b', '#f97316', '#ef4444']
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const getRecentTasks = () => {
    return tasks
      .filter(task => task.status !== 'done')
      .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
      .slice(0, 5);
  };

  const getOverdueTasks = () => {
    return tasks.filter(task => 
      task.status !== 'done' && 
      task.status !== 'cancelled' && 
      new Date() > new Date(task.endDate)
    );
  };

  const getUpcomingTasks = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return tasks.filter(task => 
      task.startDate <= nextWeek && 
      task.startDate >= new Date() &&
      task.status !== 'done' &&
      task.status !== 'cancelled'
    );
  };

  if (loadingData) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Welcome Back 👋</h2>
          <p className="mt-1 text-sm text-gray-600">
            Here's what's happening with your tasks.
          </p>
        </div>
        <Link
          to="/tasks/create"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Link>
      </div>

      {/* Stats Overview */}
      {dashboardData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckSquare className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                <p className="text-2xl font-semibold text-gray-900">{dashboardData.overview.totalTasks}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{dashboardData.overview.completedTasks}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900">{dashboardData.overview.inProgressTasks}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Overdue</p>
                <p className="text-2xl font-semibold text-gray-900">{dashboardData.overview.overdueTasks}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      {chartData && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Status</h3>
            <div className="h-64">
              <DashboardChart
                type="doughnut"
                data={chartData.statusDistribution}
                height={256}
              />
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Category</h3>
            <div className="h-64">
              <DashboardChart
                type="bar"
                data={chartData.categoryDistribution}
                height={256}
              />
            </div>
          </div>
        </div>
      )}

      {/* Recent Tasks */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Tasks</h3>
          <div className="space-y-3">
            {getRecentTasks().length > 0 ? (
              getRecentTasks().map((task) => (
                <TaskCard key={task._id} task={task} compact />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent tasks</p>
            )}
          </div>
          <div className="mt-4">
            <Link
              to="/tasks"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              View all tasks →
            </Link>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Tasks</h3>
          <div className="space-y-3">
            {getUpcomingTasks().length > 0 ? (
              getUpcomingTasks().map((task) => (
                <TaskCard key={task._id} task={task} compact />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming tasks</p>
            )}
          </div>
          <div className="mt-4">
            <Link
              to="/tasks/create"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              Create new task →
            </Link>
          </div>
        </div>
      </div>

      {/* Overdue Tasks Alert */}
      {getOverdueTasks().length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Overdue Tasks ({getOverdueTasks().length})
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>You have {getOverdueTasks().length} overdue task(s) that need attention.</p>
              </div>
              <div className="mt-4">
                <Link
                  to="/tasks"
                  className="text-sm font-medium text-red-800 hover:text-red-600"
                >
                  View overdue tasks →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;



