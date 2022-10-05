import { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './Login.scss';

import BombayLoginContext from '../Context/BombayLoginContext';
import BombayModeContext from '../Context/BombayModeContext';
import BombayUtilityContext from '../Context/BombayUtilityContext';

import { login } from "../Network/Login";
import LabeledInput from '../Widgets/LabeledInput';

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
        const usernameInput = document.querySelector('[data-fieldname="username"] input');
        const passwordInput = document.querySelector('[data-fieldname="password"] input');

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

        document.querySelector('[data-fieldname="username"] input').value = '';
        document.querySelector('[data-fieldname="password"] input').value = '';
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

    if (loggedIn) {
        return '';
    } else {
        return (
            <div className="login-container">
                <div className="login-form">
                    <h1 className="login-header">Please Log In</h1>
                    <div className="info">
                        <LabeledInput
                            modelName='login'
                            fieldName='username'
                            labelText='User Name'
                            onChange={handleChange}
                        />
                        <LabeledInput
                            modelName='login'
                            fieldName='password'
                            labelText='Password'
                            type='password'
                            onChange={handleChange}
                        />
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