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
import SongCollection from "./SongCollection";
import SongModel from "./SongModel";

const testToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGREM4MTEzOCIsInVzZXIiOnsiaWQiOjEsIm5hbWUiOiJhZG1pbiIsImFkbWluIjpmYWxzZX0sImlhdCI6MTY2NTk2NTA5OX0.2vz14X7Tm-oFlyOa7dcAF-5y5ympi_UlWyJNxO4xyS4";

function setupLogin(loggedIn = true) {
  const loginPromise = PromiseWithResolvers();
  mockLoginStatus.mockReturnValue(loginPromise.promise);
  loginPromise.resolve(loggedIn);
}

describe("SongCollection", () => {
  beforeEach(() => {
    localStorage.setItem("jwttoken", testToken);
  });

  afterEach(() => {
    localStorage.removeItem("jwttoken");
  });

  it("should not recognize a base collection as a song collection", async () => {
    setupLogin();
    mockPrepareURLFromArgs.mockReturnValue(new URL("https://xyzzy/table"));
    const getPromise = PromiseWithResolvers();
    mockGetFromURLString.mockReturnValue(getPromise.promise);

    // If the class extension is done correctly, TypeScript should just handle this.
    const baseCollection = new CollectionBase("/table");

    const songCollection = new SongCollection();

    expect(CollectionBase.isCollection(baseCollection)).toBeTruthy();
    expect(CollectionBase.isCollection(songCollection)).toBeTruthy();

    expect(SongCollection.isCollection(baseCollection)).toBeFalsy();
    expect(SongCollection.isCollection(songCollection)).toBeTruthy();
  });

  it("should fetch song collection", async () => {
    setupLogin();

    const getPromise = PromiseWithResolvers();
    mockGetFromURLString.mockReturnValue(getPromise.promise);
    mockPrepareURLFromArgs.mockReturnValue(new URL("https://xyzzy/song"));

    const collection = new SongCollection();
    const [fetchBody, models] = makeModels(10, { type: "song" });
    getPromise.resolve(fetchBody);
    await collection.ready();

    expect(SongCollection.isCollection(collection)).toBeTruthy();
    expect(collection.models()).toEqual(models);
    expect(collection.modelClass()).toBe(SongModel);
  });

  it("should save a new song", async () => {
    setupLogin();

    const postPromise = PromiseWithResolvers();
    mockPostToURLString.mockReturnValue(postPromise.promise);
    const getPromise = PromiseWithResolvers();
    mockGetFromURLString.mockReturnValue(getPromise.promise);
    mockPrepareURLFromArgs.mockReturnValue(new URL("https://xyzzy/song"));

    const collection = new SongCollection();
    const newSongData = {
      id: 1,
      name: "New Song",
      artist_id: 1,
      url: "https://xyzzy/song/1",
      artist: {
        id: 1,
        name: "Test Artist",
        url: "https://xyzzy/artist/1",
      },
    };

    const savePromise = collection.save(newSongData);
    postPromise.resolve(newSongData);
    const savedSong = await savePromise;

    expect(savedSong).toBeDefined();
    expect(savedSong.get("name")).toBe("New Song");
    expect(SongModel.isModel(savedSong)).toBeTruthy();

    expect(mockPostToURLString).toHaveBeenCalledTimes(1);
    expect(mockPostToURLString).toHaveBeenCalledWith(
      "https://xyzzy/song",
      newSongData,
    );
  });

  it("should handle pagination for song collection", async () => {
    setupLogin();

    const getPromise1 = PromiseWithResolvers();
    const getPromise2 = PromiseWithResolvers();
    mockGetFromURLString
      .mockReturnValueOnce(getPromise1.promise)
      .mockReturnValueOnce(getPromise2.promise);
    mockPrepareURLFromArgs.mockReturnValue(new URL("https://xyzzy/song"));

    const collection = new SongCollection();

    const [fetchBody1] = makeModels(10, {}, "song");
    getPromise1.resolve(fetchBody1);
    await collection.ready();

    expect(collection.hasNextPage()).toBeTruthy();

    const fetchPromise2 = collection.fetchNextPage();
    const [fetchBody2] = makeModels(
      10,
      {
        offset: 10,
        limit: 10,
      },
      "song",
    );
    getPromise2.resolve(fetchBody2);

    const fetchModels2 = await fetchPromise2;
    expect(fetchModels2.length).toBe(20);
    expect(collection.models()).toEqual(fetchModels2);
  });

  it("should handle song models with artist references", async () => {
    setupLogin();

    const getPromise = PromiseWithResolvers();
    mockGetFromURLString.mockReturnValue(getPromise.promise);
    mockPrepareURLFromArgs.mockReturnValue(new URL("https://xyzzy/song"));

    const collection = new SongCollection();
    const [fetchBody] = makeModels(5, {}, "song");
    getPromise.resolve(fetchBody);
    await collection.ready();

    // Test that songs have artist references
    const songs = collection.models();
    expect(songs.length).toBeGreaterThan(0);

    songs.forEach((song) => {
      expect(SongModel.isModel(song)).toBeTruthy();
      expect(song.get("artist_id")).toBeDefined();
      expect(song.artistUrl).toBeDefined();

      // Test that we can retrieve the artist
      const artist = song.artist();
      expect(artist).toBeDefined();
      expect(artist.get("id")).toEqual(song.get("artist_id"));
    });
  });
});
