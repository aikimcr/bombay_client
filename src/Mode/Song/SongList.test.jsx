import { useState } from 'react';
import { BrowserRouter } from 'react-router';

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
jest.mock('../../Hooks/useIntersectionObserver');

import { makeModels, makeAModel } from '../../testHelpers/modelTools';

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
  // const modalRoot = document.createElement("div");
  // modalRoot.id = "modal-root";
  // document.body.append(modalRoot);

  localStorage.setItem('jwttoken', testToken);
});

afterEach(() => {
  while (mockObserver.mockObserver.observers.length > 0) {
    mockObserver.mockObserver.observers.pop();
  }

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

const setUpModels = () => {
  const songNames = [
    "Hold On I'm Coming",
    'Walk This Way',
    'Kiss',
    'Cake By The Ocean',
    'Espresso',
    'Enter Sandman',
    'Stand By Me',
    "Ain't Talkin' 'Bout Love",
    'Kashmir',
    'War Pigs',
    'Renegade',
    'Refugee',
    'Gimme Shelter',
    'Bad Idea',
    'Smooth',
    'Baba O Riley',
    'Fireball',
    'Wear Your Love Like Heaven',
    'All Along The Watchtower',
    'Metal Guru',
  ];

  const artistNames = [
    'Same & Dave',
    'Aerosmith',
    'Prince',
    'DNCE',
    'Sabrina Carpenter',
    'Metallica',
    'Ben E. King',
    'Van Halen',
    'Led Zeppelin',
    'Black Sabbath',
    'Steppenwolf',
    'Tom Petty',
    'Rolling Stones',
    'Olivia Rodrigo',
    'Santana',
    'The Who',
    'Deep Purple',
    'Donovan',
    'Jimi Hendrix',
    'T. Rex',
  ];
  const [_fetchArtistBody, artistModels] = makeModels(
    10,
    {},
    'artist',
    (def) => {
      const idString = def.id || '1';
      const id = parseInt(idString) - 1;
      def.name = artistNames[id];
    },
  );

  const [_fetchBody, models] = makeModels(10, {}, 'song', (def) => {
    const idString = def.id || '1';
    const id = parseInt(idString) - 1;
    def.name = songNames[id];
    def.artist = artistModels[id];
  });

  const modelPromise = PromiseWithResolvers();
  mockModelFetcher.mockReturnValueOnce(modelPromise.promise);
  return [modelPromise, models];
};

it('Component should match snapshot', async () => {
  const [modelPromise, models] = setUpModels();

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
    modelPromise.resolve(models);
  });

  expect(asFragment()).toMatchSnapshot();
});

it('should render the list', async () => {
  const [modelPromise, models] = setUpModels();

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
    modelPromise.resolve(models);
  });
  expect(mockObserver.mockObserver.observers.length).toBe(1);
  expect(screen.getByTestId('song-list-component')).toBeInTheDocument();
  expect(screen.getAllByTestId('song-list-card')).toHaveLength(models.length);
});

it('should render the next page', async () => {
  const [modelPromise1, models1] = setUpModels();
  const [modelPromise2, models2] = setUpModels();

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
    modelPromise1.resolve(models1);
  });

  expect(mockObserver.mockObserver.observers.length).toBe(1);
  expect(screen.getByTestId('song-list-component')).toBeInTheDocument();
  expect(screen.getAllByTestId('song-list-card')).toHaveLength(models1.length);

  const observer = mockObserver.mockObserver.observers[0];

  await act(async () => {
    observer._fireIntersect(
      screen.getAllByTestId('song-list-card').slice(-1)[0],
    );
    modelPromise2.resolve(models2);
  });

  expect(screen.getAllByTestId('song-list-card')).toHaveLength(
    models1.length + models2.length,
  );
});

it('should stop when it runs out of data', async () => {
  const [modelPromise, models] = setUpModels();

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
    modelPromise.resolve(models);
  });

  expect(mockObserver.mockObserver.observers.length).toBe(1);
  expect(screen.getByTestId('song-list-component')).toBeInTheDocument();
  expect(screen.getAllByTestId('song-list-card')).toHaveLength(models.length);

  const observer = mockObserver.mockObserver.observers[0];

  await act(async () => {
    observer._fireIntersect(
      screen.getAllByTestId('song-list-card').slice(-1)[0],
    );
    modelPromise.reject({ status: 404, message: 'Not Found' });
  });

  expect(mockObserver.mockObserver.observers.length).toBe(1);
  expect(screen.getByTestId('song-list-component')).toBeInTheDocument();
  expect(screen.getAllByTestId('song-list-card')).toHaveLength(models.length);
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
  // expect(mockObserver.mockObserver.observers.length).toBe(1);
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
  // expect(Network.postToURLString).toBeCalledTimes(1);
  // expect(Network.postToURLString).toBeCalledWith(collectionUrl, {
  //   name: "Herkimer",
  //   artist_id: artistId,
  //   key_signature: "",
  //   tempo: null,
  //   lyrics: "",
  // });
});
