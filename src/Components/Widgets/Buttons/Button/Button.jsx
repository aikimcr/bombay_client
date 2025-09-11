import React from 'react';

import './Button.scss';
import classnames from 'classnames';

export const Button = ({
  className,
  text,
  role = 'primary',
  onClick,
  type = 'button',
  ...rest
}) => {
  const classNames = classnames([className, 'button'], {
    button__primary: role === 'primary',
    button__secondary: role === 'secondary',
  });
  return (
    <button {...rest} type={type} className={classNames} onClick={onClick}>
      {text}
    </button>
  );
};
