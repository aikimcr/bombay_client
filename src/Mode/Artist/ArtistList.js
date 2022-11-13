import { useEffect, useState, useRef, useContext, createRef, useCallback } from 'react';
import useIntersectionObserver from '../../Hooks/useIntersectionObserver';

import './ArtistList.scss';

import BombayLoginContext from '../../Context/BombayLoginContext';

import ArtistCollection from '../../Model/ArtistCollection';

import ArtistListItem from './ArtistListItem';
import Artist from './Artist';
import FormModal from '../../Modal/FormModal';

function ArtistList(props) {
    const topRef = createRef();

    const { loggedIn } = useContext(BombayLoginContext);

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

    const refreshCollection = useCallback(() => {
        if (!loggedIn) {
            artistCollection.current = null;
            return;
        }

        setLoading(true);

        artistCollection.current = new ArtistCollection();
        artistCollection.current.ready()
            .then(() => {
                setLoading(false);
            });
    }, [loggedIn]);

    useEffect(() => {
        if (artistCollection.current == null) {
            refreshCollection()
        }
    }, [refreshCollection]);

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
    }, [shouldPage, loading]);

    useEffect(() => {
        if (loading) { return; }

        if (artistCollection.current && artistCollection.current.hasNextPage()) {
            const myElement = topRef.current.querySelector('li:last-child');

            if (myElement) {
                observer.current.observe(myElement);
            }
        }
    }, [loading, observer, topRef]);

    useEffect(() => {
        if (loggedIn && artistCollection.current === null) {
            refreshCollection()
        }
    }, [loggedIn, refreshCollection]);

    async function submitNewArtist(artistDef) {
        await artistCollection.current.save(artistDef);
        refreshCollection();
    }

    if (!loggedIn) return null;

    return (
        <div className="list-component">
            <div className="list-controls">
                <button className="btn" onClick={() => setShowAdd(true)}>New</button>
                <div className="title">Artists</div>
                <button className="btn" onClick={refreshCollection}>Refresh</button>
                <FormModal
                    title="Add Artist"
                    onClose={() => setShowAdd(false)}
                    onSubmit={submitNewArtist}
                    open={showAdd}>
                    <Artist />
                </FormModal>
            </div>
            <div className="artist-list-container list-container" ref={topRef}>
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