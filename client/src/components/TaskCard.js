import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Flag, 
  Tag, 
  Play, 
  Pause,
  CheckCircle,
  Circle,
  AlertCircle,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { format, isAfter, isBefore, differenceInDays } from 'date-fns';
import { useTasks } from '../contexts/TaskContext';

const TaskCard = ({ task, compact = false, onDelete, showDeleteButton = true }) => {
  const { startTimer, stopTimer, deleteTask } = useTasks();
  const [isTimerRunning, setIsTimerRunning] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);


  React.useEffect(() => {
    const activeTimer = task.timeTracking?.find(t => !t.endTime);
    setIsTimerRunning(!!activeTimer);
  }, [task.timeTracking]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'done':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Circle className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Circle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'priority-urgent';
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-medium';
    }
  };

  const getCategoryColor = (category) => {
    return `category-${category}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'todo':
        return 'badge-todo';
      case 'in-progress':
        return 'badge-in-progress';
      case 'done':
        return 'badge-done';
      case 'cancelled':
        return 'badge-cancelled';
      default:
        return 'badge-todo';
    }
  };

  const isOverdue = () => {
    return task.status !== 'done' && 
           task.status !== 'cancelled' && 
           isAfter(new Date(), new Date(task.endDate));
  };

  const isDueSoon = () => {
    const daysUntilEnd = differenceInDays(new Date(task.endDate), new Date());
    return daysUntilEnd <= 3 && daysUntilEnd >= 0 && task.status !== 'done';
  };

  const handleTimerToggle = async () => {
    if (isTimerRunning) {
      await stopTimer(task._id);
    } else {
      await startTimer(task._id);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteTask(task._id);
      if (result.success && onDelete) {
        onDelete(task._id);
      }
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (date) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const formatTime = (date) => {
    return format(new Date(date), 'h:mm a');
  };

  if (compact) {
    return (
      <div className={`p-3 rounded-lg border ${
        isOverdue() ? 'border-red-200 bg-red-50' : 
        isDueSoon() ? 'border-yellow-200 bg-yellow-50' : 
        'border-gray-200 bg-white'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              {getStatusIcon(task.status)}
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {task.title}
              </h4>
            </div>
            <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
              <span className={getPriorityColor(task.priority)}>
                {task.priority}
              </span>
              <span>{formatDate(task.endDate)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`badge ${getStatusBadge(task.status)}`}>
              {task.status.replace('-', ' ')}
            </span>
            {task.status === 'in-progress' && (
              <button
                onClick={handleTimerToggle}
                className="p-1 text-gray-400 hover:text-gray-600"
                title={isTimerRunning ? 'Stop timer' : 'Start timer'}
              >
                {isTimerRunning ? (
                  <Pause className="h-3 w-3" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
              </button>
            )}
            {showDeleteButton && (
              <div className="relative">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                  className="p-1 text-red-400 hover:text-red-600"
                  title="Delete task"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
                
                {showDeleteConfirm && (
                  <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 min-w-48">
                    <p className="text-xs text-gray-700 mb-2">
                      Delete "{task.title}"?
                    </p>
                    <div className="flex space-x-1">
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        {isDeleting ? 'Deleting...' : 'Yes'}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card hover:shadow-md transition-shadow duration-200 ${
      isOverdue() ? 'border-l-4 border-l-red-500' : 
      isDueSoon() ? 'border-l-4 border-l-yellow-500' : ''
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            {getStatusIcon(task.status)}
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {task.title}
            </h3>
          </div>
          
          {task.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`badge ${getStatusBadge(task.status)}`}>
              {task.status.replace('-', ' ')}
            </span>
            <span className={`badge ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            <span className={`badge ${getCategoryColor(task.category)}`}>
              {task.category}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Start: {formatDate(task.startDate)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>End: {formatDate(task.endDate)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Est: {task.estimatedHours}h</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Actual: {task.actualHours}h</span>
            </div>
          </div>

          {task.tags && task.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {task.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{task.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${task.progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end space-y-2 ml-4">
          {task.status === 'in-progress' && (
            <button
              onClick={handleTimerToggle}
              className={`p-2 rounded-full ${
                isTimerRunning 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-green-100 text-green-600 hover:bg-green-200'
              } transition-colors duration-200`}
              title={isTimerRunning ? 'Stop timer' : 'Start timer'}
            >
              {isTimerRunning ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>
          )}

          <div className="flex items-center space-x-2">
            <Link
              to={`/tasks/${task._id}/edit`}
              className="text-primary-600 hover:text-primary-800 text-sm font-medium"
            >
              Edit
            </Link>
            {showDeleteButton && (
              <div className="relative">
                <button
                onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                  className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50 border border-red-300 px-2 py-1 rounded"
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
                
                {showDeleteConfirm && (
                  <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 min-w-64">
                    <p className="text-sm text-gray-700 mb-3">
                      Are you sure you want to delete "{task.title}"? This action cannot be undone.
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;



