import { useState } from 'react'; 
import { BrowserRouter } from 'react-router-dom';

import { act, render} from '@testing-library/react';

let mockLoggedIn = false;
let mockLoginResult = [200, "OK"]; //[401, 'Unauthorized'];

// Make it easier to track calls and arguments.
// https://stackoverflow.com/questions/73683195/jest-fn-not-registering-mock-implementation
const mockLogin = jest.fn();

jest.mock('../Network/Login', () => {
    const originalModule = jest.requireActual('../Network/Login');

    return {
        __esModule: true,
        ...originalModule,
        login: async (username, password) => {
            mockLogin(username, password);
            if (mockLoginResult[0] === 200) {
                mockLoggedIn = true;
                return '';
            } else {
                return Promise.reject({status: mockLoginResult[0], message: mockLoginResult[1]});
            }
        }, 
    }
});

import BombayLoginContext from '../Context/BombayLoginContext';
import BombayModeContext from '../Context/BombayModeContext';
import BombayUtilityContext from '../Context/BombayUtilityContext';

import Login from './Login';

jest.useFakeTimers();

function FakeContent(props) {
    const [loginState, setLoginState] = useState(false);
    const [modeState, setModeState] = useState('artist');

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
                <BombayModeContext.Provider value={modeState}>
                    <BombayUtilityContext.Provider value={utilities}>
                        {props.children}
                    </BombayUtilityContext.Provider>
                </BombayModeContext.Provider>
            </BombayLoginContext.Provider>
        </BrowserRouter>
    );
}

function verifyModeStructure(mode, options = {}) {
    const { username, password, hideState } = {
            username: '',
            password: '',
            hideState: true,
            ...options
    };

    expect(mode.className).toBe('login-container');
    expect(mode.childElementCount).toBe(1);
    
    const form = mode.firstChild;
    expect(form.className).toBe('login-form');
    expect(form.childElementCount).toBe(options.error ? 4 : 3);

    const header = form.firstChild;
    expect(header.className).toBe('login-header');
    expect(header.textContent).toBe('Please Log In');
    expect(header.childElementCount).toBe(0);

    const info = form.children[1];
    expect(info.className).toBe('info');
    expect(info.childElementCount).toBe(2);

    const userNameContainer = info.firstChild;
    expect(userNameContainer.className).toBe('labeled-input');
    expect(userNameContainer.dataset.modelname).toBe('login');
    expect(userNameContainer.dataset.fieldname).toBe('username');

    const passwordContainer = info.lastChild;
    expect(passwordContainer.className).toBe('labeled-input');
    expect(passwordContainer.dataset.modelname).toBe('login');
    expect(passwordContainer.dataset.fieldname).toBe('password');

    if (options.error) {
        const error = form.children[2];
        expect(error.textContent).toBe(options.error);
    }

    const controls = form.lastChild;
    expect(controls.className).toBe('controls');
    expect(controls.childElementCount).toBe(2);
    verifyClassList(controls.firstChild, ['clear', 'btn']);

    if (username.length === 0 || password.length === 0) {
        verifyClassList(controls.lastChild, ['login', 'btn', 'disabled']);
    } else {
        verifyClassList(controls.lastChild, ['login', 'btn'], ['disabled']);
    }
}

beforeEach(() => {
    mockLoggedIn = false;
    mockLoginResult = [200, "OK"]; //[401, 'Unauthorized'];
});

it('should render the login mode', async () => {
    const result = render(<FakeContent>
        <Login />
    </FakeContent>);

    const index = result.container;
    expect(index.childElementCount).toBe(1);

    verifyModeStructure(index.firstChild);
});


it('should enable and disable the login button', async () => {
    const result = render(<FakeContent>
        <Login />
    </FakeContent>);

    const index = result.container;
    verifyModeStructure(index.firstChild);

    const usernameInput = await changeInput(index.querySelector('[data-fieldname="username"]'), '', 'herkimer', 250);
    verifyModeStructure(index.firstChild, { username: 'herkimer' });

    const passwordInput = await changeInput(index.querySelector('[data-fieldname="password"]'), '', 'jones', 250);
    verifyModeStructure(index.firstChild, { username: 'herkimer', password: 'jones' });
});

