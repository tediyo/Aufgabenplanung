import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import ResponsiveDashboard from './components/ResponsiveDashboard';
import NotificationModal from './components/NotificationModal';
import Logo from './components/Logo';
import GoogleLoginButton from './components/GoogleLoginButton';
import GoogleCallback from './pages/GoogleCallback';
import Profile from './pages/Profile';
import MiniModal from './components/MiniModal';

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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-4">We're sorry, but something unexpected happened.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-orange-400 text-white rounded-lg hover:from-blue-600 hover:to-orange-500 transition-all"
            >
              Reload Page
        </button>
      </div>
    </div>
  );
    }

    return this.props.children;
  }
}

// Login Component
const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', message: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (email && password) {
      setIsLoading(true);
      try {
        
        // Call the server API for login
        const response = await fetch('https://aufgabenplanung.onrender.com/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          const { token, user } = data;
          
          // Store token in sessionStorage for this session only
          sessionStorage.setItem('authToken', token);
          sessionStorage.setItem('userEmail', user.email);
          
          navigate('/dashboard');
        } else {
          throw new Error(data.message || 'Login failed');
        }
      } catch (error) {
        console.error('❌ Login error:', error);
        setModal({
          isOpen: true,
          type: 'error',
          title: 'Login Failed',
          message: error.message
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSuccess = (user) => {
    setGoogleLoading(false);
    
    // No localStorage - user data will be fetched from server when needed
    navigate('/dashboard');
  };

  const handleGoogleError = (error) => {
    setGoogleLoading(false);
    console.error('Google login error:', error);
    setModal({
      isOpen: true,
      type: 'error',
      title: 'Google Login Failed',
      message: error
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-orange-400 to-yellow-400 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="xl" />
                </div>
          <h1 className="text-2xl font-bold text-gray-900">Task Scheduler</h1>
          <p className="text-gray-600 mt-2">Complete Task Management Solution</p>
        </div>

        {/* Google Login Button */}
        <div className="mb-6">
          <GoogleLoginButton
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            text={googleLoading ? "Signing in with Google..." : "Continue with Google"}
            disabled={googleLoading}
          />
              </div>
              
        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
              </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

        <form onSubmit={handleLogin} className="space-y-6">
                <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-orange-400 text-white rounded-lg hover:from-blue-600 hover:to-orange-500 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : ' Login / Register'}
          </button>
        </form>
        
        <p className="text-center text-sm text-gray-500 mt-6">
          Use any email and password to test the application
        </p>
        
        <div className="text-center mt-4">
          <button
            onClick={() => navigate('/register')}
            className="text-blue-500 hover:text-orange-500 font-medium text-sm transition-colors"
          >
            Don't have an account? Create one here
          </button>
        </div>
      </div>
      
      {/* Mini Modal */}
      <MiniModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />
    </div>
  );
};

// Register Component - Updated
const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', message: '' });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Password Mismatch',
        message: 'Passwords do not match. Please make sure both password fields are identical.'
      });
      return;
    }

    setIsLoading(true);
    try {
      
      // Test server connectivity first
      const testResponse = await fetch('https://aufgabenplanung.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const testData = await testResponse.json();
      
      if (testResponse.ok) {
        const { token, user } = testData;
        
        // Store token and email (if provided)
        sessionStorage.setItem('authToken', token);
        if (user?.email) {
          sessionStorage.setItem('userEmail', user.email);
        }
        // Store token and email
        sessionStorage.setItem('authToken', token);
        if (user?.email) {
          sessionStorage.setItem('userEmail', user.email);
        }
        
        navigate('/dashboard');
      } else {
        // Handle specific error cases
        if (testResponse.status === 400 && testData.message === 'User already exists with this email') {
          setModal({
            isOpen: true,
            type: 'error',
            title: 'Registration Failed',
            message: 'An account with this email already exists. Please use a different email or try logging in.'
          });
        } else if (testResponse.status === 400 && testData.errors) {
          // Handle validation errors
          const errorMessages = testData.errors.map(err => err.msg).join(', ');
          setModal({
            isOpen: true,
            type: 'error',
            title: 'Registration Failed',
            message: errorMessages
          });
        } else {
          throw new Error(`Server returned ${testResponse.status}: ${testData.message || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Registration Failed',
        message: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = (user) => {
    setGoogleLoading(false);
    
    // No localStorage - user data will be fetched from server when needed
    navigate('/dashboard');
  };

  const handleGoogleError = (error) => {
    setGoogleLoading(false);
    console.error('Google login error:', error);
    setModal({
      isOpen: true,
      type: 'error',
      title: 'Google Login Failed',
      message: error
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-orange-400 to-yellow-400 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Join Task Scheduler today</p>
        </div>
        
        {/* Google Login Button */}
        <div className="mb-6">
          <GoogleLoginButton
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            text={googleLoading ? "Signing up with Google..." : "Sign up with Google"}
            disabled={googleLoading}
          />
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or create account with email</span>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
              <input
              type="password"
                value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Create a password"
                required
              />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
              <input
              type="password"
                value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm your password"
                required
              />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-orange-400 text-white rounded-lg hover:from-blue-600 hover:to-orange-500 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : ' Create Account'}
          </button>
        </form>
        
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-blue-500 hover:text-orange-500 font-medium transition-colors"
          >
            Sign in here
          </button>
        </p>
        
        <div className="text-center mt-2">
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-700 font-medium text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </div>
      
      {/* Mini Modal */}
      <MiniModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem('authToken');
  const userEmail = sessionStorage.getItem('userEmail');
  
  if (!token && !userEmail) {
    window.location.href = '/login';
    return null;
  }
  
  return children;
};

// Main App Component
function App() {
  // Derive auth state from sessionStorage each render to avoid stale state
  const isLoggedIn = !!sessionStorage.getItem('authToken') || !!sessionStorage.getItem('userEmail');

  return (
    <ErrorBoundary>
    <Router>
      <div className="App">
        <Routes>
            <Route path="/" element={isLoggedIn ? <ResponsiveDashboard /> : <Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><ResponsiveDashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/auth/google/callback" element={<GoogleCallback />} />
            <Route path="*" element={isLoggedIn ? <ResponsiveDashboard /> : <Login />} />
        </Routes>
          <NotificationModal />
      </div>
    </Router>
    </ErrorBoundary>
  );
}

export default App;
