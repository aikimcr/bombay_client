import { createContext, Dispatch } from "react";

interface BombayLoginContextValues {
  loggedIn: boolean;
  setLoggedIn?: Dispatch<boolean>;
}

export const BombayLoginContext = createContext({
  loggedIn: false,
  setLoggedIn: null,
});

export default BombayLoginContext;
