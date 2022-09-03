import { useEffect, useState } from 'react';

import './Login.scss';

function Login(props) {
    const [timerHandle, setTimerHandle] = useState(null);
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

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

    function login(event) {
        if (timerHandle) {
            clearTimeout(timerHandle);
            setTimerHandle(null);
        }

        debugger;
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

    return (
        <div className="login-container">
            <div className="login-form">
                <h1>Please Log In</h1>
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
                    <div className="login btn" onClick={login}>Login</div>
                </div>
            </div>
        </div>
    );
}

export default Login;