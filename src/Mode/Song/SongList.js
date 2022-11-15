import { useState, useContext, createRef } from 'react';

import './SongList.scss';

import BombayLoginContext from '../../Context/BombayLoginContext';

import SongCollection from '../../Model/SongCollection';

import SongListItem from './SongListItem';
import Song from './Song';
import FormModal from '../../Modal/FormModal';
import useModelCollection from '../../Hooks/useModelCollection';

function SongList(props) {
    const topRef = createRef();

    const loginState = useContext(BombayLoginContext);

    const [songCollection, refreshCollection] = useModelCollection({
        CollectionClass: SongCollection,
        topRef, loginState,
    });

    const [showAdd, setShowAdd] = useState(false);

    async function submitNewSong(songDef) {
        await songCollection.current.save(songDef);
        refreshCollection();
    }

    if (!loginState.loggedIn) return null;

    return (
        <div className="list-component">
            <div className="list-controls">
                <button className="btn" onClick={() => setShowAdd(true)}>New</button>
                <div className="title">Songs</div>
                <button className="btn" onClick={refreshCollection}>Refresh</button>
                <FormModal
                    title="Add Song"
                    onClose={() => setShowAdd(false)}
                    onSubmit={submitNewSong}
                    open={showAdd}>
                    <Song />
                </FormModal>
            </div>
            <div className="song-list-container list-container" ref={topRef}>
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