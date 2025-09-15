import React from 'react';

import './PickerButton.scss';

interface PickerButtonProps {
  id?: string;
  buttonText: string;
  disabled?: boolean;
  openState: boolean;
  openStateToggle: () => void;
  popoverTarget: string;
}

export const PickerButton: React.FC<PickerButtonProps> = ({
  id = 'picker-button',
  buttonText,
  disabled = false,
  openState,
  openStateToggle,
  popoverTarget,
}): React.ReactElement => {
  return (
    <button
      id={id}
      className="picker-button"
      data-testid="picker-button"
      type="button"
      onClick={openStateToggle}
      aria-haspopup="menu"
      aria-expanded={openState}
      aria-controls={popoverTarget}
      popoverTarget={popoverTarget}
      popoverTargetAction="toggle"
      disabled={disabled}
    >
      {buttonText}
      {openState ? (
        <i className="fa-solid fa-caret-up"></i>
      ) : (
        <i className="fa-solid fa-caret-down"></i>
      )}
    </button>
  );
};
