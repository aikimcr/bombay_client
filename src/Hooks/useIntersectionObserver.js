import { useEffect, useRef } from 'react';

export function useIntersectionObserver(topRef, callback, options = {}) {
    const observer = useRef(null);

    useEffect(() => {
        if (observer.current == null) {
            observer.current = new IntersectionObserver(callback, {...options, root: topRef.current.parentElement});
        }

        return () => { observer.current.disconnect(); }
    }, [observer.current, topRef.current]);
    
    return observer;
}

export default useIntersectionObserver;