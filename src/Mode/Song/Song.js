import PropTypes from 'prop-types';

import LabeledInput from '../../Widgets/LabeledInput';

function Song(props) {
    return (
        <LabeledInput modelName='song' fieldName='name' labelText='Song Name' model={props.song} />
    )
}

Song.propTypes = {
    song: PropTypes.object,
}

export default Song
