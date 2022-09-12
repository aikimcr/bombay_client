// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { useState } from 'react';
import BombayLoginContext from './Context/BombayLoginContext';
import BombayModeContext from './Context/BombayModeContext';

// Use this to turn the crank on context changes.
globalThis.ContextChanger = function (props) {
    const [loginState, setLoginState] = useState(props.loginState);
    const [modeState, setModeState] = useState(props.modeState);

    function toggleLogin() {
        setLoginState(!loginState);
    }

    function updateModeState(evt) {
        setModeState(evt.currentTarget.value);
    }

    return (
        <BombayLoginContext.Provider value={loginState}>
            <BombayModeContext.Provider value={modeState}>
                {props.children}
                <button className="change-test-login" onClick={toggleLogin}>Change Login</button>
                <input className="change-test-mode" type='text' onChange={updateModeState} />
            </BombayModeContext.Provider>
        </BombayLoginContext.Provider>
    );
}

globalThis.toggleLogin = function () {
    const changeButton = document.querySelector('.change-test-login');
    userEvent.click(changeButton);
}