import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const MiniModal = ({ isOpen, onClose, type = 'info', title, message, duration = 4000 }) => {
  React.useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-white" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-white" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-white" />;
      default:
        return <Info className="w-4 h-4 text-white" />;
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-green-600';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-red-600';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
      default:
        return 'bg-gradient-to-r from-blue-500 to-orange-400';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-xs w-full">
      {/* Modal */}
      <div className={`relative ${getGradient()} rounded-md shadow-lg p-3 transform transition-all duration-300 ease-in-out`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-1 right-1 p-0.5 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
        >
          <X className="w-2.5 h-2.5 text-white" />
        </button>
        
        {/* Content */}
        <div className="flex items-center space-x-2 pr-5">
          {getIcon()}
          <div className="flex-1">
            {title && (
              <h3 className="text-xs font-semibold text-white mb-0.5">
                {title}
              </h3>
            )}
            <p className="text-white text-xs leading-tight opacity-90">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniModal;
