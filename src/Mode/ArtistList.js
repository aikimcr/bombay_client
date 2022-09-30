import { useEffect, useState, useRef, createRef } from 'react';
import useIntersectionObserver from '../Hooks/useIntersectionObserver';

import './ArtistList.scss';

import ArtistCollection from '../Model/ArtistCollection';

import ArtistListItem from './ArtistListItem';

function ArtistList(props) {
    // const [loadTries, setLoadTries] = useState(0);
    const topRef = createRef();

    const artistCollection = useRef(null);
    const observer = useIntersectionObserver(topRef, (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setShouldPage(true);
                observer.unobserve(entry.target);
            }

            // if (entry.isVisible) {
            // }
        });
    });

    const [shouldPage, setShouldPage] = useState(false);
    const [loading, setLoading] = useState(true);

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
                    return <ArtistListItem className key={key} artist={artist} />
                })}
            </ul>
        </div>
    );
}

export default ArtistList;