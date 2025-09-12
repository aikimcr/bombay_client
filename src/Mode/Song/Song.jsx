import React, { useContext, useState } from 'react';

import PropTypes from 'prop-types';

import BombayUtilityContext from '../../Context/BombayUtilityContext';

import { ArtistCollection } from '../../Model/ArtistCollection';

import {
  LabeledInput,
  LabeledRange,
  PickerButton,
  SelectInput,
  TextAreaInput,
  TextInput,
} from '../../Components';

import './Song.scss';

export const Song = ({ song }) => {
  const { getBootstrap } = useContext(BombayUtilityContext);

  const [artistModel, setArtistModel] = useState(song ? song.artist : null);

  const { keySignatures } = getBootstrap();
  const keyOptions = keySignatures.map((key) => {
    return { value: key };
  });

  return (
    <div className="song-fields">
      <LabeledInput
        inputId="name"
        fieldName="name"
        labelText="Song Name"
        InputField={TextInput}
        inputProps={{
          defaultValue: song?.name,
        }}
      />
      <PickerButton
        modelName="artist"
        targetField="artist_id"
        fieldName="id"
        labelText="Artist"
        collectionClass={ArtistCollection}
        model={artistModel}
        onModelPicked={setArtistModel}
      />
      <LabeledInput
        labelText="Key"
        inputId="song-key"
        InputField={SelectInput}
        inputProps={{
          options: keyOptions,
          unsetLabel: '<unset>',
          defaultValue: song?.key,
        }}
      />
      <LabeledRange
        inputId="tempo"
        fieldName="tempo"
        labelText="Tempo"
        inputProps={{
          min: 20,
          max: 220,
          defaultValue: song?.tempo,
        }}
      />
      <LabeledInput
        labelText="Lyrics"
        inputId="lyrics"
        fieldName="lyrics"
        InputField={TextAreaInput}
        defaultValue={song?.lyrics}
      />
    </div>
  );
};

Song.propTypes = {
  song: PropTypes.object,
};