it('should login successfully', async () => {
    const result = render(<FakeContent>
        <Login />
    </FakeContent>);

    const index = result.container;
    verifyModeStructure(index.firstChild);

    const usernameInput = await changeInput(index.querySelector('[data-fieldname="username"]'), '', 'herkimer', 250);
    const passwordInput = await changeInput(index.querySelector('[data-fieldname="password"]'), '', 'jones', 250);
    verifyModeStructure(index.firstChild, { username: 'herkimer', password: 'jones' });

    const loginButton = index.querySelector('.login.btn');

    // Wait for the component to rerender.
    await act(async () => {
        loginButton.click();
    });

    expect(mockLogin.mock.calls).toEqual([['herkimer', 'jones']]);
    expect(result.container.firstChild).toBe(null);
});

it('should show error on failed login', async () => {
    const result = render(<FakeContent>
        <Login />
    </FakeContent>);

    const index = result.container;
    verifyModeStructure(index.firstChild);

    const usernameInput = await changeInput(index.querySelector('[data-fieldname="username"]'), '', 'herkimer', 250);
    const passwordInput = await changeInput(index.querySelector('[data-fieldname="password"]'), '', 'jones', 250);
    verifyModeStructure(index.firstChild, { username: 'herkimer', password: 'jones' });

    mockLoginResult = [401, 'Unauthorized'];
    const loginButton = index.querySelector('.login.btn');

    // Wait for the component to rerender.
    await act(async () => {
        loginButton.click();
    });

    expect(mockLogin.mock.calls).toEqual([['herkimer', 'jones']]);
    expect(result.container.firstChild).not.toBe(null);
    verifyModeStructure(index.firstChild, { username: 'herkimer', password: 'jones', error: 'Username or password is incorrect.' });
});

it('should show error on call error', async () => {
    const result = render(<FakeContent>
        <Login />
    </FakeContent>);

    const index = result.container;
    verifyModeStructure(index.firstChild);

    const usernameInput = await changeInput(index.querySelector('[data-fieldname="username"]'), '', 'herkimer', 250);
    const passwordInput = await changeInput(index.querySelector('[data-fieldname="password"]'), '', 'jones', 250);
    verifyModeStructure(index.firstChild, { username: 'herkimer', password: 'jones' });

    mockLoginResult = [500, 'Server Failure'];
    const loginButton = index.querySelector('.login.btn');

    // Wait for the component to rerender.
    await act(async () => {
        loginButton.click();
    });

    expect(mockLogin.mock.calls).toEqual([['herkimer', 'jones']]);
    expect(result.container.firstChild).not.toBe(null);
    verifyModeStructure(index.firstChild, { username: 'herkimer', password: 'jones', error: '500: Server Failure' });
});

it('should clear the inputs and error on clear all fields', async () => {
    const result = render(<FakeContent>
        <Login />
    </FakeContent>);

    const index = result.container;
    verifyModeStructure(index.firstChild);

    const usernameInput = await changeInput(index.querySelector('[data-fieldname="username"]'), '', 'herkimer', 250);
    const passwordInput = await changeInput(index.querySelector('[data-fieldname="password"]'), '', 'jones', 250);
    verifyModeStructure(index.firstChild, { username: 'herkimer', password: 'jones' });

    mockLoginResult = [401, 'Unauthorized'];
    const loginButton = index.querySelector('.login.btn');

    // Wait for the component to rerender.
    await act(async () => {
        loginButton.click();
    });

    verifyModeStructure(index.firstChild, { username: 'herkimer', password: 'jones', error: 'Username or password is incorrect.' });

    const clearButton = index.querySelector('.clear.btn');

    // Wait for the component to rerender.
    await act(async () => {
        clearButton.click();
    });

    verifyModeStructure(index.firstChild);
});