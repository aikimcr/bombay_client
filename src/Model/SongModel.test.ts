import {
  mockGetFromURLString,
  mockLogin,
  mockLoginStatus,
  mockLogout,
  mockPutToURLString,
  mockRefreshToken,
  mockPrepareURLFromArgs,
  mockPostToURLString,
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

import { makeAModel } from "../testHelpers/modelTools";

import ModelBase from "./ModelBase";
import SongModel from "./SongModel";

function setupLogin(loggedIn = true) {
  mockLoginStatus.mockResolvedValue(loggedIn);
}

describe("SongModel", () => {
  it("should instantiate a model", async () => {
    setupLogin();
    const [def] = makeAModel("song");
    const model = SongModel.from(def);

    expect(SongModel.isModel(model)).toBeTruthy();
    expect(model.get("id")).toEqual(def.id);
    expect(model.get("name")).toEqual(def.name);
    expect(model.get("artist_id")).toEqual(def.artist_id);
    expect(model.idUrl()).toEqual(def.url);

    expect(model.artist).toBeDefined();
    const artist = model.artist();
    expect(artist).toBeDefined();
    expect(artist.get("id")).toEqual(model.get("artist_id"));
    expect(artist.get("name")).toEqual(def.artist.name);
    expect(artist.idUrl()).toEqual(def.artist.url);
  });

  it("should fetch a song model", async () => {
    setupLogin();

    const getPromise = PromiseWithResolvers();
    mockGetFromURLString.mockReturnValueOnce(getPromise.promise);

    const [fetchBody, fetchModel] = makeAModel("song");

    const model = new SongModel(fetchBody.url);

    const fetchPromise = model.ready();
    getPromise.resolve(fetchBody);
    const fetchDef = await fetchPromise;

    expect(model.toJSON()).toEqual(fetchBody);
    expect(model.toJSON()).toEqual(fetchModel.toJSON());
    expect(fetchDef).toEqual(fetchBody);

    expect(mockGetFromURLString).toHaveBeenCalledTimes(1);
    expect(mockGetFromURLString).toHaveBeenCalledWith(fetchBody.url);
  });

  it("should save changes to the song model", async () => {
    setupLogin();

    const putPromise = PromiseWithResolvers();
    mockPutToURLString.mockReturnValue(putPromise.promise);

    const [oldBody] = makeAModel("song");
    const model = SongModel.from(oldBody);
    expect(model.toJSON()).toEqual(oldBody);

    const newName = "Updated Song Name";
    model.set("name", newName);
    expect(model.toJSON()).not.toEqual(oldBody);
    expect(model.get("name")).toEqual(newName);

    const savePromise = model.save();
    putPromise.resolve({
      ...oldBody,
      name: newName,
    });
    const newBody = await savePromise;
    expect(newBody).not.toEqual(oldBody);
    expect(newBody.name).toEqual(newName);

    expect(mockPutToURLString).toHaveBeenCalledTimes(1);
    expect(mockPutToURLString).toHaveBeenCalledWith(oldBody.url, {
      ...oldBody,
      name: newName,
    });
  });

  it("should not recognize a base model as a song model", async () => {
    setupLogin();
    // If the class extension is done correctly, TypeScript should just handle this.
    const [baseDef] = makeAModel("table1");
    const [songDef] = makeAModel("song");

    const baseModel = new ModelBase(baseDef.url, baseDef);
    const songModel = new SongModel(songDef.url, songDef);

    expect(ModelBase.isModel(baseModel)).toBeTruthy();
    expect(ModelBase.isModel(songModel)).toBeTruthy();

    expect(SongModel.isModel(baseModel)).toBeFalsy();
    expect(SongModel.isModel(songModel)).toBeTruthy();
  });

  it("should update the artist model", async () => {
    setupLogin();
    const mockPromise = PromiseWithResolvers();
    // The mock is not recognized unless it is done this way.
    mockPutToURLString.mockReturnValue(mockPromise.promise);

    const [modelDef, songModel] = makeAModel("song");
    const [newArtistDef, newArtistModel] = makeAModel("artist");
    const songModelDef = { ...modelDef };
    delete songModelDef.artist;

    songModelDef.artist_id = newArtistDef.id;
    songModel.set(songModelDef);

    const savePromise = songModel.save();
    mockPromise.resolve({
      ...songModelDef,
      artist: newArtistDef,
    });
    const newBody = await savePromise;

    expect(newBody).toEqual({
      ...songModelDef,
      artist: newArtistDef,
    });
    expect(songModel.get("artist_id")).toEqual(newArtistModel.get("id"));
    expect(songModel.artist()).toEqual(newArtistModel);
  });

  it("should handle artist reference correctly", async () => {
    setupLogin();

    const [songDef] = makeAModel("song");
    const model = SongModel.from(songDef);

    // Test that the artist reference is properly set up
    expect(model.artistUrl).toBeDefined();
    expect(model.artistUrl).toEqual(songDef.artist.url);

    // Test that we can retrieve the artist
    const artist = model.artist();
    expect(artist).toBeDefined();
    expect(artist.get("id")).toEqual(songDef.artist.id);
    expect(artist.get("name")).toEqual(songDef.artist.name);
  });
});
