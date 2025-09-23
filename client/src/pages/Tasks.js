import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc,
  Grid,
  List,
  Calendar,
  Clock,
  Trash2,
  CheckSquare
} from 'lucide-react';
import { useTasks } from '../contexts/TaskContext';
import TaskCard from '../components/TaskCard';
import LoadingSpinner from '../components/LoadingSpinner';
import TaskFilters from '../components/TaskFilters';
import DeleteManager from '../components/DeleteManager';
import useResponsive from '../hooks/useResponsive';

const Tasks = () => {
  const { 
    tasks, 
    loading, 
    filters, 
    pagination, 
    setFilters, 
    setSorting,
    fetchTasks,
    bulkDeleteTasks,
    cleanupCompletedTasks,
    cleanupOldTasks
  } = useTasks();
  const { isMobile, isTablet, getGridCols, getCardPadding, getTextSize } = useResponsive();
  
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showDeleteManager, setShowDeleteManager] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [filters, sortBy, sortOrder]);

  const handleSearch = (searchTerm) => {
    setFilters({ search: searchTerm });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSort = (field) => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortOrder(newOrder);
    setSorting(field, newOrder);
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? (
      <SortAsc className="h-4 w-4" />
    ) : (
      <SortDesc className="h-4 w-4" />
    );
  };

  const getStatusCounts = () => {
    return {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      done: tasks.filter(t => t.status === 'done').length,
      cancelled: tasks.filter(t => t.status === 'cancelled').length,
    };
  };

  const statusCounts = getStatusCounts();

  const handleTaskSelect = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === tasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(tasks.map(task => task._id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) return;
    try {
      await bulkDeleteTasks(selectedTasks);
      setSelectedTasks([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Bulk delete error:', error);
    }
  };

  const handleTaskDelete = (taskId) => {
    setSelectedTasks(prev => prev.filter(id => id !== taskId));
  };

  if (loading) {
    return <LoadingSpinner text="Loading tasks..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Tasks</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage and track your tasks
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
          <button
            onClick={() => setShowDeleteManager(true)}
            className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
          <Link
            to="/tasks/create"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Link>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">{statusCounts.total}</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{statusCounts.total}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">{statusCounts.todo}</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">To Do</p>
              <p className="text-2xl font-semibold text-gray-900">{statusCounts.todo}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-sm font-bold">{statusCounts.inProgress}</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">{statusCounts.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-sm font-bold">{statusCounts.done}</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Done</p>
              <p className="text-2xl font-semibold text-gray-900">{statusCounts.done}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-600 text-sm font-bold">{statusCounts.cancelled}</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Cancelled</p>
              <p className="text-2xl font-semibold text-gray-900">{statusCounts.cancelled}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white shadow rounded-lg p-6">
          <TaskFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
          />
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                className="input w-full lg:w-64"
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
            <div className="flex items-center space-x-2 overflow-x-auto">
              <span className="text-sm text-gray-500 whitespace-nowrap">Sort by:</span>
              <button
                onClick={() => handleSort('title')}
                className="flex items-center space-x-1 px-2 py-1 text-xs sm:text-sm border rounded-md hover:bg-gray-50 whitespace-nowrap"
              >
                <span>Title</span>
                {getSortIcon('title')}
              </button>
              <button
                onClick={() => handleSort('startDate')}
                className="flex items-center space-x-1 px-2 py-1 text-xs sm:text-sm border rounded-md hover:bg-gray-50 whitespace-nowrap"
              >
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Date</span>
                {getSortIcon('startDate')}
              </button>
              <button
                onClick={() => handleSort('priority')}
                className="flex items-center space-x-1 px-2 py-1 text-xs sm:text-sm border rounded-md hover:bg-gray-50 whitespace-nowrap"
              >
                <span>Priority</span>
                {getSortIcon('priority')}
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${
                  viewMode === 'grid' 
                    ? 'bg-primary-100 text-primary-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${
                  viewMode === 'list' 
                    ? 'bg-primary-100 text-primary-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedTasks.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-800">
                {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {selectedTasks.length === tasks.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedTasks([])}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks Grid/List */}
      {tasks.length > 0 ? (
        <div className={
          viewMode === 'grid' 
            ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' 
            : 'space-y-4'
        }>
          {tasks.map((task) => (
            <div key={task._id} className="relative">
              {selectedTasks.length > 0 && (
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedTasks.includes(task._id)}
                    onChange={() => handleTaskSelect(task._id)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              )}
              <TaskCard 
                task={task} 
                compact={viewMode === 'list'} 
                onDelete={handleTaskDelete}
                showDeleteButton={true}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Calendar className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new task.
          </p>
          <div className="mt-6">
            <Link
              to="/tasks/create"
              className="btn btn-primary inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Link>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              disabled={!pagination.hasPrev}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              disabled={!pagination.hasNext}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {(pagination.currentPage - 1) * 20 + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * 20, pagination.totalTasks)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{pagination.totalTasks}</span>{' '}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  disabled={!pagination.hasNext}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Delete Manager Modal */}
      {showDeleteManager && (
        <DeleteManager onClose={() => setShowDeleteManager(false)} />
      )}
    </div>
  );
};

export default Tasks;



