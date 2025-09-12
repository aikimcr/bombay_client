import React, { useRef } from 'react';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';

import './TextAreaInput.scss';

export const TextAreaInput = ({
  ref,
  id,
  name,
  rows = 300,
  cols = 100,
  defaultValue,
  onChange,
}) => {
  const changeHandler = debounce((evt) => {
    evt.preventDefault();
    onChange?.call(null, evt.target.value);
  }, 500);

  return (
    <textarea
      ref={ref}
      className="textarea-input"
      data-testid="textarea-input"
      id={id}
      name={name}
      rows={rows}
      cols={cols}
      defaultValue={defaultValue}
      onChange={changeHandler}
    ></textarea>
  );
};

TextAreaInput.propTypes = {
  ref: PropTypes.ref,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  rows: PropTypes.number,
  cols: PropTypes.number,
  defaultValue: PropTypes.string,
  onChange: PropTypes.func,
};
