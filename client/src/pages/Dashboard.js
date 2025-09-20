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

const Dashboard = () => {
  const { tasks, loading } = useTasks();
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
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here's what's happening with your tasks.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            to="/tasks/create"
            className="btn btn-primary inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      {dashboardData && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckSquare className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Tasks
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {dashboardData.overview.totalTasks}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Completed
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {dashboardData.overview.completedTasks}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      In Progress
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {dashboardData.overview.inProgressTasks}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Overdue
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {dashboardData.overview.overdueTasks}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      {chartData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tasks by Status</h3>
            <DashboardChart
              type="doughnut"
              data={chartData.statusDistribution}
              height={300}
            />
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tasks by Category</h3>
            <DashboardChart
              type="bar"
              data={chartData.categoryDistribution}
              height={300}
            />
          </div>
        </div>
      )}

      {/* Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Tasks
            </h3>
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
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Upcoming Tasks
            </h3>
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



