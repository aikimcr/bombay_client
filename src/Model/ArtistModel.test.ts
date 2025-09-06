import {
  mockGetFromURLString,
  mockLogin,
  mockLoginStatus,
  mockLogout,
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
    getFromURLString: mockGetFromURLString,
    putToURLString: mockPutToURLString,
  };
});

import { makeAModel } from "../testHelpers/modelTools";

import ModelBase from "./ModelBase";
import ArtistModel from "./ArtistModel";

function setupLogin(loggedIn = true) {
  mockLoginStatus.mockResolvedValue(loggedIn);
}

describe("ArtistModel", () => {
  it("should instantiate a model", async () => {
    setupLogin();
    const model = new ArtistModel(null, {
      id: 119,
      name: "xyzzy",
    });

    expect(ArtistModel.isModel(model)).toBeTruthy();
    expect(model.get("id")).toBe(119);
    expect(model.get("name")).toBe("xyzzy");

    // Method under test must be wrapped in a function or the throw is not caught.
    expect(() => model.get("shoesize")).toThrow(
      'No field "shoesize" is set',
    );
    model.set("shoesize", 36);
    expect(model.get("shoesize")).toBe(36);
  });

  it("should create a model from a definition", async () => {
    setupLogin();
    const model = ArtistModel.from({
      id: 63,
      name: "Plover",
    });

    expect(ArtistModel.isModel(model)).toBeTruthy();
    expect(model.get("id")).toBe(63);
    expect(model.get("name")).toBe("Plover");
  });

  it("should fetch an artist model", async () => {
    setupLogin();

    const getPromise = PromiseWithResolvers();
    mockGetFromURLString.mockReturnValueOnce(getPromise.promise);

    const [fetchBody, fetchModel] = makeAModel("artist");

    const model = new ArtistModel(fetchBody.url);

    const fetchPromise = model.ready();
    getPromise.resolve(fetchBody);
    const fetchDef = await fetchPromise;

    expect(model.toJSON()).toEqual(fetchBody);
    expect(model.toJSON()).toEqual(fetchModel.toJSON());
    expect(fetchDef).toEqual(fetchBody);

    expect(mockGetFromURLString).toHaveBeenCalledTimes(1);
    expect(mockGetFromURLString).toHaveBeenCalledWith(fetchBody.url);
  });

  it("should save changes to the artist model", async () => {
    setupLogin();

    const putPromise = PromiseWithResolvers();
    mockPutToURLString.mockReturnValue(putPromise.promise);

    const [oldBody] = makeAModel("artist");
    const model = ArtistModel.from(oldBody);
    expect(model.toJSON()).toEqual(oldBody);

    const newName = "Updated Artist Name";
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

  it("should not recognize a base model as an artist model", async () => {
    setupLogin();
    // If the class extension is done correctly, TypeScript should just handle this.
    const [baseDef] = makeAModel("table1");
    const [artistDef] = makeAModel("artist");

    const baseModel = new ModelBase(baseDef.url, baseDef);
    const artistModel = new ArtistModel(artistDef.url, artistDef);

    expect(ModelBase.isModel(baseModel)).toBeTruthy();
    expect(ModelBase.isModel(artistModel)).toBeTruthy();

    expect(ArtistModel.isModel(baseModel)).toBeFalsy();
    expect(ArtistModel.isModel(artistModel)).toBeTruthy();
  });
});
