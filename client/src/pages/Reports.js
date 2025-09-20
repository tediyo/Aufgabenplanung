import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Calendar, 
  TrendingUp, 
  BarChart3,
  PieChart,
  Clock,
  Target,
  AlertTriangle
} from 'lucide-react';
import { reportsAPI } from '../utils/api';
import DashboardChart from '../components/DashboardChart';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [productivityData, setProductivityData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchDashboardData();
    fetchProductivityData();
  }, [dateRange, period]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getDashboard({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
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
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductivityData = async () => {
    try {
      const response = await reportsAPI.getProductivity({
        period,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      setProductivityData(response.data);
    } catch (error) {
      console.error('Error fetching productivity data:', error);
      toast.error('Failed to load productivity data');
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await reportsAPI.exportData({
        format,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tasks-export.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    setDateRange({ startDate: '', endDate: '' });
  };

  if (loading) {
    return <LoadingSpinner text="Loading reports..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Reports & Analytics
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive insights into your task management and productivity
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <button
            onClick={() => handleExport('csv')}
            className="btn btn-secondary inline-flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={() => handleExport('json')}
            className="btn btn-secondary inline-flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Period
            </label>
            <select
              value={period}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="select"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          {period === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  className="input"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Overview Stats */}
      {dashboardData && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className="h-6 w-6 text-blue-400" />
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
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Completion Rate
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {dashboardData.overview.completionRate}%
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
                      Productivity Score
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {dashboardData.overview.productivityScore}%
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
                      Overdue Tasks
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

      {/* Charts */}
      {chartData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Tasks by Status
            </h3>
            <DashboardChart
              type="doughnut"
              data={chartData.statusDistribution}
              height={300}
            />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Tasks by Category
            </h3>
            <DashboardChart
              type="bar"
              data={chartData.categoryDistribution}
              height={300}
            />
          </div>
        </div>
      )}

      {/* Time Tracking Analysis */}
      {dashboardData && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Time Tracking Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {dashboardData.timeTracking.totalEstimatedHours}h
              </div>
              <div className="text-sm text-gray-500">Estimated Hours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {dashboardData.timeTracking.totalActualHours}h
              </div>
              <div className="text-sm text-gray-500">Actual Hours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {dashboardData.timeTracking.timeAccuracy}%
              </div>
              <div className="text-sm text-gray-500">Time Accuracy</div>
            </div>
          </div>
        </div>
      )}

      {/* Productivity Trends */}
      {productivityData && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Productivity Trends
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {productivityData.averages.tasksPerDay}
              </div>
              <div className="text-sm text-gray-500">Tasks per Day</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {productivityData.averages.completionRate}%
              </div>
              <div className="text-sm text-gray-500">Average Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {productivityData.averages.hoursPerDay}h
              </div>
              <div className="text-sm text-gray-500">Hours per Day</div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Trends Chart */}
      {productivityData && productivityData.weeklyTrends && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Weekly Productivity Trends
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Week
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tasks Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tasks Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Hours
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(productivityData.weeklyTrends).map(([week, data]) => (
                  <tr key={week}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(week).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {data.tasksCreated}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {data.tasksCompleted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {data.totalHours}h
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;

