import React, { useContext } from "react";
import BombayLoginContext from "../../../Context/BombayLoginContext";

export const ProtectedRoute = ({ children }) => {
  const loginState = useContext(BombayLoginContext);

  if (loginState.loggedIn) {
    return <>{children}</>;
  }

  return <div>Login Required</div>;
};
