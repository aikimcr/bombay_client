import { useContext } from 'react';

import './LoginStatus.scss';

import BombayLoginContext from '../Context/BombayLoginContext';
import BombayUtilityContext from '../Context/BombayUtilityContext';

import { logout } from "../Network/Login";
import Button from './Button';

function LoginStatus(props) {
    const loggedIn = useContext(BombayLoginContext);
    const { setLoginState } = useContext(BombayUtilityContext);

    async function doLogout() {
        await logout();
        setLoginState(false);
    }

    return (
        <div className="login-status">
            {loggedIn ? <Button className="logout btn" onClick={doLogout} disabled={false} label='Logout' /> : <div className="label">Please Login</div>}
        </div>
    );
}

export default LoginStatus;