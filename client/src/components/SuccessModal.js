import React from 'react';
import { CheckCircle, X } from 'lucide-react';

const SuccessModal = ({ isOpen, onClose, onCreateAnother, taskTitle, taskDescription }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-sm sm:max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl relative" style={{ 
        background: 'linear-gradient(white, white) padding-box, linear-gradient(45deg, #10b981, #059669, #047857, #ffffff) border-box',
        border: '3px solid transparent'
      }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">✅ Task Created Successfully!</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Task Created Successfully!</h3>
            <p className="text-gray-600">Your task has been saved and is ready to use.</p>
          </div>

          {/* Task Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Task Details:</h4>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-600">Title:</span>
                <p className="text-sm text-gray-900 font-medium">{taskTitle}</p>
              </div>
              {taskDescription && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Description:</span>
                  <p className="text-sm text-gray-900">{taskDescription}</p>
                </div>
              )}
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-green-700">Your task is now in your task list and ready to use.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium text-sm sm:text-base"
            >
              Continue
            </button>
            <button
              onClick={onCreateAnother}
              className="flex-1 px-3 py-2 sm:px-4 sm:py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm sm:text-base"
            >
              Create Another
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
