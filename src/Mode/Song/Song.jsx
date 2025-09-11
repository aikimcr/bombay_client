import React, { useContext, useState } from 'react';

import PropTypes from 'prop-types';

import BombayUtilityContext from '../../Context/BombayUtilityContext';

import { ArtistCollection } from '../../Model/ArtistCollection';

import OldLabeledInput from '../../Components/Widgets/OldLabeledInput.jsx';
import {
  LabeledRange,
  PickerButton,
  SelectInput,
  LabeledInput,
} from '../../Components';

import LabeledTextArea from '../../Components/Widgets/LabeledTextArea.jsx';

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
      <OldLabeledInput
        modelName="song"
        fieldName="name"
        labelText="Song Name"
        model={song}
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
      <LabeledTextArea
        modelName="song"
        fieldName="lyrics"
        labelText="Lyrics"
        model={song}
      />
    </div>
  );
};

Song.propTypes = {
  song: PropTypes.object,
};
