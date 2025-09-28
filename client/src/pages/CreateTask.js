import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Tag, 
  Repeat,
  Bell,
  Save,
  X
} from 'lucide-react';
import { useTasks } from '../contexts/TaskContext';
import { tasksAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const CreateTask = () => {
  const navigate = useNavigate();
  const { createTask } = useTasks();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal',
    priority: 'medium',
    timeFrame: 'custom',
    startDate: '',
    endDate: '',
    estimatedHours: 0,
    tags: [],
    isRecurring: false,
    recurringPattern: {
      frequency: 'weekly',
      interval: 1,
      daysOfWeek: [],
      endRecurrence: ''
    },
    notifications: {
      startDate: true,
      endDate: true,
      reminder: true,
      reminderDays: 1
    },
    template: 'custom'
  });
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await tasksAPI.getTemplates();
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleTemplateSelect = (templateKey) => {
    setSelectedTemplate(templateKey);
    if (templateKey !== 'custom' && templates[templateKey]) {
      const template = templates[templateKey];
      setFormData(prev => ({
        ...prev,
        ...template,
        template: templateKey,
        startDate: '',
        endDate: '',
        tags: template.tags || []
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        template: 'custom',
        title: '',
        description: '',
        category: 'personal',
        priority: 'medium',
        timeFrame: 'custom',
        tags: []
      }));
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

  const handleArrayChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value.split(',').map(tag => tag.trim()).filter(tag => tag)
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

  const calculateEndDate = (timeFrame, startDate) => {
    if (!startDate) return '';
    
    const start = new Date(startDate);
    const end = new Date(start);
    
    switch (timeFrame) {
      case 'daily':
        end.setDate(end.getDate() + 1);
        break;
      case 'weekly':
        end.setDate(end.getDate() + 7);
        break;
      case 'monthly':
        end.setMonth(end.getMonth() + 1);
        break;
      case 'annually':
        end.setFullYear(end.getFullYear() + 1);
        break;
      default:
        return formData.endDate;
    }
    
    return end.toISOString().split('T')[0];
  };

  const handleTimeFrameChange = (e) => {
    const timeFrame = e.target.value;
    setFormData(prev => ({
      ...prev,
      timeFrame,
      endDate: calculateEndDate(timeFrame, prev.startDate)
    }));
  };

  const handleStartDateChange = (e) => {
    const startDate = e.target.value;
    setFormData(prev => ({
      ...prev,
      startDate,
      endDate: calculateEndDate(prev.timeFrame, startDate)
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

    setLoading(true);
    toast.loading('Creating task...', { id: 'create-task' });
    
    try {
      // Convert dates to ISO8601 format for server validation
      const taskData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      };
      
      console.log('Sending create data:', taskData);
      const result = await createTask(taskData);
      
      if (result.success) {
        toast.success('Task created successfully!', { id: 'create-task' });
        navigate('/tasks');
      } else {
        toast.error(result.message || 'Failed to create task', { id: 'create-task' });
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task. Please try again.', { id: 'create-task' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Create New Task</h1>
          <p className="text-sm text-gray-500">Add a new task to your schedule</p>
        </div>
      </div>

      {/* Template Selection */}
      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Choose a Template</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Object.entries(templates).map(([key, template]) => (
            <button
              key={key}
              onClick={() => handleTemplateSelect(key)}
              className={`p-4 border rounded-lg text-left transition-colors ${
                selectedTemplate === key
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h4 className="font-medium text-gray-900">{template.title}</h4>
              <p className="text-sm text-gray-500 mt-1">{template.description}</p>
              <div className="mt-2 flex items-center space-x-2">
                <span className={`badge category-${template.category}`}>
                  {template.category}
                </span>
                <span className={`badge priority-${template.priority}`}>
                  {template.priority}
                </span>
              </div>
            </button>
          ))}
          <button
            onClick={() => handleTemplateSelect('custom')}
            className={`p-4 border rounded-lg text-left transition-colors ${
              selectedTemplate === 'custom'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <h4 className="font-medium text-gray-900">Custom Task</h4>
            <p className="text-sm text-gray-500 mt-1">Create a custom task from scratch</p>
          </button>
        </div>
      </div>

      {/* Task Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Task Details</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Title */}
            <div className="sm:col-span-2">
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
            <div className="sm:col-span-2">
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

            {/* Time Frame */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Frame
              </label>
              <select
                name="timeFrame"
                value={formData.timeFrame}
                onChange={handleTimeFrameChange}
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

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleStartDateChange}
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
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="ml-1 text-primary-600 hover:text-primary-800"
                  >
                    <X className="h-3 w-3" />
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

        {/* Recurring Settings */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              name="isRecurring"
              checked={formData.isRecurring}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-gray-700">
              Make this a recurring task
            </label>
          </div>

          {formData.isRecurring && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  value={formData.recurringPattern.frequency}
                  onChange={(e) => handleNestedChange('recurringPattern', 'frequency', e.target.value)}
                  className="select"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interval
                </label>
                <input
                  type="number"
                  value={formData.recurringPattern.interval}
                  onChange={(e) => handleNestedChange('recurringPattern', 'interval', parseInt(e.target.value))}
                  min="1"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Recurrence
                </label>
                <input
                  type="date"
                  value={formData.recurringPattern.endRecurrence}
                  onChange={(e) => handleNestedChange('recurringPattern', 'endRecurrence', e.target.value)}
                  className="input"
                />
              </div>
            </div>
          )}
        </div>

        {/* Notification Settings */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
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
        <div className="flex flex-col space-y-3 sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-secondary w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary inline-flex items-center w-full sm:w-auto justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTask;

