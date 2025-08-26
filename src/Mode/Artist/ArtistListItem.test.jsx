import { act, render } from "@testing-library/react";

import * as Network from "../../Network/Network";

import { makeAModel } from "../../testHelpers/modelTools";

import ArtistListItem from "./ArtistListItem.jsx";

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

function getAreas(result) {
  const index = result.container;
  expect(index.childElementCount).toEqual(1);

  const listElement = index.firstChild;
  expect(listElement.tagName).toEqual("LI");
  expect(listElement).toHaveClass("card");
  expect(listElement.childElementCount).toEqual(3);

  const headerElement = listElement.firstChild;
  expect(headerElement).toHaveClass("header");
  expect(headerElement).toHaveTextContent("Artist");
  expect(headerElement.childElementCount).toEqual(0);

  const nameElement = listElement.children[1];
  expect(nameElement).toHaveClass("name");

  const detailsElement = listElement.lastChild;
  expect(detailsElement).toHaveClass("details");
  expect(detailsElement.childElementCount).toBe(0);

  return [detailsElement, nameElement, headerElement, listElement, index];
}

it("should render a list item", async () => {
  const [modelDef, model] = makeAModel("/artist");
  const result = render(<ArtistListItem artist={model} />);
  const [, nameElement] = getAreas(result);

  expect(nameElement).toHaveTextContent(modelDef.name);
});

it("should open the editor modal", async () => {
  const [modelDef, model] = makeAModel("/artist");
  const result = render(<ArtistListItem artist={model} />);

  const index = result.container;

  await act(async () => {
    index.firstChild.click();
  });

  const modalRoot = document.getElementById("modal-root");
  expect(modalRoot.childElementCount).toBe(1);
});

it("should save changes to the model", async () => {
  const [mockPromise, mockResolve] = makeResolvablePromise();
  // The mock is not recognized unless it is done this way.
  Network.putToURLString = jest.fn((url, body) => {
    return mockPromise;
  });

  const [modelDef, model] = makeAModel("/artist");

  const result = render(<ArtistListItem artist={model} />);

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
    mockResolve({ ...modelDef, name: "Herkimer" });
  });

  expect(Network.putToURLString).toBeCalledTimes(1);
  expect(Network.putToURLString).toBeCalledWith(modelDef.url, {
    ...modelDef,
    name: "Herkimer",
  });
});
