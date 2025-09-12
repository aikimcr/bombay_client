import React from 'react';
import { act, render, screen } from '@testing-library/react';

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

import { LoginStatusDisplay } from '.';

describe('LoginStatusDisplay', () => {
  describe('when logged out', () => {
    it('should show the login button', async () => {
      const { asFragment } = render(
        <ContextChanger initialLoggedIn={false}>
          <LoginStatusDisplay />
        </ContextChanger>,
      );

      expect(asFragment).toMatchSnapshot();

      const loginButton = screen.getByText('Login');
      expect(loginButton).toBeVisible();
      expect(loginButton.tagName).toBe('BUTTON');
    });

    it('should navigate to login route when the login button is pressed', async () => {
      render(
        <ContextChanger initialLoggedIn={false}>
          <LoginStatusDisplay />
        </ContextChanger>,
      );

      const loginButton = screen.getByText('Login');
      expect(loginButton).toBeInTheDocument();

      await act(async () => {
        loginButton.click();
      });

      expect(mockNavigateToRoute).toHaveBeenCalledWith('/login');
    });
  });

  describe('when logged in', () => {
    it('should show the logout button', async () => {
      const { asFragment } = render(
        <ContextChanger initialLoggedIn={true}>
          <LoginStatusDisplay />
        </ContextChanger>,
      );
      expect(asFragment).toMatchSnapshot();

      const logoutButton = screen.getByText('Logout');
      expect(logoutButton).toBeVisible();
      expect(logoutButton.tagName).toBe('BUTTON');
    });

    it('should logout when the logout button is pressed', async () => {
      const logoutPromise = PromiseWithResolvers();
      mockLogout.mockReturnValue(logoutPromise.promise);

      render(
        <ContextChanger initialLoggedIn={true}>
          <LoginStatusDisplay />
        </ContextChanger>,
      );

      let loginForm = screen.queryByText('Showing Log In Form');
      expect(loginForm).toBeNull();

      const logoutButton = screen.getByText('Logout');

      await act(async () => {
        logoutButton.click();
      });

      await act(async () => {
        logoutPromise.resolve({});
      });

      expect(mockLogout).toHaveBeenCalledTimes(1);

      loginForm = screen.queryByText('Showing Log In Form');
      expect(loginForm).toBeNull();
    });
  });
});
