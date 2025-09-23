import React from 'react';
import useResponsive from '../hooks/useResponsive';

const ResponsiveTest = () => {
  const { screenSize, breakpoint, isMobile, isTablet, isDesktop, getGridCols, getCardPadding, getTextSize } = useResponsive();

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs z-40">
      <div className="space-y-1">
        <div>Screen: {screenSize.width}x{screenSize.height}</div>
        <div>Breakpoint: {breakpoint}</div>
        <div>Mobile: {isMobile ? 'Yes' : 'No'}</div>
        <div>Tablet: {isTablet ? 'Yes' : 'No'}</div>
        <div>Desktop: {isDesktop ? 'Yes' : 'No'}</div>
        <div>Stats Grid: {getGridCols('stats')}</div>
        <div>Tasks Grid: {getGridCols('tasks')}</div>
        <div>Card Padding: {getCardPadding()}</div>
        <div>Text Size: {getTextSize('heading')}</div>
      </div>
    </div>
  );
};

export default ResponsiveTest;
