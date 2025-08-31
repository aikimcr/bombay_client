import { useContext } from "react";
import { act, render, screen } from "@testing-library/react";

import { mockUseLoginTracking } from "./Hooks/testing";

jest.mock("./Hooks/useLoginTracking", () => {
  const originalModule = jest.requireActual("./Hooks/useLoginTracking");

  return {
    __esModule: true,
    ...originalModule,
    useLoginTracking: mockUseLoginTracking,
  };
});

import { mockFetchBootstrap } from "./Network/testing";

jest.mock("./Network/Bootstrap", () => {
  const originalModule = jest.requireActual("./Network/Bootstrap");

  return {
    __esModule: true,
    ...originalModule,
    fetchBootstrap: mockFetchBootstrap,
  };
});

jest.mock("./Components", () => {
  const originalModule = jest.requireActual("./Components");

  return {
    __esModule: true,
    ...originalModule,
    LoginStatusDisplay: () => <div data-testid="mock-login-status">Login</div>,
  };
});

import { App } from "./App";

const testBootstrap = {
  key_signatures: ["A", "B", "C", "D", "E", "F", "G"],
};

describe("Test App", () => {
  test("Compoment matches snapshopt", async () => {
    const bootstrapPromise = PromiseWithResolvers();
    mockFetchBootstrap.mockReturnValue(bootstrapPromise.promise);

    const { asFragment } = render(<App />);

    await act(async () => {
      bootstrapPromise.resolve(testBootstrap);
    });

    expect(asFragment()).toMatchSnapshot();
  });

  test("Renders App Framework", async () => {
    const bootstrapPromise = PromiseWithResolvers();
    mockFetchBootstrap.mockReturnValue(bootstrapPromise.promise);

    await act(async () => {
      render(<App />);
    });

    await act(async () => {
      bootstrapPromise.resolve(testBootstrap);
    });

    expect(screen.getByTestId("app")).toBeInTheDocument();
    expect(screen.getByTestId("mock-login-status")).toBeInTheDocument();
  });
});
