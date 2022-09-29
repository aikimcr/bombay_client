import { useEffect, useRef } from 'react';

export class mockEntry {
    constructor(target, isIntersecting = false) {
        this.target = target;
        this.isIntersecting = isIntersecting;
        this.isVisible = false;
    }
}

export class mockObserver  {
    static observers = [];

    constructor(callback, options) {
        this.callback = callback;
        this.options = options;
        this.entries = [];
        this.constructor.observers.push(this);
    }

    observe(target) {
    }

    unobserve(target) {
    }

    disconnect() {
    }

    _fireIntersect(target, isIntersecting = true) {
        const entry = new mockEntry(target, isIntersecting);
        this.callback([entry], this);
    }
}

export function useIntersectionObserver(topRef, callback, options = {}) {
    const observer = useRef(null);
    
    useEffect(() => {
        console.count('mock observer/topref');

        if (observer.current == null) {
            console.count('mock Make an observer');
            observer.current = new mockObserver(callback, { ...options, root: topRef.current.parentElement });
        }

        return () => { observer.current.disconnect(); }
    }, [observer.current, topRef.current]);

    return observer;

}

export default useIntersectionObserver;