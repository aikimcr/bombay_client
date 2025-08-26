import { createContext } from "react";

const BombayLoginContext = createContext({
  loggedIn: false,
  showLoginForm: false, // deprecated
  setLoggedIn: null,
  setShowLogin: null,
});

export default BombayLoginContext;
