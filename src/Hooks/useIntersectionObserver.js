import { useEffect, useRef } from 'react';

export function useIntersectionObserver(topRef, callback, options = {}) {
    const observer = useRef(null);

    useEffect(() => {
        console.count('observer/topref');

        if (observer.current == null) {
            console.count('Make an observer');
            observer.current = new IntersectionObserver(callback, {...options, root: topRef.current.parentElement});
        }

        return () => { observer.current.disconnect(); }
    }, [observer.current, topRef.current]);
    
    return observer;
}

export default useIntersectionObserver;