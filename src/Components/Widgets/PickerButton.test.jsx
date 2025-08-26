import { act, render, screen } from "@testing-library/react";
import { useState } from "react";

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

import PickerButton from "./PickerButton.jsx";

let testSetLoggedIn;

function TestWrapper({ loggedIn, showLoginForm, children }) {
  const [loginState, setLoginState] = useState({ loggedIn, showLoginForm });

  testSetLoggedIn = (isLoggedIn) => {
    setLoginState((oldState) => {
      return { ...oldState, loggedIn: isLoggedIn };
    });
  };

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

it("should show the button", async () => {
  setupLogin();

  const onModelPicked = jest.fn();

  const { resolve } = Network._setupMocks();

  const { asFragment, container } = render(
    <TestWrapper loggedIn={true} showLoginForm={false}>
      <PickerButton
        collectionClass={TestCollection}
        modelName="table1"
        fieldName="id"
        targetField="table2_id"
        labelText="Pick A Model"
        onModelPicked={onModelPicked}
      />
    </TestWrapper>,
  );

  expect(asFragment).toMatchSnapshot();

  expect(mockObserver.mockObserver.observers.length).toBe(0);
  const [fetchBody] = makeModels(10, {});

  await act(async () => {
    resolve(fetchBody);
  });

  expect(mockObserver.mockObserver.observers.length).toBe(0);
  const listComponent = container.querySelector(".picker-component");
  expect(listComponent).toBeNull();
});

it("should show the list on click", async () => {
  setupLogin();

  const onModelPicked = jest.fn();

  const { resolve } = Network._setupMocks();

  const { container, queryByText } = render(
    <TestWrapper loggedIn={true} showLoginForm={false}>
      <PickerButton
        collectionClass={TestCollection}
        modelName="table1"
        fieldName="id"
        targetField="table2_id"
        labelText="Pick A Model"
        onModelPicked={onModelPicked}
      />
    </TestWrapper>,
  );

  let listComponent = container.querySelector(".picker-component");
  expect(listComponent).toBeNull;
  expect(mockObserver.mockObserver.observers.length).toBe(0);

  const showButton = queryByText(/Please Choose/);
  const [fetchBody] = makeModels(10, {});

  await act(async () => {
    showButton.click();
    resolve(fetchBody);
  });

  expect(mockObserver.mockObserver.observers.length).toBe(1);
  listComponent = container.querySelector(".picker-component");
  expect(listComponent).toBeInTheDocument();
});

it("should call the callback and close the list when an item is clicked", async () => {
  setupLogin();

  const onModelPicked = jest.fn();

  const { resolve } = Network._setupMocks();

  const { container, queryByText } = render(
    <TestWrapper loggedIn={true} showLoginForm={false}>
      <PickerButton
        collectionClass={TestCollection}
        modelName="table1"
        fieldName="id"
        targetField="table2_id"
        labelText="Pick A Model"
        onModelPicked={onModelPicked}
      />
    </TestWrapper>,
  );

  const showButton = queryByText(/Please Choose/);
  const [fetchBody, models] = makeModels(10, {}, undefined, (def) => {
    def.table2_id = parseInt(Math.random() * 100);
  });

  await act(async () => {
    showButton.click();
    resolve(fetchBody);
  });

  expect(onModelPicked).not.toBeCalled();

  expect(mockObserver.mockObserver.observers.length).toBe(1);
  const el = queryByText(models[2].get("name"));

  await act(async () => {
    el.click();
  });

  expect(onModelPicked).toBeCalled();
  expect(onModelPicked).toBeCalledWith(models[2]);
  const listComponent = container.querySelector(".picker-component");
  expect(listComponent).toBeNull;
});

it("should close the list without calling if the button is pushed again", async () => {
  setupLogin();

  const onModelPicked = jest.fn();

  const { resolve } = Network._setupMocks();

  const { container, queryByText } = render(
    <PickerButton
      collectionClass={TestCollection}
      modelName="table1"
      targetField="table2_id"
      fieldName="table2_id"
      labelText="Pick A Model"
      onModelPicked={onModelPicked}
    />,
  );

  const showButton = queryByText(/Please Choose/);
  const [fetchBody, models] = makeModels(10, {});

  await act(async () => {
    showButton.click();
    resolve(fetchBody);
  });

  expect(onModelPicked).not.toBeCalled();

  expect(mockObserver.mockObserver.observers.length).toBe(1);
  let listComponent = container.querySelector(".picker-component");
  expect(listComponent).toBeInTheDocument();

  expect(onModelPicked).not.toBeCalled();

  await act(async () => {
    showButton.click();
  });

  listComponent = container.querySelector(".picker-component");
  expect(listComponent).not.toBeInTheDocument();
});
