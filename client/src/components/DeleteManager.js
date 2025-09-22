import React, { useState } from 'react';
import { 
  Trash2, 
  CheckSquare, 
  Clock, 
  Calendar,
  AlertTriangle,
  X,
  ChevronDown
} from 'lucide-react';
import { useTasks } from '../contexts/TaskContext';

const DeleteManager = ({ onClose }) => {
  const { 
    tasks, 
    bulkDeleteTasks, 
    cleanupCompletedTasks, 
    cleanupOldTasks 
  } = useTasks();
  
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [showCleanupOptions, setShowCleanupOptions] = useState(false);
  const [cleanupDays, setCleanupDays] = useState(30);
  const [isProcessing, setIsProcessing] = useState(false);

  const completedTasks = tasks.filter(task => task.status === 'done');
  const oldTasks = tasks.filter(task => {
    const daysSinceCreated = Math.floor((new Date() - new Date(task.createdAt)) / (1000 * 60 * 60 * 24));
    return daysSinceCreated >= cleanupDays && task.status !== 'done';
  });

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
    
    setIsProcessing(true);
    try {
      await bulkDeleteTasks(selectedTasks);
      setSelectedTasks([]);
      setShowBulkDelete(false);
    } catch (error) {
      console.error('Bulk delete error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCleanupCompleted = async () => {
    setIsProcessing(true);
    try {
      await cleanupCompletedTasks();
      setShowCleanupOptions(false);
    } catch (error) {
      console.error('Cleanup completed error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCleanupOld = async () => {
    setIsProcessing(true);
    try {
      await cleanupOldTasks(cleanupDays);
      setShowCleanupOptions(false);
    } catch (error) {
      console.error('Cleanup old error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }}>
      <div style={{
        background: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        maxWidth: '56rem',
        width: '100%',
        margin: '0 1rem',
        maxHeight: '90vh',
        overflow: 'hidden',
        position: 'relative',
        border: '4px solid transparent',
        backgroundClip: 'padding-box'
      }}>
        {/* Colorful Border Overlay */}
        <div style={{
          position: 'absolute',
          top: '-4px',
          left: '-4px',
          right: '-4px',
          bottom: '-4px',
          background: 'linear-gradient(90deg, #fbbf24 0%, #f97316 25%, #3b82f6 50%, #fbbf24 75%, #f97316 100%)',
          borderRadius: '0.75rem',
          zIndex: -1
        }}></div>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Trash2 className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900">Delete Tasks</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-green-800">Cleanup Completed</h3>
                  <p className="text-sm text-green-600">
                    {completedTasks.length} completed tasks
                  </p>
                </div>
                <button
                  onClick={handleCleanupCompleted}
                  disabled={completedTasks.length === 0 || isProcessing}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Clean Up'}
                </button>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-orange-800">Cleanup Old Tasks</h3>
                  <p className="text-sm text-orange-600">
                    {oldTasks.length} tasks older than {cleanupDays} days
                  </p>
                </div>
                <button
                  onClick={() => setShowCleanupOptions(!showCleanupOptions)}
                  className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Cleanup Old Tasks Options */}
          {showCleanupOptions && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-orange-800 mb-2">
                    Delete tasks older than:
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={cleanupDays}
                      onChange={(e) => setCleanupDays(parseInt(e.target.value))}
                      className="w-20 px-3 py-1 border border-orange-300 rounded text-sm"
                    />
                    <span className="text-sm text-orange-600">days</span>
                    <button
                      onClick={handleCleanupOld}
                      disabled={oldTasks.length === 0 || isProcessing}
                      className="px-4 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 disabled:opacity-50"
                    >
                      {isProcessing ? 'Processing...' : 'Delete Old Tasks'}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-orange-600">
                  This will delete {oldTasks.length} tasks that are older than {cleanupDays} days and not completed.
                </p>
              </div>
            </div>
          )}

          {/* Bulk Delete Section */}
          <div className="border border-gray-200 rounded-lg">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Select Tasks to Delete</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {selectedTasks.length === tasks.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <span className="text-sm text-gray-500">
                    {selectedTasks.length} selected
                  </span>
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {tasks.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No tasks found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {tasks.map((task) => (
                    <div key={task._id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task._id)}
                          onChange={() => handleTaskSelect(task._id)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {task.title}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              task.status === 'done' ? 'bg-green-100 text-green-800' :
                              task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {task.status.replace('-', ' ')}
                            </span>
                            <span className={`text-xs ${
                              task.priority === 'urgent' ? 'text-red-600' :
                              task.priority === 'high' ? 'text-orange-600' :
                              task.priority === 'medium' ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {task.priority}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(task.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedTasks.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <span className="text-sm text-gray-700">
                      {selectedTasks.length} tasks will be permanently deleted
                    </span>
                  </div>
                  <button
                    onClick={handleBulkDelete}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {isProcessing ? 'Deleting...' : `Delete ${selectedTasks.length} Tasks`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteManager;
