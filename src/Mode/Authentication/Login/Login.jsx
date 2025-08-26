import React, { useContext, useRef, useState } from "react";

import "./Login.scss";

import BombayLoginContext from "../../../Context/BombayLoginContext";

import { loginStatus, login } from "../../../Network/Login";
import {
  Button,
  LabeledInput,
  PasswordInput,
  TextInput,
} from "../../../Components";

export const Login = () => {
  const formRef = useRef();

  let timerHandle = null;

  const [error, setError] = useState(null);
  const [submitDisabled, setSubmitDisabled] = useState(true);

  const { loggedIn, setLoggedIn, showLoginForm } =
    useContext(BombayLoginContext);

  function getCredentials() {
    // TODO: THere has to be a better way to do what these two lines are doing.

    const usernameInput = formRef.current
      ? formRef.current.querySelector('[name="username"]')
      : "";
    const passwordInput = formRef.current
      ? formRef.current.querySelector('[name="password"]')
      : "";

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

    if (formRef.current) {
      formRef.current.querySelector('[name="username"]').value = "";
      formRef.current.querySelector('[name="password"]').value = "";
    }

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

  return (
    <div className="login-container">
      <div ref={formRef} className="login-form">
        <h1 className="login-header">Please Log In</h1>
        <div className="info">
          <LabeledInput
            labelText="User Name"
            inputId="login-user-name"
            InputField={TextInput}
            inputProps={{
              id: "login-user-name",
              name: "username",
            }}
          />
          <LabeledInput
            labelText="Password"
            inputId="login-password"
            InputField={PasswordInput}
            inputProps={{
              id: "login-password",
              name: "password",
            }}
          />
        </div>
        {error && <div className="error">{error}</div>}
        <div className="controls">
          <Button
            className="clear"
            disabled={false}
            role="secondary"
            onClick={clearAllFields}
            text="Clear All Fields"
          />
          <Button
            className="login"
            disabled={submitDisabled}
            onClick={doLogin}
            text="Login"
          />
        </div>
      </div>
    </div>
  );
};
