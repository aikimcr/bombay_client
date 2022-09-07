import { useState, useContext } from 'react';

import './HeaderBar.scss';

import BombayContext from '../BombayContext';

// Dummy elements for testing
function LoggedInState(props) {
    return (<div className="logged-in"></div>);
}

function LoggedOutState(props) {
    return (<div className="logged-out"></div>);
}

function HeaderBar(props) {
    const context = useContext(BombayContext);


    return (
        <div className="header-bar">
            <div className="title">{context.title}</div>
            <div className="login-status">
                {context.loggedIn ? <LoggedInState /> : <LoggedOutState />}
            </div>
        </div>
    );
}

export default HeaderBar;