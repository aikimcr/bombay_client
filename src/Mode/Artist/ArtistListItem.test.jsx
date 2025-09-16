import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import {
  mockGetFromURLString,
  mockPutToURLString,
  mockPostToURLString,
  mockBuildURL,
  mockDefaultAPIBasePath,
  mockDefaultAPIServer,
  mockPrepareURLFromArgs,
} from '../../Network/testing';

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
    putToURLString: mockPutToURLString,
    postToURLString: mockPostToURLString,
  };
});

jest.mock('./ArtistEditor/ArtistForm');

import * as Network from '../../Network/Network';

import { makeADef, makeAModelFromDef } from '../../testHelpers/modelTools';
import { TestArtistCollectionURL, TestUrlWithId } from '../../Model/testing';

import { ArtistListItem } from './ArtistListItem';

jest.useFakeTimers();

beforeEach(() => {
  const modalRoot = document.createElement('div');
  modalRoot.id = 'modal-root';
  document.body.append(modalRoot);
});

afterEach(() => {
  const modalRoot = document.getElementById('modal-root');
  modalRoot.remove();
});

it('Component should match snapshot', async () => {
  const modelDef = makeADef('artist', (def) => {
    def.name = 'Alessia Koelpin';
  });
  mockBuildURL.mockReturnValue(
    TestUrlWithId(TestArtistCollectionURL, modelDef.id),
  );
  const model = makeAModelFromDef(modelDef, 'artist');

  const { asFragment } = render(<ArtistListItem artist={model} />);

  expect(asFragment()).toMatchSnapshot();
});

it('should render a list item', async () => {
  const modelDef = makeADef('artist');
  mockBuildURL.mockReturnValue(
    TestUrlWithId(TestArtistCollectionURL, modelDef.id),
  );
  const model = makeAModelFromDef(modelDef, 'artist');
  render(<ArtistListItem artist={model} />);
  expect(screen.getByTestId('artist-list-card')).toBeInTheDocument();
});

it('should open the editor modal', async () => {
  const modelDef = makeADef('artist');
  mockBuildURL.mockReturnValue(
    TestUrlWithId(TestArtistCollectionURL, modelDef.id),
  );
  const model = makeAModelFromDef(modelDef, 'artist');
  render(<ArtistListItem artist={model} />);

  const card = screen.getByTestId('artist-list-card');

  await act(async () => {
    fireEvent.click(card);
  });

  expect(screen.getByTestId('mock-artist-form')).toBeInTheDocument();
});

// Move this to the model editor
it.skip('should save changes to the model', async () => {
  const [mockPromise, mockResolve] = makeResolvablePromise();
  // The mock is not recognized unless it is done this way.
  Network.putToURLString = jest.fn((url, body) => {
    return mockPromise;
  });

  const modelDef = makeADef('artist');

  const result = render(<ArtistListItem artist={model} />);

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
    mockResolve({ ...modelDef, name: 'Herkimer' });
  });

  expect(Network.putToURLString).toHaveBeenCalledTimes(1);
  expect(Network.putToURLString).toHaveBeenCalledWith(modelDef.url, {
    ...modelDef,
    name: 'Herkimer',
  });
});
