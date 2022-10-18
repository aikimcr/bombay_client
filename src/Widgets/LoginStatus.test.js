import * as NetworkLogin from '../Network/Login';
jest.mock('../Network/Login');

import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { act, render, screen } from '@testing-library/react';

const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGREM4MTEzOCIsInVzZXIiOnsiaWQiOjEsIm5hbWUiOiJhZG1pbiIsImFkbWluIjpmYWxzZX0sImlhdCI6MTY2NTk2NTA5OX0.2vz14X7Tm-oFlyOa7dcAF-5y5ympi_UlWyJNxO4xyS4';

import BombayLoginContext from '../Context/BombayLoginContext';
import BombayUtilityContext from '../Context/BombayUtilityContext';

import LoginStatus from './LoginStatus';

let mockLoggedIn = false;

function FakeContent(props) {
    const [loginState, setLoginState] = useState(mockLoggedIn);

    const setMode = async newMode => {
        setModeState(newMode);
    }

    const utilities = {
        setMode,
        setLoginState,
    }

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

beforeEach(() => {
    localStorage.removeItem('jwttoken');
    mockLoggedIn = false;
})

afterEach(() => {
    localStorage.removeItem('jwttoken');
    mockLoggedIn = false;
})

it('should render the login status (logged out)', async () => {
    const { asFragment } = render(
        <FakeContent>
            <LoginStatus />
        </FakeContent>
    )

    expect(asFragment).toMatchSnapshot();
    const statusDiv = screen.getByText('Please Login');
    expect(statusDiv).toBeVisible();
});

it('should show the logout button when logged in', async () => {
    mockLoggedIn = true;
    const { asFragment } = render(
        <FakeContent>
            <LoginStatus />
        </FakeContent>
    )
    expect(asFragment).toMatchSnapshot();
    const logoutButton = screen.getByText('Logout');
    expect(logoutButton).toBeVisible();
});

it('should logout when the logout button is pressed', async () => {
    const { resolve } = NetworkLogin._setupMocks();

    mockLoggedIn = true;
    const result = render(
        <FakeContent>
            <LoginStatus />
        </FakeContent>
    )

    const logoutButton = screen.getByText('Logout');

    await act(async () => {
        logoutButton.click();
        resolve({});
    });

    expect(NetworkLogin.logout).toBeCalledTimes(1);
});
