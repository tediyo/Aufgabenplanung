import React, { useState, useRef, useEffect } from 'react';
import { useIntersectionObserver } from '../hooks/useMobileOptimization';

const LazyLoadWrapper = ({ 
  children, 
  fallback = <div className="animate-pulse bg-gray-200 rounded h-32" />,
  threshold = 0.1,
  rootMargin = '50px'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef();
  const { isIntersecting } = useIntersectionObserver(ref, { threshold, rootMargin });

  useEffect(() => {
    if (isIntersecting && !isLoaded) {
      // Add a small delay to prevent too many components loading at once
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isIntersecting, isLoaded]);

  return (
    <div ref={ref}>
      {isLoaded ? children : fallback}
    </div>
  );
};

export default LazyLoadWrapper;
