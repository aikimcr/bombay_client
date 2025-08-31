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
  mockServerProtocol,
  mockServerHost,
  mockServerBasePath,
  mockServerPort,
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

import CollectionBase from "./CollectionBase";
import ArtistCollection from "./ArtistCollection";
import ArtistModel from "./ArtistModel";

const testToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGREM4MTEzOCIsInVzZXIiOnsiaWQiOjEsIm5hbWUiOiJhZG1pbiIsImFkbWluIjpmYWxzZX0sImlhdCI6MTY2NTk2NTA5OX0.2vz14X7Tm-oFlyOa7dcAF-5y5ympi_UlWyJNxO4xyS4";

function setupLogin(loggedIn = true) {
  const loginPromise = PromiseWithResolvers();
  mockLoginStatus.mockReturnValue(loginPromise.promise);
  loginPromise.resolve(loggedIn);
}

describe("ArtistCollection", () => {
  beforeEach(() => {
    localStorage.setItem("jwttoken", testToken);
  });

  afterEach(() => {
    localStorage.removeItem("jwttoken");
  });

  it("should not recognize a base collection as an artist collection", async () => {
    setupLogin();

    const getPromise = PromiseWithResolvers();
    mockGetFromURLString.mockReturnValue(getPromise.promise);
    mockPrepareURLFromArgs.mockReturnValue(new URL("https://xyzzy/table"));

    // If the class extension is done correctly, TypeScript should just handle this.
    const baseCollection = new CollectionBase("/table");
    const artistCollection = new ArtistCollection();

    expect(CollectionBase.isCollection(baseCollection)).toBeTruthy();
    expect(CollectionBase.isCollection(artistCollection)).toBeTruthy();

    expect(ArtistCollection.isCollection(baseCollection)).toBeFalsy();
    expect(ArtistCollection.isCollection(artistCollection)).toBeTruthy();
  });

  it("should fetch artist collection", async () => {
    setupLogin();

    const getPromise = PromiseWithResolvers();
    mockGetFromURLString.mockReturnValue(getPromise.promise);
    mockPrepareURLFromArgs.mockReturnValue(new URL("https://xyzzy/artist"));

    const collection = new ArtistCollection();
    const [fetchBody, models] = makeModels(10, { type: "artist" });
    getPromise.resolve(fetchBody);
    await collection.ready();

    expect(ArtistCollection.isCollection(collection)).toBeTruthy();
    expect(collection.models()).toEqual(models);
    expect(collection.modelClass()).toBe(ArtistModel);
  });

  it("should save a new artist", async () => {
    setupLogin();

    const postPromise = PromiseWithResolvers();
    mockPostToURLString.mockReturnValue(postPromise.promise);
    const getPromise = PromiseWithResolvers();
    mockGetFromURLString.mockReturnValue(getPromise.promise);
    mockPrepareURLFromArgs.mockReturnValue(new URL("https://xyzzy/artist"));

    const collection = new ArtistCollection();
    const newArtistData = {
      id: 1,
      name: "New Artist",
      url: "https://xyzzy/artist/1",
    };

    const savePromise = collection.save(newArtistData);
    postPromise.resolve(newArtistData);
    const savedArtist = await savePromise;

    expect(savedArtist).toBeDefined();
    expect(savedArtist.get("name")).toBe("New Artist");
    expect(ArtistModel.isModel(savedArtist)).toBeTruthy();

    expect(mockPostToURLString).toHaveBeenCalledTimes(1);
    expect(mockPostToURLString).toHaveBeenCalledWith(
      "https://xyzzy/artist",
      newArtistData,
    );
  });

  it("should handle pagination for artist collection", async () => {
    setupLogin();

    const getPromise1 = PromiseWithResolvers();
    const getPromise2 = PromiseWithResolvers();
    mockGetFromURLString
      .mockReturnValueOnce(getPromise1.promise)
      .mockReturnValueOnce(getPromise2.promise);
    mockPrepareURLFromArgs.mockReturnValue(new URL("https://xyzzy/artist"));

    const collection = new ArtistCollection();

    const [fetchBody1, models1] = makeModels(10, { type: "artist" });
    getPromise1.resolve(fetchBody1);
    await collection.ready();

    expect(collection.hasNextPage()).toBeTruthy();

    const fetchPromise2 = collection.fetchNextPage();
    const [fetchBody2, models2] = makeModels(10, {
      type: "artist",
      offset: 10,
      limit: 10,
    });
    getPromise2.resolve(fetchBody2);

    const fetchModels2 = await fetchPromise2;
    expect(fetchModels2).toEqual([...models1, ...models2]);
    expect(collection.models()).toEqual(fetchModels2);
  });
});
