import { useState, useEffect } from 'react';

import './App.scss';

import BombayContext from './BombayContext';

import HeaderBar from './AppLayout/HeaderBar';
import Navigation from './AppLayout/Navigation';
import Filters from './AppLayout/Filters';
import Content from './AppLayout/Content';
import Accessories from './AppLayout/Accessories';
import Footer from './AppLayout/Footer';

import { loginStatus } from './Network/Login';

function App() {
  const [appState, setAppState] = useState({
    title: 'Bombay Band Management System',
    loggedIn: false,
    mode: 'artist',
  });

  useEffect(() => {
    // ToDo: Make the interval configurable, don't check if logged out.
    const intervalHandle = setInterval(async () => {
      const result = await loginStatus();
      const newState = {
        ...appState,
        loggedIn: result.loggedIn,
      }
      setAppState(newState);
    }, 10 * 60 * 1000); // Ten minutes.

    return () => {
      clearInterval(intervalHandle);
    };
  }, [appState]);

  return (
    <div className="App">
      <BombayContext.Provider value={appState}>
        <HeaderBar />
        <Navigation />
        <Filters />
        <Content />
        <Accessories />
        <Footer />
      </BombayContext.Provider>
    </div >
  );
}

export default App;
