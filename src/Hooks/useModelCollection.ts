import { useState, useEffect, useContext, useRef } from 'react';

import BombayLoginContext from '../Context/BombayLoginContext';
import { CollectionBase } from '../Model/CollectionBase';

export interface UseModelCollectionOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialCollection: CollectionBase<any, any>;
  topRef: React.RefObject<Element>;
  isMounted: boolean;
}

export interface UseModelCollectionReturn {
  loading: boolean;
  shouldPage: boolean;
  refreshCollection: () => void;
}

export function useModelCollection({
  initialCollection,
  topRef,
  isMounted,
}: UseModelCollectionOptions): UseModelCollectionReturn {
  const { loggedIn } = useContext(BombayLoginContext);
  const [shouldPage, setShouldPage] = useState(false);
  const [loading, setLoading] = useState(loggedIn);
  const [error, setError] = useState(false);
  const observer = useRef(null);

  // Not entirely clear this needs to be a state, but it's conventient for now.
  const [collection] = useState(initialCollection);

  const refreshCollection = async (): Promise<void> => {
    // console.count(`refresh, ${loggedIn}`);
    if (!loggedIn) {
      return;
    }

    setError(false);
    setLoading(true);

    try {
      await collection.fetchNextPage();
      // console.count(`newCollection ready: ${collection}`);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // console.count(`mount hook, ${collection}, ${loading}`);
    refreshCollection();
  }, []);

  const checkForNextPage = async () => {
    // console.log(collection.hasNextPage, collection.nextPage);
    setShouldPage(false);

    if (collection.hasNextPage) {
      setLoading(true);

      try {
        await collection.fetchNextPage();
        setLoading(false);
      } catch (err) {
        setError(true);
      }
    }
  };

  useEffect(() => {
    // console.count(`shouldPage: ${shouldPage}, loading: ${loading}`);
    if (!shouldPage) {
      return;
    }
    if (loading) {
      return;
    }
    if (error) {
      return;
    }

    checkForNextPage();
  }, [shouldPage, loading]);

  const observerCallback: IntersectionObserverCallback = (
    entries,
    observer,
  ) => {
    // console.log('observerCallback called');
    entries.forEach((entry) => {
      // console.count('entry');
      if (entry.isIntersecting) {
        // console.log('entry intersects');
        setShouldPage(true);
        observer.unobserve(entry.target);
      }

      // I haven't found a case where this is actually needed, but I haven't ruled it out.
      // if (entry.isVisible) {
      // }
    });
  };

  useEffect(() => {
    // console.log('changes', loading, isMounted, collection?.length, topRef);
    if (!collection) {
      return;
    }

    if (!isMounted) {
      return;
    }

    if (loading) {
      return;
    }

    if (!observer.current) {
      observer.current = new IntersectionObserver(observerCallback, {
        root: topRef.current.parentElement,
      });
    }

    if (collection.hasNextPage) {
      const myElement = topRef.current?.querySelector('li:last-child');

      if (myElement) {
        observer.current?.observe(myElement);
      }
    }
  }, [loading, isMounted, collection]);

  useEffect(() => {
    // console.count(`loggedIn change, ${loggedIn}, ${collection} ${loading}`);
    if (loading) {
      return;
    }

    if (error) {
      return;
    }

    if (loggedIn && collection.length === 0) {
      refreshCollection();
      return;
    }

    if (!loggedIn) {
      collection.clear();
    }
  }, [loggedIn, loading, collection]);

  // console.log('return collection', collection);
  return {
    loading,
    shouldPage,
    refreshCollection,
  };
}
