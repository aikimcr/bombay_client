import React, { useRef, useContext, useState, useEffect } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { mockIntersectionObserver } from './testing';

// jest.spyOn('globalThis', IntersectionObserver).mockImplementation(() => {
//   return undefined;
// });

// import { useIntersectionObserver } from "./useIntersectionObserver";
// jest.mock('./useIntersectionObserver', () => {
//   const originalModule = jest.requireActual('./useIntersectionObserver');

//   return {
//     __esModule: true,
//     ...originalModule,
//     useIntersectionObserver: mockUseIntersectionObserver,
//   };
// });

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
} from '../Network/testing';

jest.mock('../Network/Login', () => {
  const originalModule = jest.requireActual('../Network/Login');

  return {
    __esModule: true,
    ...originalModule,
    loginStatus: mockLoginStatus,
    refreshToken: mockRefreshToken,
    login: mockLogin,
    logout: mockLogout,
  };
});

jest.mock('../Network/Network', () => {
  const originalModule = jest.requireActual('../Network/Network');

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

jest.mock('jwt-decode');

import {
  setupTestCollectionOneFetch,
  TestCollectionOne,
  TestCollectionOneURL,
  TestModelOne,
  TestUrlWithOffsets,
} from '../Model/testing';

import BombayLoginContext from '../Context/BombayLoginContext';
import { useModelCollection } from './useModelCollection';
import { ContextChanger } from '../testHelpers';

interface TestAppProps {
  initialCollection: TestCollectionOne;
  mockMountPromise: Promise<void>;
}

function TestApp({ initialCollection, mockMountPromise }: TestAppProps) {
  const { loggedIn } = useContext(BombayLoginContext);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    (async () => {
      await mockMountPromise;
      setIsMounted(true);
    })();
  }, []);

  mockLoginStatus.mockImplementation(() => {
    return loggedIn;
  });

  const topRef = useRef<HTMLDivElement>(null);
  useModelCollection({
    initialCollection,
    topRef,
    isMounted,
  });

  return (
    <div ref={topRef} data-testid="test-list">
      {initialCollection.map((model: TestModelOne) => {
        const key = `collection-${model.id}`;
        return (
          <li key={key} data-testid="test-list-item">
            {model.name}
          </li>
        );
      })}
    </div>
  );
}

jest.useFakeTimers();

beforeEach(() => {
  window.IntersectionObserver = mockIntersectionObserver;
  mockPrepareURLFromArgs.mockReturnValue(new URL('https://xyzzy/testTable'));
  mockBuildURL.mockReturnValue(new URL(TestCollectionOneURL));
});

afterEach(() => {
  delete window.IntersectionObserver;
  while (mockIntersectionObserver.observers.length > 0) {
    mockIntersectionObserver.observers.pop();
  }
});

it('should start loading the collection', async () => {
  const [getPromise, fetchBody, models] = setupTestCollectionOneFetch();
  const collection = new TestCollectionOne({});

  const mountPromise = PromiseWithResolvers();

  render(
    <ContextChanger initialLoggedIn={true}>
      <TestApp
        initialCollection={collection}
        mockMountPromise={mountPromise.promise}
      />
    </ContextChanger>,
  );

  expect(mockIntersectionObserver.observers.length).toBe(0);

  await act(async () => {
    mountPromise.resolve();
  });

  expect(mockIntersectionObserver.observers.length).toBe(0);

  await act(async () => {
    getPromise.resolve(fetchBody);
  });

  expect(mockIntersectionObserver.observers.length).toBe(1);
  expect(mockGetFromURLString).toHaveBeenCalledTimes(1);
  expect(mockGetFromURLString).toHaveReturnedWith(getPromise.promise);
  expect(getPromise.promise).resolves.toEqual(fetchBody);

  expect(screen.getAllByTestId('test-list-item')).toHaveLength(models.length);
});

