import React from 'react';
import PropTypes from 'prop-types';

function Button(props) {
  const classList = new Set();

  if (props.className) {
    const propsClasses = props.className.split(/\s+/);
    propsClasses.forEach((name) => classList.add(name));
  }

  classList.add('btn');
  const className = Array.from(classList).join(' ');

  if (props.disabled) {
    return (
      <button className={className} onClick={props.onClick} disabled>
        {' '}
        {props.label}
      </button>
    );
  } else {
    return (
      <button className={className} onClick={props.onClick}>
        {props.label}
      </button>
    );
  }
}

Button.propTypes = {
  label: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default Button;
