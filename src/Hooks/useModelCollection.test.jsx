import { useEffect, useRef, useContext, useState } from "react";
import {
  act,
  fireEvent,
  queryAllByTestId,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import {
  mockGetFromURLString,
  mockLogin,
  mockLoginStatus,
  mockLogout,
  mockPostToURLString,
  mockPrepareURLFromArgs,
  mockPutToURLString,
  mockRefreshToken,
  mockServerBasePath,
  mockServerHost,
  mockServerPort,
  mockServerProtocol,
} from "../Network/testing";

jest.mock("../Network/Login", () => {
  const originalModule = jest.requireActual("../Network/Login");

  return {
    __esModule: true,
    ...originalModule,
    loginStatus: mockLoginStatus,
    refreshToken: mockRefreshToken,
    login: mockLogin,
    logout: mockLogout,
  };
});

jest.mock("../Network/Network", () => {
  const originalModule = jest.requireActual("../Network/Network");

  return {
    __esModule: true,
    ...originalModule,
    serverProtocol: mockServerProtocol,
    serverHost: mockServerHost,
    serverBasePath: mockServerBasePath,
    serverPort: mockServerPort,
    prepareURLFromArgs: mockPrepareURLFromArgs,
    getFromURLString: mockGetFromURLString,
    postToURLString: mockPostToURLString,
    putToURLString: mockPutToURLString,
  };
});

import * as mockObserver from "./useIntersectionObserver";

jest.mock("jwt-decode");

import { makeModels } from "../testHelpers/modelTools";

import ModelBase from "../Model/ModelBase";
import CollectionBase from "../Model/CollectionBase";

class TestModel extends ModelBase {}
class TestCollection extends CollectionBase {
  constructor(options = {}) {
    super("/testTable", { ...options, modelClass: TestModel });
  }
}

import BombayLoginContext from "../Context/BombayLoginContext";
import useModelCollection from "./useModelCollection";
import { ContextChanger } from "../testHelpers";

const mockCollectionProcessor = jest.fn();

function TestApp() {
  const { loggedIn } = useContext(BombayLoginContext);

  mockLoginStatus.mockImplementation(() => {
    return loggedIn;
  });

  const topRef = useRef();
  const [collection] = useModelCollection({
    CollectionClass: TestCollection,
    topRef,
  });

  useEffect(() => {
    mockCollectionProcessor.mockReturnValue(collection);
  }, [collection]);

  // useEffect(() => {
  //   mockLoginStatus.mockResolvedValue(loggedIn);
  // }, [loggedIn]);

  return (
    <div ref={topRef} data-testid="test-list">
      {collection == null
        ? ""
        : collection.map((model) => {
            const key = `collection-${model.get("id")}`;
            return (
              <div key={key} model={model} data-testid="test-list-item">
                model.get('name')
              </div>
            );
          })}
    </div>
  );
}

jest.useFakeTimers();

function setupLogin(loggedIn = true) {
  mockLoginStatus.mockResolvedValueOnce(loggedIn);
}

beforeEach(() => {
  mockPrepareURLFromArgs.mockReturnValue(new URL("https://xyzzy/testTable"));
});

afterEach(() => {
  while (mockObserver.mockObserver.observers.length > 0) {
    mockObserver.mockObserver.observers.pop();
  }
});

it("should get the collection and start loading", async () => {
  const getPromise = PromiseWithResolvers();
  mockGetFromURLString.mockReturnValue(getPromise.promise);

  render(
    <ContextChanger initialLoggedIn={true}>
      <TestApp />
    </ContextChanger>,
  );

  const [fetchBody, models] = makeModels(10, {}, "testTable");

  await act(async () => {
    getPromise.resolve(fetchBody);
  });

  expect(mockObserver.mockObserver.observers.length).toBe(1);
  expect(mockGetFromURLString).toHaveBeenCalledTimes(1);
  expect(mockGetFromURLString).toHaveReturnedWith(getPromise.promise);
  expect(getPromise.promise).resolves.toEqual(fetchBody);

  await waitFor(() => {
    const testCollection = mockCollectionProcessor();
    expect(testCollection.models()).toEqual(models);
  });
});

it("should get the next page", async () => {
  const getPromise1 = PromiseWithResolvers();
  const getPromise2 = PromiseWithResolvers();
  mockGetFromURLString
    .mockReturnValueOnce(getPromise1.promise)
    .mockReturnValueOnce(getPromise2.promise);

  render(
    <ContextChanger initialLoggedIn={true}>
      <TestApp />
    </ContextChanger>,
  );

  const fetchBody = [];
  const models = [];

  [fetchBody[0], models[0]] = makeModels(10, {}, "testTable");

  await act(async () => {
    getPromise1.resolve(fetchBody[0]);
  });

  expect(mockObserver.mockObserver.observers.length).toBe(1);
  expect(mockGetFromURLString).toHaveBeenCalledTimes(1);
  expect(mockGetFromURLString).toHaveReturnedWith(getPromise1.promise);
  expect(getPromise1.promise).resolves.toEqual(fetchBody[0]);
  expect(screen.queryAllByTestId("test-list-item")).toHaveLength(
    models[0].length,
  );

  await waitFor(() => {
    const testCollection = mockCollectionProcessor();
    expect(testCollection.models()).toEqual(models[0]);
  });

  [fetchBody[1], models[1]] = makeModels(
    10,
    { offset: 10, limit: 10 },
    "testTable",
  );

  const observer = mockObserver.mockObserver.observers[0];

  await act(async () => {
    observer._fireIntersect(
      screen.getAllByTestId("test-list-item").slice(-1)[0],
    );
    getPromise2.resolve(fetchBody[1]);
  });

  expect(mockGetFromURLString).toHaveBeenCalledTimes(2);
  expect(mockGetFromURLString).toHaveReturnedWith(getPromise2.promise);
  expect(getPromise2.promise).resolves.toEqual(fetchBody[1]);

  await waitFor(() => {
    const testCollection = mockCollectionProcessor();
    expect(testCollection.models()).toEqual([...models[0], ...models[1]]);
  });
});

it("should stop when it runs out of data", async () => {
  const getPromise1 = PromiseWithResolvers();
  const getPromise2 = PromiseWithResolvers();
  mockGetFromURLString
    .mockReturnValueOnce(getPromise1.promise)
    .mockReturnValueOnce(getPromise2.promise);

  render(
    <ContextChanger initialLoggedIn={true}>
      <TestApp />
    </ContextChanger>,
  );

  const fetchBody = [];
  const models = [];

  [fetchBody[0], models[0]] = makeModels(10, {}, "testTable");

  await act(async () => {
    getPromise1.resolve(fetchBody[0]);
  });

  expect(mockObserver.mockObserver.observers.length).toBe(1);
  expect(mockGetFromURLString).toHaveBeenCalledTimes(1);
  expect(mockGetFromURLString).toHaveReturnedWith(getPromise1.promise);
  expect(getPromise1.promise).resolves.toEqual(fetchBody[0]);
  expect(screen.queryAllByTestId("test-list-item")).toHaveLength(
    models[0].length,
  );

  await waitFor(() => {
    const testCollection = mockCollectionProcessor();
    expect(testCollection.models()).toEqual(models[0]);
  });

  const observer = mockObserver.mockObserver.observers[0];

  await act(async () => {
    observer._fireIntersect(
      screen.getAllByTestId("test-list-item").slice(-1)[0],
    );
    getPromise2.reject({ status: 404, message: "Not Found" });
  });

  expect(mockGetFromURLString).toHaveBeenCalledTimes(2);
  expect(mockGetFromURLString).toHaveReturnedWith(getPromise2.promise);
  expect(getPromise2.promise).rejects;
  expect(screen.queryAllByTestId("test-list-item")).toHaveLength(
    models[0].length,
  );

  await waitFor(() => {
    const testCollection = mockCollectionProcessor();
    expect(testCollection.models()).toEqual(models[0]);
  });
});

it("should return a null collection when not logged in", async () => {
  render(
    <ContextChanger initialLoggedIn={false}>
      <TestApp />
    </ContextChanger>,
  );

  expect(mockObserver.mockObserver.observers.length).toBe(1);
  expect(mockGetFromURLString).toHaveBeenCalledTimes(0);

  await waitFor(() => {
    const testCollection = mockCollectionProcessor();
    expect(testCollection).toBeNull();
  });
});

it("should load the collection on login", async () => {
  render(
    <ContextChanger initialLoggedIn={false}>
      <TestApp />
    </ContextChanger>,
  );

  expect(mockObserver.mockObserver.observers.length).toBe(1);
  expect(mockGetFromURLString).toHaveBeenCalledTimes(0);

  await waitFor(() => {
    const testCollection = mockCollectionProcessor();
    expect(testCollection).toBeNull();
  });

  const getPromise = PromiseWithResolvers();
  mockGetFromURLString.mockReturnValue(getPromise.promise);

  const loginButton = screen.getByTestId("change-test-login");
  expect(loginButton).toBeInTheDocument();

  await act(async () => {
    fireEvent.click(loginButton);
  });

  const [fetchBody, models] = makeModels(10, {}, "testTable");

  await act(async () => {
    getPromise.resolve(fetchBody);
  });

  expect(mockObserver.mockObserver.observers.length).toBe(1);
  expect(mockGetFromURLString).toHaveBeenCalledTimes(1);
  expect(mockGetFromURLString).toHaveReturnedWith(getPromise.promise);
  expect(getPromise.promise).resolves.toEqual(fetchBody);

  await waitFor(() => {
    const testCollection = mockCollectionProcessor();
    expect(testCollection.models()).toEqual(models);
  });
});
