import React from 'react';

import './Button.scss';
import classnames from 'classnames';

export const Button = ({
  className,
  text,
  category = 'primary',
  onClick = () => undefined,
  type = 'button',
  ...rest
}) => {
  const classNames = classnames([className, 'button'], {
    button__primary: category === 'primary',
    button__secondary: category === 'secondary',
  });
  return (
    <button {...rest} type={type} className={classNames} onClick={onClick}>
      {text}
    </button>
  );
};
