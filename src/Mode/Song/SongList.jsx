import { useState, useContext, createRef } from "react";

import "./SongList.scss";

import SongCollection from "../../Model/SongCollection";

import SongListItem from "./SongListItem.jsx";
import Song from "./Song.jsx";
import FormModal from "../../Modal/FormModal.jsx";
import useModelCollection from "../../Hooks/useModelCollection";
import { ProtectedRoute } from "../../Components";
import BombayLoginContext from "../../Context/BombayLoginContext";

export const SongList = (props) => {
  const topRef = createRef();

  const loginState = useContext(BombayLoginContext);

  const [songCollection, refreshCollection] = useModelCollection({
    CollectionClass: SongCollection,
    topRef,
    loginState,
  });

  const [showAdd, setShowAdd] = useState(false);

  async function submitNewSong(songDef) {
    await songCollection.current.save(songDef);
    refreshCollection();
  }

  return (
    <ProtectedRoute>
      <div className="list-component">
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
            {songCollection?.current == null
              ? ""
              : songCollection.current.map((song) => {
                  const key = `song-list-${song.get("id")}`;
                  return <SongListItem className key={key} song={song} />;
                })}
          </ul>
        </div>
      </div>
    </ProtectedRoute>
  );
};
