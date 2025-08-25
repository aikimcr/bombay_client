import { useState, useContext, createRef } from "react";

import "./ArtistList.scss";

import BombayLoginContext from "../../Context/BombayLoginContext";

import ArtistCollection from "../../Model/ArtistCollection";

import ArtistListItem from "./ArtistListItem";
import Artist from "./Artist";
import FormModal from "../../Modal/FormModal";
import useModelCollection from "../../Hooks/useModelCollection";

function ArtistList(props) {
  const topRef = createRef();

  const loginState = useContext(BombayLoginContext);

  const [artistCollection, refreshCollection] = useModelCollection({
    CollectionClass: ArtistCollection,
    topRef,
    loginState,
  });

  const [showAdd, setShowAdd] = useState(false);

  async function submitNewArtist(artistDef) {
    await artistCollection.current.save(artistDef);
    refreshCollection();
  }

  if (!loginState.loggedIn) return null;

  return (
    <div className="list-component">
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
          {artistCollection?.current == null
            ? ""
            : artistCollection.current.map((artist) => {
                const key = `artist-list-${artist.get("id")}`;
                return <ArtistListItem className key={key} artist={artist} />;
              })}
        </ul>
      </div>
    </div>
  );
}

export default ArtistList;
