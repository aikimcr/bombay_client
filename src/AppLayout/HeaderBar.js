import { useState, useContext } from 'react';

import './HeaderBar.scss';

import BombayLoginContext from '../Context/BombayLoginContext';

// Dummy elements for testing
function LoggedInState(props) {
    return (<div className="logged-in">Logged In</div>);
}

function LoggedOutState(props) {
    return (<div className="logged-out">Logged Out</div>);
}

function HeaderBar(props) {
    const loggedIn = useContext(BombayLoginContext);
    const title=props.title || "Bombay Band Management System";

    return (
        <div className="header-bar">
            <div className="title">{title}</div>
            <div className="login-status">
                {loggedIn ? <LoggedInState /> : <LoggedOutState />}
            </div>
        </div>
    );
}

export default HeaderBar;