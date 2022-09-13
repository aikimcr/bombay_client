import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import './Login.scss';

import BombayLoginContext from '../Context/BombayLoginContext';
import BombayModeContext from '../Context/BombayModeContext';
import BombayUtilityContext from '../Context/BombayUtilityContext';

import { login } from "../Network/Login";

function Login(props) {
    const navigate = useNavigate();

    const [timerHandle, setTimerHandle] = useState(null);
    const [credentials, setCredentials] = useState({ username: '', password: '' });

    const loggedIn = useContext(BombayLoginContext);
    const mode = useContext(BombayModeContext);
    const { checkLoginState } = useContext(BombayUtilityContext);

    useEffect(() => {
        const loginButton = document.querySelector('.btn.login');

        if (loginButton) {
            if (credentials.password.length > 0 && credentials.username.length > 0) {
                loginButton.classList.remove('disabled');
            } else {
                loginButton.classList.add('disabled');
            }
        }
    }, [credentials]);

    useEffect(() => {
        if (loggedIn) {
            navigate(`/${mode}`);
        }
    }, [loggedIn, mode, navigate]);

    function handleChange(event) {
        const target = event.currentTarget;

        if (timerHandle) {
            clearTimeout(timerHandle);
            setTimerHandle(null);
        }

        setTimerHandle(setTimeout(() => {
            const key = target.className;
            const newCredentials = {
                ...credentials,
                [key]: target.value,
            }

            setCredentials(newCredentials);

            clearTimeout(timerHandle);
            setTimerHandle(null);
        }, 250));
    }

    function clearAllFields(event) {
        if (timerHandle) {
            clearTimeout(timerHandle);
            setTimerHandle(null);
        }

        document.querySelector('input.username').value = '';
        document.querySelector('input.password').value = '';
        setCredentials({ username: '', password: '' });
    }

    async function doLogin(event) {
        if (timerHandle) {
            clearTimeout(timerHandle);
            setTimerHandle(null);
        }

        await login(credentials.username, credentials.password);
        checkLoginState();
    }

    function togglePassword(evt) {
        const el = evt.currentTarget;
        const pwd = el.parentElement.querySelector('.password');

        if (el.dataset.hidden === 'true') {
            el.dataset.hidden = false;
            el.textContent = 'Hide';
            pwd.setAttribute('type', 'text');
        } else {
            el.dataset.hidden = true;
            el.textContent = 'Show';
            pwd.setAttribute('type', 'password');
        }
    }

    if (loggedIn) {
        return '';
    } else {
        return (
            <div className="login-container">
                <div className="login-form">
                    <h1 className="login-header">Please Log In</h1>
                    <div className="info">
                        <div>
                            <div className="label">Username</div>
                            <div className="input"><input className="username" type="text" onChange={handleChange} /></div>
                        </div>
                        <div>
                            <div className="label">Password</div>
                            <div className="input">
                                <input className="password" type="password" onChange={handleChange} />
                                <div className="toggle btn" data-hidden="true" onClick={togglePassword}>Show</div>
                            </div>
                        </div>
                    </div>
                    <div className="controls">
                        <div className="clear btn" onClick={clearAllFields}>Clear All Fields</div>
                        <div className="login btn disabled" onClick={doLogin}>Login</div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Login;