import React, { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import BombayLoginContext from "../../../Context/BombayLoginContext";
import { loginStatus, login } from "../../../Network/Login";
import {
  Button,
  LabeledInput,
  PasswordInput,
  TextInput,
} from "../../../Components";
import { useRouteManager } from "../../../Hooks/useRouteManager";

import "./Login.scss";

export const Login = () => {
  const routeManager = useRouteManager();

  const { loggedIn, setLoggedIn } = useContext(BombayLoginContext);

  const [submitDisabled, setSubmitDisabled] = useState(true);

  const { register, reset, handleSubmit, formState, setError, clearErrors } =
    useForm({
      shouldUseNativeValidaton: true,
    });

  const doLogin = async (data) => {
    const { username, password } = data;

    try {
      await login(username, password);
    } catch (err) {
      if (err.status === 401) {
        setError("Username or password is incorrect.");
      } else {
        setError(`${err.status}: ${err.message}`);
      }
    }

    const loginOkay = await loginStatus();
    setLoggedIn(loginOkay);
  };

  const onSubmit = (data) => {
    doLogin(data);
  };

  const handleReset = () => {
    setSubmitDisabled(true);
    reset({
      username: "",
      password: "",
    });
  };

  useEffect(() => {
    if (formState.isValid && Object.entries(formState.errors).length === 0) {
      setSubmitDisabled(false);
      return;
    }

    setSubmitDisabled(true);
  }, [formState]);

  useEffect(() => {
    if (loggedIn) {
      routeManager.navigateToRoute("/artistList");
    }
  }, [loggedIn]);

  return (
    <div className="login-container">
      <form
        className="login-form"
        onSubmit={handleSubmit(onSubmit)}
        onReset={handleReset}
      >
        <h1 className="login-header">Please Log In</h1>
        <div className="info">
          <LabeledInput
            labelText="User Name"
            inputId="login-user-name"
            InputField={TextInput}
            inputProps={{
              ...register("username", {
                required: "Please enter a valid username",
              }),
              id: "login-user-name",
              name: "username",
            }}
          />
          <LabeledInput
            labelText="Password"
            inputId="login-password"
            InputField={PasswordInput}
            inputProps={{
              ...register("password", {
                required: "Please enter a valid password",
              }),
              id: "login-password",
              name: "password",
            }}
          />
        </div>
        {Object.entries(formState.errors).length !== 0 && (
          <div className="error">{formState.errors[0]}</div>
        )}
        <div className="controls">
          <Button
            className="clear"
            disabled={false}
            role="secondary"
            text="Clear All Fields"
            type="reset"
          />
          <Button
            className="login"
            disabled={submitDisabled}
            text="Login"
            type="submit"
          />
        </div>
      </form>
    </div>
  );
};
