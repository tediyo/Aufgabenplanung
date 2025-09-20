import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Simple Dashboard Component
const Dashboard = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Sample Task 1', status: 'todo', priority: 'high' },
    { id: 2, title: 'Sample Task 2', status: 'in-progress', priority: 'medium' },
    { id: 3, title: 'Sample Task 3', status: 'done', priority: 'low' }
  ]);

  const addTask = () => {
    const newTask = {
      id: tasks.length + 1,
      title: `New Task ${tasks.length + 1}`,
      status: 'todo',
      priority: 'medium'
    };
    setTasks([...tasks, newTask]);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>📊 Task Scheduler Dashboard</h1>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ 
          background: '#f0f8ff', 
          padding: '20px', 
          borderRadius: '8px', 
          flex: 1,
          textAlign: 'center'
        }}>
          <h3>Total Tasks</h3>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#2563eb' }}>
            {tasks.length}
          </div>
        </div>
        
        <div style={{ 
          background: '#f0fdf4', 
          padding: '20px', 
          borderRadius: '8px', 
          flex: 1,
          textAlign: 'center'
        }}>
          <h3>Completed</h3>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#16a34a' }}>
            {tasks.filter(t => t.status === 'done').length}
          </div>
        </div>
        
        <div style={{ 
          background: '#fef3c7', 
          padding: '20px', 
          borderRadius: '8px', 
          flex: 1,
          textAlign: 'center'
        }}>
          <h3>In Progress</h3>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#d97706' }}>
            {tasks.filter(t => t.status === 'in-progress').length}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={addTask}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ➕ Add New Task
        </button>
      </div>

      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
        <h2 style={{ padding: '20px', margin: 0, borderBottom: '1px solid #e5e7eb' }}>
          Your Tasks
        </h2>
        <div style={{ padding: '20px' }}>
          {tasks.map(task => (
            <div key={task.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '15px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              marginBottom: '10px',
              background: task.status === 'done' ? '#f0fdf4' : 
                         task.status === 'in-progress' ? '#fef3c7' : '#f9fafb'
            }}>
              <div>
                <h4 style={{ margin: 0, color: '#374151' }}>{task.title}</h4>
                <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                  Status: {task.status} | Priority: {task.priority}
                </p>
              </div>
              <div>
                <button 
                  onClick={() => {
                    const newStatus = task.status === 'todo' ? 'in-progress' : 
                                    task.status === 'in-progress' ? 'done' : 'todo';
                    setTasks(tasks.map(t => t.id === task.id ? {...t, status: newStatus} : t));
                  }}
                  style={{
                    padding: '5px 15px',
                    backgroundColor: task.status === 'done' ? '#16a34a' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {task.status === 'todo' ? 'Start' : 
                   task.status === 'in-progress' ? 'Complete' : 'Reset'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px' }}>
        <h3>🎉 Features Working:</h3>
        <ul style={{ color: '#374151' }}>
          <li>✅ Task creation and management</li>
          <li>✅ Status tracking (Todo → In Progress → Done)</li>
          <li>✅ Priority levels</li>
          <li>✅ Interactive dashboard</li>
          <li>✅ Real-time updates</li>
        </ul>
      </div>
    </div>
  );
};

// Simple Login Component
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (email && password) {
      // Mock login - just redirect to dashboard
      window.location.href = '/dashboard';
    } else {
      alert('Please enter email and password');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#374151' }}>
          🚀 Task Scheduler
        </h1>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#374151' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '16px'
              }}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#374151' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '16px'
              }}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Login / Register
          </button>
        </form>
        
        <p style={{ 
          textAlign: 'center', 
          marginTop: '20px', 
          color: '#6b7280',
          fontSize: '14px'
        }}>
          Use any email and password to test
        </p>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in (simple check)
  React.useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath === '/dashboard') {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

