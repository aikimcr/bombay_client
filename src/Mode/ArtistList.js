import { useEffect, useState, useRef, createRef } from 'react';
import useIntersectionObserver from '../Hooks/useIntersectionObserver';

import './ArtistList.scss';

import ArtistCollection from '../Model/ArtistCollection';

import ArtistListItem from './ArtistListItem';
import Artist from './Artist';
import { FormModal } from '../Modal/FormModal';

function ArtistList(props) {
    const topRef = createRef();

    const artistCollection = useRef(null);
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

    const [showAdd, setShowAdd] = useState(false);
    const [shouldPage, setShouldPage] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const intervalHandle = setInterval(refreshCollection, 300000);

        return () => {
            clearInterval(intervalHandle);
        }
    }, []);

    useEffect(() => {
        if (artistCollection.current == null) {
            refreshCollection()
        }
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

    function refreshCollection() {
        setLoading(true);

        artistCollection.current = new ArtistCollection();
        artistCollection.current.ready()
            .then(() => {
                setLoading(false);
            });
    }

    async function submitNewArtist(artistDef) {
        await artistCollection.current.save(artistDef);
        refreshCollection();
    }

    return (
        <div className="list-component">
            <div className="list-controls">
                <button className="btn" onClick={() => setShowAdd(true)}>New</button>
                <button className="btn" onClick={refreshCollection}>Refresh</button>
                <FormModal
                    title="Add Artist"
                    onClose={() => setShowAdd(false)}
                    onSubmit={submitNewArtist}
                    open={showAdd}>
                    <Artist />
                </FormModal>
            </div>
            <div className="artist-list-container" ref={topRef}>
                <ul className="artist-list card-list">
                    {artistCollection?.current == null ? '' : artistCollection.current.map(artist => {
                        const key = `artist-list-${artist.get('id')}`;
                        return <ArtistListItem className key={key} artist={artist} />
                    })}
                </ul>
            </div>
        </div>
    );
}

export default ArtistList;