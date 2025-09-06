//
// Models must:
// - Fetch based on a unique id
// - Set the data fields on instantiate
// - Allow changing of field values.
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

import * as Network from "../Network/Network";

import { makeAModel } from "../testHelpers/modelTools";

import ModelBase from "./ModelBase";

function setupLogin(loggedIn = true) {
  mockLoginStatus.mockResolvedValue(loggedIn);
}

describe("ModelBase", () => {
  it("should instantiate a model", async () => {
    setupLogin();
    const model = new ModelBase(null, {
      id: 119,
      name: "xyzzy",
    });

    expect(ModelBase.isModel(model)).toBeTruthy();
    expect(model.get("id")).toBe(119);
    expect(model.get("name")).toBe("xyzzy");

    // Method under test must be wrapped in a function or the throw is not caught.
    expect(() => model.get("shoesize")).toThrow('No field "shoesize" is set');
    model.set("shoesize", 36);
    expect(model.get("shoesize")).toBe(36);
  });

  it("should create a model from a definition", async () => {
    setupLogin();
    // const { resolve } = Network._setupMocks();
    const model = ModelBase.from({
      id: 63,
      name: "Plover",
    });

    expect(ModelBase.isModel(model)).toBeTruthy();
    expect(model.get("id")).toBe(63);
    expect(model.get("name")).toBe("Plover");
  });

  it("should fetch a model", async () => {
    setupLogin();

    const getPromise = PromiseWithResolvers();
    mockGetFromURLString.mockReturnValueOnce(getPromise.promise);

    const [fetchBody, fetchModel] = makeAModel();

    const model = new ModelBase(fetchBody.url);

    const fetchPromise = model.ready();
    getPromise.resolve(fetchBody);
    const fetchDef = await fetchPromise;

    expect(model.toJSON()).toEqual(fetchBody);
    expect(model.toJSON()).toEqual(fetchModel.toJSON());
    expect(fetchDef).toEqual(fetchBody);

    expect(Network.getFromURLString).toHaveBeenCalledTimes(1);
    expect(Network.getFromURLString).toHaveBeenCalledWith(fetchBody.url);
  });

  it("should save changes to the model", async () => {
    setupLogin();

    const putPromise = PromiseWithResolvers();
    mockPutToURLString.mockReturnValue(putPromise.promise);

    const [oldBody] = makeAModel();
    const model = ModelBase.from(oldBody);
    expect(model.toJSON()).toEqual(oldBody);

    const newName = "Updated Name";
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

  // Test this, but this is really the wrong way to do this.
  it("should add a reference model", async () => {
    setupLogin();

    const [mainBody] = makeAModel("foobar");
    const [refBody] = makeAModel("xyzzy");

    const mainModel = ModelBase.from(mainBody);
    // Url calculations should be idempotent
    expect(mainModel.idUrl()).toEqual("http://localhost:2001/foobar/1");

    const refModel = ModelBase.from(refBody);
    expect(refModel.idUrl()).toEqual("http://localhost:2001/xyzzy/1");

    expect(mainModel.idUrl()).not.toEqual(refModel.idUrl());

    expect(() => {
      mainModel.addRef("xyzzy", refModel);
    }).not.toThrow();

    expect(mainModel.getRef("http://localhost:2001/xyzzy/1").toJSON()).toEqual(
      refModel.toJSON(),
    );
    expect(mainModel.xyzzy()).toBeDefined();
    expect(mainModel.xyzzy().toJSON()).toEqual(refModel.toJSON());
  });
});
