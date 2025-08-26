import { useContext, useState } from "react";
import { createPortal } from "react-dom";

import "./Login.scss";

import BombayLoginContext from "../Context/BombayLoginContext";

import { loginStatus, login } from "../Network/Login";
import OldLabeledInput from "../Components/Widgets/OldLabeledInput";
import Button from "../Components/Widgets/Button";

function Login(props) {
  let timerHandle = null;

  const [error, setError] = useState(null);
  const [submitDisabled, setSubmitDisabled] = useState(true);

  const { loggedIn, setLoggedIn, showLoginForm } =
    useContext(BombayLoginContext);

  function getCredentials() {
    // TODO: THere has to be a better way to do what these two lines are doing.
    const usernameInput = document.querySelector(
      '[data-targetfield="username"] input',
    );
    const passwordInput = document.querySelector(
      '[data-targetfield="password"] input',
    );

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
      clearTimer();

      const { username, password } = getCredentials();

      if (username.length > 0 && password.length > 0) {
        setSubmitDisabled(false);
      } else {
        setSubmitDisabled(true);
      }
    }, 250);
  }

  function clearAllFields(event) {
    clearTimer();

    document.querySelector('[data-targetfield="username"] input').value = "";
    document.querySelector('[data-targetfield="password"] input').value = "";
    setSubmitDisabled(true);
    setError(null);
  }

  async function doLogin(event) {
    const { username, password } = getCredentials();

    clearTimer();

    await login(username, password).catch((err) => {
      if (err.status === 401) {
        setError("Username or password is incorrect.");
      } else {
        setError(`${err.status}: ${err.message}`);
      }
    });

    const loginOkay = await loginStatus();
    setLoggedIn(loginOkay);
  }

  if (loggedIn) return null;
  if (!showLoginForm) return null;

  const modalRoot = document.getElementById("modal-root");

  return createPortal(
    <div className="login-container">
      <div className="login-form">
        <h1 className="login-header">Please Log In</h1>
        <div className="info">
          <OldLabeledInput
            modelName="login"
            fieldName="username"
            labelText="User Name"
            onChange={handleChange}
          />
          <OldLabeledInput
            modelName="login"
            fieldName="password"
            labelText="Password"
            type="password"
            onChange={handleChange}
          />
        </div>
        {error && <div className="error">{error}</div>}
        <div className="controls">
          <Button
            className="clear"
            disabled={false}
            onClick={clearAllFields}
            label="Clear All Fields"
          />
          <Button
            className="login"
            disabled={submitDisabled}
            onClick={doLogin}
            label="Login"
          />
        </div>
      </div>
    </div>,
    modalRoot,
  );
}

export default Login;
