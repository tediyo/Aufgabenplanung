import React from 'react';
import { Heart, Code, Coffee } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-blue-500 to-orange-400 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">T</span>
              </div>
              <h3 className="text-xl font-bold">Task Scheduler</h3>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed">
              Complete task management solution designed to help you stay organized and productive.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/tasks" className="text-blue-100 hover:text-white transition-colors">
                  My Tasks
                </a>
              </li>
              <li>
                <a href="/dashboard" className="text-blue-100 hover:text-white transition-colors">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/reports" className="text-blue-100 hover:text-white transition-colors">
                  Reports
                </a>
              </li>
              <li>
                <a href="/profile" className="text-blue-100 hover:text-white transition-colors">
                  Profile
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact</h4>
            <div className="space-y-2 text-sm">
              <p className="text-blue-100">
                <span className="font-medium">Developer:</span> Tewodros Berhanu
              </p>
              <p className="text-blue-100">
                <span className="font-medium">Email:</span> thedronberhanu19@gmail.com
              </p>
              <div className="flex items-center space-x-1 text-blue-100">
                <span className="font-medium">Built with:</span>
                <Heart className="w-4 h-4 text-red-300" />
                <Code className="w-4 h-4 text-blue-200" />
                <Coffee className="w-4 h-4 text-yellow-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-blue-400/30 mt-8 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-sm text-blue-100">
              © {currentYear} Task Scheduler. All rights reserved.
            </div>
            <div className="text-sm text-blue-100">
              Made with ❤️ by <span className="font-semibold text-white">@Tewodros</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
