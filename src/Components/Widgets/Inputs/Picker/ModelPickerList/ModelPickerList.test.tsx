import React from 'react';

import { act, render, screen } from '@testing-library/react';

import {
  mockBuildURL,
  mockDefaultAPIBasePath,
  mockDefaultAPIServer,
  mockGetFromURLString,
  mockLogin,
  mockLoginStatus,
  mockLogout,
  mockPostToURLString,
  mockPrepareURLFromArgs,
  mockPutToURLString,
  mockRefreshToken,
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
import { setupTestCollectionOneFetch } from '../../../../../Model/testing';

import { ModelPickerList } from './ModelPickerList';
import {
  ContextChanger,
  TestCollectionOne,
  TestCollectionOneURL,
} from '../../../../../testHelpers';

jest.useFakeTimers();

const setupLogin = (loggedIn = true) => {
  const loginPromise = PromiseWithResolvers();
  mockLoginStatus.mockReturnValue(loginPromise);
  loginPromise.resolve({
    loggedIn,
    token: testToken,
  });
};

const testToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGREM4MTEzOCIsInVzZXIiOnsiaWQiOjEsIm5hbWUiOiJhZG1pbiIsImFkbWluIjpmYWxzZX0sImlhdCI6MTY2NTk2NTA5OX0.2vz14X7Tm-oFlyOa7dcAF-5y5ympi_UlWyJNxO4xyS4';

beforeEach(() => {
  window.IntersectionObserver = mockIntersectionObserver;
  mockBuildURL.mockReturnValue(TestCollectionOneURL);
});

afterEach(() => {
  delete window.IntersectionObserver;
  mockIntersectionObserver._clear();
});

describe('Test ModelPickerList', () => {
  it('component should match snapshot', async () => {
    const [getPromise, fetchBody] = setupTestCollectionOneFetch();

    setupLogin();

    const testCollection = new TestCollectionOne({});
    const { asFragment } = render(
      <ContextChanger initialLoggedIn={true}>
        <ModelPickerList initialCollection={testCollection} />
      </ContextChanger>,
    );

    await act(async () => {
      getPromise.resolve(fetchBody);
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render the list as a popover dialog', async () => {
    const [getPromise, fetchBody] = setupTestCollectionOneFetch();

    setupLogin();

    const testCollection = new TestCollectionOne({});
    render(
      <ContextChanger initialLoggedIn={true}>
        <ModelPickerList initialCollection={testCollection} />
      </ContextChanger>,
    );

    const listDialog = screen.getByTestId('model-picker-list');
    expect(listDialog).toBeInTheDocument();
    expect(listDialog.tagName).toEqual('DIALOG');
    expect(listDialog).toHaveAttribute('id', 'model-picker-list');
    expect(listDialog).toHaveClass('model-picker-list');
    expect(listDialog).toHaveAttribute('popover', 'auto');

    const testList = screen.getByTestId('model-picker-list-list');
    expect(listDialog).toContainElement(testList);
    expect(testList).toBeEmptyDOMElement();

    await act(async () => {
      getPromise.resolve(fetchBody);
    });

    expect(testList).not.toBeEmptyDOMElement();
  });
});
