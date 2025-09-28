import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-blue-500 to-orange-400 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-1 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div className="text-sm text-blue-100">
            © {currentYear} Personal Task Management Tool. All rights reserved.
          </div>
          <div className="text-sm text-blue-100">
            Made with ❤️ by <span className="font-semibold text-white">@Tewodros</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;