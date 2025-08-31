import { useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";

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
} from "../../Network/testing";

jest.mock("../../Network/Login", () => {
  const originalModule = jest.requireActual("../../Network/Login");

  return {
    __esModule: true,
    ...originalModule,
    loginStatus: mockLoginStatus,
    refreshToken: mockRefreshToken,
    login: mockLogin,
    logout: mockLogout,
  };
});

jest.mock("../../Network/Network", () => {
  const originalModule = jest.requireActual("../../Network/Network");

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

import {
  MockTestCollection,
  mockFetchBody,
  mockModels,
  MockPickerList,
} from "./testing";

jest.mock(".", () => {
  const originalModule = jest.requireActual(".");

  return {
    __esModule: true,
    ...originalModule,
    PickerList: MockPickerList,
  };
});

import BombayLoginContext from "../../Context/BombayLoginContext";

import PickerButton from "./PickerButton.jsx";

let testSetLoggedIn;

function TestWrapper({ loggedIn, children }) {
  const [loginState, setLoginState] = useState({ loggedIn });

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
  const loginPromise = PromiseWithResolvers();
  loginPromise.resolve({ loggedIn, token });
}

beforeEach(() => {
  localStorage.setItem("jwttoken", testToken);
});

afterEach(() => {
  localStorage.removeItem("jwttoken");
});

it("Component should match snapshot", async () => {
  setupLogin();

  const getPromise = PromiseWithResolvers();
  mockGetFromURLString.mockReturnValue(getPromise.promise);

  const onModelPicked = jest.fn();

  const { asFragment } = render(
    <TestWrapper loggedIn={true}>
      <PickerButton
        collectionClass={MockTestCollection}
        modelName="table1"
        fieldName="id"
        targetField="table2_id"
        labelText="Pick A Model"
        onModelPicked={onModelPicked}
      />
    </TestWrapper>,
  );

  await act(async () => {
    getPromise.resolve(mockFetchBody);
  });

  expect(asFragment()).toMatchSnapshot();
});

it("should hide the list on load", async () => {
  setupLogin();

  const getPromise = PromiseWithResolvers();
  mockGetFromURLString.mockReturnValue(getPromise.promise);

  const onModelPicked = jest.fn();

  render(
    <TestWrapper loggedIn={true}>
      <PickerButton
        collectionClass={MockTestCollection}
        modelName="table1"
        fieldName="id"
        targetField="table2_id"
        labelText="Pick A Model"
        onModelPicked={onModelPicked}
      />
    </TestWrapper>,
  );

  await act(async () => {
    getPromise.resolve(mockFetchBody);
  });

  expect(screen.queryByTestId("mock-picker-list")).toBeNull();
});

it("should show the list on click", async () => {
  setupLogin();

  const getPromise = PromiseWithResolvers();
  mockGetFromURLString.mockReturnValue(getPromise.promise);

  const onModelPicked = jest.fn();

  render(
    <TestWrapper loggedIn={true}>
      <PickerButton
        collectionClass={MockTestCollection}
        modelName="table1"
        fieldName="id"
        targetField="table2_id"
        labelText="Pick A Model"
        onModelPicked={onModelPicked}
      />
    </TestWrapper>,
  );

  await act(async () => {
    getPromise.resolve(mockFetchBody);
  });

  let listComponent = screen.queryByTestId("mock-picker-list");
  expect(listComponent).toBeNull;

  const showButton = screen.getByText(/Please Choose/);

  await act(async () => {
    fireEvent.click(showButton);
  });

  listComponent = screen.getByTestId("mock-picker-list");
  expect(listComponent).toBeInTheDocument();
});

it("should call the callback and close the list when an item is clicked", async () => {
  setupLogin();

  const getPromise = PromiseWithResolvers();
  mockGetFromURLString.mockReturnValue(getPromise.promise);

  const onModelPicked = jest.fn();

  render(
    <TestWrapper loggedIn={true}>
      <PickerButton
        collectionClass={MockTestCollection}
        modelName="table1"
        fieldName="id"
        targetField="table2_id"
        labelText="Pick A Model"
        onModelPicked={onModelPicked}
      />
    </TestWrapper>,
  );

  await act(async () => {
    getPromise.resolve(mockFetchBody);
  });

  const showButton = screen.getByText(/Please Choose/);

  await act(async () => {
    fireEvent.click(showButton);
  });

  expect(onModelPicked).not.toBeCalled();

  const el = screen.getByText("Pick Model");

  await act(async () => {
    fireEvent.click(el);
  });

  expect(onModelPicked).toBeCalled();
  expect(onModelPicked).toBeCalledWith(mockModels[2]);

  const listComponent = screen.queryByTestId("mock-picker-list");
  expect(listComponent).toBeNull;
});

it("should close the list without calling if the button is pushed again", async () => {
  setupLogin();

  const getPromise = PromiseWithResolvers();
  mockGetFromURLString.mockReturnValue(getPromise.promise);

  const onModelPicked = jest.fn();

  render(
    <PickerButton
      collectionClass={MockTestCollection}
      modelName="table1"
      targetField="table2_id"
      fieldName="table2_id"
      labelText="Pick A Model"
      onModelPicked={onModelPicked}
    />,
  );

  await act(async () => {
    getPromise.resolve(mockFetchBody);
  });

  const showButton = screen.queryByText(/Please Choose/);

  await act(async () => {
    fireEvent.click(showButton);
  });

  expect(onModelPicked).not.toBeCalled();

  let listComponent = screen.getByTestId("mock-picker-list");
  expect(listComponent).toBeInTheDocument();

  expect(onModelPicked).not.toBeCalled();

  await act(async () => {
    showButton.click();
  });

  listComponent = screen.queryByTestId("mock-picker-list");
  expect(listComponent).not.toBeInTheDocument();
});
