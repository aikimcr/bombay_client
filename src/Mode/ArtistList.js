// import React from 'react';

import { useEffect, useState, useRef, createRef } from 'react';
import useIntersectionObserver from '../Hooks/useIntersectionObserver';

import './ArtistList.scss';

import ArtistCollection from '../Model/ArtistCollection';

function ArtistList(props) {
    // const [loadTries, setLoadTries] = useState(0);
    const topRef = createRef();

    const artistCollection = useRef(null);
    const observer = useIntersectionObserver(topRef, (entries, observer) => {
        console.count('intersect changed');

        entries.forEach(entry => {
            if (entry.isIntersecting) {
                console.count('isIntersecting');
                setShouldPage(true);
                observer.unobserve(entry.target);
            }

            if (entry.isVisible) {
                console.count('isVisible');
            }
        });
    });

    const [shouldPage, setShouldPage] = useState(false);
    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     console.count('observer/topref');

    //     if (observer.current == null) {
    //         console.count('Make an observer');
    //         debugger;
    //         observer.current = useIntersectionObserver((entries, observer) => {
    //             console.count('intersect changed');

    //             entries.forEach(entry => {
    //                 if (entry.isIntersecting) {
    //                     console.count('isIntersecting');
    //                     setShouldPage(true);
    //                     observer.unobserve(entry.target);
    //                 }

    //                 if (entry.isVisible) {
    //                     console.count('isVisible');
    //                 }
    //             });
    //         }, {
    //             root: topRef.current.parentElement,
    //         });
    //     }

    //     return () => { observer.current.disconnect(); }
    // }, [observer.current, topRef.current]);

    useEffect(() => {
        if (artistCollection.current == null) {
            artistCollection.current = new ArtistCollection();
        }

        artistCollection.current.ready()
            .then(() => {
                setLoading(false);
            });
    }, [artistCollection.current]);

    useEffect(() => {
        if (!shouldPage) { return; }
        if (loading) { return; }

        console.count('shouldPage');
        setShouldPage(false);

        if (artistCollection.current.hasNextPage()) {
            setLoading(true);

            artistCollection.current.fetchNextPage()
                .then(() => {
                    setLoading(false);
                });
        }
    }, [shouldPage]);

    useEffect(() => {
        if (loading) { return; }

        if (artistCollection.current && artistCollection.current.hasNextPage()) {
            const myElement = topRef.current.querySelector('li:last-child');

            if (myElement) {
                observer.current.observe(myElement);
            }
        }
    }, [loading]);

    return (
        <div className="artist-list-container" ref={topRef}>
            <ul className="artist-list card-list">
                {artistCollection?.current == null ? '' : artistCollection.current.map(artist => {
                    const key = `artist-list-${artist.get('id')}`;
                    return <li className="card" key={key}>{artist.get('name')}</li>
                })}
            </ul>
        </div>
    );
}

export default ArtistList;