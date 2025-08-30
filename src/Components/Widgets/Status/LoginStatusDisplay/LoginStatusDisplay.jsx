import { useContext } from "react";

import "./LoginStatusDisplay.scss";

import BombayLoginContext from "../../../../Context/BombayLoginContext";

import { logout } from "../../../../Network/Login";
import { Button } from "../..";
import { useRouteManager } from "../../../../Hooks/useRouteManager";

export const LoginStatusDisplay = () => {
  const routeManager = useRouteManager();
  const { loggedIn, setLoggedIn, setShowLogin } =
    useContext(BombayLoginContext);

  async function doLogout() {
    await logout();
    setLoggedIn(false);
  }

  function showLogin() {
    routeManager.navigateToRoute("/login");
  }

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
