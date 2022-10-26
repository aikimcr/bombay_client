import { useState } from 'react';

import PropTypes from 'prop-types';

import ArtistCollection from '../../Model/ArtistCollection';

import LabeledInput from '../../Widgets/LabeledInput';
import PickerButton from '../../Widgets/PickerButton';

function Song(props) {
    const [artistModel, setArtistModel] = useState(props.song ? props.song.artist() : null);
    
    return (
        <>
            <LabeledInput modelName='song' fieldName='name' labelText='Song Name' model={props.song} />
            <PickerButton 
                modelName='artist'
                targetField='artist_id'
                fieldName='id'
                labelText='Artist'
                collectionClass={ArtistCollection}
                model={artistModel}
                onModelPicked={setArtistModel}
            />
        </>
    )
}

Song.propTypes = {
    song: PropTypes.object,
    artist: PropTypes.object,
}

export default Song
