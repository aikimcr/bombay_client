import { useContext } from "react";

import "./LoginStatus.scss";

import BombayLoginContext from "../Context/BombayLoginContext";

import { logout } from "../Network/Login";
import Button from "./Button.jsx";

function LoginStatus(props) {
  const { loggedIn, setLoggedIn, setShowLogin } =
    useContext(BombayLoginContext);

  async function doLogout() {
    await logout();
    setLoggedIn(false);
  }

  function showLogin() {
    setShowLogin(true);
  }

  return (
    <div className="login-status">
      {loggedIn ? (
        <Button
          className="logout btn"
          onClick={doLogout}
          disabled={false}
          label="Logout"
        />
      ) : (
        <Button
          className="login btn"
          onClick={showLogin}
          disabled={false}
          label="Login"
        />
      )}
    </div>
  );
}

export default LoginStatus;
