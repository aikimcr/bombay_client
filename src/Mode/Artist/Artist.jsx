import PropTypes from 'prop-types';

import OldLabeledInput from '../../Components/Widgets/OldLabeledInput.jsx';

export const Artist = (props) => {
  return (
    <OldLabeledInput
      modelName="artist"
      fieldName="name"
      labelText="Artist Name"
      model={props.artist}
    />
  );
};

Artist.propTypes = {
  artist: PropTypes.object,
};

export default Artist;
