// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useState } from 'react';

import * as Network from './Network/Network';
jest.mock('./Network/Network');

import useIntersectionObserver, * as mockObserver from './Hooks/useIntersectionObserver';
jest.mock('./Hooks/useIntersectionObserver');

import BombayLoginContext from './Context/BombayLoginContext';

globalThis.makeResolvablePromise = function () {
    let resolver;
    let rejecter;
    let promise = new Promise((resolve, reject) => {
        resolver = resolve;
        rejecter = reject;
    });

    return [promise, resolver, rejecter];
}

// Use this to turn the crank on context changes.
globalThis.ContextChanger = function (props) {
    const [loginState, setLoginState] = useState(props.loggedIn);
    const [showLoginForm, setShowLoginForm] = useState(props.showLoginForm);

    const loginContext = {
        loggedIn: loginState,
        showLoginForm: showLoginForm,
        setLoggedIn: newLoggedIn => {
            if (newLoggedIn) {
                setShowLoginForm(false);
            }

            setLoginState(newLoggedIn);
        },

        setShowLogin: newShow => {
            if (loginState) return;
            setShowLoginForm(newShow);
        },
    }

    function toggleLogin() {
        loginContext.setLoggedIn(!loginState);
    }

    return (
        <BombayLoginContext.Provider value={loginContext}>
            {props.children}
            {showLoginForm ? <div>Showing Log In Form</div> : null}
            <button className="change-test-login" onClick={toggleLogin}>Change Login</button>
        </BombayLoginContext.Provider>
    );
}

globalThis.toggleLogin = function () {
    const changeButton = document.querySelector('.change-test-login');
    userEvent.click(changeButton);
}

globalThis.changeInput = async function (root, selector, newValue, timerAdvance = -1) {
    const inputField = selector ? root.querySelector(selector) : root;
    fireEvent.change(inputField, { target: { value: newValue } });

    if (timerAdvance >= 0) {
        await act(async function () {
            jest.advanceTimersByTime(timerAdvance);
        });
    }

    return inputField;
}
