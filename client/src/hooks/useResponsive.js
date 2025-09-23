import { useState, useEffect } from 'react';

const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  const [breakpoint, setBreakpoint] = useState('lg');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });

      // Determine breakpoint
      if (width < 475) {
        setBreakpoint('xs');
      } else if (width < 640) {
        setBreakpoint('sm');
      } else if (width < 768) {
        setBreakpoint('md');
      } else if (width < 1024) {
        setBreakpoint('lg');
      } else if (width < 1280) {
        setBreakpoint('xl');
      } else {
        setBreakpoint('2xl');
      }
    };

    // Set initial size
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = breakpoint === 'xs' || breakpoint === 'sm';
  const isTablet = breakpoint === 'md' || breakpoint === 'lg';
  const isDesktop = breakpoint === 'xl' || breakpoint === '2xl';

  const getGridCols = (type) => {
    switch (type) {
      case 'stats':
        if (isMobile) return 'grid-cols-1 xs:grid-cols-2';
        if (isTablet) return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
        return 'grid-cols-4 xl:grid-cols-4';
      
      case 'tasks':
        if (isMobile) return 'grid-cols-1';
        if (isTablet) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2';
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5';
      
      case 'charts':
        if (isMobile) return 'grid-cols-1';
        if (isTablet) return 'grid-cols-1';
        return 'grid-cols-1 xl:grid-cols-2';
      
      case 'recent':
        if (isMobile) return 'grid-cols-1';
        if (isTablet) return 'grid-cols-1';
        return 'grid-cols-1 xl:grid-cols-2';
      
      default:
        return 'grid-cols-1';
    }
  };

  const getCardPadding = () => {
    if (isMobile) return 'p-4';
    if (isTablet) return 'p-4 sm:p-5 md:p-6';
    return 'p-4 sm:p-5 md:p-6 lg:p-8';
  };

  const getTextSize = (type) => {
    if (isMobile) {
      switch (type) {
        case 'heading': return 'text-lg sm:text-xl';
        case 'subheading': return 'text-base sm:text-lg';
        case 'body': return 'text-sm';
        case 'small': return 'text-xs';
        default: return 'text-sm';
      }
    }
    if (isTablet) {
      switch (type) {
        case 'heading': return 'text-xl sm:text-2xl lg:text-3xl';
        case 'subheading': return 'text-lg sm:text-xl';
        case 'body': return 'text-sm sm:text-base';
        case 'small': return 'text-xs sm:text-sm';
        default: return 'text-sm sm:text-base';
      }
    }
    return 'text-base sm:text-lg lg:text-xl';
  };

  return {
    screenSize,
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    getGridCols,
    getCardPadding,
    getTextSize,
  };
};

export default useResponsive;
