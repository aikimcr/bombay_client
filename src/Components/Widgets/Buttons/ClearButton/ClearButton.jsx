import React from 'react';
import PropTypes from 'prop-types';

import './ClearButton.scss';

export const ClearButton = (props) => {
  return (
    <button
      className="clear-button"
      data-testid="clear-button"
      type="button"
      onClick={props.onClick}
    >
      <i className="fa-solid fa-eraser"></i>
    </button>
  );
};

ClearButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};
