import React, { useState } from 'react';
import { BrowserRouter } from 'react-router';

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

jest.mock('../../Network/Network', () => {
  const originalModule = jest.requireActual('../../Network/Network');

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

import { mockIntersectionObserver } from '../../Hooks/testing';
import {
  setupArtistCollectionFetch,
  TestArtistCollectionURL,
} from '../../Model/testing';

import BombayLoginContext from '../../Context/BombayLoginContext';
import BombayUtilityContext from '../../Context/BombayUtilityContext';

import { ArtistList } from './ArtistList.jsx';

jest.useFakeTimers();

function FakeContent(props) {
  const [loginState, setLoginState] = useState({
    loggedIn: true,
    showLoginForm: false,
  });
  const [modeState, setModeState] = useState('artist');

  const checkLoginState = async () => {
    setLoginState(true);
  };

  const setMode = async (newMode) => {
    setModeState('artist');
  };

  const utilities = {
    checkLoginState,
    setMode,
  };

  return (
    <BrowserRouter basename="/">
      <BombayLoginContext.Provider value={loginState}>
        <BombayUtilityContext.Provider value={utilities}>
          {props.children}
        </BombayUtilityContext.Provider>
      </BombayLoginContext.Provider>
    </BrowserRouter>
  );
}

jest.useFakeTimers();

const testToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGREM4MTEzOCIsInVzZXIiOnsiaWQiOjEsIm5hbWUiOiJhZG1pbiIsImFkbWluIjpmYWxzZX0sImlhdCI6MTY2NTk2NTA5OX0.2vz14X7Tm-oFlyOa7dcAF-5y5ympi_UlWyJNxO4xyS4';

beforeEach(() => {
  window.IntersectionObserver = mockIntersectionObserver;
  localStorage.setItem('jwttoken', testToken);
  mockBuildURL.mockReturnValue(new URL(TestArtistCollectionURL));
});

afterEach(() => {
  delete window.IntersectionObserver;
  mockIntersectionObserver._clear();
  localStorage.removeItem('jwttoken');
});

function getAreas(result) {
  expect(mockIntersectionObserver.observers.length).toBe(1);
  const observer = mockIntersectionObserver.observers[0];

  const index = result.container;
  expect(index.childElementCount).toEqual(1);

  const listComponent = index.firstChild;
  expect(listComponent.childElementCount).toEqual(2);

  const controls = listComponent.firstChild;
  expect(controls.className).toEqual('list-controls');
  expect(controls.childElementCount).toEqual(3);

  const listContainer = listComponent.lastChild;
  expect(listContainer).toHaveClass('artist-list-container');
  expect(listContainer).toHaveClass('list-container');
  expect(listContainer.childElementCount).toEqual(1);
  expect(observer.options.root.lastChild).toHaveClass('artist-list-container');

  const listElement = listContainer.firstChild;

  return [listElement, controls, observer, listContainer, index];
}

it('Component should match snapshot', async () => {
  const [getPromise, fetchBody, models] = setupArtistCollectionFetch();

  const loginPromise = PromiseWithResolvers();
  mockLoginStatus.mockReturnValue(loginPromise);
  loginPromise.resolve({
    loggedIn: true,
    token: testToken,
  });

  const { asFragment } = render(
    <FakeContent>
      <ArtistList />
    </FakeContent>,
  );

  await act(async () => {
    getPromise.resolve(fetchBody);
  });

  expect(asFragment()).toMatchSnapshot();
});

it('should render the list', async () => {
  const [getPromise, fetchBody, models] = setupArtistCollectionFetch();

  const loginPromise = PromiseWithResolvers();
  mockLoginStatus.mockReturnValue(loginPromise);
  loginPromise.resolve({
    loggedIn: true,
    token: testToken,
  });

  const result = render(
    <FakeContent>
      <ArtistList />
    </FakeContent>,
  );

  await act(async () => {
    getPromise.resolve(fetchBody);
  });

  expect(mockIntersectionObserver.observers.length).toBe(1);

  expect(screen.getByTestId('artist-list-component')).toBeInTheDocument();
  expect(screen.getAllByTestId('artist-list-card')).toHaveLength(models.length);
});

it('should render the next page', async () => {
  const [getPromise1, fetchBody1, models1] = setupArtistCollectionFetch();
  const [getPromise2, fetchBody2, models2] = setupArtistCollectionFetch({
    offset: 10,
    limit: 10,
  });

  const loginPromise = PromiseWithResolvers();
  mockLoginStatus.mockReturnValue(loginPromise);
  loginPromise.resolve({
    loggedIn: true,
    token: testToken,
  });

  const result = render(
    <FakeContent>
      <ArtistList />
    </FakeContent>,
  );

  await act(async () => {
    getPromise1.resolve(fetchBody1);
  });

  expect(mockIntersectionObserver.observers.length).toBe(1);
  expect(screen.getByTestId('artist-list-component')).toBeInTheDocument();
  expect(screen.getAllByTestId('artist-list-card')).toHaveLength(
    models1.length,
  );

  const observer = mockIntersectionObserver.observers[0];

  await act(async () => {
    observer._fireIntersect(
      screen.getAllByTestId('artist-list-card').slice(-1)[0],
    );
    getPromise2.resolve(fetchBody2);
  });

  expect(screen.getAllByTestId('artist-list-card')).toHaveLength(
    models1.length + models2.length,
  );
});

it('should stop when it runs out of data', async () => {
  const [getPromise1, fetchBody1, models1] = setupArtistCollectionFetch();
  const [getPromise2] = setupArtistCollectionFetch();

  const loginPromise = PromiseWithResolvers();
  mockLoginStatus.mockReturnValue(loginPromise);
  loginPromise.resolve({
    loggedIn: true,
    token: testToken,
  });

  const result = render(
    <FakeContent>
      <ArtistList />
    </FakeContent>,
  );

  await act(async () => {
    getPromise1.resolve(fetchBody1);
  });

  expect(mockIntersectionObserver.observers.length).toBe(1);
  expect(screen.getByTestId('artist-list-component')).toBeInTheDocument();
  expect(screen.getAllByTestId('artist-list-card')).toHaveLength(
    models1.length,
  );

  const observer = mockIntersectionObserver.observers[0];

  await act(async () => {
    observer._fireIntersect(
      screen.getAllByTestId('artist-list-card').slice(-1)[0],
    );
    getPromise2.reject({ status: 404, message: 'Not Found' });
  });

  expect(mockIntersectionObserver.observers.length).toBe(1);
  expect(screen.getByTestId('artist-list-component')).toBeInTheDocument();
  expect(screen.getAllByTestId('artist-list-card')).toHaveLength(
    models1.length,
  );
});

// Move this to testing the artist editing component.
it.skip('should add an artist', async () => {
  const loginPromise = PromiseWithResolvers();
  mockLoginStatus.mockReturnValue(loginPromise);
  loginPromise.resolve({
    loggedIn: true,
    token: testToken,
  });

  const modalRoot = document.getElementById('modal-root');

  const result = render(
    <FakeContent>
      <ArtistList />
    </FakeContent>,
  );

  const [fetchBody] = makeFetchBodyAndModels(10, {}, 'artist');
  const collectionUrl = Network.prepareURLFromArgs('artist').toString();

  await act(async () => {
    resolve(fetchBody);
  });

  expect(mockIntersectionObserver.observers.length).toBe(1);

  const [, controls] = getAreas(result);

  expect(modalRoot.childElementCount).toEqual(0);

  const addButton = controls.firstChild;

  act(() => {
    addButton.click();
  });

  expect(modalRoot.childElementCount).toEqual(1);

  const submitButton = modalRoot.querySelector('[type="submit"]');

  const [saveDef] = makeAModel('artist');
  await changeInput(
    modalRoot.querySelector('[data-targetfield="name"'),
    'input',
    'Herkimer',
    250,
  );

  await act(async () => {
    submitButton.click();
  });

  resolve(saveDef);

  expect(Network.postToURLString).toHaveBeenCalledTimes(1);
  expect(Network.postToURLString).toHaveBeenCalledWith(collectionUrl, {
    name: 'Herkimer',
  });
});
