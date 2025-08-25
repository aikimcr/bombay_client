//
// Models must:
// - Fetch based on a unique id
// - Set the data fields on instantiate
// - Allow changing of field values.
import * as NetworkLogin from "../Network/Login";
jest.mock("../Network/Login");

import * as Network from "../Network/Network";

import casual from "casual";

import { makeAModel } from "../testHelpers/modelTools";

import ModelBase from "./ModelBase";

function setupLogin(loggedIn = true, token = "xyzzy") {
  const loginPromise = NetworkLogin._setupMocks();
  loginPromise.resolve({ loggedIn, token });
}

it("should instantiate a model", async () => {
  setupLogin();
  // const { resolve } = Network._setupMocks();
  const model = new ModelBase(null, {
    id: 119,
    name: "xyzzy",
  });

  expect(ModelBase.isModel(model)).toBeTruthy();
  expect(model.get("id")).toBe(119);
  expect(model.get("name")).toBe("xyzzy");

  // Method under test must be wrapped in a function or the throw is not caught.
  expect(() => model.get("shoesize")).toThrowError(
    'No field "shoesize" is set',
  );
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
  const { resolve } = Network._setupMocks();
  const [fetchBody, fetchModel] = makeAModel();

  const model = new ModelBase(fetchBody.url);
  const fetchPromise = model.ready();
  resolve(fetchBody);
  const fetchDef = await fetchPromise;
  expect(model.toJSON()).toEqual(fetchBody);
  expect(model.toJSON()).toEqual(fetchModel.toJSON());
  expect(fetchDef).toEqual(fetchBody);

  expect(Network.getFromURLString).toBeCalledTimes(1);
  expect(Network.getFromURLString).toBeCalledWith(fetchBody.url);
});

it("should save changes to the model", async () => {
  setupLogin();
  const { resolve } = Network._setupMocks();

  const [oldBody, oldModel] = makeAModel();
  const model = ModelBase.from(oldBody);
  expect(model.toJSON()).toEqual(oldBody);

  const newName = casual.uniqueName("table1");
  model.set("name", newName);
  expect(model.toJSON()).not.toEqual(oldBody);
  expect(model.get("name")).toEqual(newName);

  const savePromise = model.save();
  resolve({ ...oldBody, name: newName });
  const newBody = await savePromise;
  expect(newBody).not.toEqual(oldBody);
  expect(newBody.name).toEqual(newName);

  expect(Network.putToURLString).toBeCalledTimes(1);
  expect(Network.putToURLString).toBeCalledWith(oldBody.url, {
    ...oldBody,
    name: newName,
  });
});
