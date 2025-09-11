import React, { useImperativeHandle, useRef } from 'react';
import PropTypes from 'prop-types';
import { RangeInput } from '.';

import './LabeledRange.scss';

export const LabeledRange = ({ labelText, inputId, inputProps }) => {
  return (
    <div className="labeled-range" data-testid="labeled-range">
      <label htmlFor={inputId}>{labelText}</label>
      <RangeInput {...inputProps} id={inputId} />
    </div>
  );
};

LabeledRange.propTypes = {
  fieldName: PropTypes.string.isRequired,
  labelText: PropTypes.string.isRequired,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  onChange: PropTypes.func,
};

export default LabeledRange;
