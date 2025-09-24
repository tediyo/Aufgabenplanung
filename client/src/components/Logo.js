import React from 'react';

const Logo = ({ size = 'default', className = '' }) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-8 h-8';
      case 'medium':
        return 'w-12 h-12';
      case 'large':
        return 'w-16 h-16';
      case 'xl':
        return 'w-20 h-20';
      default:
        return 'w-10 h-10';
    }
  };

  return (
    <div className={`flex items-center justify-center ${getSizeClasses()} ${className}`}>
      <div className="relative">
        {/* Background circle for better visibility */}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full"></div>
        
        {/* Logo image */}
        <div className="relative w-full h-full rounded-full overflow-hidden shadow-lg">
          <img 
            src="/images/pmp5.png" 
            alt="PPM Logo" 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to emoji if image fails to load
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          {/* Fallback emoji logo */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center" style={{ display: 'none' }}>
            <div className="w-3/4 h-3/4 bg-white rounded-full flex items-center justify-center">
              <div className="text-blue-600 font-bold text-lg">📋</div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>
    </div>
  );
};

export default Logo;
