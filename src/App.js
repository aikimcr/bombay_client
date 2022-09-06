import { useState } from 'react';

import logo from './logo.svg';
import './App.scss';

import BombayContext from './BombayContext';

import HeaderBar from './AppLayout/HeaderBar';
import Navigation from './AppLayout/Navigation';
import Filters from './AppLayout/Filters';
import Content from './AppLayout/Content';
import Accessories from './AppLayout/Accessories';
import Footer from './AppLayout/Footer';

function App() {
  const [appState, setAppState] = useState({
    title: 'Bombay Band Management System',
    loggedIn: false,
    mode: 'login',
  });  

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
    </div>
  );
}

export default App;
