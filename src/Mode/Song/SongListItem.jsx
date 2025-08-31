import React, { useState } from "react";

import PropTypes from "prop-types";

import "./SongList.scss";

import { Song } from "./Song";
import FormModal from "../../Modal/FormModal";

export const SongListItem = ({ song }) => {
  const [showEdit, setShowEdit] = useState(false);
  const [displayName, setDisplayName] = useState(song.get("name"));
  const [artistName, setArtistName] = useState(song.artist().get("name"));

  async function updateSong(modelDef) {
    await song.set(modelDef).save();
    setDisplayName(song.get("name"));
    setArtistName(song.artist().get("name"));
  }

  return (
    <>
      <li
        className="card wide"
        data-testid="song-list-card"
        onClick={() => setShowEdit(true)}
      >
        <div className="header">Song</div>
        <div className="name">{displayName}</div>
        <div className="details">
          <>
            <div className="label">Artist</div>
            <div className="text">{artistName}</div>
          </>
          <>
            <div className="label">Key</div>
            <div className="text">{song.get("key_signature")}</div>
          </>
          <>
            <div className="label">Tempo</div>
            <div className="text">{song.get("tempo")}</div>
          </>
          <>
            <div className="label">Lyrics</div>
            <div className="long-text">
              <pre>{song.get("lyrics")}</pre>
            </div>
          </>
        </div>
      </li>
      <FormModal
        title="Edit Song"
        onClose={() => setShowEdit(false)}
        onSubmit={updateSong}
        open={showEdit}
      >
        <Song song={song} />
      </FormModal>
    </>
  );
};

SongListItem.propTypes = {
  song: PropTypes.object,
};

export default SongListItem;
