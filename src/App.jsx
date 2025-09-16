import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter } from 'react-router';

import BombayLoginContext from './Context/BombayLoginContext';
import BombayUtilityContext from './Context/BombayUtilityContext';
import ConfigurationContext from './Context/ConfiguratonContext';

import { fetchBootstrap } from './Network/Bootstrap';
import { useLoginTracking } from './Hooks/useLoginTracking';

import './App.scss';
import {
  AppLayout,
  AppRoutes,
  HeaderLayout,
  LoginStatusDisplay,
  NavigationDropdown,
} from './Components';

export const App = () => {
  const [bootstrap, setBootstrap] = useState(null);
  const [showLoginForm, setShowLoginForm] = useState(false);

  const [loginState, setLoginState] = useLoginTracking();

  const callFetchBootstrap = useEffect(() => {
    (async () => {
      try {
        const result = await fetchBootstrap();
        setBootstrap(result);
        return result;
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const getBootstrap = () => bootstrap;

  const loginContext = {
    loggedIn: loginState,
    showLoginForm: showLoginForm,
    setLoggedIn: (newLoggedIn) => {
      if (newLoggedIn) {
        setShowLoginForm(false);
      }

      setLoginState(newLoggedIn);
    },

    setShowLogin: (newShow) => {
      if (loginState) return;
      setShowLoginForm(newShow);
    },
  };

  const utilities = {
    getBootstrap,
  };

  const routerBase = process.env.CLIENT_ROUTER_BASE || '/';

  const appConfig = {
    routerBase,
  };

  if (!bootstrap) {
    return null;
  }

  return (
    <div className="App" data-testid="app">
      <ConfigurationContext.Provider value={appConfig}>
        <BombayLoginContext.Provider value={loginContext}>
          <BombayUtilityContext.Provider value={utilities}>
            <BrowserRouter basename={routerBase}>
              <AppLayout
                header={
                  <HeaderLayout
                    title="PDQ Band Manager"
                    footer={<LoginStatusDisplay />}
                  />
                }
              >
                <AppRoutes />
              </AppLayout>
            </BrowserRouter>
          </BombayUtilityContext.Provider>
        </BombayLoginContext.Provider>
      </ConfigurationContext.Provider>
    </div>
  );
};