it('should wait until the component is mounted to create observer', async () => {
  const [getPromise, fetchBody, models] = setupTestCollectionOneFetch();
  const collection = new TestCollectionOne({});

  const mountPromise = PromiseWithResolvers();

  render(
    <ContextChanger initialLoggedIn={true}>
      <TestApp
        initialCollection={collection}
        mockMountPromise={mountPromise.promise}
      />
    </ContextChanger>,
  );

  expect(mockIntersectionObserver.observers.length).toBe(0);

  await act(async () => {
    getPromise.resolve(fetchBody);
  });

  expect(mockIntersectionObserver.observers.length).toBe(0);

  await act(async () => {
    mountPromise.resolve();
  });

  expect(mockIntersectionObserver.observers.length).toBe(1);
  expect(mockGetFromURLString).toHaveBeenCalledTimes(1);
  expect(mockGetFromURLString).toHaveReturnedWith(getPromise.promise);
  expect(getPromise.promise).resolves.toEqual(fetchBody);

  expect(screen.getAllByTestId('test-list-item')).toHaveLength(models.length);
});

it('should get the next page', async () => {
  const [getPromise1, fetchBody1, models1] = setupTestCollectionOneFetch();
  const [getPromise2, fetchBody2, models2] = setupTestCollectionOneFetch({
    offset: 10,
    limit: 10,
  });
  const collection = new TestCollectionOne({});

  const mountPromise = PromiseWithResolvers();

  render(
    <ContextChanger initialLoggedIn={true}>
      <TestApp
        initialCollection={collection}
        mockMountPromise={mountPromise.promise}
      />
    </ContextChanger>,
  );

  await act(async () => {
    mountPromise.resolve();
  });

  await act(async () => {
    getPromise1.resolve(fetchBody1);
  });

  expect(mockIntersectionObserver.observers.length).toBe(1);

  expect(mockGetFromURLString).toHaveBeenCalledTimes(1);
  expect(mockGetFromURLString).toHaveReturnedWith(getPromise1.promise);
  expect(getPromise1.promise).resolves.toEqual(fetchBody1);
  expect(collection.ready).resolves.toEqual(models1);
  expect(screen.queryAllByTestId('test-list-item')).toHaveLength(
    models1.length,
  );

  expect(collection.length).toEqual(10);
  expect(collection.nextPage).toEqual(
    TestUrlWithOffsets(TestCollectionOneURL, 10, 10),
  );
  expect(collection.hasNextPage).toBeTruthy();
  expect(collection.prevPage).toBeUndefined();
  expect(collection.hasPrevPage).toBeFalsy();

  const observer = mockIntersectionObserver.observers[0];

  await act(async () => {
    observer._fireIntersect(
      screen.getAllByTestId('test-list-item').slice(-1)[0],
    );
    getPromise2.resolve(fetchBody2);
  });

  expect(mockGetFromURLString).toHaveBeenCalledTimes(2);
  expect(mockGetFromURLString).toHaveReturnedWith(getPromise2.promise);
  expect(getPromise2.promise).resolves.toEqual(fetchBody2);
  expect(screen.queryAllByTestId('test-list-item')).toHaveLength(
    models1.length + models2.length,
  );

  expect(collection.length).toEqual(20);
  expect(collection.nextPage).toEqual(
    TestUrlWithOffsets(TestCollectionOneURL, 20, 10),
  );
  expect(collection.hasNextPage).toBeTruthy();
  expect(collection.prevPage).toEqual(
    TestUrlWithOffsets(TestCollectionOneURL, 0, 10),
  );
  expect(collection.hasPrevPage).toBeTruthy();
});

