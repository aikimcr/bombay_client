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
  setupSongCollectionFetch,
  TestSongCollectionURL,
} from '../../Model/testing';

import BombayLoginContext from '../../Context/BombayLoginContext';
import BombayUtilityContext from '../../Context/BombayUtilityContext';

import { SongList } from './SongList.jsx';

jest.useFakeTimers();

function FakeContent(props) {
  const [loginState, setLoginState] = useState({
    loggedIn: true,
    showLoginForm: false,
  });
  const [modeState, setModeState] = useState('song');

  const checkLoginState = async () => {
    setLoginState(true);
  };

  const setMode = async (newMode) => {
    setModeState('song');
  };

  const getBootstrap = () => {
    return {
      keySignatures: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    };
  };

  const utilities = {
    checkLoginState,
    setMode,
    getBootstrap,
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
  mockBuildURL.mockReturnValue(new URL(TestSongCollectionURL));
});

afterEach(() => {
  delete window.IntersectionObserver;
  mockIntersectionObserver._clear();
  localStorage.removeItem('jwttoken');
});

const mockUtility = {
  getBootstrap: () => {
    return {
      keySignatures: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    };
  },
};

const renderWrapper = ({ children }) => {
  return (
    <BombayUtilityContext.Provider value={mockUtility}>
      {children}
    </BombayUtilityContext.Provider>
  );
};

it('Component should match snapshot', async () => {
  const [getPromise, fetchBody, models] = setupSongCollectionFetch();

  const loginPromise = PromiseWithResolvers();
  mockLoginStatus.mockReturnValue(loginPromise);

  loginPromise.resolve({
    loggedIn: true,
    token: testToken,
  });

  const { asFragment } = render(
    <FakeContent>
      <SongList />
    </FakeContent>,
  );

  await act(async () => {
    getPromise.resolve(fetchBody);
  });

  expect(asFragment()).toMatchSnapshot();
});

it('should render the list', async () => {
  const [getPromise, fetchBody, models] = setupSongCollectionFetch();

  const loginPromise = PromiseWithResolvers();
  mockLoginStatus.mockReturnValue(loginPromise);
  loginPromise.resolve({
    loggedIn: true,
    token: testToken,
  });

  const result = render(
    <FakeContent>
      <SongList />
    </FakeContent>,
  );

  await act(async () => {
    getPromise.resolve(fetchBody);
  });
  expect(mockIntersectionObserver.observers.length).toBe(1);
  expect(screen.getByTestId('song-list-component')).toBeInTheDocument();
  expect(screen.getAllByTestId('song-list-card')).toHaveLength(models.length);
});

it('should render the next page', async () => {
  const [getPromise1, fetchBody1, models1] = setupSongCollectionFetch();
  const [getPromise2, fetchBody2, models2] = setupSongCollectionFetch({
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
      <SongList />
    </FakeContent>,
  );

  await act(async () => {
    getPromise1.resolve(fetchBody1);
  });

  expect(mockIntersectionObserver.observers.length).toBe(1);
  expect(screen.getByTestId('song-list-component')).toBeInTheDocument();
  expect(screen.getAllByTestId('song-list-card')).toHaveLength(models1.length);

  const observer = mockIntersectionObserver.observers[0];

  await act(async () => {
    observer._fireIntersect(
      screen.getAllByTestId('song-list-card').slice(-1)[0],
    );
    getPromise2.resolve(fetchBody2);
  });

  expect(screen.getAllByTestId('song-list-card')).toHaveLength(
    models1.length + models2.length,
  );
});

it('should stop when it runs out of data', async () => {
  const [getPromise1, fetchBody1, models1] = setupSongCollectionFetch();
  const [getPromise2] = setupSongCollectionFetch({
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
      <SongList />
    </FakeContent>,
  );

  await act(async () => {
    getPromise1.resolve(fetchBody1);
  });

  expect(mockIntersectionObserver.observers.length).toBe(1);
  expect(screen.getByTestId('song-list-component')).toBeInTheDocument();
  expect(screen.getAllByTestId('song-list-card')).toHaveLength(models1.length);

  const observer = mockIntersectionObserver.observers[0];

  await act(async () => {
    observer._fireIntersect(
      screen.getAllByTestId('song-list-card').slice(-1)[0],
    );
    getPromise2.reject({ status: 404, message: 'Not Found' });
  });

  expect(mockIntersectionObserver.observers.length).toBe(1);
  expect(screen.getByTestId('song-list-component')).toBeInTheDocument();
  expect(screen.getAllByTestId('song-list-card')).toHaveLength(models1.length);
});

// Move this test to testing for the song editor form
it.skip('should add a song', async () => {
  // const loginPromise = PromiseWithResolvers();
  // mockLoginStatus.mockReturnValue(loginPromise);
  // loginPromise.resolve({
  //   loggedIn: true,
  //   token: testToken,
  // });
  // const modalRoot = document.getElementById("modal-root");
  // const result = render(
  //   <FakeContent>
  //     <SongList />
  //   </FakeContent>,
  // );
  // const [fetchBody] = makeModels(10, {}, "song");
  // const collectionUrl = Network.prepareURLFromArgs("song").toString();
  // await act(async () => {
  //   resolve(fetchBody);
  // });
  // expect(mockIntersectionObserver.observers.length).toBe(1);
  // // const [, controls] = getAreas(result);
  // expect(modalRoot.childElementCount).toEqual(0);
  // // const addButton = controls.firstChild;
  // // act(() => {
  // //   addButton.click();
  // // });
  // expect(modalRoot.childElementCount).toEqual(1);
  // const submitButton = modalRoot.querySelector('[type="submit"]');
  // const [saveDef] = makeAModel("song");
  // const artistId = saveDef.artist.id;
  // await changeInput(
  //   modalRoot.querySelector('[data-targetfield="name"'),
  //   "input",
  //   "Herkimer",
  //   250,
  // );
  // await changeInput(
  //   modalRoot.querySelector('[data-targetfield="artist_id"'),
  //   "input",
  //   artistId,
  //   250,
  // );
  // await act(async () => {
  //   submitButton.click();
  // });
  // resolve(saveDef);
  // expect(Network.postToURLString).toHaveBeenCalledTimes(1);
  // expect(Network.postToURLString).toHaveBeenCalledWith(collectionUrl, {
  //   name: "Herkimer",
  //   artist_id: artistId,
  //   key_signature: "",
  //   tempo: null,
  //   lyrics: "",
  // });
});
