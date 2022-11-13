import * as NetworkLogin from '../Network/Login';
jest.mock('../Network/Login');

import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { act, fireEvent, render } from '@testing-library/react';

const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGREM4MTEzOCIsInVzZXIiOnsiaWQiOjEsIm5hbWUiOiJhZG1pbiIsImFkbWluIjpmYWxzZX0sImlhdCI6MTY2NTk2NTA5OX0.2vz14X7Tm-oFlyOa7dcAF-5y5ympi_UlWyJNxO4xyS4';


import BombayLoginContext from '../Context/BombayLoginContext';
import BombayUtilityContext from '../Context/BombayUtilityContext';

import Login from './Login';

jest.useFakeTimers();

beforeEach(() => {
    localStorage.removeItem('jwttoken');

    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.append(modalRoot);
});

afterEach(() => {
    const modalRoot = document.getElementById('modal-root');
    modalRoot.remove();
});

it('should render the login mode', async () => {
    const { asFragment } = render(<ContextChanger loggedIn={false} showLoginForm={true}>
        <Login />
    </ContextChanger>);

    expect(asFragment).toMatchSnapshot();

    const modalRoot = document.getElementById('modal-root');
    expect(modalRoot).toMatchSnapshot();
});

it('should not render the login mode', async () => {
    render(<ContextChanger loggedIn={false} showLoginForm={false}>
        <Login />
    </ContextChanger>);

    const modalRoot = document.getElementById('modal-root');
    expect(modalRoot).toBeEmptyDOMElement();
});

it('should enable and disable the login button', async () => {
    render(<ContextChanger loggedIn={false} showLoginForm={true}>
        <Login />
    </ContextChanger>);

    const modalRoot = document.getElementById('modal-root');
    const loginButton = modalRoot.querySelector('.login.btn');
    expect(loginButton).toBeDisabled()

    const usernameInput = await changeInput(modalRoot, '[data-targetfield="username"] > input', 'herkimer', 250);
    expect(loginButton).toBeDisabled();

    const passwordInput = await changeInput(modalRoot, '[data-targetfield="password"] > input', 'jones', 250);
    expect(loginButton).not.toBeDisabled()
});

it('should login successfully', async () => {
    const { resolve } = NetworkLogin._setupMocks();

    const result = render(<ContextChanger loggedIn={false} showLoginForm={true}>
        <Login />
    </ContextChanger>);

    const modalRoot = document.getElementById('modal-root');
    const loginButton = modalRoot.querySelector('.login.btn');

    const usernameInput = await changeInput(modalRoot, '[data-targetfield="username"] > input', 'herkimer', 300);
    const passwordInput = await changeInput(modalRoot, '[data-targetfield="password"] > input', 'jones', 300);
    expect(loginButton).not.toBeDisabled()

    // Wait for the component to rerender.
    await act(async () => {
        const newLoginButton = modalRoot.querySelector('.login.btn');
        newLoginButton.click();
    });

    await act(async () => {
        resolve(testToken);
    });

    expect(NetworkLogin.login).toBeCalledTimes(1);
    expect(NetworkLogin.login).toBeCalledWith('herkimer', 'jones');
});

it('should show error on failed login', async () => {
    const { resolve } = NetworkLogin._setupMocks();

    const result = render(<ContextChanger loggedIn={false} showLoginForm={true}>
        <Login />
    </ContextChanger>);

    const modalRoot = document.getElementById('modal-root');
    const loginButton = modalRoot.querySelector('.login.btn');

    const usernameInput = await changeInput(modalRoot, '[data-targetfield="username"] > input', 'herkimer', 250);
    const passwordInput = await changeInput(modalRoot, '[data-targetfield="password"] > input', 'jones', 250);
    expect(loginButton).not.toBeDisabled()

    // Wait for the component to rerender.
    await act(async () => {
        const newLoginButton = modalRoot.querySelector('.login.btn');
        newLoginButton.click();
    });

    await act(async () => {
        resolve(null);
    });

    expect(NetworkLogin.login).toBeCalledTimes(1);
    expect(NetworkLogin.login).toBeCalledWith('herkimer', 'jones');
});

it('should show error on call error', async () => {
    const { resolve } = NetworkLogin._setupMocks();

    const result = render(<ContextChanger loggedIn={false} showLoginForm={true}>
        <Login />
    </ContextChanger>);

    const modalRoot = document.getElementById('modal-root');
    const loginButton = modalRoot.querySelector('.login.btn');

    const usernameInput = await changeInput(modalRoot, '[data-targetfield="username"] > input', 'herkimer', 250);
    const passwordInput = await changeInput(modalRoot, '[data-targetfield="password"] > input', 'jones', 250);
    expect(loginButton).not.toBeDisabled()

    // Wait for the component to rerender.
    await act(async () => {
        const newLoginButton = modalRoot.querySelector('.login.btn');
        newLoginButton.click();
    });

    await act(async () => {
        resolve(null);
    });

    expect(NetworkLogin.login).toBeCalledTimes(1);
    expect(NetworkLogin.login).toBeCalledWith('herkimer', 'jones');
});

it('should clear the inputs and error on clear all fields', async () => {
    const { resolve } = NetworkLogin._setupMocks();

    const result = render(<ContextChanger loggedIn={false} showLoginForm={true}>
        <Login />
    </ContextChanger>);

    const modalRoot = document.getElementById('modal-root');
    const loginButton = modalRoot.querySelector('.login.btn');

    const usernameInput = await changeInput(modalRoot, '[data-targetfield="username"] > input', 'herkimer', 250);
    const passwordInput = await changeInput(modalRoot, '[data-targetfield="password"] > input', 'jones', 250);
    expect(loginButton).not.toBeDisabled()

    // Wait for the component to rerender.
    await act(async () => {
        const newLoginButton = modalRoot.querySelector('.login.btn');
        newLoginButton.click();
    });

    await act(async () => {
        resolve(null);
    });

    const clearButton = modalRoot.querySelector('.clear.btn');

    // Wait for the component to rerender.
    await act(async () => {
        clearButton.click();
    });

    expect(loginButton).toBeDisabled()
});