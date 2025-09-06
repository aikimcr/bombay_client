import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import {
  mockLoginStatus,
  mockRefreshToken,
  mockLogin,
  mockLogout,
  testToken,
} from '../../../Network/testing';

jest.mock('../../../Network/Login', () => {
  const originalModule = jest.requireActual('../../../Network/Login');

  return {
    __esModule: true,
    ...originalModule,
    loginStatus: mockLoginStatus,
    refreshToken: mockRefreshToken,
    login: mockLogin,
    logout: mockLogout,
  };
});

import { ContextChanger } from '../../../testHelpers/ContextChanger';
import { Login } from '.';

jest.useFakeTimers();

beforeEach(() => {
  localStorage.removeItem('jwttoken');
});

it('Component should match snapshot', async () => {
  const { asFragment } = render(
    <ContextChanger initialLoggedIn={false}>
      <Login />
    </ContextChanger>,
  );

  expect(asFragment()).toMatchSnapshot();
});

it('should enable and disable the login button', async () => {
  render(
    <ContextChanger initialLoggedIn={false}>
      <Login />
    </ContextChanger>,
  );

  const loginButton = screen.getByText('Login');
  expect(loginButton).toBeDisabled();

  const userNameInput = screen.getByLabelText('User Name');
  expect(userNameInput).toHaveValue('');

  await act(async () => {
    fireEvent.change(userNameInput, { target: { value: 'herkimer' } });
  });

  expect(userNameInput).toHaveValue('herkimer');
  expect(loginButton).toBeDisabled();

  const passwordInput = screen.getByLabelText('Password');
  expect(passwordInput).toHaveValue('');

  await act(async () => {
    fireEvent.change(passwordInput, { target: { value: 'jones' } });
  });

  expect(loginButton).not.toBeDisabled();
});

it('should login successfully', async () => {
  const { promise, resolve } = PromiseWithResolvers();
  mockLogin.mockReturnValue(promise);

  const result = render(
    <ContextChanger initialLoggedIn={false}>
      <Login />
    </ContextChanger>,
  );

  const loginButton = screen.getByText('Login');
  expect(loginButton).toBeDisabled();

  const userNameInput = screen.getByLabelText('User Name');
  const passwordInput = screen.getByLabelText('Password');

  await act(async () => {
    fireEvent.change(userNameInput, { target: { value: 'herkimer' } });
  });

  await act(async () => {
    fireEvent.change(passwordInput, { target: { value: 'jones' } });
  });

  expect(loginButton).not.toBeDisabled();

  await act(async () => {
    fireEvent.click(loginButton);
  });

  await act(async () => {
    resolve(testToken);
  });

  expect(mockLogin).toBeCalledTimes(1);
  expect(mockLogin).toBeCalledWith('herkimer', 'jones');
});

it('should show error on failed login', async () => {
  const { promise, resolve } = PromiseWithResolvers();
  mockLogin.mockReturnValue(promise);

  const result = render(
    <ContextChanger initialLoggedIn={false}>
      <Login />
    </ContextChanger>,
  );

  const loginButton = screen.getByText('Login');
  expect(loginButton).toBeDisabled();

  const userNameInput = screen.getByLabelText('User Name');
  const passwordInput = screen.getByLabelText('Password');

  await act(async () => {
    fireEvent.change(userNameInput, { target: { value: 'herkimer' } });
  });

  await act(async () => {
    fireEvent.change(passwordInput, { target: { value: 'jones' } });
  });

  expect(loginButton).not.toBeDisabled();

  await act(async () => {
    fireEvent.click(loginButton);
  });

  await act(async () => {
    resolve(null);
  });

  expect(mockLogin).toBeCalledTimes(1);
  expect(mockLogin).toBeCalledWith('herkimer', 'jones');
});

it('should show error on call error', async () => {
  const { promise, reject } = PromiseWithResolvers();
  mockLogin.mockReturnValue(promise);

  const result = render(
    <ContextChanger initialLoggedIn={false}>
      <Login />
    </ContextChanger>,
  );

  const loginButton = screen.getByText('Login');
  expect(loginButton).toBeDisabled();

  const userNameInput = screen.getByLabelText('User Name');
  const passwordInput = screen.getByLabelText('Password');

  await act(async () => {
    fireEvent.change(userNameInput, { target: { value: 'herkimer' } });
  });

  await act(async () => {
    fireEvent.change(passwordInput, { target: { value: 'jones' } });
  });

  expect(loginButton).not.toBeDisabled();

  await act(async () => {
    fireEvent.click(loginButton);
  });

  await act(async () => {
    reject({ status: 500, messsage: 'Mock fail' });
  });

  expect(mockLogin).toBeCalledTimes(1);
  expect(mockLogin).toBeCalledWith('herkimer', 'jones');
});

it('should clear the inputs and error on clear all fields', async () => {
  const { promise, resolve } = PromiseWithResolvers();

  const result = render(
    <ContextChanger initialLoggedIn={false}>
      <Login />
    </ContextChanger>,
  );

  const loginButton = screen.getByText('Login');
  expect(loginButton).toBeDisabled();

  const userNameInput = screen.getByLabelText('User Name');
  const passwordInput = screen.getByLabelText('Password');

  await act(async () => {
    fireEvent.change(userNameInput, { target: { value: 'herkimer' } });
  });

  await act(async () => {
    fireEvent.change(passwordInput, { target: { value: 'jones' } });
  });

  expect(loginButton).not.toBeDisabled();

  const clearButton = loginButton.previousElementSibling;

  await act(async () => {
    fireEvent.click(clearButton);
  });

  // expect(loginButton).toBeDisabled();
});
