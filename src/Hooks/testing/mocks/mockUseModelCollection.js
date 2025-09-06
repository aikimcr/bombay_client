import React, { useEffect, useState } from "react";
import useIntersectionObserver from "../../useIntersectionObserver";

export const mockModelFetcher = jest.fn();

export const mockUseModelCollection = ({
  CollectionClass,
  topRef,
  loginState,
}) => {
  const [collection, setCollection] = useState(null);
  const [shouldPage, setShouldPage] = useState(false);
  const [loading, setLoading] = useState(true);

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
    try {
      setLoading(true);
      const modelList = await mockModelFetcher();
      const newCollection = new CollectionClass({ models: modelList });
      setCollection(newCollection);
      setLoading(false);
    } catch (err) {
      setCollection([]);
    }
  };

  const nextPage = async () => {
    setLoading(true);

    try {
      const newList = await mockModelFetcher();

      newList?.forEach((model) => {
        try {
          collection.add(model);
        } catch (err) {
          console.error(err);
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!collection || collection.length === 0) {
      refreshCollection();
    }
  }, []);

  useEffect(() => {
    // console.count(`loading: ${loading}, observer: ${observer}, topRef: ${topRef}`);
    if (loading) {
      return;
    }

    if (collection && collection.hasNextPage()) {
      const myElement = topRef.current?.querySelector("li:last-child");

      if (myElement) {
        observer.current.observe(myElement);
      }
    }
  }, [loading, observer, topRef]);

  useEffect(() => {
    // console.log('shouldPage/loading change', shouldPage, loading);
    if (!shouldPage) {
      return;
    }
    if (loading) {
      return;
    }

    setShouldPage(false);

    nextPage();
  }, [shouldPage, loading]);

  return [collection, refreshCollection];
};
