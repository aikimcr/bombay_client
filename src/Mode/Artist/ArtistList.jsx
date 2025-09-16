import React, { useState, useContext, createRef, useEffect } from 'react';

import './ArtistList.scss';

import { ArtistCollection } from '../../Model/ArtistCollection';

import { ArtistListItem } from './ArtistListItem.jsx';
import { useModelCollection } from '../../Hooks/useModelCollection';
import { Button, ProtectedRoute } from '../../Components';
import { ArtistForm } from './ArtistEditor';

export const ArtistList = (props) => {
  const topRef = createRef();
  const dialogRef = createRef();

  const [isMounted, setIsMounted] = useState(false);
  const [artistCollection] = useState(new ArtistCollection({}));
  const { refreshCollection } = useModelCollection({
    initialCollection: artistCollection,
    topRef,
    isMounted,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleEditorClose = () => {
    refreshCollection();
  };

  const showAddForm = () => {
    dialogRef.current?.showModal();
  };

  let nextKey = 1;

  return (
    <ProtectedRoute>
      <div className="list-component" data-testid="artist-list-component">
        <div className="list-controls">
          <Button
            text="New Artist"
            category="secondary"
            type="button"
            onClick={showAddForm}
          />
          <div className="title">Artists</div>
          <Button
            text="Refresh"
            category="secondary"
            type="button"
            onClick={refreshCollection}
          />
          <ArtistForm ref={dialogRef} onClose={handleEditorClose} />
        </div>
        <div className="artist-list-container list-container" ref={topRef}>
          <ul className="artist-list card-list">
            {artistCollection == null
              ? ''
              : artistCollection.map((artist) => {
                  const key = nextKey++;
                  return <ArtistListItem className key={key} artist={artist} />;
                })}
          </ul>
        </div>
      </div>
    </ProtectedRoute>
  );
};
