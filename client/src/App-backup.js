import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { authAPI } from './utils/api';
import ResponsiveDashboard from './components/ResponsiveDashboard';
import NotificationModal from './components/NotificationModal';
import './utils/responsiveTest'; // Import responsive test utilities

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong.</h2>
          <p>Error: {this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Sidebar Component
const Sidebar = ({ tasks, onTaskSelect, selectedTask, onLogout, onDeleteTask, filter, setFilter }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'done': 
        return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>;
      case 'in-progress': 
        return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>;
      case 'todo': 
        return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>;
      default: 
        return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>;
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
    <div className="sidebar-content" style={{
      width: '100%',
      height: '100%',
      color: 'white',
      padding: '24px',
      overflowY: 'auto',
      boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)',
      borderRight: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '32px',
        paddingBottom: '24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          marginBottom: '8px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
          </div>
          <div>
            <h2 style={{ 
              margin: 0, 
              color: '#f8fafc', 
              fontSize: '20px',
              fontWeight: '700',
              letterSpacing: '-0.025em'
            }}>Task Manager</h2>
            <p style={{ 
              margin: 0, 
              color: '#cbd5e1', 
              fontSize: '13px',
              fontWeight: '500'
            }}>Complete task management</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
              padding: '12px 16px 12px 44px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#f8fafc',
              fontSize: '14px',
              fontWeight: '500',
              outline: 'none',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#f97316';
              e.target.style.background = 'rgba(255, 255, 255, 0.15)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
          />
          <div style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#cbd5e1',
            fontSize: '16px'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['all', 'todo', 'in-progress', 'done'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                background: filter === status 
                  ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' 
                  : 'rgba(255, 255, 255, 0.1)',
                color: filter === status ? '#ffffff' : '#cbd5e1',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s ease',
                boxShadow: filter === status 
                  ? '0 4px 12px rgba(249, 115, 22, 0.3)' 
                  : 'none',
                border: filter === status 
                  ? 'none' 
                  : '1px solid rgba(255, 255, 255, 0.2)'
              }}
              onMouseEnter={(e) => {
                if (filter !== status) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.color = '#f8fafc';
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== status) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.color = '#cbd5e1';
                }
              }}
            >
              {status.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <h3 style={{ 
            margin: 0, 
            color: '#f8fafc', 
            fontSize: '16px',
            fontWeight: '700',
            letterSpacing: '-0.025em'
          }}>
            Tasks
        </h3>
          <div style={{
            background: 'rgba(249, 115, 22, 0.1)',
            color: '#f97316',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            {filteredTasks.length}
          </div>
        </div>
        <div style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
          {filteredTasks.map(task => (
            <div
              key={task._id}
              style={{
                padding: '16px',
                marginBottom: '12px',
                borderRadius: '16px',
                background: selectedTask?._id === task._id 
                  ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' 
                  : 'rgba(255, 255, 255, 0.1)',
                border: selectedTask?._id === task._id 
                  ? '1px solid rgba(249, 115, 22, 0.3)' 
                  : '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
                position: 'relative',
                backdropFilter: 'blur(10px)',
                boxShadow: selectedTask?._id === task._id 
                  ? '0 8px 32px rgba(249, 115, 22, 0.2)' 
                  : '0 4px 16px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                if (selectedTask?._id !== task._id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedTask?._id !== task._id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
                }
              }}
            >
              {/* Main task content - clickable */}
              <div 
                onClick={() => onTaskSelect(task)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  marginBottom: '8px' 
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: selectedTask?._id === task._id 
                      ? 'rgba(255, 255, 255, 0.2)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px'
                  }}>
                    {getStatusIcon(task.status)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontSize: '15px', 
                  fontWeight: '600',
                      color: selectedTask?._id === task._id ? '#ffffff' : '#f8fafc',
                      marginBottom: '4px',
                      lineHeight: '1.3',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                }}>
                  {task.title}
              </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      marginBottom: '6px'
                    }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                  borderRadius: '50%',
                  background: getPriorityColor(task.priority)
                      }}></div>
                <span style={{ 
                  fontSize: '12px', 
                        color: selectedTask?._id === task._id ? '#e2e8f0' : '#cbd5e1',
                        textTransform: 'capitalize',
                        fontWeight: '500'
                }}>
                  {task.priority} • {task.category}
                </span>
              </div>
              <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        flex: 1,
                        height: '4px',
                        background: selectedTask?._id === task._id 
                          ? 'rgba(255, 255, 255, 0.2)' 
                          : 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${task.progress}%`,
                          height: '100%',
                          background: selectedTask?._id === task._id 
                            ? '#ffffff' 
                            : '#f97316',
                          borderRadius: '2px',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                      <span style={{ 
                        fontSize: '11px', 
                        color: selectedTask?._id === task._id ? '#e2e8f0' : '#cbd5e1',
                        fontWeight: '600',
                        minWidth: '32px',
                        textAlign: 'right'
                      }}>
                        {task.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(task._id);
                }}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  width: '28px',
                  height: '28px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  color: '#ef4444',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                  e.target.style.borderColor = '#ef4444';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                  e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 6h18l-2 13H5L3 6zM8 4V2h8v2H8zM6 8v10h12V8H6z"/>
                </svg>
              </button>

              {/* Delete confirmation */}
              {showDeleteConfirm === task._id && (
                <div style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  right: '0',
                  bottom: '0',
                  background: 'rgba(0, 0, 0, 0.8)',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 10
                }}>
                  <div style={{
                    background: '#374151',
                    padding: '12px',
                    borderRadius: '6px',
                    textAlign: 'center',
                    maxWidth: '200px',
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
                      borderRadius: '10px',
                      zIndex: -1
                    }}></div>
                    <p style={{ 
                      color: '#f9fafb', 
                fontSize: '12px', 
                      margin: '0 0 8px 0' 
                    }}>
                      Delete "{task.title}"?
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTask(task._id);
                          setShowDeleteConfirm(null);
                        }}
                        style={{
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        Yes
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(null);
                        }}
                        style={{
                          background: '#6b7280',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
              </div>
                  </div>
                </div>
              )}
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
    tags: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
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
        tags: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
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
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
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
          borderRadius: '16px',
          zIndex: -1
        }}></div>
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

        <form onSubmit={handleSubmit} style={{
          border: '1px solid #f3f4f6',
          borderRadius: '8px',
          padding: '20px',
          backgroundColor: '#fafafa'
        }}>
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
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: '500' }}>
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
                required
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

// Mobile Drawer Component
const MobileDrawer = ({ isOpen, onClose, children }) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="drawer-backdrop"
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            opacity: isOpen ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}
      
      {/* Drawer */}
      <div 
        className={`drawer ${isOpen ? 'drawer-open' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '320px',
          height: '100vh',
          background: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)',
          color: 'white',
          zIndex: 1000,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '2px 0 20px rgba(0, 0, 0, 0.3)',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
            Menu
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: 'white',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '40px',
              minHeight: '40px'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {/* Drawer Content */}
        <div style={{ padding: '0' }}>
          {children}
        </div>
      </div>
    </>
  );
};

