import { act, render } from "@testing-library/react";
import { useState } from "react";

import * as NetworkLogin from "../../Network/Login";
jest.mock("../../Network/Login");

import * as Network from "../../Network/Network";
import * as mockObserver from "../../Hooks/useIntersectionObserver";

import { makeModels, makeAModel } from "../../testHelpers/modelTools";

import BombayLoginContext from "../../Context/BombayLoginContext";
import BombayUtilityContext from "../../Context/BombayUtilityContext";

import SongListItem from "./SongListItem";

jest.useFakeTimers();

beforeEach(() => {
  const modalRoot = document.createElement("div");
  modalRoot.id = "modal-root";
  document.body.append(modalRoot);
});

afterEach(() => {
  const modalRoot = document.getElementById("modal-root");
  modalRoot.remove();
});

const mockUtility = {
  getBootstrap: () => {
    return {
      keySignatures: ["A", "B", "C", "D", "E", "F", "G"],
    };
  },
};

const renderWrapper = ({ children }) => {
  const [loginState, setLoginState] = useState({
    loggedIn: true,
    showLoginForm: false,
  });

  return (
    <BombayLoginContext.Provider value={loginState}>
      <BombayUtilityContext.Provider value={mockUtility}>
        {children}
      </BombayUtilityContext.Provider>
    </BombayLoginContext.Provider>
  );
};

function setupLogin(loggedIn = true, token = "xyzzy") {
  const loginPromise = NetworkLogin._setupMocks();
  loginPromise.resolve({ loggedIn, token });
}

function getAreas(result) {
  const index = result.container;
  expect(index.childElementCount).toEqual(1);

  const listElement = index.firstChild;
  expect(listElement.tagName).toEqual("LI");
  expect(listElement).toHaveClass("card");
  expect(listElement.childElementCount).toEqual(3);

  const headerElement = listElement.firstChild;
  expect(headerElement).toHaveClass("header");
  expect(headerElement).toHaveTextContent("Song");
  expect(headerElement.childElementCount).toEqual(0);

  const nameElement = listElement.children[1];
  expect(nameElement).toHaveClass("name");

  const detailsElement = listElement.lastChild;
  expect(detailsElement).toHaveClass("details");
  expect(detailsElement.childElementCount).toBe(8);

  return [detailsElement, nameElement, headerElement, listElement, index];
}

afterEach(() => {
  while (mockObserver.mockObserver.observers.length > 0) {
    mockObserver.mockObserver.observers.pop();
  }
});

it("should render a list item", async () => {
  const [modelDef, model] = makeAModel("song");
  const result = render(<SongListItem song={model} />, {
    wrapper: renderWrapper,
  });
  const [detailsElement, nameElement] = getAreas(result);

  expect(nameElement).toHaveTextContent(modelDef.name);

  expect(detailsElement.children[1]).toHaveTextContent(modelDef.artist.name);
  expect(detailsElement.children[3]).toHaveTextContent(modelDef.key_signature);
  expect(detailsElement.children[5]).toHaveTextContent(modelDef.tempo);
  expect(detailsElement.children[7]).toHaveTextContent(modelDef.lyrics);
});

it("should open the editor modal", async () => {
  setupLogin();

  const [mockGetPromise, mockGetResolve] = makeResolvablePromise();

  // The mock is not recognized unless it is done this way.
  Network.getFromURLString = jest.fn((url) => {
    return mockGetPromise;
  });

  const [fetchBody, models] = makeModels(10, {});

  await act(async () => {
    mockGetResolve(fetchBody);
  });

  const [modelDef, model] = makeAModel("song");

  const result = render(<SongListItem song={model} />, {
    wrapper: renderWrapper,
  });

  const index = result.container;

  await act(async () => {
    index.firstChild.click();
  });

  const modalRoot = document.getElementById("modal-root");
  expect(modalRoot.childElementCount).toEqual(1);
});

it("should save changes to the model", async () => {
  setupLogin();

  const [mockGetPromise, mockGetResolve] = makeResolvablePromise();
  const [mockPutPromise, mockPutResolve] = makeResolvablePromise();
  // The mock is not recognized unless it is done this way.
  Network.getFromURLString = jest.fn((url) => {
    return mockGetPromise;
  });

  Network.putToURLString = jest.fn((url, body) => {
    return mockPutPromise;
  });

  const [fetchBody, models] = makeModels(10, {});

  await act(async () => {
    mockGetResolve(fetchBody);
  });

  const [modelDef, model] = makeAModel("song");
  const songModelDef = { ...modelDef };
  delete songModelDef.artist;

  const result = render(<SongListItem song={model} />, {
    wrapper: renderWrapper,
  });

  const index = result.container;

  await act(async () => {
    index.firstChild.click();
  });

  const modalRoot = document.getElementById("modal-root");
  expect(modalRoot.childElementCount).toEqual(1);

  const submitButton = modalRoot.querySelector('[type="submit"]');

  await changeInput(
    modalRoot.querySelector('[data-targetfield="name"'),
    "input",
    "Herkimer",
    250,
  );

  act(() => {
    submitButton.click();
  });

  await act(async () => {
    mockPutResolve({ ...modelDef, name: "Herkimer" });
  });

  expect(Network.putToURLString).toBeCalledTimes(1);
  expect(Network.putToURLString).toBeCalledWith(modelDef.url, {
    ...songModelDef,
    name: "Herkimer",
  });
});

it("should update the artist name", async () => {
  setupLogin();

  const [mockGetPromise, mockGetResolve] = makeResolvablePromise();
  const [mockPutPromise, mockPutResolve] = makeResolvablePromise();
  // The mock is not recognized unless it is done this way.
  Network.getFromURLString = jest.fn((url) => {
    return mockGetPromise;
  });

  Network.putToURLString = jest.fn((url, body) => {
    return mockPutPromise;
  });

  const [modelDef, songModel] = makeAModel("song");
  const oldArtistDef = modelDef.artist;
  const songModelDef = { ...modelDef };
  delete songModelDef.artist;

  const result = render(<SongListItem song={songModel} />, {
    wrapper: renderWrapper,
  });

  const index = result.container;

  await act(async () => {
    index.firstChild.click();
  });

  const modalRoot = document.getElementById("modal-root");
  expect(modalRoot.childElementCount).toEqual(1);

  const submitButton = modalRoot.querySelector('[type="submit"]');
  const editButton = modalRoot.querySelector(".picker-button button");
  expect(editButton.textContent).toEqual(oldArtistDef.name);

  const [newArtistDef, newArtistModel] = makeAModel("artist");
  const fetchBody = {
    data: [oldArtistDef, newArtistDef],
    url: "xyzzy",
  };

  await act(async () => {
    editButton.click();
    mockGetResolve(fetchBody);
  });

  const newArtistLine = modalRoot.querySelector("li.picker-item:last-child");
  expect(newArtistLine).toHaveTextContent(newArtistDef.name);

  songModelDef.artist_id = newArtistDef.id;

  await act(async () => {
    newArtistLine.click();
  });

  expect(editButton).toHaveTextContent(newArtistDef.name);

  await act(async () => {
    submitButton.click();
    mockPutResolve({ ...songModelDef, artist: newArtistDef });
  });

  expect(Network.putToURLString).toBeCalledTimes(1);
  expect(Network.putToURLString).toBeCalledWith(modelDef.url, songModelDef);
  expect(songModel.artist().toJSON()).toEqual(newArtistDef);
});
