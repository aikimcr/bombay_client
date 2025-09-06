import React, { useContext } from "react";

import "./LoginStatusDisplay.scss";

import BombayLoginContext from "../../../../Context/BombayLoginContext";

import { logout } from "../../../../Network/Login";
import { Button } from "../..";
import { useRouteManager } from "../../../../Hooks/useRouteManager";

export const LoginStatusDisplay: React.FC = () => {
  const routeManager = useRouteManager();
  const { loggedIn, setLoggedIn } = useContext(BombayLoginContext);

  const doLogout = async (): Promise<void> => {
    await logout();
    setLoggedIn(false);
  };

  const showLogin = (): void => {
    routeManager.navigateToRoute("/login");
  };

  return (
    <div className="login-status">
      {loggedIn ? (
        <Button
          className="logout btn"
          onClick={doLogout}
          disabled={false}
          text="Logout"
        />
      ) : (
        <Button
          className="login btn"
          onClick={showLogin}
          disabled={false}
          text="Login"
        />
      )}
    </div>
  );
};