// Main Dashboard Component
// const Dashboard = () => {
//   const [tasks, setTasks] = useState([]);
//   const [selectedTask, setSelectedTask] = useState(null);
//   const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Notification state
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Mobile detection and touch optimization
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Mobile-specific optimizations
    if (window.innerWidth <= 1024) {
      // Prevent zoom on input focus (iOS)
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
      
      // Add touch-friendly classes
      document.body.classList.add('mobile-device');
      
      // Add swipe gesture for drawer
      let startX = 0;
      let startY = 0;
      let isSwipe = false;
      
      const handleTouchStart = (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isSwipe = false;
      };
      
      const handleTouchMove = (e) => {
        if (!startX || !startY) return;
        
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = startX - currentX;
        const diffY = startY - currentY;
        
        // Check if it's a horizontal swipe
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
          isSwipe = true;
          e.preventDefault();
        }
      };
      
      const handleTouchEnd = (e) => {
        if (!startX || !startY) return;
        
        const endX = e.changedTouches[0].clientX;
        const diffX = startX - endX;
        
        // Swipe right to open drawer (from left edge)
        if (isSwipe && diffX < -100 && startX < 50) {
          setSidebarOpen(true);
        }
        // Swipe left to close drawer
        else if (isSwipe && diffX > 100 && sidebarOpen) {
          setSidebarOpen(false);
        }
        
        startX = 0;
        startY = 0;
        isSwipe = false;
      };
      
      document.addEventListener('touchstart', handleTouchStart, { passive: false });
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd, { passive: false });
      
      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    } else {
      document.body.classList.remove('mobile-device');
    }
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      document.body.classList.remove('mobile-device');
    };
  }, [sidebarOpen]);

  // Helper function to show notifications
  const showNotification = (type, title, message) => {
    setNotification({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('error', 'Authentication Error', 'No authentication token found. Please log in again.');
        return;
      }

      const response = await fetch(`https://aufgabenplanung.onrender.com/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      // Update local state after successful deletion
      setTasks(prevTasks => {
        const updatedTasks = prevTasks.filter(task => task._id !== taskId);
        // If the deleted task was selected, clear selection
        if (selectedTask?._id === taskId) {
          setSelectedTask(null);
        }
        return updatedTasks;
      });

      showNotification('success', 'Task Deleted', 'Task has been successfully deleted from the database.');
    } catch (error) {
      console.error('Error deleting task:', error);
      showNotification('error', 'Delete Failed', 'Failed to delete task. Please try again.');
    }
  };
  const [activeTimer, setActiveTimer] = useState(null);

  // Load tasks from backend
  const loadTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://aufgabenplanung.onrender.com/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  // Load tasks on component mount
  React.useEffect(() => {
    loadTasks();
  }, []);

  const addTask = async (newTask) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://aufgabenplanung.onrender.com/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newTask,
          notifications: {
            startDate: true,
            endDate: true,
            reminder: true,
            reminderDays: 1
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTasks([...tasks, data.task]);
        showNotification('success', 'Task Created', 'Task created successfully! You will receive email notifications on the start and end dates.');
        // Reload tasks to get the latest data
        await loadTasks();
      } else {
        const errorData = await response.json();
        showNotification('error', 'Creation Failed', `Error creating task: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      showNotification('error', 'Creation Failed', 'Error creating task. Please try again.');
    }
  };

  const updateTaskStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://aufgabenplanung.onrender.com/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          progress: newStatus === 'done' ? 100 : 0
        })
      });

      if (response.ok) {
        setTasks(tasks.map(task => 
          task._id === id 
            ? { ...task, status: newStatus, progress: newStatus === 'done' ? 100 : task.progress }
            : task
        ));
        // Reload tasks to get the latest data
        await loadTasks();
      } else {
        showNotification('error', 'Update Failed', 'Error updating task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      showNotification('error', 'Update Failed', 'Error updating task status');
    }
  };

  const startTimer = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://aufgabenplanung.onrender.com/api/tasks/${id}/start-timer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setActiveTimer(id);
        // Reload tasks to get the latest data
        await loadTasks();
      } else {
        showNotification('error', 'Timer Error', 'Error starting timer');
      }
    } catch (error) {
      console.error('Error starting timer:', error);
      showNotification('error', 'Timer Error', 'Error starting timer');
    }
  };

  const stopTimer = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://aufgabenplanung.onrender.com/api/tasks/${id}/stop-timer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setActiveTimer(null);
        setTasks(tasks.map(task => 
          task._id === id 
            ? { ...task, actualHours: task.actualHours + 0.5 }
            : task
        ));
        // Reload tasks to get the latest data
        await loadTasks();
      } else {
        showNotification('error', 'Timer Error', 'Error stopping timer');
      }
    } catch (error) {
      console.error('Error stopping timer:', error);
      showNotification('error', 'Timer Error', 'Error stopping timer');
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
    <div className={`main-content ${isMobile ? 'mobile' : ''}`} style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      marginLeft: isMobile ? '0' : '320px', // Account for sidebar
      position: 'relative'
    }}>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          /* Mobile Responsive Styles */
          @media (max-width: 1024px) {
            .main-content {
              margin-left: 0 !important;
              padding: 8px !important;
              padding-top: 60px !important;
              min-height: 100vh;
              transition: all 0.3s ease;
            }
            
            /* Mobile-specific animations */
            @keyframes slideInFromLeft {
              from {
                transform: translateX(-100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
            
            @keyframes slideInFromRight {
              from {
                transform: translateX(100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
            
            @keyframes fadeInUp {
              from {
                transform: translateY(20px);
                opacity: 0;
              }
              to {
                transform: translateY(0);
                opacity: 1;
              }
            }
            
            @keyframes bounceIn {
              0% {
                transform: scale(0.3);
                opacity: 0;
              }
              50% {
                transform: scale(1.05);
              }
              70% {
                transform: scale(0.9);
              }
              100% {
                transform: scale(1);
                opacity: 1;
              }
            }
            
            @keyframes pulse {
              0% {
                transform: scale(1);
              }
              50% {
                transform: scale(1.05);
              }
              100% {
                transform: scale(1);
              }
            }
            
            .stats-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 6px !important;
              margin-bottom: 16px !important;
            }
            
            .stats-card {
              padding: 12px !important;
              border-radius: 12px !important;
              transition: all 0.2s ease !important;
              cursor: pointer !important;
              animation: fadeInUp 0.4s ease-out !important;
            }
            
            .stats-card:hover {
              transform: translateY(-4px) !important;
              box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
            }
            
            .stats-card:active {
              transform: translateY(-2px) scale(0.98) !important;
              transition: all 0.1s ease !important;
            }
            
            .header {
              padding: 12px !important;
              flex-direction: column !important;
              gap: 8px !important;
              align-items: flex-start !important;
              margin-bottom: 16px !important;
            }
            
            .mobile-menu-btn {
              display: flex !important;
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
              border: none;
              color: white;
              padding: 8px;
              border-radius: 8px;
              cursor: pointer;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
              width: 40px;
              height: 40px;
              touch-action: manipulation;
              position: fixed !important;
              top: 12px !important;
              left: 12px !important;
              z-index: 1001 !important;
              transition: all 0.2s ease;
            }
            
            .mobile-menu-btn:hover {
              transform: scale(1.05);
              box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
            }
            
            .mobile-menu-btn:active {
              transform: scale(0.95);
            }
            
            /* Mobile haptic feedback simulation */
            .mobile-menu-btn:active,
            .stats-card:active,
            .task-card:active,
            .btn-primary:active,
            .btn-secondary:active {
              animation: pulse 0.1s ease;
            }
            
            /* Mobile touch ripple effect */
            .mobile-touch-ripple {
              position: relative;
              overflow: hidden;
            }
            
            .mobile-touch-ripple::after {
              content: '';
              position: absolute;
              top: 50%;
              left: 50%;
              width: 0;
              height: 0;
              border-radius: 50%;
              background: rgba(255, 255, 255, 0.3);
              transform: translate(-50%, -50%);
              transition: width 0.3s ease, height 0.3s ease;
            }
            
            .mobile-touch-ripple:active::after {
              width: 200px;
              height: 200px;
            }
            
            
            .modal-content {
              padding: 20px !important;
              width: 95% !important;
              max-width: none !important;
              margin: 20px !important;
              border-radius: 16px !important;
            }
            
            .form-grid {
              grid-template-columns: 1fr !important;
              gap: 12px !important;
            }
            
            .button-group {
              flex-direction: column !important;
              gap: 8px !important;
            }
            
            .task-details {
              padding: 16px !important;
            }
            
            .task-actions {
              flex-direction: column !important;
              gap: 8px !important;
            }
            
            .task-actions button {
              width: 100% !important;
              min-height: 44px !important;
              touch-action: manipulation;
            }
            
            /* Mobile-specific touch improvements */
            button, input, select, textarea {
              touch-action: manipulation;
              -webkit-tap-highlight-color: transparent;
            }
            
            /* Mobile scroll improvements */
            .sidebar {
              -webkit-overflow-scrolling: touch;
              overflow-y: auto;
            }
            
            /* Mobile-specific animations */
            .mobile-menu-btn:active {
              transform: scale(0.95);
              transition: transform 0.1s ease;
            }
            
            .stats-card:active {
              transform: scale(0.98);
              transition: transform 0.1s ease;
            }
          }
          
          @media (max-width: 768px) {
            .main-content {
              padding: 6px !important;
              padding-top: 50px !important;
            }
            
            .stats-grid {
              grid-template-columns: 1fr !important;
              gap: 6px !important;
              margin-bottom: 12px !important;
            }
            
            .stats-card {
              padding: 10px !important;
              border-radius: 10px !important;
            }
            
            .stats-card h3 {
              font-size: 12px !important;
              margin-bottom: 2px !important;
              font-weight: 600 !important;
            }
            
            .stats-card .number {
              font-size: 20px !important;
              font-weight: 700 !important;
            }
            
            .header {
              padding: 10px !important;
              border-radius: 12px !important;
              margin-bottom: 12px !important;
            }
            
            .header h1 {
              font-size: 18px !important;
              margin-bottom: 2px !important;
              font-weight: 700 !important;
            }
            
            .header p {
              font-size: 12px !important;
              opacity: 0.8 !important;
            }
            
            .task-card {
              padding: 12px !important;
              border-radius: 10px !important;
              margin-bottom: 8px !important;
              transition: all 0.2s ease !important;
              cursor: pointer !important;
              animation: slideInFromRight 0.3s ease-out !important;
              position: relative !important;
              overflow: hidden !important;
            }
            
            .task-card::before {
              content: '';
              position: absolute;
              top: 0;
              left: -100%;
              width: 100%;
              height: 100%;
              background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
              transition: left 0.5s ease;
            }
            
            .task-card:hover::before {
              left: 100%;
            }
            
            .task-card:hover {
              transform: translateY(-2px) !important;
              box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12) !important;
            }
            
            .task-card:active {
              transform: translateY(0) scale(0.98) !important;
              transition: all 0.1s ease !important;
            }
            
            .task-card h3 {
              font-size: 14px !important;
              margin-bottom: 4px !important;
              transition: color 0.2s ease !important;
              font-weight: 600 !important;
            }
            
            .task-card:hover h3 {
              color: #3b82f6 !important;
            }
            
            .task-card p {
              font-size: 12px !important;
              line-height: 1.3 !important;
              opacity: 0.8 !important;
            }
            
            .modal-content {
              padding: 16px !important;
              margin: 16px !important;
              border-radius: 16px !important;
            }
            
            .notification {
              top: 10px !important;
              right: 10px !important;
              left: 10px !important;
              max-width: none !important;
              border-radius: 12px !important;
            }
            
            /* Mobile-specific button improvements */
            .btn-primary, .btn-secondary {
              min-height: 40px !important;
              font-size: 14px !important;
              font-weight: 600 !important;
              border-radius: 8px !important;
              transition: all 0.2s ease !important;
              position: relative !important;
              overflow: hidden !important;
              animation: bounceIn 0.3s ease-out !important;
              padding: 8px 16px !important;
            }
            
            .btn-primary::before, .btn-secondary::before {
              content: '';
              position: absolute;
              top: 0;
              left: -100%;
              width: 100%;
              height: 100%;
              background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
              transition: left 0.5s ease;
            }
            
            .btn-primary:hover::before, .btn-secondary:hover::before {
              left: 100%;
            }
            
            .btn-primary:hover, .btn-secondary:hover {
              transform: translateY(-2px) !important;
              box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15) !important;
            }
            
            .btn-primary:active, .btn-secondary:active {
              transform: translateY(0) scale(0.95) !important;
              transition: all 0.1s ease !important;
            }
            
            /* Mobile-specific input improvements */
            .input-field {
              min-height: 40px !important;
              font-size: 14px !important;
              border-radius: 8px !important;
              padding: 8px 12px !important;
            }
            
            /* Mobile-specific spacing */
            .main-content {
              padding: 8px !important;
            }
            
            /* Mobile-specific task actions */
            .task-actions {
              margin-top: 12px !important;
            }
            
            .task-actions button {
              min-height: 48px !important;
              font-size: 14px !important;
            }
          }
          
          @media (max-width: 480px) {
            .main-content {
              padding: 4px !important;
              padding-top: 45px !important;
            }
            
            .header {
              padding: 8px !important;
              margin-bottom: 12px !important;
            }
            
            .header h1 {
              font-size: 16px !important;
            }
            
            .header p {
              font-size: 11px !important;
            }
            
            .stats-grid {
              gap: 4px !important;
              margin-bottom: 12px !important;
            }
            
            .stats-card {
              padding: 8px !important;
              border-radius: 8px !important;
            }
            
            .stats-card h3 {
              font-size: 10px !important;
              margin-bottom: 1px !important;
            }
            
            .stats-card .number {
              font-size: 16px !important;
            }
            
            .task-card {
              padding: 10px !important;
              border-radius: 8px !important;
              margin-bottom: 6px !important;
            }
            
            .task-card h3 {
              font-size: 13px !important;
              margin-bottom: 3px !important;
            }
            
            .task-card p {
              font-size: 11px !important;
              line-height: 1.2 !important;
            }
            
            .modal-content {
              padding: 12px !important;
              margin: 8px !important;
              border-radius: 12px !important;
            }
            
            .btn-primary, .btn-secondary {
              padding: 12px 16px !important;
              font-size: 14px !important;
              min-height: 44px !important;
              border-radius: 10px !important;
            }
            
            .input-field {
              padding: 12px !important;
              font-size: 16px !important;
              min-height: 44px !important;
              border-radius: 10px !important;
            }
            
            .mobile-menu-btn {
              width: 36px !important;
              height: 36px !important;
              padding: 6px !important;
              top: 8px !important;
              left: 8px !important;
            }
            
            .sidebar {
              max-width: 280px !important;
            }
            
            .notification {
              top: 8px !important;
              right: 8px !important;
              left: 8px !important;
              padding: 12px !important;
              border-radius: 10px !important;
            }
            
            /* Extra small mobile optimizations */
            .form-grid {
              gap: 8px !important;
            }
            
            .button-group {
              gap: 6px !important;
            }
            
            .task-actions {
              margin-top: 8px !important;
              gap: 6px !important;
            }
            
            .task-actions button {
              min-height: 44px !important;
              font-size: 13px !important;
              padding: 10px 12px !important;
            }
          }
          
          /* Desktop sidebar styles */
          @media (min-width: 1025px) {
            .sidebar {
              position: fixed;
              top: 0;
              left: 0;
              width: 320px;
              height: 100vh;
              z-index: 100;
              background: linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%);
              box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
            }
            
            .sidebar-content {
              width: 100%;
              height: 100%;
              overflow-y: auto;
            }
          }
          
          /* Drawer styles */
          .drawer {
            will-change: transform;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .drawer-backdrop {
            will-change: opacity;
            transition: opacity 0.3s ease;
          }
          
          /* Mobile drawer animations */
          @media (max-width: 1024px) {
            .drawer {
              animation: slideInFromLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .drawer-backdrop {
              animation: fadeIn 0.3s ease;
            }
            
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          }
          
          /* Mobile drawer optimizations */
          @media (max-width: 1024px) {
            .drawer {
              width: 100%;
              max-width: 320px;
            }
            
            .drawer-backdrop {
              backdrop-filter: blur(4px);
            }
            
            /* Ensure mobile menu button is always visible and accessible */
            .mobile-menu-btn {
              position: fixed !important;
              top: 20px !important;
              left: 20px !important;
              z-index: 1001 !important;
              display: flex !important;
            }
            
            /* Ensure no other elements overlap with the menu button */
            .header {
              margin-top: 0 !important;
            }
            
            /* Add some breathing room for the fixed menu button */
            .main-content > div:first-child {
              margin-top: 0 !important;
            }
          }
          
          /* Mobile device specific styles */
          .mobile-device {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }
          
          .mobile-device input,
          .mobile-device textarea {
            -webkit-user-select: text;
            -khtml-user-select: text;
            -moz-user-select: text;
            -ms-user-select: text;
            user-select: text;
          }
          
          /* Mobile-specific smooth scrolling */
          .mobile-device {
            -webkit-overflow-scrolling: touch;
            scroll-behavior: smooth;
          }
          
          /* Mobile-specific focus styles */
          .mobile-device button:focus,
          .mobile-device input:focus,
          .mobile-device select:focus,
          .mobile-device textarea:focus {
            outline: 2px solid #3b82f6;
            outline-offset: 2px;
          }
        `}
      </style>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="sidebar">
      <Sidebar 
        tasks={tasks} 
        onTaskSelect={setSelectedTask}
        selectedTask={selectedTask}
            onDeleteTask={handleDeleteTask}
            filter={filter}
            setFilter={setFilter}
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
        </div>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <MobileDrawer 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        >
          <Sidebar 
            tasks={tasks} 
            onTaskSelect={(task) => {
              setSelectedTask(task);
              setSidebarOpen(false);
            }}
            selectedTask={selectedTask}
            onDeleteTask={handleDeleteTask}
            filter={filter}
            setFilter={setFilter}
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
        </MobileDrawer>
      )}

      {/* Main Content */}
      <div style={{ padding: '32px' }}>
        {/* Header */}
        <div className="header" style={{ 
          background: 'rgba(255, 255, 255, 0.8)', 
          padding: '32px', 
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          marginBottom: '32px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(20px)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}>
             {isMobile && (
               <button
                 onClick={() => setSidebarOpen(true)}
                 className="mobile-menu-btn mobile-touch-ripple"
               >
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                   <line x1="3" y1="6" x2="21" y2="6"></line>
                   <line x1="3" y1="12" x2="21" y2="12"></line>
                   <line x1="3" y1="18" x2="21" y2="18"></line>
                 </svg>
               </button>
             )}
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                marginBottom: '8px'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                  </svg>
                </div>
                <div>
                  <h1 style={{ 
                    margin: 0, 
                    color: '#0f172a', 
                    fontSize: '32px',
                    fontWeight: '800',
                    letterSpacing: '-0.025em'
                  }}>Task Dashboard</h1>
                  <p style={{ 
                    margin: '4px 0 0 0', 
                    color: '#64748b',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}>Complete task management and analytics</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px rgba(249, 115, 22, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 32px rgba(249, 115, 22, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 24px rgba(249, 115, 22, 0.3)';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              Add New Task
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px', 
          marginBottom: '40px'
        }}>
          <div className={`stats-card ${isMobile ? 'mobile-touch-ripple' : ''}`} style={{ 
            background: 'rgba(255, 255, 255, 0.8)', 
            padding: '24px', 
            borderRadius: '20px', 
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(20px)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)';
          }}
          >
            {/* Background Pattern */}
          <div style={{ 
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.05) 100%)',
              borderRadius: '50%',
              zIndex: 0
            }}></div>
            
            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <div>
                  <div style={{ 
                    fontSize: '36px', 
                    fontWeight: '800', 
                    color: '#3b82f6',
                    marginBottom: '4px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>{stats.total}</div>
                  <div style={{ 
                    color: '#64748b', 
                    fontSize: '14px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Total Tasks</div>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            borderRadius: '12px', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
          </div>
              </div>
              
              {/* Progress Bar */}
          <div style={{ 
                width: '100%',
                height: '6px',
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '3px',
                overflow: 'hidden',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
                  borderRadius: '3px',
                  animation: 'pulse 2s ease-in-out infinite'
                }}></div>
              </div>
              
              {/* Action Button */}
              <button 
                onClick={() => {
                  // Filter to show all tasks
                  setFilter('all');
                  setSelectedCategory('all');
                }}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '8px',
                  color: '#3b82f6',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(59, 130, 246, 0.2)';
                  e.target.style.borderColor = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(59, 130, 246, 0.1)';
                  e.target.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                }}
              >
                View All Tasks
              </button>
            </div>
          </div>
          <div className={`stats-card ${isMobile ? 'mobile-touch-ripple' : ''}`} style={{ 
            background: 'rgba(255, 255, 255, 0.8)', 
            padding: '24px', 
            borderRadius: '20px', 
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(20px)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)';
          }}
          >
            {/* Background Pattern */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
              borderRadius: '50%',
              zIndex: 0
            }}></div>
            
            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <div>
                  <div style={{ 
                    fontSize: '36px', 
                    fontWeight: '800', 
                    color: '#10b981',
                    marginBottom: '4px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>{stats.completed}</div>
                  <div style={{ 
                    color: '#64748b', 
                    fontSize: '14px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Completed</div>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '12px', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
          </div>
              </div>
              
              {/* Circular Progress */}
          <div style={{ 
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'conic-gradient(#10b981 0deg, #10b981 ' + (stats.completed / stats.total * 360) + 'deg, rgba(16, 185, 129, 0.1) ' + (stats.completed / stats.total * 360) + 'deg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                position: 'relative'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
            background: 'white', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#10b981'
                }}>
                  {Math.round((stats.completed / stats.total) * 100)}%
                </div>
              </div>
              
              {/* Action Button */}
              <button 
                onClick={() => {
                  // Filter to show completed tasks
                  setFilter('done');
                  setSelectedCategory('done');
                }}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '8px',
                  color: '#10b981',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(16, 185, 129, 0.2)';
                  e.target.style.borderColor = '#10b981';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(16, 185, 129, 0.1)';
                  e.target.style.borderColor = 'rgba(16, 185, 129, 0.2)';
                }}
              >
                View Completed
              </button>
            </div>
          </div>
          <div className={`stats-card ${isMobile ? 'mobile-touch-ripple' : ''}`} style={{ 
            background: 'rgba(255, 255, 255, 0.8)', 
            padding: '24px', 
            borderRadius: '20px', 
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(20px)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)';
          }}
          >
            {/* Background Pattern */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.05) 100%)',
              borderRadius: '50%',
              zIndex: 0
            }}></div>
            
            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <div>
                  <div style={{ 
                    fontSize: '36px', 
                    fontWeight: '800', 
                    color: '#f97316',
                    marginBottom: '4px',
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>{stats.inProgress}</div>
                  <div style={{ 
                    color: '#64748b', 
                    fontSize: '14px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>In Progress</div>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            borderRadius: '12px', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                  animation: 'spin 2s linear infinite'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
          </div>
              </div>
              
              {/* Progress Bars */}
              <div style={{ marginBottom: '12px' }}>
          <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '4px',
                  fontSize: '11px',
                  color: '#64748b',
                  fontWeight: '600'
                }}>
                  <span>Active</span>
                  <span>{stats.inProgress}</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '4px',
                  background: 'rgba(249, 115, 22, 0.1)',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${(stats.inProgress / stats.total) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #f97316 0%, #ea580c 100%)',
                    borderRadius: '2px',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>
              
              {/* Action Button */}
              <button 
                onClick={() => {
                  // Filter to show in-progress tasks
                  setFilter('in-progress');
                  setSelectedCategory('in-progress');
                }}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  background: 'rgba(249, 115, 22, 0.1)',
                  border: '1px solid rgba(249, 115, 22, 0.2)',
                  borderRadius: '8px',
                  color: '#f97316',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(249, 115, 22, 0.2)';
                  e.target.style.borderColor = '#f97316';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(249, 115, 22, 0.1)';
                  e.target.style.borderColor = 'rgba(249, 115, 22, 0.2)';
                }}
              >
                View Active Tasks
              </button>
            </div>
          </div>
          <div className={`stats-card ${isMobile ? 'mobile-touch-ripple' : ''}`} style={{ 
            background: 'rgba(255, 255, 255, 0.8)', 
            padding: '24px', 
            borderRadius: '20px', 
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(20px)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)';
          }}
          >
            {/* Background Pattern */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)',
              borderRadius: '50%',
              zIndex: 0
            }}></div>
            
            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <div>
                  <div style={{ 
                    fontSize: '36px', 
                    fontWeight: '800', 
                    color: '#8b5cf6',
                    marginBottom: '4px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>{stats.completionRate}%</div>
                  <div style={{ 
                    color: '#64748b', 
                    fontSize: '14px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Completion Rate</div>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            borderRadius: '12px', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
          </div>
              </div>
              
              {/* Donut Chart */}
          <div style={{ 
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: `conic-gradient(#8b5cf6 0deg, #8b5cf6 ${stats.completionRate * 3.6}deg, rgba(139, 92, 246, 0.1) ${stats.completionRate * 3.6}deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                position: 'relative'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
            background: 'white', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#8b5cf6',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  {stats.completionRate}%
                </div>
              </div>
              
              {/* Action Button */}
              <button 
                onClick={() => {
                  // Show all tasks for analytics view
                  setFilter('all');
                  setSelectedCategory('analytics');
                }}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: '8px',
                  color: '#8b5cf6',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(139, 92, 246, 0.2)';
                  e.target.style.borderColor = '#8b5cf6';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(139, 92, 246, 0.1)';
                  e.target.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                }}
              >
                View Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Task Cards Display - Only show when a category is selected */}
        {selectedCategory && (
          <div style={{ marginBottom: '40px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <h2 style={{ 
                color: '#0f172a', 
                fontSize: '24px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                margin: 0
              }}>
                <div style={{
                  width: '4px',
                  height: '24px',
                  background: selectedCategory === 'all' ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' :
                             selectedCategory === 'done' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                             selectedCategory === 'in-progress' ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' :
                             'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  borderRadius: '2px'
                }}></div>
                {selectedCategory === 'all' ? 'All Tasks' :
                 selectedCategory === 'done' ? 'Completed Tasks' :
                 selectedCategory === 'in-progress' ? 'Active Tasks' :
                 selectedCategory === 'analytics' ? 'Analytics Overview' : 'Tasks'}
              </h2>
              <button 
                onClick={() => setSelectedCategory(null)}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '8px',
                  color: '#ef4444',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                  e.target.style.borderColor = '#ef4444';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                  e.target.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                }}
              >
                Close View
              </button>
            </div>
            
            {/* Single Task Card for Selected Category */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '16px',
            padding: '24px', 
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: selectedCategory === 'all' ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' :
                             selectedCategory === 'done' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                             selectedCategory === 'in-progress' ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' :
                             'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            borderRadius: '12px', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedCategory === 'all' ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                    </svg>
                  ) : selectedCategory === 'done' ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  ) : selectedCategory === 'in-progress' ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  )}
                </div>
                <div>
                  <h3 style={{ 
                    margin: 0, 
                    color: '#0f172a', 
                    fontSize: '20px',
                    fontWeight: '700'
                  }}>
                    {selectedCategory === 'all' ? 'All Tasks' :
                     selectedCategory === 'done' ? 'Completed Tasks' :
                     selectedCategory === 'in-progress' ? 'Active Tasks' :
                     selectedCategory === 'analytics' ? 'Analytics Overview' : 'Tasks'}
                  </h3>
                  <p style={{ 
                    margin: 0, 
                    color: '#64748b', 
                    fontSize: '16px'
                  }}>
                    {selectedCategory === 'all' ? `${tasks.length} total tasks` :
                     selectedCategory === 'done' ? `${tasks.filter(t => t.status === 'done').length} completed tasks` :
                     selectedCategory === 'in-progress' ? `${tasks.filter(t => t.status === 'in-progress').length} active tasks` :
                     selectedCategory === 'analytics' ? `${tasks.length} tasks for analysis` : 'Tasks'}
                  </p>
          </div>
        </div>
              
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {(() => {
                  let filteredTasks = [];
                  if (selectedCategory === 'all') {
                    filteredTasks = tasks;
                  } else if (selectedCategory === 'done') {
                    filteredTasks = tasks.filter(t => t.status === 'done');
                  } else if (selectedCategory === 'in-progress') {
                    filteredTasks = tasks.filter(t => t.status === 'in-progress');
                  } else if (selectedCategory === 'analytics') {
                    filteredTasks = tasks;
                  }
                  
                  return filteredTasks.map(task => (
                    <div key={task._id} style={{
                      padding: '16px',
                      background: selectedCategory === 'all' ? 'rgba(59, 130, 246, 0.05)' :
                                 selectedCategory === 'done' ? 'rgba(16, 185, 129, 0.05)' :
                                 selectedCategory === 'in-progress' ? 'rgba(249, 115, 22, 0.05)' :
                                 'rgba(139, 92, 246, 0.05)',
                      borderRadius: '12px',
                      marginBottom: '12px',
                      border: selectedCategory === 'all' ? '1px solid rgba(59, 130, 246, 0.1)' :
                             selectedCategory === 'done' ? '1px solid rgba(16, 185, 129, 0.1)' :
                             selectedCategory === 'in-progress' ? '1px solid rgba(249, 115, 22, 0.1)' :
                             '1px solid rgba(139, 92, 246, 0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => setSelectedTask(task)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = selectedCategory === 'all' ? 'rgba(59, 130, 246, 0.1)' :
                                                      selectedCategory === 'done' ? 'rgba(16, 185, 129, 0.1)' :
                                                      selectedCategory === 'in-progress' ? 'rgba(249, 115, 22, 0.1)' :
                                                      'rgba(139, 92, 246, 0.1)';
                      e.currentTarget.style.borderColor = selectedCategory === 'all' ? 'rgba(59, 130, 246, 0.2)' :
                                                      selectedCategory === 'done' ? 'rgba(16, 185, 129, 0.2)' :
                                                      selectedCategory === 'in-progress' ? 'rgba(249, 115, 22, 0.2)' :
                                                      'rgba(139, 92, 246, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = selectedCategory === 'all' ? 'rgba(59, 130, 246, 0.05)' :
                                                      selectedCategory === 'done' ? 'rgba(16, 185, 129, 0.05)' :
                                                      selectedCategory === 'in-progress' ? 'rgba(249, 115, 22, 0.05)' :
                                                      'rgba(139, 92, 246, 0.05)';
                      e.currentTarget.style.borderColor = selectedCategory === 'all' ? 'rgba(59, 130, 246, 0.1)' :
                                                      selectedCategory === 'done' ? 'rgba(16, 185, 129, 0.1)' :
                                                      selectedCategory === 'in-progress' ? 'rgba(249, 115, 22, 0.1)' :
                                                      'rgba(139, 92, 246, 0.1)';
                    }}
                    >
                      <div style={{ 
                        fontSize: '16px', 
                        fontWeight: '600', 
                        color: '#0f172a',
                        marginBottom: '6px'
                      }}>{task.title}</div>
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#64748b',
                        textTransform: 'capitalize',
                        marginBottom: '4px'
                      }}>{task.status} • {task.priority} • {task.category}</div>
                      {task.description && (
                        <div style={{ 
                          fontSize: '13px', 
                          color: '#64748b',
                          fontStyle: 'italic',
                          marginTop: '4px'
                        }}>{task.description}</div>
                      )}
                    </div>
                  ));
                })()}
                
                {(() => {
                  let filteredTasks = [];
                  if (selectedCategory === 'all') {
                    filteredTasks = tasks;
                  } else if (selectedCategory === 'done') {
                    filteredTasks = tasks.filter(t => t.status === 'done');
                  } else if (selectedCategory === 'in-progress') {
                    filteredTasks = tasks.filter(t => t.status === 'in-progress');
                  } else if (selectedCategory === 'analytics') {
                    filteredTasks = tasks;
                  }
                  
                  if (filteredTasks.length === 0) {
                    return (
                      <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        color: '#64748b',
                        fontSize: '16px',
                        fontStyle: 'italic'
                      }}>
                        {selectedCategory === 'all' ? 'No tasks available' :
                         selectedCategory === 'done' ? 'No completed tasks yet' :
                         selectedCategory === 'in-progress' ? 'No active tasks' :
                         'No tasks for analysis'}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Task Details */}
        {selectedTask && (
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
                    onClick={async () => activeTimer === selectedTask.id ? await stopTimer(selectedTask.id) : await startTimer(selectedTask.id)}
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
                  onClick={async () => {
                    const statusOrder = ['todo', 'in-progress', 'done'];
                    const currentIndex = statusOrder.indexOf(selectedTask.status);
                    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
                    await updateTaskStatus(selectedTask.id, nextStatus);
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
        )}

        {/* Task Modal */}
        <TaskModal 
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onAddTask={addTask}
        />
        
        {/* Notification Modal */}
        <NotificationModal
          isOpen={notification.isOpen}
          onClose={closeNotification}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          duration={5000}
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
      const response = await authAPI.login({
          email: email,
          password: password
      });

      if (response.data) {
        // Store user data and token
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
        
        // Redirect to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(error.response?.data?.message || 'Login failed. Please try again.');
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
      const response = await fetch('https://aufgabenplanung.onrender.com/api/auth/register', {
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
    <ErrorBoundary>
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={isLoggedIn ? <ResponsiveDashboard /> : <Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ResponsiveDashboard />} />
          <Route path="*" element={isLoggedIn ? <ResponsiveDashboard /> : <Login />} />
        </Routes>
      </div>
    </Router>
    </ErrorBoundary>
  );
}

export default App;

