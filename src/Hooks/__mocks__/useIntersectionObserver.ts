import { useEffect, useRef, RefObject } from 'react';

import { IntersectionObserverOptions } from '../useIntersectionObserver';
export class mockEntry {
  boundingClientRect: DOMRectReadOnly;
  intersectionRatio: number;
  intersectionRect: DOMRectReadOnly;
  isIntersecting: boolean;
  rootBounds: DOMRectReadOnly;
  target: Element;
  time: number;
  isVisible: boolean;

  constructor(target: Element, isIntersecting = false) {
    this.target = target;
    this.isIntersecting = isIntersecting;
    this.isVisible = false;
  }
}

export class mockObserver {
  root: Element;
  rootMargin: string;
  thresholds: readonly number[];
  callback: IntersectionObserverCallback;
  options: IntersectionObserverOptions;
  entries: mockEntry[];

  static observers: mockObserver[] = [];

  constructor(
    callback: IntersectionObserverCallback,
    options: IntersectionObserverOptions,
  ) {
    this.callback = callback;
    this.options = options;
    this.entries = [];
    mockObserver.observers.push(this);
  }

  observe(_target: Element) {}

  unobserve(_target: Element) {}

  takeRecords() {
    return this.entries;
  }

  disconnect() {}

  _fireIntersect(target: Element, isIntersecting = true) {
    const entry = new mockEntry(target, isIntersecting);
    this.callback([entry], this);
  }
}

export function useIntersectionObserver(
  topRef: RefObject<Element>,
  callback: IntersectionObserverCallback,
  options: IntersectionObserverOptions = {},
) {
  const observer = useRef(null);

  useEffect(() => {
    if (topRef.current == null) {
      return;
    }

    if (observer.current == null) {
      observer.current = new mockObserver(callback, {
        ...options,
        root: topRef.current.parentElement,
      });
    }

    return () => {
      observer.current.disconnect();
    };
  }, [observer.current, topRef]);

  return observer;
}

export default useIntersectionObserver;
