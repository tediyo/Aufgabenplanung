// Utility functions for testing responsive design
export const testResponsiveBreakpoints = () => {
  const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  };

  const currentWidth = window.innerWidth;
  const currentHeight = window.innerHeight;
  
  const activeBreakpoint = Object.entries(breakpoints)
    .reverse()
    .find(([name, width]) => currentWidth >= width)?.[0] || 'xs';

  return {
    currentWidth,
    currentHeight,
    activeBreakpoint,
    isMobile: currentWidth < 1024,
    isTablet: currentWidth >= 768 && currentWidth < 1024,
    isDesktop: currentWidth >= 1024,
    breakpoints
  };
};

export const testTouchCapability = () => {
  return {
    hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    isMobileDevice: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  };
};

export const testPerformance = () => {
  if (!('performance' in window)) {
    return { error: 'Performance API not available' };
  }

  const navigation = performance.getEntriesByType('navigation')[0];
  const paint = performance.getEntriesByType('paint');
  
  return {
    loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
    domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
    firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
    firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
    memoryUsage: performance.memory ? {
      used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
    } : null
  };
};

export const logResponsiveInfo = () => {
  console.group('📱 Responsive Design Test');
  console.log('Breakpoints:', testResponsiveBreakpoints());
  console.log('Touch Capability:', testTouchCapability());
  console.log('Performance:', testPerformance());
  console.groupEnd();
};

// Auto-run test in development
if (process.env.NODE_ENV === 'development') {
  window.addEventListener('load', () => {
    setTimeout(logResponsiveInfo, 1000);
  });
}
