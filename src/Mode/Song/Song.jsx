import { useContext, useState } from "react";

import PropTypes from "prop-types";

import BombayUtilityContext from "../../Context/BombayUtilityContext";

import ArtistCollection from "../../Model/ArtistCollection";

import LabeledInput from "../../Widgets/LabeledInput.jsx";
import PickerButton from "../../Widgets/PickerButton.jsx";
import LabeledSelect from "../../Widgets/LabeledSelect.jsx";
import LabeledRange from "../../Widgets/LabeledRange.jsx";
import LabeledTextArea from "../../Widgets/LabeledTextArea.jsx";

function Song({ song }) {
  const { getBootstrap } = useContext(BombayUtilityContext);

  const [artistModel, setArtistModel] = useState(song ? song.artist() : null);

  const { keySignatures } = getBootstrap();
  const keyOptions = keySignatures.map((key) => {
    return { value: key };
  });

  return (
    <>
      <LabeledInput
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
      <LabeledSelect
        modelName="song"
        fieldName="key_signature"
        labelText="Key"
        options={keyOptions}
        unsetLabel="<unset>"
        model={song}
      />
      <LabeledRange
        modelName="song"
        fieldName="tempo"
        labelText="Tempo"
        min={20}
        max={220}
        model={song}
      />
      <LabeledTextArea
        modelName="song"
        fieldName="lyrics"
        labelText="Lyrics"
        model={song}
      />
    </>
  );
}

Song.propTypes = {
  song: PropTypes.object,
};

export default Song;
