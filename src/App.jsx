import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter } from "react-router-dom";

import "./App.scss";

import BombayLoginContext from "./Context/BombayLoginContext";
import BombayUtilityContext from "./Context/BombayUtilityContext";
import ConfigurationContext from "./Context/ConfiguratonContext";

import HeaderBar from "./AppLayout/HeaderBar.jsx";
import Navigation from "./AppLayout/Navigation.jsx";
import Filters from "./AppLayout/Filters.jsx";
import Content from "./AppLayout/Content.jsx";
import Accessories from "./AppLayout/Accessories.jsx";
import Footer from "./AppLayout/Footer.jsx";

import { fetchBootstrap } from "./Network/Bootstrap";
import useLoginTracking from "./Hooks/useLoginTracking";

export const App = () => {
  const [bootstrap, setBootstrap] = useState(null);
  const [showLoginForm, setShowLoginForm] = useState(false);

  const [loginState, setLoginState] = useLoginTracking();

  const callFetchBootstrap = useCallback(async () => {
    try {
      const result = await fetchBootstrap();
      setBootstrap(result);
      return result;
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    callFetchBootstrap();
  }, [callFetchBootstrap]);

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

  const routerBase = process.env.REACT_APP_ROUTER_BASE || "/";

  const appConfig = {
    routerBase,
  };

  return (
    <div className="App">
      <ConfigurationContext.Provider value={appConfig}>
        <BombayLoginContext.Provider value={loginContext}>
          <BombayUtilityContext.Provider value={utilities}>
            <BrowserRouter basename={routerBase}>
              <HeaderBar />
              <Navigation />
              <Filters />
              <Content />
              <Accessories />
              <Footer />
            </BrowserRouter>
          </BombayUtilityContext.Provider>
        </BombayLoginContext.Provider>
      </ConfigurationContext.Provider>
    </div>
  );
};
