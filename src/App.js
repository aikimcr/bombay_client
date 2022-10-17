import { useState, useEffect, useCallback } from 'react';

import './App.scss';

import BombayLoginContext from './Context/BombayLoginContext';
import BombayModeContext from './Context/BombayModeContext';
import BombayUtilityContext from './Context/BombayUtilityContext';

import HeaderBar from './AppLayout/HeaderBar';
import Navigation from './AppLayout/Navigation';
import Filters from './AppLayout/Filters';
import Content from './AppLayout/Content';
import Accessories from './AppLayout/Accessories';
import Footer from './AppLayout/Footer';

import { loginStatus } from './Network/Login';

function App() {
  const [loginState, setLoginState] = useState(false);
  const [modeState, setModeState] = useState('songList');

  const checkLoginState = useCallback(async () => {
    const result = await loginStatus();
    setLoginState(result);
  }, []);

  const setMode = useCallback((newMode) => {
    setModeState(newMode);
  }, []);

  useEffect(() => {
    checkLoginState();

    // ToDo: Make the interval configurable, don't check if logged out.
    const intervalHandle = setInterval(async () => {
      checkLoginState();
    }, 15000/*10 * 60 * 1000*/); // Ten minutes.

    return () => {
      clearInterval(intervalHandle);
    };
  });

  const utilities = {
    setMode,
    setLoginState,
  }

  return (
    <div className="App">
      <BombayLoginContext.Provider value={loginState}>
        <BombayModeContext.Provider value={modeState}>
          <BombayUtilityContext.Provider value={utilities}>
            <HeaderBar />
            <Navigation />
            <Filters />
            <Content />
            <Accessories />
            <Footer />
          </BombayUtilityContext.Provider>
        </BombayModeContext.Provider>
      </BombayLoginContext.Provider>
    </div >
  );
}

export default App;
