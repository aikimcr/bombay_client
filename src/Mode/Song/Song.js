import { useContext, useState } from 'react';

import PropTypes from 'prop-types';

import BombayUtilityContext from '../../Context/BombayUtilityContext';

import ArtistCollection from '../../Model/ArtistCollection';

import LabeledInput from '../../Widgets/LabeledInput';
import PickerButton from '../../Widgets/PickerButton';
import LabeledSelect from '../../Widgets/LabeledSelect';
import LabeledRange from '../../Widgets/LabeledRange';
import LabeledTextArea from '../../Widgets/LabeledTextArea';

function Song(props) {
    const { getBootstrap } = useContext(BombayUtilityContext);

    const [artistModel, setArtistModel] = useState(props.song ? props.song.artist() : null);
    
    const { keySignatures } = getBootstrap();
    const keyOptions = keySignatures.map(key => {
        return { value: key };
    });

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
            <LabeledSelect
                modelName='song'
                fieldName='key_signature'
                labelText='Key'
                options={keyOptions}
                unsetLabel='<unset>'
                model={props.song}
            />
            <LabeledRange
                modelName='song'
                fieldName='tempo'
                labelText='Tempo'
                min={20}
                max={220}
                model={props.song}
            />
            <LabeledTextArea
                modelName='song'
                fieldName='lyrics'
                labelText='Lyrics'
                model={props.song}
            />
        </>
    )
}

Song.propTypes = {
    song: PropTypes.object,
    artist: PropTypes.object,
}

export default Song
