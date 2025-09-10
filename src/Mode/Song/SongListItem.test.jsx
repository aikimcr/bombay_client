import { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

jest.mock('./Song');
jest.mock('../../Modal/FormModal', () => {
  const originalModule = jest.requireActual('../../Modal/FormModal');

  return {
    __esModule: true,
    ...originalModule,
    default: () => <div data-testid="edit-song-modal">Form Modal</div>,
  };
});

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

import * as Network from '../../Network/Network';

import {
  makeFetchBodyAndModels,
  makeAModel,
} from '../../testHelpers/modelTools';

import BombayLoginContext from '../../Context/BombayLoginContext';
import BombayUtilityContext from '../../Context/BombayUtilityContext';

import { SongListItem } from './SongListItem';

jest.useFakeTimers();

const mockUtility = {
  getBootstrap: () => {
    return {
      keySignatures: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    };
  },
};

const renderWrapper = ({ children }) => {
  const [loginState, setLoginState] = useState({
    loggedIn: true,
    showLoginForm: false,
  });

  return (
    <BombayLoginContext.Provider value={loginState}>
      <BombayUtilityContext.Provider value={mockUtility}>
        {children}
      </BombayUtilityContext.Provider>
    </BombayLoginContext.Provider>
  );
};

function setupLogin(loggedIn = true) {
  mockLoginStatus.mockResolvedValue(loggedIn);
}

const makeTestSong = () => {
  const [_artistModelDef, artistModel] = makeAModel('artist', (def) => {
    def.name = 'Billy Joel';
  });
  const [_modelDef, model] = makeAModel('song', (def) => {
    def.name = 'Piano Man';
    def.artist = artistModel;
  });

  return model;
};

it('Component should match snapshot', async () => {
  const model = makeTestSong();

  const { asFragment } = render(<SongListItem song={model} />, {
    wrapper: renderWrapper,
  });

  expect(asFragment()).toMatchSnapshot();
});

it('should open the editor modal', async () => {
  setupLogin();

  const model = makeTestSong();
  render(<SongListItem song={model} />, {
    wrapper: renderWrapper,
  });

  const songCard = screen.getByTestId('song-list-card');

  await act(async () => {
    fireEvent.click(songCard);
  });

  expect(screen.getByTestId('edit-song-modal')).toBeInTheDocument();
});

// Move these tests to the SongForm component
it.skip('should save changes to the model', async () => {
  setupLogin();

  const [mockGetPromise, mockGetResolve] = makeResolvablePromise();
  const [mockPutPromise, mockPutResolve] = makeResolvablePromise();
  // The mock is not recognized unless it is done this way.
  Network.getFromURLString = jest.fn((url) => {
    return mockGetPromise;
  });

  Network.putToURLString = jest.fn((url, body) => {
    return mockPutPromise;
  });

  const [fetchBody, models] = makeFetchBodyAndModels(10, {});

  await act(async () => {
    mockGetResolve(fetchBody);
  });

  const model = makeTestSong();
  const songModelDef = { ...modelDef };
  delete songModelDef.artist;

  const result = render(<SongListItem song={model} />, {
    wrapper: renderWrapper,
  });

  const index = result.container;

  await act(async () => {
    index.firstChild.click();
  });

  const modalRoot = document.getElementById('modal-root');
  expect(modalRoot.childElementCount).toEqual(1);

  const submitButton = modalRoot.querySelector('[type="submit"]');

  await changeInput(
    modalRoot.querySelector('[data-targetfield="name"'),
    'input',
    'Herkimer',
    250,
  );

  act(() => {
    submitButton.click();
  });

  await act(async () => {
    mockPutResolve({ ...modelDef, name: 'Herkimer' });
  });

  expect(Network.putToURLString).toBeCalledTimes(1);
  expect(Network.putToURLString).toBeCalledWith(modelDef.url, {
    ...songModelDef,
    name: 'Herkimer',
  });
});

it.skip('should update the artist name', async () => {
  setupLogin();

  const [mockGetPromise, mockGetResolve] = makeResolvablePromise();
  const [mockPutPromise, mockPutResolve] = makeResolvablePromise();
  // The mock is not recognized unless it is done this way.
  Network.getFromURLString = jest.fn((url) => {
    return mockGetPromise;
  });

  Network.putToURLString = jest.fn((url, body) => {
    return mockPutPromise;
  });

  const [modelDef, songModel] = makeAModel('song');
  const oldArtistDef = modelDef.artist;
  const songModelDef = { ...modelDef };
  delete songModelDef.artist;

  const result = render(<SongListItem song={songModel} />, {
    wrapper: renderWrapper,
  });

  const index = result.container;

  await act(async () => {
    index.firstChild.click();
  });

  const modalRoot = document.getElementById('modal-root');
  expect(modalRoot.childElementCount).toEqual(1);

  const submitButton = modalRoot.querySelector('[type="submit"]');
  const editButton = modalRoot.querySelector('.picker-button button');
  expect(editButton.textContent).toEqual(oldArtistDef.name);

  const [newArtistDef, newArtistModel] = makeAModel('artist');
  const fetchBody = {
    data: [oldArtistDef, newArtistDef],
    url: 'xyzzy',
  };

  await act(async () => {
    editButton.click();
    mockGetResolve(fetchBody);
  });

  const newArtistLine = modalRoot.querySelector('li.picker-item:last-child');
  expect(newArtistLine).toHaveTextContent(newArtistDef.name);

  songModelDef.artist_id = newArtistDef.id;

  await act(async () => {
    newArtistLine.click();
  });

  expect(editButton).toHaveTextContent(newArtistDef.name);

  await act(async () => {
    submitButton.click();
    mockPutResolve({ ...songModelDef, artist: newArtistDef });
  });

  expect(Network.putToURLString).toBeCalledTimes(1);
  expect(Network.putToURLString).toBeCalledWith(modelDef.url, songModelDef);
  expect(songModel.artist().toJSON()).toEqual(newArtistDef);
});
