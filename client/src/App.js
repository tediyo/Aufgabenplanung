import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

// Sidebar Component
const Sidebar = ({ tasks, onTaskSelect, selectedTask, onLogout }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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

  return (
    <div style={{
      width: '300px',
      height: '100vh',
      background: '#1f2937',
      color: 'white',
      padding: '20px',
      overflowY: 'auto',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 1000
    }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#f9fafb' }}>📋 Task Manager</h2>
        <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>Complete task management</p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #374151',
            background: '#374151',
            color: 'white',
            fontSize: '14px'
          }}
        />
      </div>

      {/* Filter Buttons */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {['all', 'todo', 'in-progress', 'done'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: 'none',
                background: filter === status ? '#3b82f6' : '#374151',
                color: 'white',
                fontSize: '12px',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {status.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div>
        <h3 style={{ margin: '0 0 15px 0', color: '#f9fafb', fontSize: '16px' }}>
          Tasks ({filteredTasks.length})
        </h3>
        <div style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
          {filteredTasks.map(task => (
            <div
              key={task.id}
              onClick={() => onTaskSelect(task)}
              style={{
                padding: '12px',
                marginBottom: '8px',
                borderRadius: '8px',
                background: selectedTask?.id === task.id ? '#3b82f6' : '#374151',
                cursor: 'pointer',
                border: '1px solid #4b5563',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '16px' }}>{getStatusIcon(task.status)}</span>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: selectedTask?.id === task.id ? 'white' : '#f9fafb'
                }}>
                  {task.title}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: getPriorityColor(task.priority)
                }}></span>
                <span style={{ 
                  fontSize: '12px', 
                  color: selectedTask?.id === task.id ? '#e5e7eb' : '#9ca3af',
                  textTransform: 'capitalize'
                }}>
                  {task.priority} • {task.category}
                </span>
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: selectedTask?.id === task.id ? '#e5e7eb' : '#9ca3af',
                marginTop: '4px'
              }}>
                {task.progress}% complete
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logout Button */}
      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #374151' }}>
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            padding: '10px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

// Modal Component for Adding Tasks
const TaskModal = ({ isOpen, onClose, onAddTask }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal',
    priority: 'medium',
    timeFrame: 'custom',
    estimatedHours: 1,
    tags: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title) {
      const task = {
        id: Date.now(),
        ...formData,
        status: 'todo',
        progress: 0,
        actualHours: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };
      onAddTask(task);
      setFormData({
        title: '',
        description: '',
        category: 'personal',
        priority: 'medium',
        timeFrame: 'custom',
        estimatedHours: 1,
        tags: ''
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000
    }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#374151' }}>➕ Create New Task</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter task title"
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
              placeholder="Enter task description"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              >
                <option value="work">💼 Work</option>
                <option value="personal">👤 Personal</option>
                <option value="health">💪 Health</option>
                <option value="finance">💰 Finance</option>
                <option value="education">📚 Education</option>
                <option value="other">🔧 Other</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🟠 High</option>
                <option value="urgent">🔴 Urgent</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
                Time Frame
              </label>
              <select
                value={formData.timeFrame}
                onChange={(e) => setFormData({...formData, timeFrame: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              >
                <option value="daily">📅 Daily</option>
                <option value="weekly">📆 Weekly</option>
                <option value="monthly">📊 Monthly</option>
                <option value="annually">🗓️ Annually</option>
                <option value="custom">⚙️ Custom</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
                Estimated Hours
              </label>
              <input
                type="number"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({...formData, estimatedHours: parseFloat(e.target.value) || 0})}
                min="0"
                step="0.5"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px'
              }}
              placeholder="e.g., project, deadline, important"
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 24px',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              ✅ Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
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
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8fafc', 
      fontFamily: 'Arial, sans-serif',
      marginLeft: '300px' // Account for sidebar
    }}>
      {/* Sidebar */}
      <Sidebar 
        tasks={tasks} 
        onTaskSelect={setSelectedTask}
        selectedTask={selectedTask}
        onLogout={async () => {
          try {
            // Clear local storage
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            
            // Redirect to login page
            window.location.href = '/login';
          } catch (error) {
            console.error('Logout error:', error);
            // Even if API call fails, still clear local storage
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
        }}
      />

      {/* Main Content */}
      <div style={{ padding: '20px' }}>
        {/* Header */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{ margin: 0, color: '#374151', fontSize: '28px' }}>📊 Task Dashboard</h1>
              <p style={{ margin: '5px 0 0 0', color: '#6b7280' }}>Complete task management and analytics</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              ➕ Add New Task
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px', 
          marginBottom: '30px' 
        }}>
          <div style={{ 
            background: 'white', 
            padding: '24px', 
            borderRadius: '12px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>{stats.total}</div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Total Tasks</div>
          </div>
          <div style={{ 
            background: 'white', 
            padding: '24px', 
            borderRadius: '12px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>{stats.completed}</div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Completed</div>
          </div>
          <div style={{ 
            background: 'white', 
            padding: '24px', 
            borderRadius: '12px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.inProgress}</div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>In Progress</div>
          </div>
          <div style={{ 
            background: 'white', 
            padding: '24px', 
            borderRadius: '12px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#8b5cf6' }}>{stats.completionRate}%</div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Completion Rate</div>
          </div>
        </div>

        {/* Task Details */}
        {selectedTask ? (
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            marginBottom: '20px'
          }}>
            <div style={{ 
              padding: '24px', 
              borderBottom: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <h2 style={{ margin: '0 0 10px 0' }}>{selectedTask.title}</h2>
              <p style={{ margin: 0, opacity: 0.9 }}>{selectedTask.description}</p>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <strong>Status:</strong> 
                  <span style={{ 
                    marginLeft: '8px',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'white',
                    background: getStatusColor(selectedTask.status)
                  }}>
                    {selectedTask.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                <div>
                  <strong>Priority:</strong> 
                  <span style={{ 
                    marginLeft: '8px',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'white',
                    background: getPriorityColor(selectedTask.priority)
                  }}>
                    {selectedTask.priority.toUpperCase()}
                  </span>
                </div>
                <div><strong>Category:</strong> {selectedTask.category}</div>
                <div><strong>Time Frame:</strong> {selectedTask.timeFrame}</div>
                <div><strong>Progress:</strong> {selectedTask.progress}%</div>
                <div><strong>Estimated Hours:</strong> {selectedTask.estimatedHours}h</div>
                <div><strong>Actual Hours:</strong> {selectedTask.actualHours}h</div>
                <div><strong>Start Date:</strong> {selectedTask.startDate}</div>
                <div><strong>End Date:</strong> {selectedTask.endDate}</div>
              </div>
              
              {selectedTask.tags.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <strong>Tags:</strong>
                  <div style={{ marginTop: '8px' }}>
                    {selectedTask.tags.map((tag, index) => (
                      <span key={index} style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        background: '#e5e7eb',
                        color: '#374151',
                        borderRadius: '16px',
                        fontSize: '12px',
                        marginRight: '8px',
                        marginBottom: '4px'
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                {selectedTask.status === 'in-progress' && (
                  <button
                    onClick={() => activeTimer === selectedTask.id ? stopTimer(selectedTask.id) : startTimer(selectedTask.id)}
                    style={{
                      padding: '10px 20px',
                      background: activeTimer === selectedTask.id ? '#ef4444' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    {activeTimer === selectedTask.id ? '⏹️ Stop Timer' : '▶️ Start Timer'}
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
                  style={{
                    padding: '10px 20px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  {selectedTask.status === 'todo' ? '▶️ Start Task' : 
                   selectedTask.status === 'in-progress' ? '✅ Complete Task' : '🔄 Reset Task'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ 
            background: 'white', 
            padding: '40px', 
            borderRadius: '12px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📋</div>
            <h3 style={{ color: '#374151', marginBottom: '10px' }}>Select a Task</h3>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>Choose a task from the sidebar to view details and manage it</p>
            <button
              onClick={() => setShowModal(true)}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              ➕ Create Your First Task
            </button>
          </div>
        )}

        {/* Task Modal */}
        <TaskModal 
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onAddTask={addTask}
        />
      </div>
    </div>
  );
};

// Login Component
const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data and token
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>📋</div>
          <h1 style={{ color: '#374151', margin: 0 }}>Task Scheduler</h1>
          <p style={{ color: '#6b7280', margin: '5px 0 0 0' }}>Complete Task Management Solution</p>
        </div>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '15px'
            }}
          >
            🚀 Login
          </button>
        </form>
        
        <div style={{ textAlign: 'center' }}>
          <p style={{ 
            color: '#6b7280',
            fontSize: '14px',
            margin: '0 0 15px 0'
          }}>
            Don't have an account?
          </p>
          <button
            onClick={() => navigate('/register')}
            style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              color: '#667eea',
              border: '2px solid #667eea',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#667eea';
              e.target.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#667eea';
            }}
          >
            📝 Create New Account
          </button>
        </div>
      </div>
    </div>
  );
};

// Register Component
const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    match: false,
  });

  React.useEffect(() => {
    setPasswordChecks({
      length: formData.password.length >= 6,
      match: formData.password === formData.confirmPassword && formData.password !== '',
    });
  }, [formData.password, formData.confirmPassword]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!passwordChecks.length || !passwordChecks.match) {
      alert('Please check password requirements');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data and token
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>📝</div>
          <h1 style={{ color: '#374151', margin: 0 }}>Create Account</h1>
          <p style={{ color: '#6b7280', margin: '5px 0 0 0' }}>Join Task Scheduler today</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
              {passwordChecks.length ? '✅' : '❌'} At least 6 characters
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
              {passwordChecks.match ? '✅' : '❌'} Passwords match
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!passwordChecks.length || !passwordChecks.match}
            style={{
              width: '100%',
              padding: '14px',
              background: passwordChecks.length && passwordChecks.match 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: passwordChecks.length && passwordChecks.match ? 'pointer' : 'not-allowed',
              marginBottom: '15px'
            }}
          >
            📝 Create Account
          </button>
        </form>
        
        <div style={{ textAlign: 'center' }}>
          <p style={{ 
            color: '#6b7280',
            fontSize: '14px',
            margin: '0 0 15px 0'
          }}>
            Already have an account?
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              color: '#667eea',
              border: '2px solid #667eea',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#667eea';
              e.target.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#667eea';
            }}
          >
            🚀 Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  React.useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={isLoggedIn ? <Dashboard /> : <Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={isLoggedIn ? <Dashboard /> : <Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

