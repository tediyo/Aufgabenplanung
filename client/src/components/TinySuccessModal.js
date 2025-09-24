import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

const TinySuccessModal = ({ isOpen, onClose, message, duration = 3000 }) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div 
        className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm"
        style={{ 
          background: 'linear-gradient(white, white) padding-box, linear-gradient(45deg, #10b981, #059669, #047857, #ffffff) border-box',
          border: '2px solid transparent'
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TinySuccessModal;
