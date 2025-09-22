import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

const NotificationModal = ({ 
  isOpen, 
  onClose, 
  type = 'success', 
  title, 
  message, 
  duration = 3000 
}) => {
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
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-8 w-8 text-yellow-500" />;
      case 'info':
        return <Info className="h-8 w-8 text-blue-500" />;
      default:
        return <CheckCircle className="h-8 w-8 text-green-500" />;
    }
  };


  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }}>
      <div style={{
        maxWidth: '28rem',
        width: '100%',
        margin: '0 1rem',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        background: 'white',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        border: '4px solid transparent',
        backgroundClip: 'padding-box'
      }}>
        {/* Colorful Border Overlay */}
        <div style={{
          position: 'absolute',
          top: '-4px',
          left: '-4px',
          right: '-4px',
          bottom: '-4px',
          background: 'linear-gradient(90deg, #fbbf24 0%, #f97316 25%, #3b82f6 50%, #fbbf24 75%, #f97316 100%)',
          borderRadius: '0.75rem',
          zIndex: -1
        }}></div>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <div style={{ flexShrink: 0 }}>
            {getIcon()}
          </div>
          <div style={{ marginLeft: '0.75rem', flex: 1 }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0
            }}>
              {title}
            </h3>
            <p style={{
              marginTop: '0.25rem',
              fontSize: '0.875rem',
              color: '#6b7280',
              margin: '0.25rem 0 0 0'
            }}>
              {message}
            </p>
          </div>
          <div style={{ marginLeft: '1rem', flexShrink: 0 }}>
            <button
              onClick={onClose}
              style={{
                display: 'inline-flex',
                borderRadius: '0.375rem',
                padding: '0.375rem',
                color: '#6b7280',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = '0.75';
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = '1';
              }}
            >
              <span style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>Close</span>
              <svg style={{ height: '1.25rem', width: '1.25rem' }} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
