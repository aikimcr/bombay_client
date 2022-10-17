import { useContext } from 'react';

import './LoginStatus.scss';

import BombayLoginContext from '../Context/BombayLoginContext';

import { logout } from "../Network/Login";
import Button from './Button';

function LoginStatus(props) {
    const loggedIn = useContext(BombayLoginContext);

    async function doLogout() {
        await logout();
    }

    return (
        <div className="login-status">
            {loggedIn ? <Button className="logout btn" onClick={doLogout} disabled={false} label='Logout' /> : <div className="label">Please Login</div>}
        </div>
    );
}

export default LoginStatus;