import * as NetworkLogin from "../Network/Login";
jest.mock("../Network/Login");

import { act, render, screen } from "@testing-library/react";

import LoginStatus from "./LoginStatus";

beforeEach(() => {
  localStorage.removeItem("jwttoken");
});

afterEach(() => {
  localStorage.removeItem("jwttoken");
});

it("should show the login button when logged out", async () => {
  const { asFragment } = render(
    <ContextChanger loggedIn={false}>
      <LoginStatus />
    </ContextChanger>,
  );

  expect(asFragment).toMatchSnapshot();

  const loginForm = screen.queryByText("Showing Log In Form");
  expect(loginForm).toBeNull();

  const loginButton = screen.getByText("Login");
  expect(loginButton).toBeVisible();
  expect(loginButton.tagName).toBe("BUTTON");
});

it("should show the login form when the login button is pressed", async () => {
  render(
    <ContextChanger loggedIn={false}>
      <LoginStatus />
    </ContextChanger>,
  );

  let loginForm = screen.queryByText("Showing Log In Form");
  expect(loginForm).toBeNull();

  const loginButton = screen.getByText("Login");

  await act(async () => {
    loginButton.click();
  });

  loginForm = screen.queryByText("Showing Log In Form");
  expect(loginForm).not.toBeNull();
  expect(loginForm).toBeInTheDocument();
});

it("should show the logout button when logged in", async () => {
  const { asFragment } = render(
    <ContextChanger loggedIn={true}>
      <LoginStatus />
    </ContextChanger>,
  );
  expect(asFragment).toMatchSnapshot();

  const loginForm = screen.queryByText("Showing Log In Form");
  expect(loginForm).toBeNull();

  const logoutButton = screen.getByText("Logout");
  expect(logoutButton).toBeVisible();
  expect(logoutButton.tagName).toBe("BUTTON");
});

it("should logout when the logout button is pressed", async () => {
  const { resolve } = NetworkLogin._setupMocks();

  const result = render(
    <ContextChanger loggedIn={true}>
      <LoginStatus />
    </ContextChanger>,
  );

  let loginForm = screen.queryByText("Showing Log In Form");
  expect(loginForm).toBeNull();

  const logoutButton = screen.getByText("Logout");

  await act(async () => {
    logoutButton.click();
    resolve({});
  });

  expect(NetworkLogin.logout).toBeCalledTimes(1);

  loginForm = screen.queryByText("Showing Log In Form");
  expect(loginForm).toBeNull();
});
