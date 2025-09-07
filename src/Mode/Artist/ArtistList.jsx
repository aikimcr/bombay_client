import { useState, useContext, createRef } from 'react';

import './ArtistList.scss';

import BombayLoginContext from '../../Context/BombayLoginContext';

import { ArtistCollection } from '../../Model/ArtistCollection';

import ArtistListItem from './ArtistListItem.jsx';
import Artist from './Artist.jsx';
import FormModal from '../../Modal/FormModal.jsx';
import { useModelCollection } from '../../Hooks/useModelCollection';
import { ProtectedRoute } from '../../Components';

export const ArtistList = (props) => {
  const topRef = createRef();

  const loginState = useContext(BombayLoginContext);

  const [artistCollection] = useState(new ArtistCollection({}));
  const { refreshCollection } = useModelCollection({
    initialCollection: artistCollection,
    topRef,
  });

  const [showAdd, setShowAdd] = useState(false);

  async function submitNewArtist(artistDef) {
    await artistCollection.save(artistDef);
    refreshCollection();
  }

  return (
    <ProtectedRoute>
      <div className="list-component" data-testid="artist-list-component">
        <div className="list-controls">
          <button className="btn" onClick={() => setShowAdd(true)}>
            New
          </button>
          <div className="title">Artists</div>
          <button className="btn" onClick={refreshCollection}>
            Refresh
          </button>
          <FormModal
            title="Add Artist"
            onClose={() => setShowAdd(false)}
            onSubmit={submitNewArtist}
            open={showAdd}
          >
            <Artist />
          </FormModal>
        </div>
        <div className="artist-list-container list-container" ref={topRef}>
          <ul className="artist-list card-list">
            {artistCollection == null
              ? ''
              : artistCollection.map((artist) => {
                  const key = `artist-list-${artist.id}`;
                  return <ArtistListItem className key={key} artist={artist} />;
                })}
          </ul>
        </div>
      </div>
    </ProtectedRoute>
  );
};