it('should stop when it runs out of data', async () => {
  const [getPromise1, fetchBody1, models1] = setupTestCollectionOneFetch();
  const [getPromise2] = setupTestCollectionOneFetch();
  const collection = new TestCollectionOne({});

  mockGetFromURLString
    .mockReturnValueOnce(getPromise1.promise)
    .mockReturnValueOnce(getPromise2.promise);

  const mountPromise = PromiseWithResolvers();

  render(
    <ContextChanger initialLoggedIn={true}>
      <TestApp
        initialCollection={collection}
        mockMountPromise={mountPromise.promise}
      />
    </ContextChanger>,
  );

  await act(async () => {
    mountPromise.resolve();
  });

  await act(async () => {
    getPromise1.resolve(fetchBody1);
  });

  expect(mockIntersectionObserver.observers.length).toBe(1);
  expect(mockGetFromURLString).toHaveBeenCalledTimes(1);
  expect(mockGetFromURLString).toHaveReturnedWith(getPromise1.promise);
  expect(getPromise1.promise).resolves.toEqual(fetchBody1);
  expect(screen.queryAllByTestId('test-list-item')).toHaveLength(
    models1.length,
  );

  expect(collection.length).toEqual(10);
  expect(collection.nextPage).toEqual(
    TestUrlWithOffsets(TestCollectionOneURL, 10, 10),
  );
  expect(collection.hasNextPage).toBeTruthy();
  expect(collection.prevPage).toBeUndefined();
  expect(collection.hasPrevPage).toBeFalsy();

  const observer = mockIntersectionObserver.observers[0];

  await act(async () => {
    observer._fireIntersect(
      screen.getAllByTestId('test-list-item').slice(-1)[0],
    );
    getPromise2.reject({
      status: 404,
      message: 'Not Found',
    });
  });

  expect(mockGetFromURLString).toHaveBeenCalledTimes(2);
  expect(mockGetFromURLString).toHaveReturnedWith(getPromise2.promise);
  expect(getPromise2.promise).rejects;
  expect(screen.queryAllByTestId('test-list-item')).toHaveLength(
    models1.length,
  );

  expect(collection.length).toEqual(10);
  expect(collection.nextPage).toBeUndefined();
  expect(collection.hasNextPage).toBeFalsy();
  expect(collection.prevPage).toBeUndefined();
  expect(collection.hasPrevPage).toBeFalsy();
});

it('should return a null collection when not logged in', async () => {
  const collection = new TestCollectionOne({});

  const mountPromise = PromiseWithResolvers();

  render(
    <ContextChanger initialLoggedIn={false}>
      <TestApp
        initialCollection={collection}
        mockMountPromise={mountPromise.promise}
      />
    </ContextChanger>,
  );

  await act(async () => {
    mountPromise.resolve();
  });

  expect(mockIntersectionObserver.observers.length).toBe(0);
  expect(mockGetFromURLString).toHaveBeenCalledTimes(0);
  expect(screen.queryAllByTestId('test-list-item')).toHaveLength(0);
});

it('should load the collection on login', async () => {
  const [getPromise, fetchBody, models] = setupTestCollectionOneFetch();
  const collection = new TestCollectionOne({});

  const mountPromise = PromiseWithResolvers();

  render(
    <ContextChanger initialLoggedIn={false}>
      <TestApp
        initialCollection={collection}
        mockMountPromise={mountPromise.promise}
      />
    </ContextChanger>,
  );

  await act(async () => {
    mountPromise.resolve();
  });

  expect(mockIntersectionObserver.observers.length).toBe(0);
  expect(mockGetFromURLString).toHaveBeenCalledTimes(0);
  expect(screen.queryAllByTestId('test-list-item')).toHaveLength(0);

  const loginButton = screen.getByTestId('change-test-login');
  expect(loginButton).toBeInTheDocument();

  await act(async () => {
    fireEvent.click(loginButton);
  });

  await act(async () => {
    getPromise.resolve(fetchBody);
  });

  expect(mockIntersectionObserver.observers.length).toBe(1);
  expect(mockGetFromURLString).toHaveBeenCalledTimes(1);
  expect(mockGetFromURLString).toHaveReturnedWith(getPromise.promise);
  expect(getPromise.promise).resolves.toEqual(fetchBody);
  expect(screen.queryAllByTestId('test-list-item')).toHaveLength(models.length);
});
