import { useEffect, useState, useRef, createRef } from 'react';
import useIntersectionObserver from '../../Hooks/useIntersectionObserver';

import './SongList.scss';

import SongCollection from '../../Model/SongCollection';

import SongListItem from './SongListItem';
import Song from './Song';
import FormModal from '../../Modal/FormModal';

function SongList(props) {
    const topRef = createRef();

    const songCollection = useRef(null);
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
        if (songCollection.current == null) {
            console.count('Init Songlist');
            refreshCollection();
        }

        const intervalHandle = setInterval(refreshCollection, 300000);

        return () => {
            clearInterval(intervalHandle);
        }
    }, []);

    useEffect(() => {
        if (!shouldPage) { return; }
        if (loading) { return; }

        setShouldPage(false);

        if (songCollection.current.hasNextPage()) {
            setLoading(true);

            songCollection.current.fetchNextPage()
                .then(() => {
                    setLoading(false);
                });
        }
    }, [shouldPage, loading]);

    useEffect(() => {
        if (loading) { return; }

        if (songCollection.current && songCollection.current.hasNextPage()) {
            const myElement = topRef.current.querySelector('li:last-child');

            if (myElement) {
                observer.current.observe(myElement);
            }
        }
    }, [loading, observer, topRef]);

    function refreshCollection() {
        setLoading(true);

        songCollection.current = new SongCollection();
        songCollection.current.ready()
            .then(() => {
                setLoading(false);
            });
    }

    async function submitNewSong(songDef) {
        await songCollection.current.save(songDef);
        refreshCollection();
    }

    return (
        <div className="list-component">
            <div className="list-controls">
                <button className="btn" onClick={() => setShowAdd(true)}>New</button>
                <button className="btn" onClick={refreshCollection}>Refresh</button>
                <FormModal
                    title="Add Song"
                    onClose={() => setShowAdd(false)}
                    onSubmit={submitNewSong}
                    open={showAdd}>
                    <Song />
                </FormModal>
            </div>
            <div className="song-list-container" ref={topRef}>
                <ul className="song-list card-list">
                    {songCollection?.current == null ? '' : songCollection.current.map(song => {
                        const key = `song-list-${song.get('id')}`;
                        return <SongListItem className key={key} song={song} />
                    })}
                </ul>
            </div>
        </div>
    );
}

export default SongList;