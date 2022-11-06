import { useState, useEffect, useCallback } from 'react';

import './App.scss';

import BombayLoginContext from './Context/BombayLoginContext';
import BombayModeContext from './Context/BombayModeContext';
import BombayUtilityContext from './Context/BombayUtilityContext';
import ConfigurationContext from './Context/ConfiguratonContext';

import HeaderBar from './AppLayout/HeaderBar';
import Navigation from './AppLayout/Navigation';
import Filters from './AppLayout/Filters';
import Content from './AppLayout/Content';
import Accessories from './AppLayout/Accessories';
import Footer from './AppLayout/Footer';

import { fetchBootstrap } from './Network/Bootstrap';
import useLoginTracking from './Hooks/useLoginTracking';

function App() {
  const [bootstrap, setBootstrap] = useState(null);
  const [modeState, setModeState] = useState('songList');

  const [loginState, setLoginState] = useLoginTracking();

  const callFetchBootstrap = useCallback(async () => {
    try {
      const result = await fetchBootstrap();
      setBootstrap(result);
      return result;
    } catch(err) {
      console.warn(err);
    }
  }, []);

  useEffect(() => {
    callFetchBootstrap();
  }, [callFetchBootstrap]);

  const getBootstrap = () => bootstrap;

  const setMode = useCallback((newMode) => {
    setModeState(newMode);
    return newMode;
  }, []);  

  const utilities = {
    setMode,
    setLoginState,
    getBootstrap,
  }

  const routerBase = process.env.REACT_APP_ROUTER_BASE || '/';
  
  const appConfig = {
    routerBase,
  };

  return (
    <div className="App">
      <ConfigurationContext.Provider value={appConfig}>
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
      </ConfigurationContext.Provider>
    </div >
  );
}

export default App;
