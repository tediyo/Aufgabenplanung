import React from 'react';

const SidebarFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="mt-auto p-4 border-t border-gray-700">
      <div className="text-center text-xs text-gray-400 space-y-1">
        <div>© {currentYear} Task Scheduler. All rights reserved.</div>
        <div>Made with ❤️ by <span className="text-white font-semibold">@Tewodros</span></div>
      </div>
    </div>
  );
};

export default SidebarFooter;
