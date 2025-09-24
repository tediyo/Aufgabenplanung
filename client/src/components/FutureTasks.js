import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, Clock, Calendar } from 'lucide-react';
import { futureTasksAPI } from '../utils/api';
import TinySuccessModal from './TinySuccessModal';

const FutureTasks = () => {
  const [futureTasks, setFutureTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'medium',
    category: 'personal',
    estimatedDate: ''
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadFutureTasks();
  }, []);

  const loadFutureTasks = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading future tasks...');
      console.log('🔑 Current auth state:', {
        token: sessionStorage.getItem('authToken'),
        userEmail: 'Using sessionStorage token',
        user: 'Using sessionStorage token'
      });
      const response = await futureTasksAPI.getFutureTasks();
      console.log('✅ Future tasks loaded:', response.data);
      setFutureTasks(response.data.futureTasks || []);
    } catch (error) {
      console.error('❌ Error loading future tasks:', error);
      console.error('❌ Error response:', error.response?.data);
      setSuccessMessage('Failed to load future tasks');
      setShowSuccessModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setIsLoading(true);
      const taskData = {
        ...formData,
        estimatedDate: formData.estimatedDate || null
      };

      console.log('🚀 Creating future task with data:', taskData);
      console.log('🔑 Auth headers:', {
        token: sessionStorage.getItem('authToken'),
        userEmail: 'Using sessionStorage token'
      });

      if (editingTask) {
        console.log('📝 Updating future task:', editingTask._id);
        await futureTasksAPI.updateFutureTask(editingTask._id, taskData);
        setSuccessMessage('Future task updated successfully!');
      } else {
        console.log('➕ Creating new future task');
        const response = await futureTasksAPI.createFutureTask(taskData);
        console.log('✅ Future task created successfully:', response.data);
        setSuccessMessage('Future task created successfully!');
      }

      setShowSuccessModal(true);
      setShowAddModal(false);
      setEditingTask(null);
      setFormData({
        name: '',
        description: '',
        priority: 'medium',
        category: 'personal',
        estimatedDate: ''
      });
      loadFutureTasks();
    } catch (error) {
      console.error('❌ Error saving future task:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Validation errors:', error.response?.data?.errors);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error message:', error.message);
      setSuccessMessage(`Failed to save future task: ${error.response?.data?.message || error.message}`);
      setShowSuccessModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      name: task.name,
      description: task.description || '',
      priority: task.priority,
      category: task.category,
      estimatedDate: task.estimatedDate ? new Date(task.estimatedDate).toISOString().split('T')[0] : ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this future task?')) return;

    try {
      await futureTasksAPI.deleteFutureTask(id);
      setSuccessMessage('Future task deleted successfully!');
      setShowSuccessModal(true);
      loadFutureTasks();
    } catch (error) {
      console.error('Error deleting future task:', error);
      setSuccessMessage('Failed to delete future task');
      setShowSuccessModal(true);
    }
  };

  const handleToggleComplete = async (id) => {
    try {
      await futureTasksAPI.toggleFutureTask(id);
      loadFutureTasks();
    } catch (error) {
      console.error('Error toggling future task:', error);
      setSuccessMessage('Failed to update future task');
      setShowSuccessModal(true);
    }
  };

  const handleCancel = () => {
    setShowAddModal(false);
    setEditingTask(null);
    setFormData({
      name: '',
      description: '',
      priority: 'medium',
      category: 'personal',
      estimatedDate: ''
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'work': return 'text-blue-600 bg-blue-100';
      case 'personal': return 'text-purple-600 bg-purple-100';
      case 'health': return 'text-green-600 bg-green-100';
      case 'education': return 'text-orange-600 bg-orange-100';
      case 'finance': return 'text-emerald-600 bg-emerald-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-screen max-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 lg:p-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold mb-2">Future Tasks</h2>
            <p className="text-indigo-100 text-sm lg:text-base">Plan your upcoming tasks</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="p-2 lg:p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-6 flex-1 overflow-y-auto min-h-0">
        {isLoading && futureTasks.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : futureTasks.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No future tasks yet</p>
            <p className="text-sm text-gray-400">Click the + button to add your first future task</p>
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {futureTasks.map((task) => (
              <div
                key={task._id}
                className={`p-4 rounded-lg border transition-all ${
                  task.isCompleted 
                    ? 'bg-gray-50 border-gray-200 opacity-75' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`font-medium ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
                        {task.category}
                      </span>
                    </div>
                    
                    {task.description && (
                      <p className={`text-sm mb-2 ${task.isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                        {task.description}
                      </p>
                    )}
                    
                    {task.estimatedDate && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>Est. {new Date(task.estimatedDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleToggleComplete(task._id)}
                      className={`p-2 rounded-lg transition-colors ${
                        task.isCompleted 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(task)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(task._id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingTask ? 'Edit Future Task' : 'Add Future Task'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter task name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter task description (optional)"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="personal">Personal</option>
                      <option value="work">Work</option>
                      <option value="health">Health</option>
                      <option value="education">Education</option>
                      <option value="finance">Finance</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Date
                  </label>
                  <input
                    type="date"
                    name="estimatedDate"
                    value={formData.estimatedDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : (editingTask ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <TinySuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
        duration={3000}
      />
    </div>
  );
};

export default FutureTasks;
