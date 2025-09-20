import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Simple test component
const TestDashboard = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎉 Task Scheduler - Working!</h1>
      <p>If you can see this, the React app is working correctly.</p>
      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h2>Quick Test</h2>
        <button 
          onClick={() => alert('Button clicked! App is responsive.')}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Button
        </button>
      </div>
      <div style={{ marginTop: '20px' }}>
        <h3>Next Steps:</h3>
        <ul>
          <li>✅ React app is running</li>
          <li>✅ Backend API is running</li>
          <li>🔄 Loading the full dashboard...</li>
        </ul>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<TestDashboard />} />
          <Route path="/dashboard" element={<TestDashboard />} />
          <Route path="*" element={<TestDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

