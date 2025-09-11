import React, { useRef } from 'react';
import PropTypes from 'prop-types';

export const SelectionInputOption = (props) => {
  return <option value={props.value}>{props.label}</option>;
};

SelectionInputOption.propTypes = {
  value: PropTypes.any.isRequired,
  label: PropTypes.string,
};
