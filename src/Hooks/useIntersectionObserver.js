import { useEffect, useRef } from "react";

export function useIntersectionObserver(topRef, callback, options = {}) {
  const observer = useRef(null);

  useEffect(() => {
    if (topRef.current == null) return;

    if (observer.current == null) {
      observer.current = new IntersectionObserver(callback, {
        ...options,
        root: topRef.current.parentElement,
      });
    }

    return () => {
      observer.current.disconnect();
    };
  }, [callback, options, topRef]);

  return observer;
}

export default useIntersectionObserver;
