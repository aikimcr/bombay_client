import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { act, render } from '@testing-library/react';

// Make it easier to track calls and arguments.
// https://stackoverflow.com/questions/73683195/jest-fn-not-registering-mock-implementation
const mockLogout = jest.fn();

jest.mock('../Network/Login', () => {
    const originalModule = jest.requireActual('../Network/Login');

    return {
        __esModule: true,
        ...originalModule,
        logout: async () => {
            mockLogout.apply(this, arguments);
            return '';
        },
    }
});

import BombayLoginContext from '../Context/BombayLoginContext';
import BombayUtilityContext from '../Context/BombayUtilityContext';

import LoginStatus from './LoginStatus';

let mockLoggedIn = false;

function FakeContent(props) {
    const [loginState, setLoginState] = useState(false);

    function toggleLogin() {
        setLoginState(oldState => !oldState);
    }

    const checkLoginState = async () => {
        setLoginState(mockLoggedIn);
    }

    const setMode = async newMode => {
        setModeState(newMode);
    }

    const utilities = {
        checkLoginState,
        setMode,
    }

    return (
        <BrowserRouter basePath="/">
            <BombayLoginContext.Provider value={loginState}>
                <BombayUtilityContext.Provider value={utilities}>
                    {props.children}
                    <button className="toggleLogin" onClick={toggleLogin}>Toggle</button>
                </BombayUtilityContext.Provider>
            </BombayLoginContext.Provider>
        </BrowserRouter>
    );
}

it('should render the login status', async () => {
    const result = render(
        <FakeContent>
            <LoginStatus />
        </FakeContent>
    )

    const index = result.container;
    const status = index.firstChild;
    expect(status.childElementCount).toBe(1);
    expect(status.firstChild.className).toBe('label');
    expect(status.firstChild.textContent).toBe('Please Login');
});

it('should show the logout button after logging in', async () => {
    const result = render(
        <FakeContent>
            <LoginStatus />
        </FakeContent>
    )

    const index = result.container;
    const status = index.firstChild;
    const toggler = index.lastChild;

    await act(async () => {
        toggler.click();
    })

    expect(status.childElementCount).toBe(1);
    verifyClassList(status.firstChild, ['logout', 'btn']);
    expect(status.firstChild.textContent).toBe('Logout');
});

it('should go back to the logout when the logout button is pressed', async () => {
    const result = render(
        <FakeContent>
            <LoginStatus />
        </FakeContent>
    )

    const index = result.container;
    const status = index.firstChild;
    const toggler = index.lastChild;

    await act(async () => {
        toggler.click();
    })

    const logoutButton = index.querySelector('.logout');

    await act(async () => {
        logoutButton.click();
    });

    expect(status.childElementCount).toBe(1);
    expect(status.firstChild.className).toBe('label');
    expect(status.firstChild.textContent).toBe('Please Login');
});
