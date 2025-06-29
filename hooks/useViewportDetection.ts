import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

interface ViewportDetectionOptions {
  threshold?: number;
  rootMargin?: number;
}

export function useViewportDetection(
  options: ViewportDetectionOptions = {}
) {
  const { threshold = 0.5, rootMargin = 0 } = options;
  const [isInViewport, setIsInViewport] = useState(false);
  const viewRef = useRef<View>(null);

  useEffect(() => {
    const checkViewport = () => {
      if (!viewRef.current) return;

      viewRef.current.measure((x, y, width, height, pageX, pageY) => {
        // Get window dimensions
        const windowHeight = require('react-native').Dimensions.get('window').height;
        
        // Calculate if element is in viewport
        const elementTop = pageY;
        const elementBottom = pageY + height;
        const viewportTop = -rootMargin;
        const viewportBottom = windowHeight + rootMargin;
        
        // Check if the required threshold of the element is visible
        const visibleHeight = Math.min(elementBottom, viewportBottom) - Math.max(elementTop, viewportTop);
        const elementHeight = height;
        const visibilityRatio = Math.max(0, visibleHeight) / elementHeight;
        
        const inViewport = visibilityRatio >= threshold;
        setIsInViewport(inViewport);
      });
    };

    // Initial check
    const timer = setTimeout(checkViewport, 100);

    return () => clearTimeout(timer);
  }, [threshold, rootMargin]);

  return { isInViewport, viewRef };
}