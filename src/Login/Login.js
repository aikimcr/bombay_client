import { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './Login.scss';

import BombayLoginContext from '../Context/BombayLoginContext';
import BombayModeContext from '../Context/BombayModeContext';
import BombayUtilityContext from '../Context/BombayUtilityContext';

import { login } from "../Network/Login";

function Login(props) {
    const navigate = useNavigate();

    let timerHandle = null;

    const [error, setError] = useState(null);

    const loggedIn = useContext(BombayLoginContext);
    const mode = useContext(BombayModeContext);
    const { checkLoginState } = useContext(BombayUtilityContext);

    useEffect(() => {
        if (loggedIn) {
            navigate(`/${mode}`);
        }
    }, [loggedIn, mode, navigate]);

    function getCredentials() {
        // TODO: THere has to be a better way to do what these two lines are doing.
        const usernameInput = document.querySelector('.username');
        const passwordInput = document.querySelector('.password');

        return { username: usernameInput.value, password: passwordInput.value };
    }

    function clearTimer() {
        if (timerHandle) {
            clearTimeout(timerHandle);
            timerHandle = null;
        }
    }

    function handleChange(event) {
        timerHandle = setTimeout(() => {
            const loginButton = document.querySelector('.btn.login');

            clearTimer();

            const { username, password } = getCredentials();

            if (username.length > 0 && password.length > 0) {
                loginButton.classList.remove('disabled');
            } else {
                loginButton.classList.add('disabled');
            }
        }, 250);
    }

    function clearAllFields(event) {
        const loginButton = document.querySelector('.btn.login');

        clearTimer();

        document.querySelector('input.username').value = '';
        document.querySelector('input.password').value = '';
        loginButton.classList.add('disabled');
        setError(null);
    }

    async function doLogin(event) {
        const { username, password } = getCredentials();

        clearTimer();

        await login(username, password)
            .catch(err => {
                if (err.status === 401) {
                    setError('Username or password is incorrect.');
                } else {
                    setError(`${err.status}: ${err.message}`);
                }
            });

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
                            <div className="input">
                                <input className="username" type="text" onChange={handleChange} />
                            </div>
                        </div>
                        <div>
                            <div className="label">Password</div>
                            <div className="input">
                                <input className="password" type="password" onChange={handleChange} />
                                <div className="toggle btn" data-hidden="true" onClick={togglePassword}>Show</div>
                            </div>
                        </div>
                    </div>
                    {error && <div className="error">{error}</div>}
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