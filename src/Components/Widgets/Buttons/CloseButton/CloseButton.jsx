import React from 'react';
import PropTypes from 'prop-types';

import './CloseButton.scss';

function CloseButton(props) {
  return (
    <button
      className="close-button"
      data-testid="close-button"
      onClick={props.onClick}
    >
      <i className="fa-regular fa-circle-xmark"></i>
    </button>
  );
}

CloseButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default CloseButton;
