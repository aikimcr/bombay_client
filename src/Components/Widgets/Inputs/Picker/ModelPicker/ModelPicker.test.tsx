import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import {
  ContextChanger,
  TestCollectionOne,
  TestCollectionOneURL,
} from '../../../../../testHelpers';
import { setupTestCollectionOneFetch } from '../../../../../Model/testing';
import { mockIntersectionObserver } from '../../../../../Hooks/testing';

import { ModelPicker } from './ModelPicker';

const fetchItems: Record<
  string,
  ReturnType<typeof setupTestCollectionOneFetch>
> = {};

const handlers = [
  http.get(TestCollectionOneURL, ({ request }) => {
    const requestUrl = new URL(request.url);

    if (requestUrl.searchParams.size === 0) {
      const [_getPromise, _fetchBody, _models, fetchDef] = fetchItems.offset0;
      return HttpResponse.json(fetchDef);
    }

    const offset = requestUrl.searchParams.get('offset');
    const offsetKey = `offset${offset || '0'}`;
    const [_getPromise, _fetchBody, _models, fetchDef] = fetchItems[offsetKey];
    return HttpResponse.json(fetchDef);
  }),
];

const server = setupServer(...handlers);

beforeAll(() => {
  fetchItems.offset0 = setupTestCollectionOneFetch(TestCollectionOneURL);
  fetchItems.offset10 = setupTestCollectionOneFetch({
    TestCollectionOneURL,
    offset: 10,
    limit: 10,
  });
  fetchItems.offset20 = setupTestCollectionOneFetch({
    TestCollectionOneURL,
    offset: 20,
    limit: 20,
  });
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

describe('Test ModelPicker', () => {
  it('should match snapshot', async () => {
    const testCollection = new TestCollectionOne({});
    const { asFragment } = render(
      <ContextChanger initialLoggedIn={true}>
        <ModelPicker id="test-picker" initialCollection={testCollection} />
      </ContextChanger>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should contain a picker button and a model picker list', async () => {
    const testCollection = new TestCollectionOne({});
    render(
      <ContextChanger initialLoggedIn={true}>
        <ModelPicker id="test-picker" initialCollection={testCollection} />
      </ContextChanger>,
    );

    const modelPicker = screen.getByTestId('model-picker');
    expect(modelPicker).toBeInTheDocument();
    expect(modelPicker).toHaveAttribute('id', 'test-picker');

    const button = screen.getByTestId('picker-button');
    expect(button).toBeInTheDocument();
    expect(modelPicker).toContainElement(button);

    const list = screen.getByTestId('model-picker-list');
    expect(list).toBeInTheDocument();
    expect(modelPicker).toContainElement(list);
  });

  it('the picker button and the picker list should have their refence attributes set correctly', async () => {
    const testCollection = new TestCollectionOne({});
    const buttonId = 'test-picker-button';
    const listId = 'test-picker-popover';

    render(
      <ContextChanger initialLoggedIn={true}>
        <ModelPicker id="test-picker" initialCollection={testCollection} />
      </ContextChanger>,
    );

    const button = screen.getByTestId('picker-button');
    expect(button).toHaveAttribute('id', buttonId);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAttribute('aria-controls', listId);
    expect(button).toHaveAttribute('popovertarget', listId);

    const list = screen.getByTestId('model-picker-list');
    expect(list).toHaveAttribute('id', listId);
    expect(list).not.toHaveAttribute('open');
  });

  it('Toggles open state', async () => {
    const testCollection = new TestCollectionOne({});

    render(
      <ContextChanger initialLoggedIn={true}>
        <ModelPicker id="test-picker" initialCollection={testCollection} />
      </ContextChanger>,
    );

    // Jest dome does not seem to handle popovers well.
    const button = screen.getByTestId('picker-button');
    expect(button).toHaveAttribute('aria-expanded', 'false');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button).toHaveAttribute('aria-expanded', 'true');

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});
