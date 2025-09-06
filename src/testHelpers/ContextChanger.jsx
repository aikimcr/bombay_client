import React, { useState } from 'react';

import { BombayLoginContext } from '../Context/BombayLoginContext';
import { MemoryRouter } from 'react-router';

// Use this to turn the crank on context changes.
export const ContextChanger = ({ initialLoggedIn, children }) => {
  const [loggedIn, setLoggedIn] = useState(initialLoggedIn);

  const loginContext = {
    loggedIn,
    setLoggedIn,
  };

  function toggleLogin() {
    loginContext.setLoggedIn((oldLoggedIn) => !oldLoggedIn);
  }

  return (
    <BombayLoginContext.Provider value={loginContext}>
      <MemoryRouter>
        {children}
        <button
          className="change-test-login"
          data-testid="change-test-login"
          onClick={toggleLogin}
        >
          Change Login
        </button>
      </MemoryRouter>
    </BombayLoginContext.Provider>
  );
};
