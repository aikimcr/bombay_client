import { useState, useContext } from 'react';

import './LoginStatus.scss';

import BombayLoginContext from '../Context/BombayLoginContext';
import BombayUtilityContext from '../Context/BombayUtilityContext';


import { logout } from "../Network/Login";

function LoginStatus(props) {
    const loggedIn = useContext(BombayLoginContext);
    const { checkLoginState } = useContext(BombayUtilityContext);

    async function doLogout() {
        await logout();
        await checkLoginState();
    }

    return (
        <div className="login-status">
            {loggedIn ? <div className="logout btn" onClick={doLogout}>Logout</div> : <div className="label">Please Login</div>}
        </div>
    );
}

export default LoginStatus;