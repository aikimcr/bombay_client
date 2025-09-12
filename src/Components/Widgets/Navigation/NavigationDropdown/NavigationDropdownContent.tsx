import React, { MouseEventHandler } from 'react';
import { NavigationButton } from '..';

import './NavigationDropdownContent.scss';

interface NavigationDropdownContentProps {
  handleNavigationClick: MouseEventHandler;
}

export const NavigationDropdownContent: React.FC<
  NavigationDropdownContentProps
> = ({ handleNavigationClick }): React.ReactElement => {
  return (
    <div className="navigation-dropdown-content">
      <NavigationButton
        labelText="Artists"
        path="/artistList"
        onClick={handleNavigationClick}
      />
      <NavigationButton
        labelText="Songs"
        path="/songList"
        onClick={handleNavigationClick}
      />
    </div>
  );
};
