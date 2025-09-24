import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Play, Pause, CheckCircle, RotateCcw, Trash2 } from 'lucide-react';
import MobileDrawer from './MobileDrawer';
import DesktopSidebar from './DesktopSidebar';
import ResponsiveTaskModal from './ResponsiveTaskModal';
import SuccessModal from './SuccessModal';
import LazyLoadWrapper from './LazyLoadWrapper';
import { useMobileOptimization, useDebounce } from '../hooks/useMobileOptimization';
import { tasksAPI } from '../utils/api';

const ResponsiveDashboard = () => {
  const { touchTargetSize } = useMobileOptimization();
  
  // Debug authentication info
  const debugAuth = () => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = userData.email || localStorage.getItem('userEmail') || 'test@example.com';
    
    console.log('Auth Debug:', {
      hasToken: !!token,
      token: token ? token.substring(0, 20) + '...' : 'none',
      userEmail: userEmail,
      userData: userData
    });
  };
  
  const [tasks, setTasks] = useState([]);

  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdTask, setCreatedTask] = useState(null);
  const [activeTimer, setActiveTimer] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const addTask = async (newTask) => {
    try {
      debugAuth();
      console.log('Creating task:', newTask);
      
      // Prepare task data for server
      const taskData = {
        title: newTask.title,
        description: newTask.description || '',
        category: newTask.category,
        priority: newTask.priority,
        timeFrame: newTask.timeFrame,
        startDate: new Date(newTask.startDate).toISOString(),
        endDate: new Date(newTask.endDate).toISOString(),
        estimatedHours: newTask.estimatedHours || 1,
        tags: newTask.tags || [],
        isRecurring: false,
        notifications: {
          startDate: true,
          endDate: true,
          reminder: true,
          reminderDays: 1
        }
      };

      console.log('📝 Original task data from modal:', newTask);
      console.log('📤 Task data prepared for server:', taskData);
      console.log('📝 Description value:', newTask.description);
      console.log('📝 Description in prepared data:', taskData.description);
      
      // Use proper API call
      const result = await tasksAPI.createTask(taskData);
      
      console.log('Task created successfully:', result);
      // Add to local state with server response
      setTasks([...tasks, { ...newTask, id: result.data.task._id }]);
      
      // Show success modal
      setCreatedTask(newTask);
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Error creating task:', error);
      console.error('Failed to create task:', error.message);
      // Show user-friendly error message
      alert(`Failed to create task: ${error.message}`);
    }
  };

  const loadTasks = useCallback(async () => {
    try {
      debugAuth();
      console.log('Loading tasks from server...');
      const response = await tasksAPI.getTasks();
      console.log('Loaded tasks from server:', response.data.tasks);
      console.log('📝 First task description (if exists):', response.data.tasks?.[0]?.description);
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      console.error('Error details:', error.message);
      console.log('Using empty task list due to error');
      setTasks([]);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const updateTaskStatus = async (id, newStatus) => {
    try {
      debugAuth();
      // Use API call
      const updateData = {
        status: newStatus,
        progress: newStatus === 'done' ? 100 : tasks.find(t => t._id === id)?.progress || 0
      };
      
      const result = await tasksAPI.updateTask(id, updateData);
      
      console.log('✅ Task updated successfully:', result);
      
      // Update local state with server response
      setTasks(tasks.map(task => 
        task._id === id 
          ? { ...task, status: newStatus, progress: newStatus === 'done' ? 100 : task.progress }
          : task
      ));
      
      // Update selected task if it's the one being updated
      if (selectedTask && selectedTask._id === id) {
        setSelectedTask({ ...selectedTask, status: newStatus, progress: newStatus === 'done' ? 100 : selectedTask.progress });
      }
    } catch (error) {
      console.error('❌ Error updating task:', error);
    }
  };

  const startTimer = (id) => {
    setActiveTimer(id);
  };

  const stopTimer = (id) => {
    setActiveTimer(null);
    setTasks(tasks.map(task => 
      task.id === id 
        ? { ...task, actualHours: task.actualHours + 0.5 }
        : task
    ));
  };

  const deleteTask = async (id) => {
    setIsDeleting(true);
    try {
      debugAuth();
      // Use API call
      const result = await tasksAPI.deleteTask(id);
      
      console.log('✅ Task deleted successfully:', result);
      
      // Update local state
      setTasks(tasks.filter(task => task._id !== id && task.id !== id));
      
      // If the deleted task was selected, clear selection
      if (selectedTask && (selectedTask._id === id || selectedTask.id === id)) {
        setSelectedTask(null);
      }
      
      setShowDeleteConfirm(false);
      console.log(`Task deleted successfully!`);
    } catch (error) {
      console.error('❌ Error deleting task:', error);
      console.error('Task deletion failed:', error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'done': return '#10b981';
      case 'in-progress': return '#f59e0b';
      case 'todo': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    todo: tasks.filter(t => t.status === 'todo').length,
    completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex">
      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(!isDrawerOpen)}
        tasks={tasks}
        onTaskSelect={(task) => {
          console.log('📝 Selected task:', task);
          console.log('📝 Selected task description:', task.description);
          console.log('📝 Description type:', typeof task.description);
          console.log('📝 Description length:', task.description?.length);
          setSelectedTask(task);
        }}
        selectedTask={selectedTask}
        onLogout={() => {
          localStorage.removeItem('user');
          window.location.href = '/login';
        }}
        filter={filter}
        setFilter={setFilter}
        searchTerm={debouncedSearchTerm}
        setSearchTerm={setSearchTerm}
        onDeleteTask={(id) => {
          setShowDeleteConfirm(true);
          setSelectedTask(tasks.find(task => task.id === id));
        }}
      />

      {/* Desktop Sidebar */}
      <DesktopSidebar
        tasks={tasks}
        onTaskSelect={(task) => {
          console.log('📝 Selected task:', task);
          console.log('📝 Selected task description:', task.description);
          console.log('📝 Description type:', typeof task.description);
          console.log('📝 Description length:', task.description?.length);
          setSelectedTask(task);
        }}
        selectedTask={selectedTask}
        onLogout={() => {
          localStorage.removeItem('user');
          window.location.href = '/login';
        }}
        filter={filter}
        setFilter={setFilter}
        searchTerm={debouncedSearchTerm}
        setSearchTerm={setSearchTerm}
        onDeleteTask={(id) => {
          setShowDeleteConfirm(true);
          setSelectedTask(tasks.find(task => task.id === id));
        }}
      />


      {/* Main Content */}
      <div className="flex-1 overflow-y-auto lg:mt-0 mt-16">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Task Dashboard</h1>
              <p className="text-gray-600 mt-1">Complete task management and analytics</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1 px-2 py-1.5 sm:gap-1.5 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 bg-gradient-to-r from-blue-500 to-orange-400 text-white rounded-lg hover:from-blue-600 hover:to-orange-500 transition-all font-medium shadow-sm text-xs sm:text-sm lg:text-base"
              >
                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">Add New Task</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="p-4 lg:p-6">
          <LazyLoadWrapper>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 mb-1">{stats.total}</div>
              <div className="text-xs sm:text-sm text-gray-600">Total Tasks</div>
            </div>
            <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 mb-1">{stats.completed}</div>
              <div className="text-xs sm:text-sm text-gray-600">Completed</div>
            </div>
            <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-600 mb-1">{stats.inProgress}</div>
              <div className="text-xs sm:text-sm text-gray-600">In Progress</div>
            </div>
            <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600 mb-1">{stats.completionRate}%</div>
              <div className="text-xs sm:text-sm text-gray-600">Completion Rate</div>
            </div>
            </div>
          </LazyLoadWrapper>

          {/* Task Details */}
          {selectedTask ? (
            <LazyLoadWrapper>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 lg:p-6">
                <h2 className="text-xl lg:text-2xl font-bold mb-2">{selectedTask.title}</h2>
                {selectedTask.description ? (
                  <p className="text-blue-100 text-sm lg:text-base leading-relaxed">{selectedTask.description}</p>
                ) : (
                  <p className="text-blue-200 text-sm lg:text-base italic">No description provided</p>
                )}
              </div>
              <div className="p-4 lg:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <div className="mt-1">
                      <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: getStatusColor(selectedTask.status) }}
                      >
                        {selectedTask.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Priority:</span>
                    <div className="mt-1">
                      <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: getPriorityColor(selectedTask.priority) }}
                      >
                        {selectedTask.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Category:</span>
                    <div className="mt-1 text-sm text-gray-900 capitalize">{selectedTask.category}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Time Frame:</span>
                    <div className="mt-1 text-sm text-gray-900 capitalize">{selectedTask.timeFrame}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Progress:</span>
                    <div className="mt-1 text-sm text-gray-900">{selectedTask.progress}%</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Estimated Hours:</span>
                    <div className="mt-1 text-sm text-gray-900">{selectedTask.estimatedHours}h</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Actual Hours:</span>
                    <div className="mt-1 text-sm text-gray-900">{selectedTask.actualHours}h</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">End Date:</span>
                    <div className="mt-1 text-sm text-gray-900">{selectedTask.endDate}</div>
                  </div>
                </div>
                
                {/* Description Section */}
                {selectedTask.description && (
                  <div className="mb-6">
                    <span className="text-sm font-medium text-gray-600">Description:</span>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-900 leading-relaxed">{selectedTask.description}</p>
                    </div>
                  </div>
                )}
                
                {selectedTask.tags.length > 0 && (
                  <div className="mb-6">
                    <span className="text-sm font-medium text-gray-600">Tags:</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedTask.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  {selectedTask.status === 'in-progress' && (
                    <button
                      onClick={() => activeTimer === selectedTask.id ? stopTimer(selectedTask.id) : startTimer(selectedTask.id)}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors touch-target ${
                        activeTimer === selectedTask.id 
                          ? 'bg-gradient-to-r from-orange-500 to-yellow-400 text-white hover:from-orange-600 hover:to-yellow-500' 
                          : 'bg-gradient-to-r from-blue-500 to-orange-400 text-white hover:from-blue-600 hover:to-orange-500'
                      }`}
                      style={{ minHeight: `${touchTargetSize}px` }}
                    >
                      {activeTimer === selectedTask.id ? (
                        <>
                          <Pause className="w-4 h-4" />
                          Stop Timer
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Start Timer
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const statusOrder = ['todo', 'in-progress', 'done'];
                      const currentIndex = statusOrder.indexOf(selectedTask.status);
                      const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
                      updateTaskStatus(selectedTask.id, nextStatus);
                      setSelectedTask({...selectedTask, status: nextStatus});
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-orange-400 text-white rounded-lg hover:from-blue-600 hover:to-orange-500 transition-all font-medium touch-target"
                    style={{ minHeight: `${touchTargetSize}px` }}
                  >
                    {selectedTask.status === 'todo' ? (
                      <>
                        <Play className="w-4 h-4" />
                        Start Task
                      </>
                    ) : selectedTask.status === 'in-progress' ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Complete Task
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4" />
                        Reset Task
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium touch-target"
                    style={{ minHeight: `${touchTargetSize}px` }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Task
                  </button>
                </div>
              </div>
              </div>
            </LazyLoadWrapper>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Task</h3>
              <p className="text-gray-600 mb-6">Choose a task from the sidebar to view details and manage it</p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-1 px-3 py-2 sm:gap-1.5 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-orange-400 text-white rounded-lg hover:from-blue-600 hover:to-orange-500 transition-all font-medium text-xs sm:text-sm lg:text-base"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                <span className="hidden sm:inline">Create Your First Task</span>
                <span className="sm:hidden">Create Task</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Task Modal */}
      <ResponsiveTaskModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAddTask={addTask}
      />

      {/* Success Modal */}
      <SuccessModal 
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setCreatedTask(null);
        }}
        onCreateAnother={() => {
          setShowSuccessModal(false);
          setCreatedTask(null);
          setShowModal(true);
        }}
        taskTitle={createdTask?.title}
        taskDescription={createdTask?.description}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl relative" style={{ 
            background: 'linear-gradient(white, white) padding-box, linear-gradient(45deg, #ef4444, #dc2626, #b91c1c, #ffffff) border-box',
            border: '3px solid transparent'
          }}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Task</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 mb-2">Are you sure you want to delete this task?</p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-900">{selectedTask.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedTask.description}</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteTask(selectedTask.id)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Task'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveDashboard;
