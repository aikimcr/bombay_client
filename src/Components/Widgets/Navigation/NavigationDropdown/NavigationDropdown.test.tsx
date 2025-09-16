import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import {
  mockLoginStatus,
  mockRefreshToken,
  mockLogin,
  mockLogout,
} from '../../../../Network/testing';

jest.mock('../../../../Network/Login', () => {
  const originalModule = jest.requireActual('../../../../Network/Login');

  return {
    __esModule: true,
    ...originalModule,
    loginStatus: mockLoginStatus,
    refreshToken: mockRefreshToken,
    login: mockLogin,
    logout: mockLogout,
  };
});

import {
  mockUseRouteManager,
  mockNavigateToRoute,
} from '../../../../Hooks/testing/mocks/mockUseRouteManager';

jest.mock('../../../../Hooks/useRouteManager', () => {
  const originalModule = jest.requireActual(
    '../../../../Hooks/useRouteManager',
  );

  return {
    __esModules: true,
    ...originalModule,
    useRouteManager: mockUseRouteManager,
  };
});

import { ContextChanger } from '../../../../testHelpers/ContextChanger';

import { NavigationDropdown } from './NavigationDropdown';

describe('Test NavigationDropdown', () => {
  describe('Logged In', () => {
    it('should match snapshot', () => {
      const { asFragment } = render(
        <ContextChanger initialLoggedIn={true}>
          <NavigationDropdown />
        </ContextChanger>,
      );

      expect(asFragment()).toMatchSnapshot();
    });

    it('should show the dropdown button', () => {
      render(
        <ContextChanger initialLoggedIn={true}>
          <NavigationDropdown />
        </ContextChanger>,
      );

      const button = screen.getByTestId('navigation-dropdown-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('id', 'navigation-dropdown__button');
      expect(button).toHaveAttribute('aria-haspopup', 'menu');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute(
        'aria-controls',
        'navigation-dropdown__menu',
      );

      expect(button).toHaveClass('navigation-dropdown__button');
      expect(button).toHaveTextContent('');

      const fontAwesome = button.getElementsByTagName('i');
      expect(fontAwesome).toHaveLength(1);
      expect(fontAwesome[0]).toHaveClass('fa-solid');
      expect(fontAwesome[0]).toHaveClass('fa-bars');
    });

    it('should open the popover when the button is clicked', () => {
      render(
        <ContextChanger initialLoggedIn={true}>
          <NavigationDropdown />
        </ContextChanger>,
      );

      const button = screen.getByTestId('navigation-dropdown-button');
      expect(button).toHaveAttribute('aria-expanded', 'false');

      const dialog: HTMLDialogElement = screen.getByTestId(
        'navigation-dropdown-menu',
      );
      expect(dialog).not.toBeVisible();

      act(() => {
        fireEvent.click(button);
      });

      waitFor(() => {
        expect(dialog).toBeVisible();
      });

      waitFor(() => {
        expect(button).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should contain the anchor list', () => {
      render(
        <ContextChanger initialLoggedIn={true}>
          <NavigationDropdown />
        </ContextChanger>,
      );

      const dialog: HTMLDialogElement = screen.getByTestId(
        'navigation-dropdown-menu',
      );
      const navItems = dialog.querySelectorAll('.navigation-button');
      expect(navItems).toHaveLength(2);
      expect(navItems[0]).toHaveAttribute('data-path', '/artistList');
      expect(navItems[1]).toHaveAttribute('data-path', '/songList');
    });

    it('should close the popover when an item is clicked', () => {
      const mockHidePopover = jest.fn();

      if (!HTMLElement.prototype.hidePopover) {
        HTMLElement.prototype.hidePopover = mockHidePopover;
      }

      render(
        <ContextChanger initialLoggedIn={true}>
          <NavigationDropdown />
        </ContextChanger>,
      );

      const dialog: HTMLDialogElement = screen.getByTestId(
        'navigation-dropdown-menu',
      );
      const navItem = dialog.querySelector(
        '.navigation-button[data-path="/artistList"]',
      );

      act(() => {
        fireEvent.click(navItem);
      });

      expect(mockNavigateToRoute).toHaveBeenCalledWith('/artistList');
    });
  });

  describe('logged out', () => {
    it('should be empty', () => {
      render(
        <ContextChanger initialLoggedIn={false}>
          <NavigationDropdown />
        </ContextChanger>,
      );

      expect(screen.queryByTestId('navigation-dropdown-button')).toBeNull();
      expect(screen.queryByTestId('navigation-dropdown-menu')).toBeNull();
    });
  });
});
