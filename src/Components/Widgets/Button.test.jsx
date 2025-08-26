import { act, render, screen } from "@testing-library/react";

import Button from "./Button.jsx";

jest.useFakeTimers();

it("should show a simple button", async () => {
  const clickHandler = jest.fn();
  const disabled = false;

  const { asFragment } = render(
    <Button label="xyzzy" disabled={disabled} onClick={clickHandler} />,
  );

  expect(asFragment).toMatchSnapshot();
});

it("should respond to click", async () => {
  const clickHandler = jest.fn();
  const disabled = false;

  render(<Button label="xyzzy" disabled={disabled} onClick={clickHandler} />);
  const actualButton = screen.getByText(/xyzzy/);
  actualButton.click();

  expect(clickHandler).toBeCalled();
});

it("should ignore the click", async () => {
  const clickHandler = jest.fn();
  const disabled = true;

  render(<Button label="xyzzy" disabled={disabled} onClick={clickHandler} />);
  const actualButton = screen.getByText(/xyzzy/);
  actualButton.click();

  expect(clickHandler).not.toBeCalled();
});

it("should respect classnames", async () => {
  const clickHandler = jest.fn();
  const disabled = true;

  render(
    <Button
      className="foobar"
      label="xyzzy"
      disabled={disabled}
      onClick={clickHandler}
    />,
  );
  const actualButton = screen.getByText(/xyzzy/);
  expect(actualButton).toHaveClass("btn");
  expect(actualButton).toHaveClass("foobar");
});
