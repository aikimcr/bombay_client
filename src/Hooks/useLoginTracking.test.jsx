import { act, fireEvent, render, screen } from '@testing-library/react';

import {
  mockLoginStatus,
  mockRefreshToken,
  mockLogin,
  mockLogout,
} from '../Network/testing';

jest.mock('../Network/Login', () => {
  const originalModule = jest.requireActual('../Network/Login');

  return {
    __esModule: true,
    ...originalModule,
    loginStatus: mockLoginStatus,
    refreshToken: mockRefreshToken,
    login: mockLogin,
    logout: mockLogout,
  };
});

import { jwtDecode } from 'jwt-decode';
jest.mock('jwt-decode');

import useLoginTracking from './useLoginTracking';

function TestApp(props) {
  const [loginState, setLoginState] = useLoginTracking();

  // console.log(`TestApp ${loginState}`);

  if (loginState) {
    return <div>Logged In</div>;
  } else {
    return (
      <>
        <div>Logged Out</div>;
        <button onClick={() => setLoginState(true)}>LOGIN</button>
      </>
    );
  }
}

jest.useFakeTimers();

const testToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGREM4MTEzOCIsInVzZXIiOnsiaWQiOjEsIm5hbWUiOiJhZG1pbiIsImFkbWluIjpmYWxzZX0sImlhdCI6MTY2NTk2NTA5OX0.2vz14X7Tm-oFlyOa7dcAF-5y5ympi_UlWyJNxO4xyS4';
const decodedTestToken = {
  sub: 'FDC81138',
  user: { id: 1, name: 'admin', admin: false },
  iat: 0,
};

const loginAdvanceSeconds = 10 * 60;
const activityAdvanceSeconds = 30 * 60;

async function renderAndCheck(checkResolve = true) {
  const mockCheckLoginPromise = PromiseWithResolvers();
  const mockRefreshTokenPromise = PromiseWithResolvers();
  mockRefreshTokenPromise.resolve(null); // Refresh token shouldn't be called initially.

  mockLoginStatus.mockReturnValue(mockCheckLoginPromise.promise);
  mockRefreshToken.mockReturnValue(mockRefreshTokenPromise.promise);

  const result = render(<TestApp />);

  expect(mockLoginStatus).toBeCalledTimes(1);
  expect(mockRefreshToken).not.toBeCalled();

  await act(async () => {
    mockCheckLoginPromise.resolve(checkResolve);
  });

  expect(mockLoginStatus).toBeCalledTimes(1);
  expect(mockRefreshToken).not.toBeCalled();

  return result;
}

it('should render as logged out', async function () {
  await renderAndCheck(false);

  const testDiv = screen.getByText(/Logged/);
  expect(testDiv).toBeInTheDocument();
  expect(testDiv).toHaveTextContent('Logged Out');
});

it('should render as logged in', async function () {
  await renderAndCheck();

  const testDiv = screen.getByText(/Logged/);
  expect(testDiv).toBeInTheDocument();
  expect(testDiv).toHaveTextContent('Logged In');
});

async function nextCheck(
  loginStatusCalls,
  refreshTokenCalls,
  resolveToken,
  resolveLogin,
  loggedInText,
  loginFirst = false,
) {
  const mockCheckLoginPromise = PromiseWithResolvers();
  const mockRefreshTokenPromise = PromiseWithResolvers();

  mockLoginStatus.mockReturnValue(mockCheckLoginPromise.promise);
  mockRefreshToken.mockReturnValue(mockRefreshTokenPromise.promise);

  // Advance the time to check login and refresh the token
  await act(async () => {
    jest.advanceTimersByTime(loginAdvanceSeconds * 1000);
  });

  expect(mockLoginStatus).toBeCalledTimes(loginStatusCalls);
  expect(mockRefreshToken).toBeCalledTimes(refreshTokenCalls);

  if (loginFirst) {
    await act(async () => {
      mockCheckLoginPromise.resolve(resolveLogin);
    });
  }

  await act(async () => {
    decodedTestToken.iat = decodedTestToken.iat + activityAdvanceSeconds;
    mockRefreshTokenPromise.resolve(resolveToken);
  });

  expect(mockLoginStatus).toBeCalledTimes(loginStatusCalls);
  expect(mockRefreshToken).toBeCalledTimes(refreshTokenCalls);

  if (!loginFirst) {
    await act(async () => {
      mockCheckLoginPromise.resolve(resolveLogin);
    });
  }

  const testDiv = screen.queryByText(/Logged/);
  expect(testDiv).toBeInTheDocument();
  expect(testDiv).toHaveTextContent(loggedInText);
}

it('should logout if there is no activity', async function () {
  await renderAndCheck();

  await nextCheck(1, 1, testToken, true, 'Logged In');
  await nextCheck(1, 2, testToken, true, 'Logged In');
  await nextCheck(1, 3, testToken, true, 'Logged In');

  await act(async () => {
    jest.advanceTimersByTime(100000);
  });
  // As soon as the server times out, we're logged out.
  await nextCheck(2, 3, null, false, 'Logged Out');
});

it('should refresh the token if there is activity', async function () {
  const result = await renderAndCheck();

  const testDiv = screen.queryByText(/Logged/);
  expect(testDiv).toBeInTheDocument();
  expect(testDiv).toHaveTextContent('Logged In');

  await nextCheck(1, 1, testToken, true, 'Logged In');
  await nextCheck(1, 2, testToken, true, 'Logged In');
  await nextCheck(1, 3, testToken, true, 'Logged In');

  // Reset activity
  await act(async () => {
    fireEvent(
      result.container,
      new MouseEvent('mousedown', { bubbles: true, cancelable: true }),
    );
  });

  await nextCheck(1, 4, testToken, true, 'Logged In');
  await nextCheck(1, 5, testToken, true, 'Logged In');
  await nextCheck(1, 6, testToken, true, 'Logged In');

  // No more activity - will log out when the server does
  await nextCheck(2, 6, null, true, 'Logged In');
  await nextCheck(3, 6, null, true, 'Logged In');
  await nextCheck(4, 6, null, false, 'Logged Out', true);
});

it('should set login state to true', async function () {
  await renderAndCheck(false);

  let testDiv = screen.queryByText(/Logged/);
  expect(testDiv).toBeInTheDocument();
  expect(testDiv).toHaveTextContent('Logged Out');

  const button = screen.getByText('LOGIN');

  await act(async () => {
    button.click();
  });

  testDiv = screen.queryByText(/Logged/);
  expect(testDiv).toHaveTextContent('Logged In');
});
