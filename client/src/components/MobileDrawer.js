import React, { useState } from 'react';
import { X, Menu, Search, LogOut, Trash2, User, Clock } from 'lucide-react';
import Logo from './Logo';

const MobileDrawer = ({ 
  isOpen, 
  onClose, 
  tasks, 
  onTaskSelect, 
  selectedTask, 
  onLogout,
  filter,
  setFilter,
  searchTerm,
  setSearchTerm,
  onDeleteTask,
  onShowFutureTasks
}) => {
  const [hoveredTask, setHoveredTask] = useState(null);
  const getStatusIcon = (status) => {
    switch (status) {
      case 'done': return '✅';
      case 'in-progress': return '🔄';
      case 'todo': return '📋';
      default: return '📋';
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

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <>
      {/* Mobile Menu Button */}
            <button
              onClick={onClose}
              className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-gradient-to-r from-blue-500 to-orange-400 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-orange-500 transition-all touch-target"
            >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Logo */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Logo size="small" />
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`
        lg:hidden fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-gray-800 text-white z-50 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Logo size="small" />
            <div>
              <h2 className="text-lg font-semibold text-white">Task Manager</h2>
              <p className="text-sm text-gray-400">Complete task management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex flex-wrap gap-2">
            {['all', 'todo', 'in-progress', 'done'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`
                  px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                  ${filter === status 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }
                `}
              >
                {status.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          <h3 className="text-sm font-medium text-gray-300 mb-3">
            Tasks ({filteredTasks.length})
          </h3>
          <div className="space-y-2">
            {filteredTasks.map(task => (
              <div
                key={task.id}
                onMouseEnter={() => setHoveredTask(task.id)}
                onMouseLeave={() => setHoveredTask(null)}
                className={`
                  p-3 rounded-lg cursor-pointer transition-all duration-200 border relative group
                  ${selectedTask?.id === task.id 
                    ? 'bg-blue-600 border-blue-500' 
                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                  }
                `}
              >
                <div 
                  onClick={() => {
                    onTaskSelect(task);
                    onClose(); // Close drawer on mobile when task is selected
                  }}
                  className="flex-1"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{getStatusIcon(task.status)}</span>
                    <span className={`
                      text-sm font-medium truncate
                      ${selectedTask?.id === task.id ? 'text-white' : 'text-gray-100'}
                    `}>
                      {task.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                    />
                    <span className={`
                      text-xs capitalize
                      ${selectedTask?.id === task.id ? 'text-gray-200' : 'text-gray-400'}
                    `}>
                      {task.priority} • {task.category}
                    </span>
                  </div>
                  <div className={`
                    text-xs mt-1
                    ${selectedTask?.id === task.id ? 'text-gray-200' : 'text-gray-400'}
                  `}>
                    {task.progress}% complete
                  </div>
                </div>
                
                {/* Delete Button */}
                {hoveredTask === task.id && onDeleteTask && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTask(task.id);
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete task"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Profile, Future Tasks and Logout Buttons */}
        <div className="p-4 border-t border-gray-700 space-y-2 flex-shrink-0">
          <button
            onClick={() => {
              onClose();
              window.location.href = '/profile';
            }}
            className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
          >
            <User className="w-4 h-4" />
            Profile
          </button>
          <button
            onClick={() => {
              onClose();
              onShowFutureTasks();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all"
          >
            <Clock className="w-4 h-4" />
            Future Tasks
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-orange-500 to-yellow-400 text-white rounded-lg hover:from-orange-600 hover:to-yellow-500 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileDrawer;
