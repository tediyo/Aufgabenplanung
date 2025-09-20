import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Trash2,
  Play,
  Pause,
  Clock
} from 'lucide-react';
import { useTasks } from '../contexts/TaskContext';
import { tasksAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const EditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateTask, deleteTask, startTimer, stopTimer } = useTasks();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [task, setTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal',
    priority: 'medium',
    status: 'todo',
    timeFrame: 'custom',
    startDate: '',
    endDate: '',
    estimatedHours: 0,
    actualHours: 0,
    progress: 0,
    tags: [],
    notifications: {
      startDate: true,
      endDate: true,
      reminder: true,
      reminderDays: 1
    }
  });
  const [newTag, setNewTag] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [id]);

  useEffect(() => {
    if (task) {
      const activeTimer = task.timeTracking?.find(t => !t.endTime);
      setIsTimerRunning(!!activeTimer);
    }
  }, [task]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getTask(id);
      const taskData = response.data;
      setTask(taskData);
      setFormData({
        title: taskData.title,
        description: taskData.description || '',
        category: taskData.category,
        priority: taskData.priority,
        status: taskData.status,
        timeFrame: taskData.timeFrame,
        startDate: taskData.startDate.split('T')[0],
        endDate: taskData.endDate.split('T')[0],
        estimatedHours: taskData.estimatedHours || 0,
        actualHours: taskData.actualHours || 0,
        progress: taskData.progress || 0,
        tags: taskData.tags || [],
        notifications: {
          startDate: taskData.notifications?.startDate !== false,
          endDate: taskData.notifications?.endDate !== false,
          reminder: taskData.notifications?.reminder !== false,
          reminderDays: taskData.notifications?.reminderDays || 1
        }
      });
    } catch (error) {
      console.error('Error fetching task:', error);
      toast.error('Failed to load task');
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('End date must be after start date');
      return;
    }

    setSaving(true);
    try {
      const result = await updateTask(id, formData);
      if (result.success) {
        navigate('/tasks');
      }
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const result = await deleteTask(id);
        if (result.success) {
          navigate('/tasks');
        }
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleTimerToggle = async () => {
    if (isTimerRunning) {
      await stopTimer(id);
    } else {
      await startTimer(id);
    }
    // Refresh task data
    fetchTask();
  };

  if (loading) {
    return <LoadingSpinner text="Loading task..." />;
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Task not found</h3>
        <p className="text-gray-500">The task you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Task</h1>
            <p className="text-sm text-gray-500">Update task details and settings</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Timer */}
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
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </button>
          )}
          
          <button
            onClick={handleDelete}
            className="btn btn-danger inline-flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Time Tracking Info */}
      {task.timeTracking && task.timeTracking.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Time Tracking
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Estimated Hours</p>
              <p className="text-lg font-medium">{task.estimatedHours}h</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Actual Hours</p>
              <p className="text-lg font-medium">{task.actualHours}h</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Time Accuracy</p>
              <p className="text-lg font-medium">
                {task.estimatedHours > 0 
                  ? Math.round((1 - Math.abs(task.actualHours - task.estimatedHours) / task.estimatedHours) * 100)
                  : 0}%
              </p>
            </div>
          </div>
          
          {task.timeTracking.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Sessions</h4>
              <div className="space-y-2">
                {task.timeTracking.slice(-5).map((session, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span>
                      {new Date(session.startTime).toLocaleDateString()} - 
                      {session.endTime ? new Date(session.endTime).toLocaleTimeString() : 'Running'}
                    </span>
                    <span className="text-gray-500">
                      {session.duration ? `${Math.round(session.duration / 60)}h ${session.duration % 60}m` : 'Active'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Task Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Task Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input"
                placeholder="Enter task title"
                required
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="input"
                placeholder="Enter task description"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="select"
              >
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="health">Health</option>
                <option value="finance">Finance</option>
                <option value="education">Education</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="select"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Time Frame */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Frame
              </label>
              <select
                name="timeFrame"
                value={formData.timeFrame}
                onChange={handleChange}
                className="select"
              >
                <option value="custom">Custom</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="annually">Annually</option>
              </select>
            </div>

            {/* Estimated Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                name="estimatedHours"
                value={formData.estimatedHours}
                onChange={handleChange}
                min="0"
                step="0.5"
                className="input"
                placeholder="0"
              />
            </div>

            {/* Actual Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Actual Hours
              </label>
              <input
                type="number"
                name="actualHours"
                value={formData.actualHours}
                onChange={handleChange}
                min="0"
                step="0.5"
                className="input"
                placeholder="0"
                readOnly
              />
            </div>

            {/* Progress */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Progress (%)
              </label>
              <input
                type="number"
                name="progress"
                value={formData.progress}
                onChange={handleChange}
                min="0"
                max="100"
                className="input"
                placeholder="0"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
          </div>

          {/* Tags */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="ml-1 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                className="input flex-1"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <button
                type="button"
                onClick={addTag}
                className="btn btn-secondary"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="notifications.startDate"
                checked={formData.notifications.startDate}
                onChange={(e) => handleNestedChange('notifications', 'startDate', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                Notify when task starts
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="notifications.endDate"
                checked={formData.notifications.endDate}
                onChange={(e) => handleNestedChange('notifications', 'endDate', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                Notify when task is due
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="notifications.reminder"
                checked={formData.notifications.reminder}
                onChange={(e) => handleNestedChange('notifications', 'reminder', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                Send reminder before due date
              </label>
            </div>

            {formData.notifications.reminder && (
              <div className="ml-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reminder Days Before Due
                </label>
                <input
                  type="number"
                  value={formData.notifications.reminderDays}
                  onChange={(e) => handleNestedChange('notifications', 'reminderDays', parseInt(e.target.value))}
                  min="1"
                  max="30"
                  className="input w-32"
                />
              </div>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary inline-flex items-center"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTask;

