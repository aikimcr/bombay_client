import React from 'react';

import './TextInput.scss';

export const TextInput = ({ id, className, ...rest }) => {
  return <input {...rest} id={id} className={`text-input ${className}`} />;
};
