import React from 'react';
import PropTypes from 'prop-types';
import { LabeledInput, TextInput } from '../../Components';

export const Artist = ({ artist }) => {
  return (
    <LabeledInput
      inputId="name"
      fieldName="name"
      labelText="Artist Name"
      InputField={TextInput}
      inputProps={{
        defaultValue: artist?.name,
      }}
    />
  );
};

Artist.propTypes = {
  artist: PropTypes.object,
};

export default Artist;
