// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { useState } from 'react';
import BombayContext from './BombayContext';

// Use this to turn the crank on context changes.
globalThis.ContextChanger = function(props) {
    const [currentSet, setCurrentSet] = useState(props.context);

    function toggleLogin() {
        const newSet = { ...currentSet };
        newSet.loggedIn = !newSet.loggedIn;
        setCurrentSet(newSet);
    }

    return (
        <BombayContext.Provider value={currentSet}>
            {props.children}
            <button className="change-test-login" onClick={toggleLogin}>Change Login</button>
        </BombayContext.Provider>
    );
}

globalThis.toggleLogin = function() {
    const changeButton = document.querySelector('.change-test-login');
    userEvent.click(changeButton);
}