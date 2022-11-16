import { useState, useEffect, useRef, useCallback } from 'react';

import useIntersectionObserver from './useIntersectionObserver';

function useModelCollection({ CollectionClass, topRef, loginState }) {
    const { loggedIn } = loginState;

    const collection = useRef(null);
    const observer = useIntersectionObserver(topRef, (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setShouldPage(true);
                observer.unobserve(entry.target);
            }

            // I haven't found a case where this is actually needed, but I haven't ruled it out.
            // if (entry.isVisible) {
            // }
        });
    });

    const [shouldPage, setShouldPage] = useState(false);
    const [loading, setLoading] = useState(true);

    const refreshCollection = useCallback(() => {
        // console.count('refresh');
        if (!loggedIn) {
            collection.current = null;
            return;
        }

        setLoading(true);

        collection.current = new CollectionClass();
        collection.current.ready()
        .then(() => {
            setLoading(false);
        });
    }, [loggedIn, CollectionClass]);

    useEffect(() => {
        // console.count('refresh changed');
        if (collection.current == null) {
            refreshCollection()
        }
    }, [refreshCollection]);

    useEffect(() => {
        // console.count(`shouldPage: ${shouldPage}, loading: ${loading}`);
        if (!shouldPage) { return; }
        if (loading) { return; }

        setShouldPage(false);

        if (collection.current.hasNextPage()) {
            setLoading(true);

            collection.current.fetchNextPage()
            .then(() => {
                setLoading(false);
            });
        }
    }, [shouldPage, loading]);

    useEffect(() => {
        // console.count(`loading: ${loading}, observer: ${observer}, topRef: ${topRef}`);
        if (loading) { return; }

        if (collection.current && collection.current.hasNextPage()) {
            const myElement = topRef.current?.querySelector('li:last-child');

            if (myElement) {
                observer.current.observe(myElement);
            }
        }
    }, [loading, observer, topRef]);

    useEffect(() => {
        // console.count(`loggedIn: ${loggedIn}`);
        if (loggedIn && collection.current === null) {
            refreshCollection()
        }
    }, [loggedIn, refreshCollection]);

    // console.log('return collection', collection);
    return [collection, refreshCollection];
}

export default useModelCollection