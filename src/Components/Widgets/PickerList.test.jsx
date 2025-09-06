import { useState } from 'react';

import { act, render, screen } from '@testing-library/react';

import {
  mockLoginStatus,
  mockRefreshToken,
  mockLogin,
  mockLogout,
} from '../../Network/testing';

jest.mock('../../Network/Login', () => {
  const originalModule = jest.requireActual('../../Network/Login');

  return {
    __esModule: true,
    ...originalModule,
    loginStatus: mockLoginStatus,
    refreshToken: mockRefreshToken,
    login: mockLogin,
    logout: mockLogout,
  };
});

import { mockModelFetcher, mockUseModelCollection } from '../../Hooks/testing';
jest.mock('../../Hooks/useModelCollection', () => {
  const originalModule = jest.requireActual('../../Hooks/useModelCollection');

  return {
    __esModule: true,
    ...originalModule,
    useModelCollection: mockUseModelCollection,
  };
});

import * as mockObserver from '../../Hooks/useIntersectionObserver';

import BombayLoginContext from '../../Context/BombayLoginContext';

import { MockTestCollection, mockFetchBody, mockModels } from './testing';

import PickerList from './PickerList.jsx';
import { useModelCollection } from '../../Hooks';

function TestWrapper({ loggedIn, children }) {
  const [loginState, setLoginState] = useState({ loggedIn });

  return (
    <BombayLoginContext.Provider value={loginState}>
      {children}
    </BombayLoginContext.Provider>
  );
}

jest.useFakeTimers();

const testToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGREM4MTEzOCIsInVzZXIiOnsiaWQiOjEsIm5hbWUiOiJhZG1pbiIsImFkbWluIjpmYWxzZX0sImlhdCI6MTY2NTk2NTA5OX0.2vz14X7Tm-oFlyOa7dcAF-5y5ympi_UlWyJNxO4xyS4';

function setupLogin(loggedIn = true, token = testToken) {
  const loginPromise = PromiseWithResolvers();
  mockLogin.mockReturnValue(loginPromise);
  loginPromise.resolve({ loggedIn, token });
}

beforeEach(() => {
  localStorage.setItem('jwttoken', testToken);
});

afterEach(() => {
  while (mockObserver.mockObserver.observers.length > 0) {
    mockObserver.mockObserver.observers.pop();
  }

  localStorage.removeItem('jwttoken');
});

it('Component should match snapshot', async () => {
  setupLogin();
  const pickModel = jest.fn();

  const refreshPromise = PromiseWithResolvers();
  mockModelFetcher.mockReturnValue(refreshPromise.promise);

  const { asFragment } = render(
    <TestWrapper loggedIn={true}>
      <PickerList
        pickModel={pickModel}
        isOpen={true}
        collectionClass={MockTestCollection}
      />
    </TestWrapper>,
  );

  await act(async () => {
    refreshPromise.resolve(mockModels);
  });

  expect(asFragment()).toMatchSnapshot();
});

it('Should show the list', async () => {
  setupLogin();
  const pickModel = jest.fn();

  const refreshPromise = PromiseWithResolvers();
  mockModelFetcher.mockReturnValue(refreshPromise.promise);

  render(
    <TestWrapper loggedIn={true}>
      <PickerList
        pickModel={pickModel}
        isOpen={true}
        collectionClass={MockTestCollection}
      />
    </TestWrapper>,
  );

  expect(screen.getByTestId('picker-component')).toBeInTheDocument();
  expect(screen.queryAllByTestId('picker-item')).toHaveLength(0);

  await act(async () => {
    refreshPromise.resolve(mockModels);
  });

  expect(screen.queryAllByTestId('picker-item')).toHaveLength(
    mockModels.length,
  );
});

it('should show an empty list', async () => {
  setupLogin();
  const pickModel = jest.fn();

  const refreshPromise = PromiseWithResolvers();
  mockModelFetcher.mockReturnValue(refreshPromise.promise);

  render(
    <TestWrapper loggedIn={true}>
      <PickerList
        pickModel={pickModel}
        isOpen={true}
        collectionClass={MockTestCollection}
      />
    </TestWrapper>,
  );

  expect(screen.getByTestId('picker-component')).toBeInTheDocument();
  expect(screen.queryAllByTestId('picker-item')).toHaveLength(0);

  await act(async () => {
    refreshPromise.reject({ status: 404, message: 'Not Found' });
  });

  expect(screen.queryAllByTestId('picker-item')).toHaveLength(0);
});
