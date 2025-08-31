//
// Collections must:
// - Fetch paged data.
// - Create models from fetched data.
// - Maintain the order of models based on the fetch order.
// - Guarantee that no models are duplicated (based on the model id).
// - Handle empty fetches.
// - Provide mechanisms to fetch next and previous pages.
// - Provide mechanisms to restart the fetch from the beginning.
// - Provide mechanisms to add or remove models.
// - Provide a mechanism to post or delete for models.
// - Be agnostic to the model type.
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

import { makeModels } from "../testHelpers/modelTools";

import ModelBase from "./ModelBase";
import CollectionBase from "./CollectionBase";

const testToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGREM4MTEzOCIsInVzZXIiOnsiaWQiOjEsIm5hbWUiOiJhZG1pbiIsImFkbWluIjpmYWxzZX0sImlhdCI6MTY2NTk2NTA5OX0.2vz14X7Tm-oFlyOa7dcAF-5y5ympi_UlWyJNxO4xyS4";

describe("CollectionBase", () => {
  beforeEach(() => {
    localStorage.setItem("jwttoken", testToken);
  });

  afterEach(() => {
    localStorage.removeItem("jwttoken");
  });

  it("should fetch the first page", async () => {
    const loginPromise = PromiseWithResolvers();
    mockLoginStatus.mockReturnValue(loginPromise.promise);
    loginPromise.resolve(true);

    const getPromise = PromiseWithResolvers();
    mockGetFromURLString.mockReturnValue(getPromise.promise);
    mockPrepareURLFromArgs.mockReturnValue(new URL("https://xyzzy/table"));

    const collection = new CollectionBase("/table");
    const [fetchBody, models] = makeModels(10);
    getPromise.resolve(fetchBody);
    await collection.ready();
    expect(CollectionBase.isCollection(collection)).toBeTruthy();
    expect(collection.models()).toEqual(models);
  });

  // This logic is currently broken because of URL issues
  it.skip("should instantiate with a set of models", async () => {
    const loginPromise = PromiseWithResolvers();
    mockLoginStatus.mockReturnValue(loginPromise.promise);
    loginPromise.resolve(true);

    // In this case, paging may not be possible.
    const collection = new CollectionBase("/table1", {
      models: [
        {
          id: 1,
          name: "Herkimer P Jones",
        },
        {
          id: 2,
          name: "Agathea S Reese",
        },
      ],
    });

    // The promise should already be resolved
    await collection.ready();
    expect(collection.length()).toBe(2);
    expect(collection.models()).toEqual([
      new ModelBase(null, {
        id: 1,
        name: "Herkimer P Jones",
      }),
      new ModelBase(null, {
        id: 2,
        name: "Agathea S Reese",
      }),
    ]);
  });

  it("should fetch another page", async () => {
    const loginPromise = PromiseWithResolvers();
    mockLoginStatus.mockReturnValue(loginPromise.promise);
    loginPromise.resolve(true);

    const getPromise1 = PromiseWithResolvers();
    const getPromise2 = PromiseWithResolvers();
    mockGetFromURLString
      .mockReturnValueOnce(getPromise1.promise)
      .mockReturnValueOnce(getPromise2.promise);

    mockPrepareURLFromArgs.mockReturnValue(new URL("https://xyzzy/table"));

    const collection = new CollectionBase("/table1");

    const [fetchBody1, models1] = makeModels(10, {});
    getPromise1.resolve(fetchBody1);
    await collection.ready();

    const fetchPromise2 = collection.fetchNextPage();
    const [fetchBody2, models2] = makeModels(10, {
      offset: 10,
      limit: 10,
    });
    getPromise2.resolve(fetchBody2);

    const fetchModels2 = await fetchPromise2;
    expect(fetchModels2).toEqual([...models1, ...models2]);
    expect(collection.models()).toEqual(fetchModels2);
  });

  it("should fetch the next page and not add duplicates", async () => {
    const loginPromise = PromiseWithResolvers();
    mockLoginStatus.mockReturnValue(loginPromise.promise);
    loginPromise.resolve(true);

    // The situation this is testing is actually slightly pathological and
    // not easy to handle. This strategy really only works if the data
    // doesn't change often.
    const getPromise1 = PromiseWithResolvers();
    const getPromise2 = PromiseWithResolvers();
    mockGetFromURLString
      .mockReturnValueOnce(getPromise1.promise)
      .mockReturnValueOnce(getPromise2.promise);

    mockPrepareURLFromArgs.mockReturnValue(new URL("https://xyzzy/table"));

    const collection = new CollectionBase("/table1");

    const [fetchBody1, models1] = makeModels(10, {});
    getPromise1.resolve(fetchBody1);
    await collection.ready();

    const fetchPromise2 = collection.fetchNextPage();
    const [fetchBody2, models2] = makeModels(8, {
      offset: 10,
      limit: 10,
    });
    fetchBody2.data.unshift(...fetchBody1.data.slice(-2));
    models2.unshift(...models1.slice(-2));
    getPromise2.resolve(fetchBody2);

    const fetchModels2 = await fetchPromise2;
    expect(fetchModels2).toEqual([...models1, ...models2.slice(2)]);
    expect(collection.models()).toEqual(fetchModels2);
  });

  it("should handle a 404 at the end of the last page gracefully", async () => {
    const loginPromise = PromiseWithResolvers();
    mockLoginStatus.mockReturnValue(loginPromise.promise);
    loginPromise.resolve(true);

    const getPromise1 = PromiseWithResolvers();
    const getPromise2 = PromiseWithResolvers();
    const getPromise3 = PromiseWithResolvers();
    mockGetFromURLString
      .mockReturnValueOnce(getPromise1.promise)
      .mockReturnValueOnce(getPromise2.promise)
      .mockReturnValueOnce(getPromise3.promise);

    mockPrepareURLFromArgs.mockReturnValue(new URL("https://xyzzy/table"));

    const collection = new CollectionBase("/table1");

    const [fetchBody1, models1] = makeModels(10, {});
    getPromise1.resolve(fetchBody1);
    await collection.ready();

    const fetchPromise2 = collection.fetchNextPage();

    const [fetchBody2, models2] = makeModels(10, {
      offset: 10,
      limit: 10,
    });
    getPromise2.resolve(fetchBody2);

    const fetchModels2 = await fetchPromise2;
    expect(fetchModels2).toEqual([...models1, ...models2]);
    expect(collection.models()).toEqual(fetchModels2);

    const fetchPromise3 = collection.fetchNextPage();
    getPromise3.reject({
      status: 404,
      message: "Not Found",
    });
    const fetchModels3 = await fetchPromise3;
    expect(fetchModels3).toEqual(fetchModels2);
    expect(collection.models()).toEqual(fetchModels2);
  });

  it("should fetch the previous page", async () => {
    const loginPromise = PromiseWithResolvers();
    mockLoginStatus.mockReturnValue(loginPromise.promise);
    loginPromise.resolve(true);

    const getPromise1 = PromiseWithResolvers();
    const getPromise2 = PromiseWithResolvers();
    mockGetFromURLString
      .mockReturnValueOnce(getPromise1.promise)
      .mockReturnValueOnce(getPromise2.promise);

    mockPrepareURLFromArgs.mockReturnValue(new URL("https://xyzzy/table"));

    const collection = new CollectionBase("/table1");

    const [fetchBody1, models1] = makeModels(10, {
      offset: 30,
      limit: 10,
    });
    getPromise1.resolve(fetchBody1);
    await collection.ready();

    const fetchPromise2 = collection.fetchPrevPage();

    const [fetchBody2, models2] = makeModels(10, {
      offset: 20,
      limit: 10,
    });
    getPromise2.resolve(fetchBody2);
    const fetchModels2 = await fetchPromise2;
    expect(fetchModels2).toEqual([...models2, ...models1]);
    expect(collection.models()).toEqual(fetchModels2);
  });

  it.skip("should fetch the previous page and not add duplicates", async () => {
    const loginPromise = PromiseWithResolvers();
    mockLoginStatus.mockReturnValue(loginPromise.promise);
    loginPromise.resolve(true);

    // The situation this is testing is actually slightly pathological and
    // not easy to handle. This strategy really only works if the data
    // doesn't change often.
    const getPromise1 = PromiseWithResolvers();
    const getPromise2 = PromiseWithResolvers();
    mockGetFromURLString
      .mockReturnValueOnce(getPromise1.promise)
      .mockReturnValueOnce(getPromise2.promise);

    mockPrepareURLFromArgs.mockReturnValue(new URL("https://xyzzy/table"));

    const collection = new CollectionBase("/table1");

    const [fetchBody1, models1] = makeModels(10, {
      offset: 20,
      limit: 10,
    });
    getPromise1.resolve(fetchBody1);
    await collection.ready();

    const fetchPromise2 = collection.fetchPrevPage();

    const [fetchBody2, models2] = makeModels(8, {
      offset: 10,
      limit: 10,
    });
    fetchBody2.data.push(...fetchBody1.data.slice(-2));
    models2.push(...models1.slice(-2));
    getPromise2.resolve(fetchBody2);
    const fetchModels2 = await fetchPromise2;
    expect(fetchModels2).toEqual([...models2.slice(2), ...models1]);
    expect(collection.models()).toEqual(fetchModels2);
  });

  // // Other test cases I should write once I consider how I should handle them:
  // // - 404 on the first page.
  // // - 404 on the previous page.
  // // - 50x on any page.
  // // - 304 (unchanged) on any page.
  // // - The models list actually being trimmed at the front or back.
  // // - POST a new model to the collection.
  // // - DELETE a model from the collection.
  // // - Test the array functions on the models
});
