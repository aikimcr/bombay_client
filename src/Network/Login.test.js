import {
  mockGetFromURLString,
  mockPostToURLString,
  mockPrepareURLFromArgs,
  mockPutToURLString,
  mockServerBasePath,
  mockServerHost,
  mockServerPort,
  mockServerProtocol,
} from '../Network/testing';

jest.mock('../Network/Network', () => {
  const originalModule = jest.requireActual('../Network/Network');

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

// import * as jwt from "jwt-decode";
// const mockJwtDecode = jest.spyOn(jwt, "jwtDecode");
const mockJwtDecode = jest.fn();

jest.mock('jwt-decode', () => {
  const originalModule = jest.requireActual('jwt-decode');

  return {
    __esModule: true,
    ...originalModule,
    jwtDecode: (token) => {
      return mockJwtDecode(token);
    },
  };
});

import { loginStatus, login, logout, refreshToken } from './Login.js';

const testToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGREM4MTEzOCIsInVzZXIiOnsiaWQiOjEsIm5hbWUiOiJhZG1pbiIsImFkbWluIjpmYWxzZX0sImlhdCI6MTY2NTk2NTA5OX0.2vz14X7Tm-oFlyOa7dcAF-5y5ympi_UlWyJNxO4xyS4';
const decodedTestToken = {
  sub: 'FDC81138',
  user: { id: 1, name: 'admin', admin: false },
  iat: 1665965099,
};

it('should get login status as true without network call', async () => {
  mockJwtDecode.mockReturnValueOnce({
    ...decodedTestToken,
    iat: Date.now() / 1000,
  });
  localStorage.setItem('jwttoken', testToken);

  const loginPromise = loginStatus();

  // To Do: This code should only execute if the token has expired.  I think.
  expect(mockGetFromURLString).not.toHaveBeenCalled();

  const result = await loginPromise;
  expect(result).toBeTruthy();

  localStorage.removeItem('jwttoken');
});

it('should get login status as true with network call', async () => {
  const nowIat = parseInt(Date.now() / 1000);
  const oldIat = parseInt(nowIat - 31 * 60); // Thirty one minutes;

  const oldDecoded = { ...decodedTestToken, sub: 'xyzzy', iat: oldIat };
  const nowDecoded = { ...decodedTestToken, sub: 'plover', iat: nowIat };

  mockJwtDecode.mockReturnValueOnce(oldDecoded).mockReturnValueOnce(nowDecoded);

  localStorage.setItem('jwttoken', 'xyzzy');

  const loginUrlPromise = PromiseWithResolvers();
  mockGetFromURLString.mockReturnValueOnce(loginUrlPromise.promise);
  mockPrepareURLFromArgs.mockReturnValue('http://localhost:2001/xyzzy/login');

  const loginPromise = loginStatus();

  expect(mockGetFromURLString).toHaveBeenCalledTimes(1);
  expect(mockGetFromURLString).toHaveBeenCalledWith(
    'http://localhost:2001/xyzzy/login',
  );

  loginUrlPromise.resolve({
    loggedIn: true,
    token: testToken,
  });
  const result = await loginUrlPromise.promise;
  expect(result).toBeTruthy();
  const storedToken = localStorage.getItem('jwttoken');
  expect(storedToken).toEqual(testToken);

  localStorage.removeItem('jwttoken');
});

it('should get login status as false (no token)', async () => {
  localStorage.removeItem('jwttoken');

  const loginPromise = loginStatus();

  expect(mockGetFromURLString).not.toHaveBeenCalled();

  const result = await loginPromise;
  expect(result).toBeFalsy();
});

it('should get login status as false (expired token)', async () => {
  const oldIat = Date.now() / 1000 - 31 * 60; // Thirty one minutes;
  const oldDecoded = { ...decodedTestToken, sub: 'xyzzy', iat: oldIat };

  mockJwtDecode.mockReturnValue(oldDecoded);

  localStorage.setItem('jwttoken', testToken);

  const loginUrlPromise = PromiseWithResolvers();
  mockGetFromURLString.mockReturnValueOnce(loginUrlPromise.promise);
  mockPrepareURLFromArgs.mockReturnValue('http://localhost:2001/xyzzy/login');

  const loginPromise = loginStatus();

  expect(mockGetFromURLString).toHaveBeenCalledTimes(1);
  expect(mockGetFromURLString).toHaveBeenCalledWith(
    'http://localhost:2001/xyzzy/login',
  );

  loginUrlPromise.resolve({
    loggedIn: false,
    message: 'Session Expired',
  });

  const result = await loginPromise;
  expect(result).toBeFalsy();

  const storedToken = localStorage.getItem('jwttoken');
  expect(storedToken).toBeNull();
});

it('should get login status as false (expired token, error on fetch)', async () => {
  const oldIat = Date.now() / 1000 - 31 * 60; // Thirty one minutes;
  const oldDecoded = { ...decodedTestToken, sub: 'xyzzy', iat: oldIat };

  mockJwtDecode.mockReturnValue(oldDecoded);

  localStorage.setItem('jwttoken', testToken);

  const loginUrlPromise = PromiseWithResolvers();
  mockGetFromURLString.mockReturnValueOnce(loginUrlPromise.promise);
  mockPrepareURLFromArgs.mockReturnValue('http://localhost:2001/xyzzy/login');

  const loginPromise = loginStatus();

  expect(mockGetFromURLString).toHaveBeenCalledTimes(1);
  expect(mockGetFromURLString).toHaveBeenCalledWith(
    'http://localhost:2001/xyzzy/login',
  );

  loginUrlPromise.resolve({
    status: 500,
    message: 'System error',
  });

  const result = await loginPromise;
  expect(result).toBeFalsy();

  const storedToken = localStorage.getItem('jwttoken');
  expect(storedToken).toBeNull();
});

it('should put to login and save token', async () => {
  const localDecoded = {
    sub: 'xyzzy',
    user: { id: 2, name: 'plover', admin: false },
    iat: 1665965230,
  };
  mockJwtDecode.mockReturnValue(localDecoded);
  localStorage.setItem('jwttoken', testToken);

  const loginUrlPromise = PromiseWithResolvers();
  mockPutToURLString.mockReturnValueOnce(loginUrlPromise.promise);
  mockPrepareURLFromArgs.mockReturnValue('http://localhost:2001/xyzzy/login');

  const loginPromise = refreshToken();

  expect(mockPutToURLString).toHaveBeenCalledTimes(1);
  expect(mockPutToURLString).toHaveBeenCalledWith(
    'http://localhost:2001/xyzzy/login',
    {},
  );

  loginUrlPromise.resolve('xyzzy');

  const result = await loginPromise;
  expect(result).toEqual(localDecoded);

  const storedToken = localStorage.getItem('jwttoken');
  expect(storedToken).toEqual('xyzzy');

  localStorage.removeItem('jwttoken');
});

it('should post credentials to login and save token', async () => {
  localStorage.removeItem('jwttoken');

  const loginUrlPromise = PromiseWithResolvers();
  mockPostToURLString.mockReturnValueOnce(loginUrlPromise.promise);
  mockPrepareURLFromArgs.mockReturnValue('http://localhost:2001/xyzzy/login');

  const loginPromise = login('fred', 'friendly');

  expect(mockPostToURLString).toHaveBeenCalledTimes(1);
  expect(mockPostToURLString).toHaveBeenCalledWith(
    'http://localhost:2001/xyzzy/login',
    { username: 'fred', password: 'friendly' },
  );

  loginUrlPromise.resolve(testToken);

  const result = await loginPromise;

  const token = localStorage.getItem('jwttoken');
  expect(token).toEqual(testToken);

  localStorage.removeItem('jwttoken');
});

it('should post to logout', async () => {
  localStorage.setItem('jwttoken', testToken);

  const logoutUrlPromise = PromiseWithResolvers();
  mockPostToURLString.mockReturnValueOnce(logoutUrlPromise.promise);
  mockPrepareURLFromArgs.mockReturnValue('http://localhost:2001/xyzzy/logout');

  const logoutPromise = logout();

  expect(mockPostToURLString).toHaveBeenCalledTimes(1);
  expect(mockPostToURLString).toHaveBeenCalledWith(
    'http://localhost:2001/xyzzy/logout',
  );

  logoutUrlPromise.resolve('');

  const result = await logoutPromise;
  expect(result).toBe('');

  const token = localStorage.getItem('jwttoken');
  expect(token).toBeNull();
});
