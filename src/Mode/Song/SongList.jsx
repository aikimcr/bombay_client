import { useState, useContext, createRef } from 'react';

import './SongList.scss';

import BombayLoginContext from '../../Context/BombayLoginContext';

import { SongCollection } from '../../Model/SongCollection';

import SongListItem from './SongListItem';
import { Song } from './Song';
import FormModal from '../../Modal/FormModal';
import { useModelCollection } from '../../Hooks/useModelCollection';
import { ProtectedRoute } from '../../Components';

export const SongList = (props) => {
  const topRef = createRef();

  const loginState = useContext(BombayLoginContext);

  const [songCollection] = useState(new SongCollection({}));
  const { refreshCollection } = useModelCollection({
    initialCollection: songCollection,
    topRef,
  });

  const [showAdd, setShowAdd] = useState(false);

  async function submitNewSong(songDef) {
    await songCollection.save(songDef);
    refreshCollection();
  }

  return (
    <ProtectedRoute>
      <div className="list-component" data-testid="song-list-component">
        <div className="list-controls">
          <button className="btn" onClick={() => setShowAdd(true)}>
            New
          </button>
          <div className="title">Songs</div>
          <button className="btn" onClick={refreshCollection}>
            Refresh
          </button>
          <FormModal
            title="Add Song"
            onClose={() => setShowAdd(false)}
            onSubmit={submitNewSong}
            open={showAdd}
          >
            <Song />
          </FormModal>
        </div>
        <div className="song-list-container list-container" ref={topRef}>
          <ul className="song-list card-list">
            {songCollection == null
              ? ''
              : songCollection.map((song) => {
                  const key = `song-list-${song.id}`;
                  return <SongListItem className key={key} song={song} />;
                })}
          </ul>
        </div>
      </div>
    </ProtectedRoute>
  );
};
