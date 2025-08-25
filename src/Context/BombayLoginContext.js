import { createContext } from "react";

const BombayLoginContext = createContext({
  loggedIn: false,
  showLoginForm: false,
  setLoggedIn: null,
  setShowLogin: null,
});

export default BombayLoginContext;
