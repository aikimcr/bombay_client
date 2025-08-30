import { useState } from "react";

import { act, render, screen } from "@testing-library/react";

import * as NetworkLogin from "../../Network/Login";
jest.mock("../Network/Login");

import * as Network from "../../Network/Network";
import * as mockObserver from "../../Hooks/useIntersectionObserver";

import { makeModels } from "../../testHelpers/modelTools";

import BombayLoginContext from "../../Context/BombayLoginContext";

import ModelBase from "../../model/ModelBase";
import CollectionBase from "../../model/CollectionBase";

class TestModel extends ModelBase {}

class TestCollection extends CollectionBase {
  constructor(options = {}) {
    super("/table1", { ...options, modelClass: TestModel });
  }
}

import PickerList from "./PickerList.jsx";

function TestWrapper({ loggedIn, showLoginForm, children }) {
  const [loginState, setLoginState] = useState({ loggedIn, showLoginForm });

  return (
    <BombayLoginContext.Provider value={loginState}>
      {children}
    </BombayLoginContext.Provider>
  );
}

jest.useFakeTimers();

const testToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGREM4MTEzOCIsInVzZXIiOnsiaWQiOjEsIm5hbWUiOiJhZG1pbiIsImFkbWluIjpmYWxzZX0sImlhdCI6MTY2NTk2NTA5OX0.2vz14X7Tm-oFlyOa7dcAF-5y5ympi_UlWyJNxO4xyS4";

function setupLogin(loggedIn = true, token = testToken) {
  const loginPromise = NetworkLogin._setupMocks();
  loginPromise.resolve({ loggedIn, token });
}

beforeEach(() => {
  localStorage.setItem("jwttoken", testToken);
});

afterEach(() => {
  while (mockObserver.mockObserver.observers.length > 0) {
    mockObserver.mockObserver.observers.pop();
  }

  localStorage.removeItem("jwttoken");
});

it("should show the list", async () => {
  setupLogin();
  const pickModel = jest.fn();

  const { resolve } = Network._setupMocks();

  const { asFragment } = render(
    <TestWrapper loggedIn={true} showLoginForm={false}>
      <PickerList
        pickModel={pickModel}
        isOpen={true}
        collectionClass={TestCollection}
      />
    </TestWrapper>,
  );

  const [fetchBody, models] = makeModels(10, {});

  await act(async () => {
    resolve(fetchBody);
  });

  expect(asFragment).toMatchSnapshot();

  expect(mockObserver.mockObserver.observers.length).toBe(1);
  expect(Network.getFromURLString).toBeCalledTimes(1);
  expect(Network.getFromURLString).toBeCalledWith(
    "http://localhost:2001/xyzzy/table1",
  );
  expect(Network.getFromURLString.mock.results[0].value).resolves.toEqual(
    fetchBody,
  );

  const listElements = asFragment().querySelectorAll("li.picker-item");
  expect(listElements).toHaveLength(10);

  const el = screen.queryByText(models[1].get("name"));
  el.click();

  expect(pickModel).toBeCalled();
  expect(pickModel).toBeCalledWith(models[1]);
});

it("should show an empty list", async () => {
  setupLogin();
  const pickModel = jest.fn();

  const { reject } = Network._setupMocks();

  const { container } = render(
    <TestWrapper loggedIn={true} showLoginForm={false}>
      <PickerList
        pickModel={pickModel}
        isOpen={true}
        collectionClass={TestCollection}
      />
    </TestWrapper>,
  );

  await act(async () => {
    reject({ status: 404, message: "Not Found" });
  });

  const listElements = container.querySelectorAll("li.picker-item");
  expect(listElements).toHaveLength(0);
});
