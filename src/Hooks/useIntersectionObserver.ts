import { useEffect, useRef, RefObject } from 'react';

export interface IntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

export interface UseIntersectionObserverReturn {
  current: IntersectionObserver | null;
}

export function useIntersectionObserver(
  topRef: RefObject<Element>,
  callback: IntersectionObserverCallback,
  options: IntersectionObserverOptions = {},
): UseIntersectionObserverReturn {
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (topRef.current == null) {
      return;
    }

    if (observer.current == null) {
      observer.current = new IntersectionObserver(callback, {
        ...options,
        root: topRef.current.parentElement,
      });
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [callback, options, topRef]);

  return observer;
}

export default useIntersectionObserver;
