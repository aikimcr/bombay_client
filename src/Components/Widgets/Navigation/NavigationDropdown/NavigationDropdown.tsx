import React, {
  MouseEventHandler,
  ToggleEventHandler,
  useContext,
  useRef,
  useState,
} from 'react';
import BombayLoginContext from '../../../../Context/BombayLoginContext';
import { useRouteManager } from '../../../../Hooks/useRouteManager';
import { isHTMLElement } from '../../../../Utilities';

import './NavigationDropdown.scss';
import { NavigationDropdownContent } from './NavigationDropdownContent';

export const NavigationDropdown: React.FC = (): React.ReactElement => {
  const menuRef = useRef(null);

  const { navigateToRoute } = useRouteManager();
  const { loggedIn } = useContext(BombayLoginContext);
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigationClick: MouseEventHandler = (evt) => {
    if (isHTMLElement(evt.target)) {
      navigateToRoute(evt.target.dataset.path);
    }

    menuRef.current?.hidePopover();
  };

  const handleToggle: ToggleEventHandler = (evt) => {
    setIsOpen(evt.newState === 'open');
  };

  if (!loggedIn) {
    return null;
  }

  return (
    <div className="navigation-dropdown">
      <button
        id="navigation-dropdown__button"
        className="navigation-dropdown__button"
        data-testid="navigation-dropdown-button"
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="navigation-dropdown__menu"
        popoverTarget="navigation-dropdown__menu"
        popoverTargetAction="toggle"
      >
        <i className="fa-solid fa-bars"></i>
      </button>
      <dialog
        ref={menuRef}
        id="navigation-dropdown__menu"
        className="navigation-dropdown__menu"
        data-testid="navigation-dropdown-menu"
        popover="auto"
        onToggle={handleToggle}
      >
        <NavigationDropdownContent
          handleNavigationClick={handleNavigationClick}
        />
      </dialog>
    </div>
  );
};
