import * as Network from "./Network";
jest.mock("./Network");

import * as jwt from "jwt-decode";
const mockJwtDecode = jest.spyOn(jwt, "jwtDecode");

import { loginStatus, login, logout, refreshToken } from "./Login.js";

const testToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGREM4MTEzOCIsInVzZXIiOnsiaWQiOjEsIm5hbWUiOiJhZG1pbiIsImFkbWluIjpmYWxzZX0sImlhdCI6MTY2NTk2NTA5OX0.2vz14X7Tm-oFlyOa7dcAF-5y5ympi_UlWyJNxO4xyS4";
const decodedTestToken = {
  sub: "FDC81138",
  user: { id: 1, name: "admin", admin: false },
  iat: 1665965099,
};

it("should get login status as true without network call", async () => {
  mockJwtDecode.mockReturnValue({
    ...decodedTestToken,
    iat: Date.now() / 1000,
  });
  localStorage.setItem("jwttoken", testToken);

  Network._setupMocks();

  const loginPromise = loginStatus();

  // To Do: This code should only execute if the token has expired.  I think.
  expect(Network.getFromURLString).not.toBeCalled();

  const result = await loginPromise;
  expect(result).toBeTruthy();

  localStorage.removeItem("jwttoken");
});

it("should get login status as true with network call", async () => {
  const nowIat = Date.now() / 1000;
  const oldIat = nowIat - 31 * 60; // Thirty one minutes;

  const nowDecoded = { ...decodedTestToken, sub: "plover", iat: nowIat };
  const oldDecoded = { ...decodedTestToken, sub: "xyzzy", iat: oldIat };

  mockJwtDecode.mockReturnValueOnce(oldDecoded).mockReturnValueOnce(nowDecoded);

  localStorage.setItem("jwttoken", "xyzzy");

  const { resolve } = Network._setupMocks();
  const loginPromise = loginStatus();

  // To Do: This code should only execute if the token has expired.  I think.
  expect(Network.getFromURLString).toBeCalledTimes(1);
  expect(Network.getFromURLString).toBeCalledWith(
    "http://localhost:2001/xyzzy/login",
  );

  resolve({
    loggedIn: true,
    token: testToken,
  });
  const result = await loginPromise;
  expect(result).toBeTruthy();
  const storedToken = localStorage.getItem("jwttoken");
  expect(storedToken).toEqual(testToken);

  localStorage.removeItem("jwttoken");
});

it("should get login status as false (no token)", async () => {
  localStorage.removeItem("jwttoken");

  const {} = Network._setupMocks();
  const loginPromise = loginStatus();

  expect(Network.getFromURLString).not.toBeCalled();

  const result = await loginPromise;
  expect(result).toBeFalsy();
});

it("should get login status as false (expired token)", async () => {
  const oldIat = Date.now() / 1000 - 31 * 60; // Thirty one minutes;
  const oldDecoded = { ...decodedTestToken, sub: "xyzzy", iat: oldIat };

  mockJwtDecode.mockReturnValue(oldDecoded);

  localStorage.setItem("jwttoken", testToken);

  const { resolve } = Network._setupMocks();
  const loginPromise = loginStatus();

  // To Do: This code should only execute if the token has expired.  I think.
  expect(Network.getFromURLString).toBeCalledTimes(1);
  expect(Network.getFromURLString).toBeCalledWith(
    "http://localhost:2001/xyzzy/login",
  );

  resolve({
    loggedIn: false,
    message: "Session Expired",
  });
  const result = await loginPromise;
  expect(result).toBeFalsy();
  const storedToken = localStorage.getItem("jwttoken");
  expect(storedToken).toBeNull();
});

it("should put to login and save token", async () => {
  const localDecoded = {
    sub: "xyzzy",
    user: { id: 2, name: "plover", admin: false },
    iat: 1665965230,
  };
  mockJwtDecode.mockReturnValue(localDecoded);
  localStorage.setItem("jwttoken", testToken);

  const { resolve } = Network._setupMocks();
  const loginPromise = refreshToken();

  // To Do: This code should only execute if the token has expired.  I think.
  expect(Network.putToURLString).toBeCalledTimes(1);
  expect(Network.putToURLString).toBeCalledWith(
    "http://localhost:2001/xyzzy/login",
    {},
  );

  resolve("xyzzy");
  const result = await loginPromise;
  expect(result).toEqual(localDecoded);
  const storedToken = localStorage.getItem("jwttoken");
  expect(storedToken).toEqual("xyzzy");

  localStorage.removeItem("jwttoken");
});

it("should post credentials to login and save token", async () => {
  localStorage.removeItem("jwttoken");

  const { resolve } = Network._setupMocks();
  const loginPromise = login("fred", "friendly");

  expect(Network.postToURLString).toBeCalledTimes(1);
  expect(Network.postToURLString).toBeCalledWith(
    "http://localhost:2001/xyzzy/login",
    { username: "fred", password: "friendly" },
  );

  resolve(testToken);
  const result = await loginPromise;
  expect(result).toStrictEqual(jwt.jwtDecode(testToken));

  const token = localStorage.getItem("jwttoken");
  expect(token).toEqual(testToken);

  localStorage.removeItem("jwttoken");
});

it("should post to logout", async () => {
  localStorage.setItem("jwttoken", testToken);

  const { resolve } = Network._setupMocks();
  const logoutPromise = logout();

  expect(Network.postToURLString).toBeCalledTimes(1);
  expect(Network.postToURLString).toBeCalledWith(
    "http://localhost:2001/xyzzy/logout",
  );

  resolve("");
  const result = await logoutPromise;
  expect(result).toBe("");

  const token = localStorage.getItem("jwttoken");
  expect(token).toBeNull();
});
