import React, { MouseEventHandler } from 'react';

import './NavigationButton.scss';

interface NavigationButtonProps {
  labelText: string;
  path: string;
  onClick: MouseEventHandler;
}

export const NavigationButton: React.FC<NavigationButtonProps> = ({
  labelText,
  path,
  onClick,
}): React.ReactElement => {
  return (
    <button
      type="button"
      className="navigation-button"
      data-testid="navigation-button"
      data-path={path}
      onClick={onClick}
    >
      {labelText}
    </button>
  );
};
