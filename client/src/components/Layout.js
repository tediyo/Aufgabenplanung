import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  Plus, 
  BarChart3, 
  User, 
  Menu, 
  X,
  Bell,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Create Task', href: '/tasks/create', icon: Plus },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-[99998] bg-black bg-opacity-50 md:hidden sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-[99999] w-64 bg-gray-900 text-white transform transition-transform duration-300 md:static md:translate-x-0 sidebar-overlay ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <CheckSquare className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">Task Scheduler</span>
          </div>
          <button
            className="p-2 rounded-md hover:bg-gray-700 md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
              <span className="text-sm font-medium">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <div className="flex items-center space-x-1">
              <Link
                to="/profile"
                className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-gray-700"
                title="Profile Settings"
              >
                <Settings className="h-4 w-4" />
              </Link>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-gray-700"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="flex items-center justify-between p-4 bg-white shadow-md md:hidden relative z-40">
          <button
            className="p-2 rounded-md border border-gray-300 hover:bg-gray-50"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Task Scheduler</h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 bg-gray-50 dashboard-content">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;



