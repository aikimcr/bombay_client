import React, { useState } from 'react';

import { act, render, screen } from '@testing-library/react';

import {
  mockLoginStatus,
  mockRefreshToken,
  mockLogin,
  mockLogout,
  mockPrepareURLFromArgs,
  mockGetFromURLString,
  mockPostToURLString,
  mockPutToURLString,
  mockDefaultAPIServer,
  mockDefaultAPIBasePath,
  mockBuildURL,
} from '../../../../../Network/testing';

jest.mock('../../../../../Network/Login', () => {
  const originalModule = jest.requireActual('../../../../../Network/Login');

  return {
    __esModule: true,
    ...originalModule,
    loginStatus: mockLoginStatus,
    refreshToken: mockRefreshToken,
    login: mockLogin,
    logout: mockLogout,
  };
});

jest.mock('../../../../../Network/Network', () => {
  const originalModule = jest.requireActual('../../../../../Network/Network');

  return {
    __esModule: true,
    ...originalModule,
    defaultAPIServer: mockDefaultAPIServer,
    defaultAPIBasePath: mockDefaultAPIBasePath,
    buildURL: mockBuildURL,
    prepareURLFromArgs: mockPrepareURLFromArgs,
    getFromURLString: mockGetFromURLString,
    postToURLString: mockPostToURLString,
    putToURLString: mockPutToURLString,
  };
});

import { mockIntersectionObserver } from '../../../../../Hooks/testing';

import BombayLoginContext from '../../../../../Context/BombayLoginContext';

import {
  MockTestCollection,
  mockFetchBody,
  mockModels,
} from '../../../testing';

import PickerList from './PickerList.jsx';
import { setupTestCollectionOneFetch } from '../../../../../Model/testing';
import { TestCollectionOne } from '../../../../../testHelpers';

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
  window.IntersectionObserver = mockIntersectionObserver;
  localStorage.setItem('jwttoken', testToken);
});

afterEach(() => {
  delete window.IntersectionObserver;
  mockIntersectionObserver._clear();
  localStorage.removeItem('jwttoken');
});

it('Component should match snapshot', async () => {
  setupLogin();
  const pickModel = jest.fn();

  const [getPromise, fetchBody] = setupTestCollectionOneFetch();
  const testCollection = new TestCollectionOne({});

  const { asFragment } = render(
    <TestWrapper loggedIn={true}>
      <PickerList
        pickModel={pickModel}
        isOpen={true}
        initialCollection={testCollection}
      />
    </TestWrapper>,
  );

  await act(async () => {
    getPromise.resolve(fetchBody);
  });

  expect(asFragment()).toMatchSnapshot();
});

it('Should show the list', async () => {
  setupLogin();
  const pickModel = jest.fn();

  const [getPromise, fetchBody, models] = setupTestCollectionOneFetch();
  const testCollection = new TestCollectionOne({});

  render(
    <TestWrapper loggedIn={true}>
      <PickerList
        pickModel={pickModel}
        isOpen={true}
        initialCollection={testCollection}
      />
    </TestWrapper>,
  );

  expect(screen.getByTestId('picker-component')).toBeInTheDocument();
  expect(screen.queryAllByTestId('picker-item')).toHaveLength(0);

  await act(async () => {
    getPromise.resolve(fetchBody);
  });

  expect(screen.queryAllByTestId('picker-item')).toHaveLength(models.length);
});

it('should show an empty list', async () => {
  setupLogin();
  const pickModel = jest.fn();

  const [getPromise] = setupTestCollectionOneFetch();
  const testCollection = new TestCollectionOne({});

  render(
    <TestWrapper loggedIn={true}>
      <PickerList
        pickModel={pickModel}
        isOpen={true}
        initialCollection={testCollection}
      />
    </TestWrapper>,
  );

  expect(screen.getByTestId('picker-component')).toBeInTheDocument();
  expect(screen.queryAllByTestId('picker-item')).toHaveLength(0);

  await act(async () => {
    getPromise.reject({ status: 404, message: 'Not Found' });
  });

  expect(screen.queryAllByTestId('picker-item')).toHaveLength(0);
});
