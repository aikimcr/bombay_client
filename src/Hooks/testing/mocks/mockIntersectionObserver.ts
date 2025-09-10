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

export class mockIntersectionObserver {
  root: Element;
  rootMargin: string;
  thresholds: readonly number[];
  callback: IntersectionObserverCallback;
  options: IntersectionObserverInit;
  entries: mockEntry[];

  static observers: mockIntersectionObserver[] = [];

  static _clear() {
    while (this.observers.length > 0) {
      this.observers.pop();
    }
  }
  constructor(
    callback: IntersectionObserverCallback,
    options: IntersectionObserverInit,
  ) {
    this.callback = callback;
    this.options = options;
    this.entries = [];
    mockIntersectionObserver.observers.push(this);
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
