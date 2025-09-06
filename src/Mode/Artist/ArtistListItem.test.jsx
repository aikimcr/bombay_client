import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

jest.mock('./Artist');
jest.mock('../../Modal/FormModal', () => {
  const originalModule = jest.requireActual('../../Modal/FormModal');

  return {
    __esModule: true,
    ...originalModule,
    default: () => <div data-testid="edit-artist-modal">Form Modal</div>,
  };
});

import * as Network from '../../Network/Network';

import { makeAModel } from '../../testHelpers/modelTools';

import ArtistListItem from './ArtistListItem.jsx';

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
  const [modelDef, model] = makeAModel('artist', (def) => {
    def.name = 'Alessia Koelpin';
  });

  const { asFragment } = render(<ArtistListItem artist={model} />);

  expect(asFragment()).toMatchSnapshot();
});

it('should render a list item', async () => {
  const [_modelDef, model] = makeAModel('artist');
  render(<ArtistListItem artist={model} />);
  expect(screen.getByTestId('artist-list-card')).toBeInTheDocument();
});

it('should open the editor modal', async () => {
  const [_modelDef, model] = makeAModel('artist');
  render(<ArtistListItem artist={model} />);

  const card = screen.getByTestId('artist-list-card');

  await act(async () => {
    fireEvent.click(card);
  });

  expect(screen.getByTestId('edit-artist-modal')).toBeInTheDocument();
});

// Move this to the model editor
it.skip('should save changes to the model', async () => {
  const [mockPromise, mockResolve] = makeResolvablePromise();
  // The mock is not recognized unless it is done this way.
  Network.putToURLString = jest.fn((url, body) => {
    return mockPromise;
  });

  const [modelDef, model] = makeAModel('artist');

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

  expect(Network.putToURLString).toBeCalledTimes(1);
  expect(Network.putToURLString).toBeCalledWith(modelDef.url, {
    ...modelDef,
    name: 'Herkimer',
  });
});
