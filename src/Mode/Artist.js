import PropTypes from 'prop-types';

import LabeledInput from '../Widgets/LabeledInput';

function Artist(props) {
    const inputId = `artist-${props.artist ? props.artist.get('id') : 'new-artist'}`;

    return (
        <LabeledInput modelName='artist' fieldName='name' labelText='Artist Name' model={props.artist} />
    )
}

Artist.propTypes = {
    artist: PropTypes.object,
}

export default Artist
