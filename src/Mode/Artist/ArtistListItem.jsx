import React, { createRef, useRef, useState } from 'react';

import './ArtistList.scss';

import { ArtistForm } from './ArtistEditor/ArtistForm';

export const ArtistListItem = ({ artist }) => {
  const dialogRef = createRef();

  const [displayName, setDisplayName] = useState(artist.name);

  const handleEditClose = (artist) => {
    setDisplayName(artist.name);
  };

  const showAddForm = () => {
    dialogRef.current?.showModal();
  };

  return (
    <React.Fragment>
      <li className="card" data-testid="artist-list-card" onClick={showAddForm}>
        <div className="header">Artist</div>
        <div className="name">{displayName}</div>
        <div className="details"></div>
        <ArtistForm artist={artist} ref={dialogRef} onClose={handleEditClose} />
      </li>
    </React.Fragment>
  );
};
