import * as NetworkLogin from "./Network/Login";
jest.mock("./Network/Login");

import * as NetworkBootstrap from "./Network/Bootstrap";
jest.mock("./Network/Bootstrap");

import { useContext } from "react";
import { act, render } from "@testing-library/react";

import BombayLoginContext from "./Context/BombayLoginContext";

let mockLoggedIn = false;

// Mock the top classes here, before importing the App.
import HeaderBar from "./AppLayout/HeaderBar";
jest.mock("./AppLayout/HeaderBar", () => {
  const originalModule = jest.requireActual("./AppLayout/HeaderBar");

  return {
    __esModule: true,
    ...originalModule,
    default: () => {
      return <div className="header-bar"></div>;
    },
  };
});

import Navigation from "./AppLayout/Navigation";
jest.mock("./AppLayout/Navigation", () => {
  const originalModule = jest.requireActual("./AppLayout/Navigation");

  return {
    __esModule: true,
    ...originalModule,
    default: () => {
      return <div className="navigation"></div>;
    },
  };
});

import Filters from "./AppLayout/Filters";
jest.mock("./AppLayout/Filters", () => {
  const originalModule = jest.requireActual("./AppLayout/Filters");

  return {
    __esModule: true,
    ...originalModule,
    default: () => {
      return <div className="filters"></div>;
    },
  };
});

function MockContextConsumer(props) {
  const { loggedIn } = useContext(BombayLoginContext);
  const lgsText = loggedIn ? "Logged In" : "Logged Out";

  return (
    <div>
      <div className="lgs">{lgsText}</div>
    </div>
  );
}

import Content from "./AppLayout/Content";
jest.mock("./AppLayout/Content", () => {
  const originalModule = jest.requireActual("./AppLayout/Content");

  return {
    __esModule: true,
    ...originalModule,
    default: () => {
      return (
        <div className="content">
          <MockContextConsumer />
        </div>
      );
    },
  };
});

import App from "./App";

jest.useFakeTimers();

const testToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGREM4MTEzOCIsInVzZXIiOnsiaWQiOjEsIm5hbWUiOiJhZG1pbiIsImFkbWluIjpmYWxzZX0sImlhdCI6MTY2NTk2NTA5OX0.2vz14X7Tm-oFlyOa7dcAF-5y5ympi_UlWyJNxO4xyS4";

beforeEach(() => {
  localStorage.setItem("jwttoken", testToken);
});

afterEach(() => {
  localStorage.removeItem("jwttoken");
});

test("Renders App Framework", async () => {
  const { resolve: loginResolve } = NetworkLogin._setupMocks();
  loginResolve(true);

  const { resolve: bootstrapResolve } = NetworkBootstrap._setupMocks();
  bootstrapResolve({ key_signatures: ["A", "B", "C", "D", "E", "F", "G"] });

  const result = render(<App />);

  const index = result.container;
  expect(index.childElementCount).toBe(1);

  const app = index.firstChild;
  expect(app.className).toBe("App");
  expect(app.childElementCount).toBe(6);

  expect(app.children[0].className).toBe("header-bar");
  expect(app.children[1].className).toBe("navigation");
  expect(app.children[2].className).toBe("filters");
  expect(app.children[3].className).toBe("content");
  expect(app.children[4].className).toBe("accessories");
  expect(app.children[5].className).toBe("footer");

  let lgs = app.querySelector(".lgs");
  expect(lgs.textContent).toBe("Logged Out");

  mockLoggedIn = true;
  await act(async function () {
    jest.advanceTimersByTime(10 * 61 * 1000);
  });

  lgs = app.querySelector(".lgs");
  expect(lgs.textContent).toBe("Logged In");
});
