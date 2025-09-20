import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';

// Simple Login Component
const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (email && password) {
      // Mock login - store in localStorage and redirect
      localStorage.setItem('user', JSON.stringify({ email, name: 'User' }));
      navigate('/dashboard');
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
          <div style={{ 
            fontSize: '48px', 
            marginBottom: '10px' 
          }}>📋</div>
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
                transition: 'border-color 0.2s',
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
                transition: 'border-color 0.2s',
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
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            🚀 Login / Register
          </button>
        </form>
        
        <p style={{ 
          textAlign: 'center', 
          marginTop: '20px', 
          color: '#6b7280',
          fontSize: '14px'
        }}>
          Use any email and password to test the application
        </p>
      </div>
    </div>
  );
};

// Dashboard Component with All Features
const Dashboard = () => {
  const [tasks, setTasks] = useState([
    { 
      id: 1, 
      title: 'Complete Project Proposal', 
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

  const [newTask, setNewTask] = useState({ title: '', category: 'personal', priority: 'medium', timeFrame: 'custom' });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTimer, setActiveTimer] = useState(null);

  const addTask = () => {
    if (newTask.title) {
      const task = {
        id: tasks.length + 1,
        ...newTask,
        status: 'todo',
        progress: 0,
        estimatedHours: 0,
        actualHours: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tags: []
      };
      setTasks([...tasks, task]);
      setNewTask({ title: '', category: 'personal', priority: 'medium', timeFrame: 'custom' });
      setShowCreateForm(false);
    }
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
    // In a real app, this would start actual time tracking
  };

  const stopTimer = (id) => {
    setActiveTimer(null);
    // Update actual hours
    setTasks(tasks.map(task => 
      task.id === id 
        ? { ...task, actualHours: task.actualHours + 0.5 } // Mock 30 minutes
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
      fontFamily: 'Arial, sans-serif' 
    }}>
      {/* Header */}
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div>
            <h1 style={{ margin: 0, color: '#374151', fontSize: '28px' }}>📊 Task Dashboard</h1>
            <p style={{ margin: '5px 0 0 0', color: '#6b7280' }}>Complete task management and analytics</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
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
            ➕ New Task
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
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

        {/* Create Task Form */}
        {showCreateForm && (
          <div style={{ 
            background: 'white', 
            padding: '24px', 
            borderRadius: '12px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            marginBottom: '30px'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#374151' }}>Create New Task</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                style={{
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
              <select
                value={newTask.category}
                onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                style={{
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              >
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="health">Health</option>
                <option value="finance">Finance</option>
                <option value="education">Education</option>
              </select>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                style={{
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
              <select
                value={newTask.timeFrame}
                onChange={(e) => setNewTask({...newTask, timeFrame: e.target.value})}
                style={{
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="annually">Annually</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={addTask}
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
                ✅ Create Task
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
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
                ❌ Cancel
              </button>
            </div>
          </div>
        )}

        {/* Tasks List */}
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ margin: 0, color: '#374151' }}>Your Tasks</h2>
          </div>
          <div style={{ padding: '0' }}>
            {tasks.map(task => (
              <div key={task.id} style={{
                padding: '20px',
                borderBottom: '1px solid #f3f4f6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: task.status === 'done' ? '#f0fdf4' : 
                           task.status === 'in-progress' ? '#fef3c7' : 'white'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0, color: '#374151', fontSize: '18px' }}>{task.title}</h3>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'white',
                      background: getStatusColor(task.status)
                    }}>
                      {task.status.replace('-', ' ').toUpperCase()}
                    </span>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'white',
                      background: getPriorityColor(task.priority)
                    }}>
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', color: '#6b7280', fontSize: '14px' }}>
                    <span>📅 {task.timeFrame}</span>
                    <span>🏷️ {task.category}</span>
                    <span>⏱️ {task.estimatedHours}h estimated</span>
                    <span>✅ {task.progress}% complete</span>
                  </div>
                  {task.tags.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      {task.tags.map((tag, index) => (
                        <span key={index} style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          background: '#e5e7eb',
                          color: '#374151',
                          borderRadius: '4px',
                          fontSize: '12px',
                          marginRight: '8px'
                        }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {task.status === 'in-progress' && (
                    <button
                      onClick={() => activeTimer === task.id ? stopTimer(task.id) : startTimer(task.id)}
                      style={{
                        padding: '8px 16px',
                        background: activeTimer === task.id ? '#ef4444' : '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      {activeTimer === task.id ? '⏹️ Stop' : '▶️ Start'}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const statusOrder = ['todo', 'in-progress', 'done'];
                      const currentIndex = statusOrder.indexOf(task.status);
                      const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
                      updateTaskStatus(task.id, nextStatus);
                    }}
                    style={{
                      padding: '8px 16px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    {task.status === 'todo' ? '▶️ Start' : 
                     task.status === 'in-progress' ? '✅ Complete' : '🔄 Reset'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Showcase */}
        <div style={{ 
          marginTop: '30px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '30px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h2 style={{ margin: '0 0 20px 0' }}>🎉 Complete Task Scheduler Features</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '20px',
            textAlign: 'left'
          }}>
            <div>
              <h3>📊 Interactive Dashboard</h3>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Real-time analytics</li>
                <li>Task breakdown by category</li>
                <li>Productivity tracking</li>
                <li>Export functionality</li>
              </ul>
            </div>
            <div>
              <h3>📧 Email Notifications</h3>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Start date alerts</li>
                <li>Deadline reminders</li>
                <li>Overdue notifications</li>
                <li>Beautiful HTML templates</li>
              </ul>
            </div>
            <div>
              <h3>⏱️ Time Tracking</h3>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Start/stop timers</li>
                <li>Progress indicators</li>
                <li>Status management</li>
                <li>Visual progress tracking</li>
              </ul>
            </div>
            <div>
              <h3>🚀 Quick Creation</h3>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Pre-built templates</li>
                <li>Smart date calculation</li>
                <li>Flexible time frames</li>
                <li>One-click application</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in
  React.useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={isLoggedIn ? <Dashboard /> : <Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={isLoggedIn ? <Dashboard /> : <Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

