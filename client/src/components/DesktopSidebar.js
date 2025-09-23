import React, { useState } from 'react';
import { Search, LogOut, Trash2, X } from 'lucide-react';
import Logo from './Logo';

const DesktopSidebar = ({ 
  tasks, 
  onTaskSelect, 
  selectedTask, 
  onLogout,
  filter,
  setFilter,
  searchTerm,
  setSearchTerm,
  onDeleteTask
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
    <div className="hidden lg:block w-80 h-screen bg-gray-800 text-white overflow-y-auto flex-shrink-0">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <Logo size="medium" />
          <div>
            <h2 className="text-xl font-semibold text-white">Task Manager</h2>
            <p className="text-sm text-gray-400">Complete task management</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-700">
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
      <div className="p-4 border-b border-gray-700">
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
      <div className="flex-1 p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-4">
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
                onClick={() => onTaskSelect(task)}
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

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-orange-500 to-yellow-400 text-white rounded-lg hover:from-orange-600 hover:to-yellow-500 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default DesktopSidebar;
