import { useState, useEffect, useContext, useRef, useCallback } from 'react';

import BombayLoginContext from '../Context/BombayLoginContext';
import useIntersectionObserver from './useIntersectionObserver';

export const useModelCollection = ({ CollectionClass, topRef }) => {
  const { loggedIn } = useContext(BombayLoginContext);
  const [shouldPage, setShouldPage] = useState(false);
  const [loading, setLoading] = useState(loggedIn);

  const [collection, setCollection] = useState(null);
  const observer = useIntersectionObserver(topRef, (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setShouldPage(true);
        observer.unobserve(entry.target);
      }

      // I haven't found a case where this is actually needed, but I haven't ruled it out.
      // if (entry.isVisible) {
      // }
    });
  });

  const refreshCollection = async () => {
    // console.count(`refresh, ${loggedIn}`);
    if (!loggedIn) {
      setCollection(null);
      return;
    }

    setLoading(true);

    const newCollection = new CollectionClass();
    await newCollection.ready();
    // console.count(`newCollection ready: ${newCollection}`);

    setLoading(false);
    setCollection(newCollection);
  };

  useEffect(() => {
    // console.count(`mount hook, ${collection}, ${loading}`);
    if (collection == null) {
      refreshCollection();
    }
  }, []);

  useEffect(() => {
    // console.count(`shouldPage: ${shouldPage}, loading: ${loading}`);
    if (!shouldPage) {
      return;
    }
    if (loading) {
      return;
    }

    setShouldPage(false);

    if (collection.hasNextPage()) {
      setLoading(true);

      collection.fetchNextPage().then(() => {
        setLoading(false);
      });
    }
  }, [shouldPage, loading]);

  useEffect(() => {
    // console.count(`loading: ${loading}, observer: ${observer}, topRef: ${topRef}`);
    if (loading) {
      return;
    }

    if (collection && collection.hasNextPage()) {
      const myElement = topRef.current?.querySelector('li:last-child');

      if (myElement) {
        observer.current.observe(myElement);
      }
    }
  }, [loading, observer, topRef]);

  useEffect(() => {
    // console.count(`loggedIn change, ${loggedIn}, ${collection} ${loading}`);
    if (loading) {
      return;
    }

    if (loggedIn && collection == null) {
      refreshCollection();
      return;
    }

    if (!loggedIn) {
      setCollection(null);
    }
  }, [loggedIn]);

  // console.log('return collection', collection);
  return [collection, refreshCollection];
};

export default useModelCollection;
