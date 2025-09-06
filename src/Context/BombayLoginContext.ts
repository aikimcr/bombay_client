import { createContext, Dispatch } from 'react';

interface BombayLoginContextValues {
  loggedIn: boolean;
  setLoggedIn?: Dispatch<boolean>;
}

const initialBombayLoginContextValues: BombayLoginContextValues = {
  loggedIn: false,
  setLoggedIn: null,
};

export const BombayLoginContext = createContext(
  initialBombayLoginContextValues,
);

export default BombayLoginContext;
