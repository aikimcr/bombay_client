import React, { useRef } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  setupArtistModelFetch,
  TestArtistCollectionURL,
} from '../../../Model/testing';
import { mockIntersectionObserver } from '../../../Hooks/testing';
import { ContextChanger } from '../../../testHelpers';
import { ArtistForm } from './ArtistForm';
import { ArtistData, ArtistModel } from '../../../Model/ArtistModel';

const fetchItems: Record<string, ReturnType<typeof setupArtistModelFetch>> = {};
const putItems: ReturnType<typeof setupArtistModelFetch>[] = [];
const postItems: ReturnType<typeof setupArtistModelFetch>[] = [];

const handlers = [
  http.put(`${TestArtistCollectionURL}/:id`, () => {
    return HttpResponse.json(putItems.shift()[1]);
  }),
  http.post(TestArtistCollectionURL, () => {
    return HttpResponse.json(postItems.shift()[1]);
  }),
];

const server = setupServer(...handlers);

beforeAll(() => {
  while (Object.keys(fetchItems).length <= 20) {
    const [getPromise, fetchDef] = setupArtistModelFetch();
    fetchItems[fetchDef.id.toString()] = [getPromise, fetchDef];
  }
});

afterAll(() => server.close());

beforeEach(() => {
  window.IntersectionObserver = mockIntersectionObserver;
  server.listen();
});
afterEach(() => {
  server.resetHandlers();
  delete window.IntersectionObserver;
  mockIntersectionObserver._clear();
});

describe('Test Artist editor form', () => {
  it('should match snapshot', async () => {
    const mockRef: ReturnType<typeof useRef<HTMLDialogElement>> = {
      current: null,
    };
    const [_getPromise, artistDef] = setupArtistModelFetch();
    const artist = new ArtistModel({
      data: artistDef,
    });

    const { asFragment } = render(
      <ContextChanger initialLoggedIn={true}>
        <ArtistForm artist={artist} ref={mockRef} />
      </ContextChanger>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should show the current artist name as the default value', async () => {
    const mockRef: ReturnType<typeof useRef<HTMLDialogElement>> = {
      current: null,
    };
    const [_getPromise, artistDef] = setupArtistModelFetch();
    const artist = new ArtistModel({
      data: artistDef,
    });

    render(
      <ContextChanger initialLoggedIn={true}>
        <ArtistForm artist={artist} ref={mockRef} />
      </ContextChanger>,
    );

    const form = screen.getByTestId('artist-form-form');
    const input = screen.getByLabelText('Artist Name');

    expect(form).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(form).toContain(input);
    expect(input).toHaveValue(artist.name);
  });

  it('should show the value as empty if no artist is specified', () => {
    const mockRef: ReturnType<typeof useRef<HTMLDialogElement>> = {
      current: null,
    };

    render(
      <ContextChanger initialLoggedIn={true}>
        <ArtistForm ref={mockRef} />
      </ContextChanger>,
    );

    const form = screen.getByTestId('artist-form-form');
    const input = screen.getByLabelText('Artist Name');

    expect(form).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(form).toContain(input);
    expect(input).toHaveValue('');
  });

  it('should save changes to the artist name', async () => {
    const mockRef: ReturnType<typeof useRef<HTMLDialogElement>> = {
      current: null,
    };
    const [getPromise, artistDef] = setupArtistModelFetch();
    const artist = ArtistModel.from<ArtistData, ArtistModel>(artistDef, {
      keepId: true,
    });

    expect(artist.id).toEqual(artistDef.id);

    render(
      <ContextChanger initialLoggedIn={true}>
        <ArtistForm artist={artist} ref={mockRef} />
      </ContextChanger>,
    );

    expect(mockRef.current).toBeDefined();
    const mockClosed = jest.fn();
    mockRef.current.close = mockClosed;

    const input = screen.getByLabelText('Artist Name');
    const submitButton = screen.getByText('Save');

    putItems.push([
      getPromise,
      {
        ...artistDef,
        name: 'xyzzy',
      },
    ]);

    await act(async () => {
      fireEvent.change(input, { target: { value: 'xyzzy' } });
    });

    expect(artist.id).toEqual(artistDef.id);
    expect(input).not.toHaveValue(artistDef.name);
    expect(input).toHaveValue('xyzzy');
    expect(artist.name).toEqual(artistDef.name);
    expect(mockClosed).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(artist.id).toEqual(artistDef.id);
    expect(input).toHaveValue('xyzzy');
    expect(artist.name).toEqual('xyzzy');
    expect(mockClosed).toHaveBeenCalled();
  });
});

it('should save the new artist', async () => {
  const mockRef: ReturnType<typeof useRef<HTMLDialogElement>> = {
    current: null,
  };
  const [getPromise, artistDef] = setupArtistModelFetch();
  const artist = ArtistModel.from<ArtistData, ArtistModel>(artistDef);

  expect(artist.id).not.toBeDefined();

  render(
    <ContextChanger initialLoggedIn={true}>
      <ArtistForm artist={artist} ref={mockRef} />
    </ContextChanger>,
  );

  expect(mockRef.current).toBeDefined();
  const mockClosed = jest.fn();
  mockRef.current.close = mockClosed;

  const input = screen.getByLabelText('Artist Name');
  const submitButton = screen.getByText('Save');

  postItems.push([
    getPromise,
    {
      ...artistDef,
      name: 'xyzzy',
    },
  ]);

  await act(async () => {
    fireEvent.change(input, { target: { value: 'xyzzy' } });
  });

  expect(artist.id).not.toBeDefined();
  expect(input).not.toHaveValue(artistDef.name);
  expect(input).toHaveValue('xyzzy');
  expect(artist.name).toEqual(artistDef.name);
  expect(mockClosed).not.toHaveBeenCalled();

  await act(async () => {
    fireEvent.click(submitButton);
  });

  expect(artist.id).toEqual(artistDef.id);
  expect(input).toHaveValue('xyzzy');
  expect(artist.name).toEqual('xyzzy');
  expect(mockClosed).toHaveBeenCalled();
});
