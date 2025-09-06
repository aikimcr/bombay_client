import React from 'react';

import './LabeledInput.scss';

export const LabeledInput = ({
  labelText,
  inputId,
  InputField = () => {
    return <div>No Input</div>;
  },
  inputProps,
}) => {
  return (
    <div className="labeled-input">
      <label htmlFor={inputId} className="labeled-input__label">
        {labelText}
      </label>
      <InputField {...inputProps} id={inputId} />
    </div>
  );
};
