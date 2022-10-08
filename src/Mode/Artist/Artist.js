import PropTypes from 'prop-types';

import LabeledInput from '../../Widgets/LabeledInput';

function Artist(props) {
    return (
        <LabeledInput modelName='artist' fieldName='name' labelText='Artist Name' model={props.artist} />
    )
}

Artist.propTypes = {
    artist: PropTypes.object,
}

export default Artist
