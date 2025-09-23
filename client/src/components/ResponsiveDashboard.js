import React, { useState } from 'react';
import { Plus, Play, Pause, CheckCircle, RotateCcw } from 'lucide-react';
import MobileDrawer from './MobileDrawer';
import DesktopSidebar from './DesktopSidebar';
import ResponsiveTaskModal from './ResponsiveTaskModal';
import LazyLoadWrapper from './LazyLoadWrapper';
import { useMobileOptimization, useDebounce } from '../hooks/useMobileOptimization';

const ResponsiveDashboard = () => {
  const { touchTargetSize } = useMobileOptimization();
  const [tasks, setTasks] = useState([
    { 
      id: 1, 
      title: 'Complete Project Proposal', 
      description: 'Write and submit the quarterly project proposal',
      status: 'in-progress', 
      priority: 'high',
      category: 'work',
      timeFrame: 'weekly',
      progress: 65,
      estimatedHours: 8,
      actualHours: 5.2,
      startDate: '2024-01-15',
      endDate: '2024-01-22',
      tags: ['project', 'deadline']
    },
    { 
      id: 2, 
      title: 'Daily Workout', 
      description: 'Complete 45-minute workout routine',
      status: 'todo', 
      priority: 'medium',
      category: 'health',
      timeFrame: 'daily',
      progress: 0,
      estimatedHours: 1,
      actualHours: 0,
      startDate: '2024-01-20',
      endDate: '2024-01-20',
      tags: ['fitness', 'routine']
    },
    { 
      id: 3, 
      title: 'Monthly Budget Review', 
      description: 'Review expenses and plan next month budget',
      status: 'done', 
      priority: 'high',
      category: 'finance',
      timeFrame: 'monthly',
      progress: 100,
      estimatedHours: 2,
      actualHours: 1.8,
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      tags: ['budget', 'planning']
    }
  ]);

  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTimer, setActiveTimer] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const addTask = (newTask) => {
    setTasks([...tasks, newTask]);
  };

  const updateTaskStatus = (id, newStatus) => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? { ...task, status: newStatus, progress: newStatus === 'done' ? 100 : task.progress }
        : task
    ));
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
        onTaskSelect={setSelectedTask}
        selectedTask={selectedTask}
        onLogout={() => {
          localStorage.removeItem('user');
          window.location.reload();
        }}
        filter={filter}
        setFilter={setFilter}
        searchTerm={debouncedSearchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* Desktop Sidebar */}
      <DesktopSidebar
        tasks={tasks}
        onTaskSelect={setSelectedTask}
        selectedTask={selectedTask}
        onLogout={() => {
          localStorage.removeItem('user');
          window.location.reload();
        }}
        filter={filter}
        setFilter={setFilter}
        searchTerm={debouncedSearchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">📊 Task Dashboard</h1>
              <p className="text-gray-600 mt-1">Complete task management and analytics</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-sm text-sm sm:text-base"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Add New Task</span>
              <span className="sm:hidden">Add</span>
            </button>
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
                <p className="text-blue-100">{selectedTask.description}</p>
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
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'bg-green-600 text-white hover:bg-green-700'
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
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium touch-target"
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
                className="inline-flex items-center gap-1.5 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
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
    </div>
  );
};

export default ResponsiveDashboard;
