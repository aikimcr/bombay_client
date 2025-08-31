import { useState } from "react";
import { BrowserRouter } from "react-router";

import { act, render, screen } from "@testing-library/react";

import {
  mockLoginStatus,
  mockRefreshToken,
  mockLogin,
  mockLogout,
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

import { mockModelFetcher, mockUseModelCollection } from "../../Hooks/testing";
jest.mock("../../Hooks/useModelCollection", () => {
  const originalModule = jest.requireActual("../../Hooks/useModelCollection");

  return {
    __esModule: true,
    ...originalModule,
    useModelCollection: mockUseModelCollection,
  };
});

import * as Network from "../../Network/Network";
import * as mockObserver from "../../Hooks/useIntersectionObserver";

import { makeModels, makeAModel } from "../../testHelpers/modelTools";

import BombayLoginContext from "../../Context/BombayLoginContext";
import BombayUtilityContext from "../../Context/BombayUtilityContext";

import { ArtistList } from "./ArtistList.jsx";

jest.useFakeTimers();

function FakeContent(props) {
  const [loginState, setLoginState] = useState({
    loggedIn: true,
    showLoginForm: false,
  });
  const [modeState, setModeState] = useState("artist");

  const checkLoginState = async () => {
    setLoginState(true);
  };

  const setMode = async (newMode) => {
    setModeState("artist");
  };

  const utilities = {
    checkLoginState,
    setMode,
  };

  return (
    <BrowserRouter basename="/">
      <BombayLoginContext.Provider value={loginState}>
        <BombayUtilityContext.Provider value={utilities}>
          {props.children}
        </BombayUtilityContext.Provider>
      </BombayLoginContext.Provider>
    </BrowserRouter>
  );
}

jest.useFakeTimers();

const testToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGREM4MTEzOCIsInVzZXIiOnsiaWQiOjEsIm5hbWUiOiJhZG1pbiIsImFkbWluIjpmYWxzZX0sImlhdCI6MTY2NTk2NTA5OX0.2vz14X7Tm-oFlyOa7dcAF-5y5ympi_UlWyJNxO4xyS4";

beforeEach(() => {
  localStorage.setItem("jwttoken", testToken);
});

afterEach(() => {
  while (mockObserver.mockObserver.observers.length > 0) {
    mockObserver.mockObserver.observers.pop();
  }

  localStorage.removeItem("jwttoken");
});

function getAreas(result) {
  expect(mockObserver.mockObserver.observers.length).toBe(1);
  const observer = mockObserver.mockObserver.observers[0];

  const index = result.container;
  expect(index.childElementCount).toEqual(1);

  const listComponent = index.firstChild;
  expect(listComponent.childElementCount).toEqual(2);

  const controls = listComponent.firstChild;
  expect(controls.className).toEqual("list-controls");
  expect(controls.childElementCount).toEqual(3);

  const listContainer = listComponent.lastChild;
  expect(listContainer).toHaveClass("artist-list-container");
  expect(listContainer).toHaveClass("list-container");
  expect(listContainer.childElementCount).toEqual(1);
  expect(observer.options.root.lastChild).toHaveClass("artist-list-container");

  const listElement = listContainer.firstChild;

  return [listElement, controls, observer, listContainer, index];
}

const setUpModels = () => {
  const artistNames = [
    "Same & Dave",
    "Aerosmith",
    "Prince",
    "DNCE",
    "Sabrina Carpenter",
    "Metallica",
    "Ben E. King",
    "Van Halen",
    "Led Zeppelin",
    "Black Sabbath",
    "Steppenwolf",
    "Tom Petty",
    "Rolling Stones",
    "Olivia Rodrigo",
    "Santana",
    "The Who",
    "Deep Purple",
    "Donovan",
    "Jimi Hendrix",
    "T. Rex",
  ];
  const [_fetchBody, models] = makeModels(10, {}, "artist", (def) => {
    const idString = def.id || "1";
    const id = parseInt(idString) - 1;
    def.name = artistNames[id];
  });

  const modelPromise = PromiseWithResolvers();
  mockModelFetcher.mockReturnValueOnce(modelPromise.promise);
  return [modelPromise, models];
};

it("Component should match snapshot", async () => {
  const [modelPromise, models] = setUpModels();

  const loginPromise = PromiseWithResolvers();
  mockLoginStatus.mockReturnValue(loginPromise);
  loginPromise.resolve({
    loggedIn: true,
    token: testToken,
  });

  const { asFragment } = render(
    <FakeContent>
      <ArtistList />
    </FakeContent>,
  );

  await act(async () => {
    modelPromise.resolve(models);
  });

  expect(asFragment()).toMatchSnapshot();
});

it("should render the list", async () => {
  const [modelPromise, models] = setUpModels();

  const loginPromise = PromiseWithResolvers();
  mockLoginStatus.mockReturnValue(loginPromise);
  loginPromise.resolve({
    loggedIn: true,
    token: testToken,
  });

  const result = render(
    <FakeContent>
      <ArtistList />
    </FakeContent>,
  );

  await act(async () => {
    modelPromise.resolve(models);
  });

  expect(mockObserver.mockObserver.observers.length).toBe(1);

  expect(screen.getByTestId("artist-list-component")).toBeInTheDocument();
  expect(screen.getAllByTestId("artist-list-card")).toHaveLength(models.length);
});

it("should render the next page", async () => {
  const [modelPromise1, models1] = setUpModels();
  const [modelPromise2, models2] = setUpModels();

  const loginPromise = PromiseWithResolvers();
  mockLoginStatus.mockReturnValue(loginPromise);
  loginPromise.resolve({
    loggedIn: true,
    token: testToken,
  });

  const result = render(
    <FakeContent>
      <ArtistList />
    </FakeContent>,
  );

  await act(async () => {
    modelPromise1.resolve(models1);
  });

  expect(mockObserver.mockObserver.observers.length).toBe(1);
  expect(screen.getByTestId("artist-list-component")).toBeInTheDocument();
  expect(screen.getAllByTestId("artist-list-card")).toHaveLength(
    models1.length,
  );

  const observer = mockObserver.mockObserver.observers[0];

  await act(async () => {
    observer._fireIntersect(
      screen.getAllByTestId("artist-list-card").slice(-1)[0],
    );
    modelPromise2.resolve(models2);
  });

  expect(screen.getAllByTestId("artist-list-card")).toHaveLength(
    models1.length + models2.length,
  );
});

it("should stop when it runs out of data", async () => {
  const [modelPromise, models] = setUpModels();

  const loginPromise = PromiseWithResolvers();
  mockLoginStatus.mockReturnValue(loginPromise);
  loginPromise.resolve({
    loggedIn: true,
    token: testToken,
  });

  const result = render(
    <FakeContent>
      <ArtistList />
    </FakeContent>,
  );

  await act(async () => {
    modelPromise.resolve(models);
  });

  expect(mockObserver.mockObserver.observers.length).toBe(1);
  expect(screen.getByTestId("artist-list-component")).toBeInTheDocument();
  expect(screen.getAllByTestId("artist-list-card")).toHaveLength(models.length);

  const observer = mockObserver.mockObserver.observers[0];

  await act(async () => {
    observer._fireIntersect(
      screen.getAllByTestId("artist-list-card").slice(-1)[0],
    );
    modelPromise.reject({ status: 404, message: "Not Found" });
  });

  expect(mockObserver.mockObserver.observers.length).toBe(1);
  expect(screen.getByTestId("artist-list-component")).toBeInTheDocument();
  expect(screen.getAllByTestId("artist-list-card")).toHaveLength(models.length);
});

// Move this to testing the artist editing component.
it.skip("should add an artist", async () => {
  const loginPromise = PromiseWithResolvers();
  mockLoginStatus.mockReturnValue(loginPromise);
  loginPromise.resolve({
    loggedIn: true,
    token: testToken,
  });

  const modalRoot = document.getElementById("modal-root");

  const result = render(
    <FakeContent>
      <ArtistList />
    </FakeContent>,
  );

  const [fetchBody] = makeModels(10, {}, "artist");
  const collectionUrl = Network.prepareURLFromArgs("artist").toString();

  await act(async () => {
    resolve(fetchBody);
  });

  expect(mockObserver.mockObserver.observers.length).toBe(1);

  const [, controls] = getAreas(result);

  expect(modalRoot.childElementCount).toEqual(0);

  const addButton = controls.firstChild;

  act(() => {
    addButton.click();
  });

  expect(modalRoot.childElementCount).toEqual(1);

  const submitButton = modalRoot.querySelector('[type="submit"]');

  const [saveDef] = makeAModel("artist");
  await changeInput(
    modalRoot.querySelector('[data-targetfield="name"'),
    "input",
    "Herkimer",
    250,
  );

  await act(async () => {
    submitButton.click();
  });

  resolve(saveDef);

  expect(Network.postToURLString).toBeCalledTimes(1);
  expect(Network.postToURLString).toBeCalledWith(collectionUrl, {
    name: "Herkimer",
  });
});
